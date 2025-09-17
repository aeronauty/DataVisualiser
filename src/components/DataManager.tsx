import React, { useState } from 'react'
import { loadCSVFromFile, loadSampleDataset, SAMPLE_DATASETS, type CSVData } from '../utils/csvLoader'

interface Dataset {
  name: string
  description: string
  size: number
  columns: string[]
}

interface DataManagerProps {
  onDataLoaded: (data: CSVData) => void
}

const DataManager: React.FC<DataManagerProps> = ({ onDataLoaded }) => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showDataManager, setShowDataManager] = useState(false)

  const handleLoadSampleDataset = async (datasetName: string) => {
    setLoading(true)
    setError(null)
    try {
      const csvData = await loadSampleDataset(datasetName)
      console.log('Dataset loaded:', csvData)
      onDataLoaded(csvData)
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
      console.log('Loading file:', file.name, 'Size:', file.size, 'Type:', file.type)
      
      const csvData = await loadCSVFromFile(file)
      
      console.log('File loaded successfully:', csvData)
      onDataLoaded(csvData)
      setShowDataManager(false)
    } catch (err: any) {
      console.error('Load error:', err)
      
      let errorMessage = 'Failed to load file'
      if (err.message) {
        errorMessage = `Load failed: ${err.message}`
      }
      
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleToggleDataManager = () => {
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
                {SAMPLE_DATASETS.map((dataset) => (
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
                      onClick={() => handleLoadSampleDataset(dataset.name)}
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
