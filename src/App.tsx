import { useState, useEffect, useRef } from 'react'
import './App.css'
import DataTable from './components/DataTable'
import ScatterChart from './components/ScatterChart'
import ChartControls from './components/ChartControls'
import DataManager from './components/DataManager'
import type { DataPoint, ChartConfig } from './types'
import { binData, shouldUseBinning } from './utils/dataUtils'
import { loadSampleDataset, type CSVData, type CSVColumn } from './utils/csvLoader'
import { calculateAxisLimits, shouldUseFixedLimits } from './utils/axisUtils'

function App() {
  const [viewMode, setViewMode] = useState<'table' | 'chart'>('table')
  const [data, setData] = useState<DataPoint[]>([])
  const [rawData, setRawData] = useState<any[]>([]) // Store the full raw dataset
  const [chartConfig, setChartConfig] = useState<ChartConfig>({
    chart_type: 'scatter',
    x_column: 'x',
    y_column: 'y',
    x_columns: ['x'],
    y_columns: ['y'],
    category_column: 'category',
    size_column: 'size',
    size_min: 3,
    size_max: 25,
    category_bins: 5,
    opacity: 0.7,
    hover_fields: [],
    animation_enabled: false,
    animation_speed: 2,
    animation_duration: 800,
    transition_duration: 1000
  })
  const [columns, setColumns] = useState<CSVColumn[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [animationIndex, setAnimationIndex] = useState(0)
  const [animationInterval, setAnimationInterval] = useState<NodeJS.Timeout | null>(null)
  const chartContainerRef = useRef<HTMLDivElement>(null)

  // Transform raw data to chart format locally (enables smooth transitions)
  const transformDataForChart = (rawDataArray: any[], config: ChartConfig): DataPoint[] => {
    if (!rawDataArray || rawDataArray.length === 0) {
      return []
    }

    let transformedData = rawDataArray.map(row => {
      const point: DataPoint = {
        x: row[config.x_column] !== undefined ? row[config.x_column] : 0,
        y: row[config.y_column] !== undefined ? row[config.y_column] : 0,
      }
      
      if (config.category_column && row[config.category_column] !== undefined) {
        point.category = row[config.category_column]
        // Store the original value for binning
        point[config.category_column] = row[config.category_column]
      }
      if (config.size_column && row[config.size_column] !== undefined) {
        point.size = row[config.size_column]
      }
      
      // Add all hover fields to the data point
      if (config.hover_fields) {
        config.hover_fields.forEach((field: string) => {
          if (row[field] !== undefined) {
            point[field] = row[field]
          }
        })
      }
      
      return point
    })

    // Apply binning if needed for numerical category columns
    if (config.category_column && 
        shouldUseBinning(config.category_column, columns)) {
      transformedData = binData(
        transformedData, 
        config.category_column, 
        config.category_bins || 5,
        columns
      )
    }
    
    return transformedData
  }

  // Load default dataset on component mount
  useEffect(() => {
    loadDefaultDataset()
  }, [])

  // Update chart config when columns change
  useEffect(() => {
    if (columns.length > 0) {
      // Only update category and size columns based on column types
      const numericColumns = columns.filter(col => col.is_numeric)
      
      setChartConfig((prev: ChartConfig) => ({
        ...prev,
        x_column: numericColumns[0]?.name || columns[0]?.name || 'x',
        y_column: numericColumns[1]?.name || columns[1]?.name || 'y',
        x_columns: [numericColumns[0]?.name || columns[0]?.name || 'x'],
        y_columns: [numericColumns[1]?.name || columns[1]?.name || 'y'],
        category_column: columns.find(col => !col.is_numeric)?.name || undefined,
        size_column: numericColumns[2]?.name || undefined
      }))
    }
  }, [columns])

  // Transform data for chart when config changes (enables smooth transitions)
  useEffect(() => {
    if (viewMode === 'chart' && rawData.length > 0) {
      const transformedData = transformDataForChart(rawData, chartConfig)
      setData(transformedData)
    }
  }, [chartConfig, rawData, viewMode])

  // Animation control effect
  useEffect(() => {
    if (animationInterval) {
      clearInterval(animationInterval)
    }

    if (chartConfig.animation_enabled) {
      const xColumns = chartConfig.x_columns || [chartConfig.x_column]
      const yColumns = chartConfig.y_columns || [chartConfig.y_column]
      const totalCombinations = Math.max(xColumns.length, yColumns.length)

      if (totalCombinations > 1) {
        const interval = setInterval(() => {
          setAnimationIndex(prevIndex => {
            const newIndex = (prevIndex + 1) % totalCombinations
            
            // Update the current x and y columns based on the animation index
            const newXColumn = xColumns[newIndex % xColumns.length]
            const newYColumn = yColumns[newIndex % yColumns.length]
            
            console.log(`Animation frame ${newIndex}: ${newXColumn} vs ${newYColumn}`)
            
            setChartConfig((prev: ChartConfig) => ({
              ...prev,
              x_column: newXColumn,
              y_column: newYColumn
            }))
            
            return newIndex
          })
        }, (chartConfig.animation_speed || 2) * 1000)

        setAnimationInterval(interval)
      }
    }

    return () => {
      if (animationInterval) {
        clearInterval(animationInterval)
      }
    }
  }, [chartConfig.animation_enabled, chartConfig.animation_speed, chartConfig.transition_duration, chartConfig.x_columns, chartConfig.y_columns])

  // Cleanup animation on unmount
  useEffect(() => {
    return () => {
      if (animationInterval) {
        clearInterval(animationInterval)
      }
    }
  }, [])

  const loadDefaultDataset = async () => {
    setLoading(true)
    setError(null)
    try {
      const csvData = await loadSampleDataset('comprehensive_business_data')
      handleDataLoaded(csvData)
    } catch (err) {
      setError('Failed to load default dataset')
      console.error('Error loading default dataset:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleDataLoaded = (csvData: CSVData) => {
    setColumns(csvData.columns)
    setRawData(csvData.data)
    setData(csvData.data) // Set data for table view
    setError(null)
    console.log('Data loaded:', csvData)
  }

  const handleConfigChange = (newConfig: Partial<ChartConfig>) => {
    setChartConfig((prev: ChartConfig) => {
      const updatedConfig = { ...prev, ...newConfig };
      
      // Auto-calculate axis limits if fixed limits are enabled and we have data
      if (updatedConfig.fixed_axis_limits && rawData.length > 0) {
        const xColumns = updatedConfig.x_columns || [updatedConfig.x_column];
        const yColumns = updatedConfig.y_columns || [updatedConfig.y_column];
        
        const { xLimits, yLimits } = calculateAxisLimits(rawData, xColumns, yColumns);
        
        updatedConfig.x_axis_min = xLimits.min;
        updatedConfig.x_axis_max = xLimits.max;
        updatedConfig.y_axis_min = yLimits.min;
        updatedConfig.y_axis_max = yLimits.max;
      }
      
      return updatedConfig;
    });
    // Note: Chart data will be transformed automatically via useEffect
  }

  // handleDataLoaded is now defined above and takes CSVData parameter

  return (
    <div className="app">
      <header className="app-header">
        <h1>Data Visualizer</h1>
        <div className="header-controls">
          <DataManager 
            onDataLoaded={handleDataLoaded}
          />
          <div className="view-controls">
            <button 
              className={viewMode === 'table' ? 'active' : ''}
              onClick={() => setViewMode('table')}
            >
              Table View
            </button>
            <button 
              className={viewMode === 'chart' ? 'active' : ''}
              onClick={() => setViewMode('chart')}
            >
              Chart View
            </button>
          </div>
        </div>
      </header>

      <main className="app-main">
        {error && <div className="error-message">{error}</div>}
        
        {viewMode === 'chart' && (
          <ChartControls 
            config={chartConfig}
            columns={columns}
            onConfigChange={handleConfigChange}
          />
        )}

        <div className="content-area">
          {loading ? (
            <div className="loading">Loading...</div>
          ) : viewMode === 'table' ? (
            <DataTable data={data} />
          ) : (
            <div ref={chartContainerRef}>
              <ScatterChart data={data} config={chartConfig} />
            </div>
          )}
        </div>

        {viewMode === 'chart' && (
          <div style={{ padding: '10px', background: '#f0f0f0', margin: '10px' }}>
            <p><strong>Debug Info:</strong></p>
            <p>View Mode: {viewMode}</p>
            <p>Animation Enabled: {chartConfig.animation_enabled ? 'Yes' : 'No'}</p>
            <p>X Columns: {JSON.stringify(chartConfig.x_columns)}</p>
            <p>Y Columns: {JSON.stringify(chartConfig.y_columns)}</p>
          </div>
        )}
      </main>
    </div>
  )
}

export default App
