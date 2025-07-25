export interface DataPoint {
  x: number
  y: number
  category?: string
  size?: number
  [key: string]: any // Allow additional properties
}

export interface ChartConfig {
  chart_type: 'scatter' | 'line' | 'bar'
  x_column: string
  y_column: string
  x_columns?: string[]
  y_columns?: string[]
  category_column?: string
  size_column?: string
  size_min?: number
  size_max?: number
  category_bins?: number
  opacity?: number
  hover_fields?: string[]
  animation_enabled?: boolean
  animation_speed?: number // seconds per frame
  animation_duration?: number // milliseconds for chart transitions
  transition_duration?: number // milliseconds for smooth transitions between frames
}

export interface ColumnInfo {
  name: string
  type: string
  is_numeric: boolean
}

export interface TableData {
  data: any[]
  columns: string[]
  total_rows: number
}

export interface ChartData {
  data: DataPoint[]
  config: ChartConfig
  total_points: number
}
