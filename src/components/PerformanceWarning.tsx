import React from 'react'

interface PerformanceWarningProps {
  totalRows: number
  displayedRows: number
  sampled: boolean
}

const PerformanceWarning: React.FC<PerformanceWarningProps> = ({
  totalRows,
  displayedRows,
  sampled
}) => {
  if (!sampled) return null

  return (
    <div className="performance-warning">
      <div className="warning-content">
        <span className="warning-icon">⚠️</span>
        <span className="warning-text">
          Performance mode: Showing {displayedRows.toLocaleString()} sampled points 
          from {totalRows.toLocaleString()} total rows for better performance.
        </span>
      </div>
    </div>
  )
}

export default PerformanceWarning
