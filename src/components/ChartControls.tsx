import React from 'react'
import type { ChartConfig, ColumnInfo } from '../types'

interface ChartControlsProps {
  config: ChartConfig
  columns: ColumnInfo[]
  onConfigChange: (newConfig: Partial<ChartConfig>) => void
}

const ChartControls: React.FC<ChartControlsProps> = ({ 
  config, 
  columns, 
  onConfigChange 
}) => {
  const numericColumns = columns.filter(col => col.is_numeric)
  const allColumns = columns

  return (
    <div className="chart-controls">
      <h3>Chart Configuration</h3>
      
      <div className="controls-grid">
        <div className="control-group">
          <label htmlFor="chart-type">Chart Type:</label>
          <select
            id="chart-type"
            value={config.chart_type}
            onChange={(e) => onConfigChange({ 
              chart_type: e.target.value as ChartConfig['chart_type'] 
            })}
          >
            <option value="scatter">Scatter Plot</option>
            <option value="line">Line Chart</option>
            <option value="bar">Bar Chart</option>
          </select>
        </div>

        <div className="control-group">
          <label htmlFor="x-column">X Axis:</label>
          <select
            id="x-column"
            value={config.x_column}
            onChange={(e) => onConfigChange({ x_column: e.target.value })}
          >
            {numericColumns.map(col => (
              <option key={col.name} value={col.name}>{col.name}</option>
            ))}
          </select>
        </div>

        <div className="control-group">
          <label htmlFor="y-column">Y Axis:</label>
          <select
            id="y-column"
            value={config.y_column}
            onChange={(e) => onConfigChange({ y_column: e.target.value })}
          >
            {numericColumns.map(col => (
              <option key={col.name} value={col.name}>{col.name}</option>
            ))}
          </select>
        </div>

        <div className="control-group">
          <label htmlFor="category-column">Category (optional):</label>
          <select
            id="category-column"
            value={config.category_column || ''}
            onChange={(e) => onConfigChange({ 
              category_column: e.target.value || undefined 
            })}
          >
            <option value="">None</option>
            {allColumns.map(col => (
              <option key={col.name} value={col.name}>{col.name}</option>
            ))}
          </select>
        </div>

        <div className="control-group">
          <label htmlFor="size-column">Size (optional):</label>
          <select
            id="size-column"
            value={config.size_column || ''}
            onChange={(e) => onConfigChange({ 
              size_column: e.target.value || undefined 
            })}
          >
            <option value="">None</option>
            {numericColumns.map(col => (
              <option key={col.name} value={col.name}>{col.name}</option>
            ))}
          </select>
        </div>

        <div className="control-group">
          <label htmlFor="color-column">Color (optional):</label>
          <select
            id="color-column"
            value={config.color_column || ''}
            onChange={(e) => onConfigChange({ 
              color_column: e.target.value || undefined 
            })}
          >
            <option value="">None</option>
            {allColumns.map(col => (
              <option key={col.name} value={col.name}>{col.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="config-summary">
        <h4>Current Configuration:</h4>
        <ul>
          <li><strong>Type:</strong> {config.chart_type}</li>
          <li><strong>X:</strong> {config.x_column}</li>
          <li><strong>Y:</strong> {config.y_column}</li>
          {config.category_column && (
            <li><strong>Category:</strong> {config.category_column}</li>
          )}
          {config.size_column && (
            <li><strong>Size:</strong> {config.size_column}</li>
          )}
          {config.color_column && (
            <li><strong>Color:</strong> {config.color_column}</li>
          )}
        </ul>
      </div>
    </div>
  )
}

export default ChartControls
