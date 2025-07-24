import type { DataPoint, ColumnInfo } from '../types'

export function binData(
  data: DataPoint[], 
  categoryColumn: string, 
  numBins: number,
  columns: ColumnInfo[]
): DataPoint[] {
  // Check if the category column is numeric
  const categoryColumnInfo = columns.find(col => col.name === categoryColumn)
  const isNumeric = categoryColumnInfo?.is_numeric
  
  if (!isNumeric) {
    // If it's already categorical, return as-is
    return data
  }
  
  // Extract the values for the category column
  const values = data.map(point => point[categoryColumn]).filter(val => val != null)
  
  if (values.length === 0) {
    return data
  }
  
  // Calculate min and max values
  const minVal = Math.min(...values)
  const maxVal = Math.max(...values)
  
  // If all values are the same, create a single bin
  if (minVal === maxVal) {
    return data.map(point => ({
      ...point,
      category: `${categoryColumn}: ${minVal.toFixed(2)}`
    }))
  }
  
  // Calculate bin width
  const binWidth = (maxVal - minVal) / numBins
  
  // Function to determine which bin a value belongs to
  const getBinLabel = (value: number): string => {
    if (value === maxVal) {
      // Handle edge case where value equals maximum
      const binStart = minVal + (numBins - 1) * binWidth
      return `${categoryColumn}: ${binStart.toFixed(2)}-${maxVal.toFixed(2)}`
    }
    
    const binIndex = Math.floor((value - minVal) / binWidth)
    const binStart = minVal + binIndex * binWidth
    const binEnd = binStart + binWidth
    
    return `${categoryColumn}: ${binStart.toFixed(2)}-${binEnd.toFixed(2)}`
  }
  
  // Apply binning to the data
  return data.map(point => {
    const categoryValue = point[categoryColumn]
    if (categoryValue == null) {
      return {
        ...point,
        category: 'Unknown'
      }
    }
    
    return {
      ...point,
      category: getBinLabel(categoryValue)
    }
  })
}

export function shouldUseBinning(
  categoryColumn: string | undefined,
  columns: ColumnInfo[]
): boolean {
  if (!categoryColumn) {
    return false
  }
  
  const columnInfo = columns.find(col => col.name === categoryColumn)
  return columnInfo?.is_numeric || false
}
