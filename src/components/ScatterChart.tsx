import React from 'react'
import { 
  ScatterChart as RechartsScatter, 
  Scatter, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Legend
} from 'recharts'
import type { DataPoint, ChartConfig } from '../types'

interface ScatterChartProps {
  data: DataPoint[]
  config: ChartConfig
}

const COLORS = [
  '#8884d8', '#82ca9d', '#ffc658', '#ff7c7c', '#8dd1e1', 
  '#d084d0', '#87d068', '#ffc0cb', '#ffb347', '#87ceeb'
]

const ScatterChart: React.FC<ScatterChartProps> = ({ data, config }) => {
  // Group data by category if category column is specified
  const groupedData = data.reduce((acc, point) => {
    const category = config.category_column ? point.category || 'Unknown' : 'All Data'
    if (!acc[category]) {
      acc[category] = []
    }
    acc[category].push(point)
    return acc
  }, {} as Record<string, DataPoint[]>)

  const categories = Object.keys(groupedData)

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length > 0) {
      const data = payload[0].payload
      const hoverFields = config.hover_fields || []
      
      return (
        <div className="scatter-tooltip">
          <p><strong>{config.x_column}:</strong> {data.x?.toFixed(2)}</p>
          <p><strong>{config.y_column}:</strong> {data.y?.toFixed(2)}</p>
          {config.category_column && <p><strong>{config.category_column}:</strong> {data.category}</p>}
          {config.size_column && <p><strong>{config.size_column}:</strong> {data.size?.toFixed(2)}</p>}
          {hoverFields.map(field => (
            data[field] !== undefined && (
              <p key={field}>
                <strong>{field}:</strong> {
                  typeof data[field] === 'number' 
                    ? data[field].toFixed(2) 
                    : data[field]
                }
              </p>
            )
          ))}
        </div>
      )
    }
    return null
  }

  return (
    <div className="scatter-chart-container">
      <div className="chart-header">
        <h3>
          Scatter Plot
          {config.animation_enabled && (
            <span className="animation-indicator">🎬 Animating</span>
          )}
        </h3>
        <div className="chart-config-info">
          <span>X: {config.x_column}</span>
          <span>Y: {config.y_column}</span>
          {config.category_column && <span>Category: {config.category_column}</span>}
          {config.animation_enabled && (
            <span className="animation-speed">Speed: {config.animation_speed || 2}s</span>
          )}
        </div>
      </div>
      
      <ResponsiveContainer width="100%" height={500}>
        <RechartsScatter
          margin={{
            top: 20,
            right: 20,
            bottom: 60,
            left: 60,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            type="number" 
            dataKey="x" 
            name={config.x_column}
            label={{ 
              value: config.x_column, 
              position: 'insideBottom', 
              offset: -20,
              style: { fontWeight: 'bold' }
            }}
          />
          <YAxis 
            type="number" 
            dataKey="y" 
            name={config.y_column}
            label={{ 
              value: config.y_column, 
              angle: 0, 
              position: 'insideLeft',
              offset: 50,
              style: { 
                fontWeight: 'bold', 
                textAnchor: 'end',
                transform: 'translateY(250%)'
              }
            }}
          />
          <Tooltip content={<CustomTooltip />} />
          {categories.length > 1 && <Legend iconType="circle" layout="vertical" align="right" verticalAlign="middle" />}
          
          {categories.map((category, index) => (
            <Scatter
              key={category}
              name={category}
              data={groupedData[category]}
              fill={COLORS[index % COLORS.length]}
              animationDuration={config.transition_duration || config.animation_duration || 800}
              animationEasing="ease-out"
              shape={(props: any) => {
                const { cx, cy, payload } = props
                const minSize = config.size_min || 3
                const maxSize = config.size_max || 25
                const radius = config.size_column && payload?.size 
                  ? Math.max(minSize, Math.min(maxSize, payload.size / 20)) // Scale the size appropriately
                  : 4 // Default size
                
                return (
                  <circle 
                    cx={cx} 
                    cy={cy} 
                    r={radius} 
                    fill={COLORS[index % COLORS.length]}
                    fillOpacity={config.opacity || 0.7}
                    stroke={COLORS[index % COLORS.length]}
                    strokeWidth={1}
                  />
                )
              }}
            />
          ))}
        </RechartsScatter>
      </ResponsiveContainer>
      
      <div className="chart-info">
        <p>Total points: {data.length}</p>
        {categories.length > 1 && (
          <p>Categories: {categories.join(', ')}</p>
        )}
      </div>
    </div>
  )
}

export default React.memo(ScatterChart)
