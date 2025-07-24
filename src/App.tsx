import { useState, useEffect } from 'react'
import './App.css'
import DataTable from './components/DataTable'
import ScatterChart from './components/ScatterChart'
import ChartControls from './components/ChartControls'
import DataManager from './components/DataManager'
import type { DataPoint, ChartConfig } from './types'
import axios from 'axios'

const API_BASE_URL = 'http://localhost:8000'

function App() {
  const [viewMode, setViewMode] = useState<'table' | 'chart'>('table')
  const [data, setData] = useState<DataPoint[]>([])
  const [rawData, setRawData] = useState<any[]>([]) // Store the full raw dataset
  const [chartConfig, setChartConfig] = useState<ChartConfig>({
    chart_type: 'scatter',
    x_column: 'x',
    y_column: 'y',
    category_column: 'category',
    size_column: 'size'
  })
  const [columns, setColumns] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Transform raw data to chart format locally (enables smooth transitions)
  const transformDataForChart = (rawDataArray: any[], config: ChartConfig): DataPoint[] => {
    return rawDataArray.map(row => {
      const point: DataPoint = {
        x: row[config.x_column] || 0,
        y: row[config.y_column] || 0,
      }
      
      if (config.category_column) {
        point.category = row[config.category_column]
      }
      if (config.size_column) {
        point.size = row[config.size_column]
      }
      if (config.color_column) {
        point.color = row[config.color_column]
      }
      
      return point
    })
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
            <ScatterChart data={data} config={chartConfig} />
          )}
        </div>
      </main>
    </div>
  )
}

export default App
