import React, { useState } from 'react'
import axios from 'axios'

interface Dataset {
  name: string
  description: string
  size: number
  columns: string[]
}

interface DataManagerProps {
  onDataLoaded: () => void
  apiBaseUrl: string
}

const DataManager: React.FC<DataManagerProps> = ({ onDataLoaded, apiBaseUrl }) => {
  const [availableDatasets, setAvailableDatasets] = useState<Dataset[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showDataManager, setShowDataManager] = useState(false)

  const fetchAvailableDatasets = async () => {
    try {
      const response = await axios.get(`${apiBaseUrl}/data/sample-datasets`)
      setAvailableDatasets(response.data.datasets)
    } catch (err) {
      setError('Failed to fetch available datasets')
      console.error(err)
    }
  }

  const loadSampleDataset = async (datasetName: string) => {
    setLoading(true)
    setError(null)
    try {
      const response = await axios.post(`${apiBaseUrl}/data/load-sample/${datasetName}`)
      console.log('Dataset loaded:', response.data)
      onDataLoaded()
      setShowDataManager(false)
    } catch (err) {
      setError(`Failed to load dataset: ${datasetName}`)
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setLoading(true)
    setError(null)
    
    try {
      console.log('Uploading file:', file.name, 'Size:', file.size, 'Type:', file.type)
      
      const formData = new FormData()
      formData.append('file', file)

      const response = await axios.post(`${apiBaseUrl}/data/upload-csv`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      
      console.log('File uploaded successfully:', response.data)
      onDataLoaded()
      setShowDataManager(false)
    } catch (err: any) {
      console.error('Upload error:', err)
      
      let errorMessage = 'Failed to upload file'
      if (err.response?.data?.detail) {
        errorMessage = err.response.data.detail
      } else if (err.message) {
        errorMessage = `Upload failed: ${err.message}`
      }
      
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleToggleDataManager = () => {
    if (!showDataManager) {
      fetchAvailableDatasets()
    }
    setShowDataManager(!showDataManager)
  }

  return (
    <div className="data-manager">
      <button 
        className="data-manager-toggle"
        onClick={handleToggleDataManager}
      >
        {showDataManager ? 'Close Data Manager' : 'Manage Data'}
      </button>

      {showDataManager && (
        <div className="data-manager-panel">
          <h3>Data Management</h3>
          
          {error && <div className="error-message">{error}</div>}
          
          {/* File Upload Section */}
          <div className="upload-section">
            <h4>Upload CSV File</h4>
            <input
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              disabled={loading}
              className="file-input"
            />
            <p className="help-text">Upload a CSV file to visualize your own data</p>
          </div>

          {/* Sample Datasets Section */}
          <div className="sample-datasets-section">
            <h4>Load Sample Dataset</h4>
            {loading ? (
              <div className="loading">Loading...</div>
            ) : (
              <div className="datasets-grid">
                {availableDatasets.map((dataset) => (
                  <div key={dataset.name} className="dataset-card">
                    <h5>{dataset.name.replace('_', ' ').toUpperCase()}</h5>
                    <p className="dataset-description">{dataset.description}</p>
                    <div className="dataset-info">
                      <span className="dataset-size">{dataset.size} rows</span>
                      <span className="dataset-columns">{dataset.columns.length} columns</span>
                    </div>
                    <div className="dataset-columns-list">
                      <strong>Key columns:</strong> {dataset.columns.slice(0, 4).join(', ')}
                      {dataset.columns.length > 4 && '...'}
                    </div>
                    <button 
                      onClick={() => loadSampleDataset(dataset.name)}
                      disabled={loading}
                      className="load-dataset-btn"
                    >
                      Load Dataset
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default DataManager
