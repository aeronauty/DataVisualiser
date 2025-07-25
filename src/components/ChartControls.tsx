import React from 'react'
import type { ChartConfig, ColumnInfo } from '../types'
import RangeSlider from './RangeSlider'
import MultiSelect from './MultiSelect'
import { shouldUseBinning } from '../utils/dataUtils'

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
          <MultiSelect
            options={numericColumns.map(col => col.name)}
            selectedValues={config.x_columns || [config.x_column]}
            onChange={(values) => {
              onConfigChange({ 
                x_columns: values,
                x_column: values[0] || config.x_column // Keep first as current for compatibility
              })
            }}
            label="X Axis (select multiple for animation)"
            placeholder="Select X axis columns..."
          />
        </div>

        <div className="control-group">
          <MultiSelect
            options={numericColumns.map(col => col.name)}
            selectedValues={config.y_columns || [config.y_column]}
            onChange={(values) => {
              onConfigChange({ 
                y_columns: values,
                y_column: values[0] || config.y_column // Keep first as current for compatibility
              })
            }}
            label="Y Axis (select multiple for animation)"
            placeholder="Select Y axis columns..."
          />
        </div>

        {((config.x_columns && config.x_columns.length > 1) || 
          (config.y_columns && config.y_columns.length > 1)) && (
          <>
            <div className="control-group">
              <label>
                <input
                  type="checkbox"
                  checked={config.animation_enabled || false}
                  onChange={(e) => onConfigChange({ 
                    animation_enabled: e.target.checked 
                  })}
                />
                Enable Animation
              </label>
            </div>

            {config.animation_enabled && (
              <>
                <div className="control-group">
                  <label htmlFor="animation-speed">Animation Speed: {config.animation_speed || 2}s per frame</label>
                  <input
                    type="range"
                    id="animation-speed"
                    min="0.5"
                    max="10"
                    step="0.5"
                    value={config.animation_speed || 2}
                    onChange={(e) => onConfigChange({ 
                      animation_speed: parseFloat(e.target.value) 
                    })}
                  />
                </div>

                <div className="control-group">
                  <label htmlFor="animation-duration">Animation Duration: {config.animation_duration || 800}ms</label>
                  <input
                    type="range"
                    id="animation-duration"
                    min="200"
                    max="2000"
                    step="100"
                    value={config.animation_duration || 800}
                    onChange={(e) => onConfigChange({ 
                      animation_duration: parseInt(e.target.value) 
                    })}
                  />
                </div>

                <div className="control-group">
                  <label htmlFor="transition-duration">Transition Duration: {config.transition_duration || 1000}ms</label>
                  <input
                    type="range"
                    id="transition-duration"
                    min="500"
                    max="3000"
                    step="100"
                    value={config.transition_duration || 1000}
                    onChange={(e) => onConfigChange({ 
                      transition_duration: parseInt(e.target.value) 
                    })}
                  />
                </div>
              </>
            )}
          </>
        )}

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

        {config.category_column && (
          <>
            {shouldUseBinning(config.category_column, columns) && (
              <div className="control-group">
                <label htmlFor="category-bins">Number of bins: {config.category_bins || 5}</label>
                <input
                  type="range"
                  id="category-bins"
                  min="2"
                  max="20"
                  value={config.category_bins || 5}
                  onChange={(e) => onConfigChange({ 
                    category_bins: parseInt(e.target.value) 
                  })}
                />
              </div>
            )}
          </>
        )}

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

        {config.size_column && (
          <div className="control-group">
            <RangeSlider
              min={1}
              max={50}
              value={[config.size_min || 3, config.size_max || 25]}
              onChange={([min, max]) => onConfigChange({ 
                size_min: min,
                size_max: max
              })}
              label="Size Range"
            />
          </div>
        )}

        <div className="control-group">
          <label htmlFor="opacity">Opacity: {Math.round((config.opacity || 0.7) * 100)}%</label>
          <input
            type="range"
            id="opacity"
            min="0.1"
            max="1"
            step="0.05"
            value={config.opacity || 0.7}
            onChange={(e) => onConfigChange({ 
              opacity: parseFloat(e.target.value) 
            })}
          />
        </div>

        <div className="control-group">
          <MultiSelect
            options={allColumns.map(col => col.name)}
            selectedValues={config.hover_fields || []}
            onChange={(values) => onConfigChange({ hover_fields: values })}
            label="Hover Information"
            placeholder="Select fields to show on hover..."
          />
        </div>
      </div>

      <div className="config-summary">
        <h4>Current Configuration:</h4>
        <ul>
          <li><strong>Type:</strong> {config.chart_type}</li>
          <li><strong>X:</strong> {config.x_column} 
            {config.x_columns && config.x_columns.length > 1 && 
              ` (${config.x_columns.length} total: ${config.x_columns.join(', ')})`
            }
          </li>
          <li><strong>Y:</strong> {config.y_column}
            {config.y_columns && config.y_columns.length > 1 && 
              ` (${config.y_columns.length} total: ${config.y_columns.join(', ')})`
            }
          </li>
          {config.animation_enabled && (
            <li><strong>Animation:</strong> Enabled ({config.animation_speed || 2}s per frame)</li>
          )}
          {config.category_column && (
            <li>
              <strong>Category:</strong> {config.category_column}
              {shouldUseBinning(config.category_column, columns) && 
                ` (${config.category_bins || 5} bins)`
              }
            </li>
          )}
          {config.size_column && (
            <li><strong>Size:</strong> {config.size_column} (range: {config.size_min || 3}-{config.size_max || 25})</li>
          )}
          <li><strong>Opacity:</strong> {Math.round((config.opacity || 0.7) * 100)}%</li>
          {config.hover_fields && config.hover_fields.length > 0 && (
            <li><strong>Hover Fields:</strong> {config.hover_fields.join(', ')}</li>
          )}
        </ul>
      </div>
    </div>
  )
}

export default ChartControls
