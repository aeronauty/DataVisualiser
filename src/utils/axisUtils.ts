// Utility functions for calculating axis limits across multiple columns

export interface AxisLimits {
  min: number;
  max: number;
}

/**
 * Calculate global min/max values across multiple columns in a dataset
 */
export function calculateGlobalLimits(
  data: any[], 
  columns: string[]
): AxisLimits {
  if (!data.length || !columns.length) {
    return { min: 0, max: 1 };
  }

  let globalMin = Infinity;
  let globalMax = -Infinity;

  // Check all values across all specified columns
  for (const row of data) {
    for (const column of columns) {
      const value = row[column];
      if (typeof value === 'number' && !isNaN(value) && isFinite(value)) {
        globalMin = Math.min(globalMin, value);
        globalMax = Math.max(globalMax, value);
      }
    }
  }

  // Handle edge cases
  if (!isFinite(globalMin) || !isFinite(globalMax)) {
    return { min: 0, max: 1 };
  }

  // Add some padding (5% on each side)
  const range = globalMax - globalMin;
  const padding = range * 0.05;
  
  return {
    min: globalMin - padding,
    max: globalMax + padding
  };
}

/**
 * Calculate axis limits for chart configuration
 */
export function calculateAxisLimits(
  data: any[],
  xColumns: string[],
  yColumns: string[]
): {
  xLimits: AxisLimits;
  yLimits: AxisLimits;
} {
  return {
    xLimits: calculateGlobalLimits(data, xColumns),
    yLimits: calculateGlobalLimits(data, yColumns)
  };
}

/**
 * Check if fixed axis limits should be enabled automatically
 * (when multiple columns are selected for either axis)
 */
export function shouldUseFixedLimits(
  xColumns: string[],
  yColumns: string[]
): boolean {
  return (xColumns && xColumns.length > 1) || (yColumns && yColumns.length > 1);
}

/**
 * Format axis limit value for display
 */
export function formatAxisValue(value: number): string {
  if (Math.abs(value) >= 1000000) {
    return (value / 1000000).toFixed(1) + 'M';
  } else if (Math.abs(value) >= 1000) {
    return (value / 1000).toFixed(1) + 'K';
  } else if (Math.abs(value) >= 1) {
    return value.toFixed(1);
  } else {
    return value.toFixed(3);
  }
}
