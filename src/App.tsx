import { useState, useEffect, useRef } from 'react'
import './App.css'
import DataTable from './components/DataTable'
import ScatterChart from './components/ScatterChart'
import ChartControls from './components/ChartControls'
import DataManager from './components/DataManager'
import type { DataPoint, ChartConfig } from './types'
import axios from 'axios'
import { binData, shouldUseBinning } from './utils/dataUtils'

const API_BASE_URL = 'http://localhost:8000'

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
  const [columns, setColumns] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [animationIndex, setAnimationIndex] = useState(0)
  const [animationInterval, setAnimationInterval] = useState<NodeJS.Timeout | null>(null)
  const chartContainerRef = useRef<HTMLDivElement>(null)

  // Transform raw data to chart format locally (enables smooth transitions)
  const transformDataForChart = (rawDataArray: any[], config: ChartConfig): DataPoint[] => {
    let transformedData = rawDataArray.map(row => {
      const point: DataPoint = {
        x: row[config.x_column] || 0,
        y: row[config.y_column] || 0,
      }
      
      if (config.category_column) {
        point.category = row[config.category_column]
        // Store the original value for binning
        point[config.category_column] = row[config.category_column]
      }
      if (config.size_column) {
        point.size = row[config.size_column]
      }
      
      // Add all hover fields to the data point
      if (config.hover_fields) {
        config.hover_fields.forEach((field: string) => {
          point[field] = row[field]
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

  // Fetch available columns on component mount
  useEffect(() => {
    fetchColumns()
  }, [])

  // Update chart config when columns change
  useEffect(() => {
    if (columns.length > 0) {
      const numericColumns = columns.filter(col => col.is_numeric)
      if (numericColumns.length >= 2) {
        setChartConfig((prev: ChartConfig) => ({
          ...prev,
          x_column: numericColumns[0]?.name || prev.x_column,
          y_column: numericColumns[1]?.name || prev.y_column,
          category_column: columns.find(col => !col.is_numeric)?.name || undefined,
          size_column: numericColumns[2]?.name || undefined
        }))
      }
    }
  }, [columns])

  // Fetch data when view mode changes or when columns are first loaded
  useEffect(() => {
    if (columns.length > 0) {
      if (viewMode === 'table') {
        fetchTableData()
      } else {
        // For chart view, only fetch raw data once, then transform locally
        if (rawData.length === 0) {
          fetchRawData()
        }
      }
    }
  }, [viewMode, columns])

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

  const fetchColumns = async () => {
    try {
      setError(null)
      const response = await axios.get(`${API_BASE_URL}/data/columns`)
      setColumns(response.data.columns)
    } catch (err) {
      const errorMsg = axios.isAxiosError(err) 
        ? `Failed to fetch columns: ${err.message}` 
        : 'Failed to fetch columns'
      setError(errorMsg)
      console.error('Error fetching columns:', err)
    }
  }

  const fetchTableData = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await axios.get(`${API_BASE_URL}/data/table`)
      setData(response.data.data)
      setRawData(response.data.data) // Also store as raw data
    } catch (err) {
      const errorMsg = axios.isAxiosError(err) 
        ? `Failed to fetch table data: ${err.message}` 
        : 'Failed to fetch table data'
      setError(errorMsg)
      console.error('Error fetching table data:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchRawData = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await axios.get(`${API_BASE_URL}/data/table`)
      setRawData(response.data.data)
      // Transform immediately for chart view
      const transformedData = transformDataForChart(response.data.data, chartConfig)
      setData(transformedData)
    } catch (err) {
      const errorMsg = axios.isAxiosError(err) 
        ? `Failed to fetch data: ${err.message}` 
        : 'Failed to fetch data'
      setError(errorMsg)
      console.error('Error fetching raw data:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleConfigChange = (newConfig: Partial<ChartConfig>) => {
    setChartConfig((prev: ChartConfig) => ({ ...prev, ...newConfig }))
    // Note: Chart data will be transformed automatically via useEffect
  }

  const handleDataLoaded = () => {
    // Refresh columns and data when new data is loaded
    setRawData([]) // Clear cached raw data to force refetch
    fetchColumns()
    if (viewMode === 'table') {
      fetchTableData()
    } else {
      fetchRawData()
    }
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>Data Visualizer</h1>
        <div className="header-controls">
          <DataManager 
            onDataLoaded={handleDataLoaded}
            apiBaseUrl={API_BASE_URL}
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
