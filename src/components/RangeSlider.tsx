import React, { useState, useCallback, useRef, useEffect } from 'react'

interface RangeSliderProps {
  min: number
  max: number
  value: [number, number]
  onChange: (value: [number, number]) => void
  step?: number
  label?: string
  className?: string
}

const RangeSlider: React.FC<RangeSliderProps> = ({
  min,
  max,
  value,
  onChange,
  step = 1,
  label,
  className = ''
}) => {
  const [isDragging, setIsDragging] = useState<'min' | 'max' | null>(null)
  const sliderRef = useRef<HTMLDivElement>(null)

  const getPercentage = (val: number) => ((val - min) / (max - min)) * 100

  const getValueFromPercentage = useCallback((percentage: number) => {
    const rawValue = min + (percentage / 100) * (max - min)
    return Math.round(rawValue / step) * step
  }, [min, max, step])

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging || !sliderRef.current) return

    const rect = sliderRef.current.getBoundingClientRect()
    const percentage = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100))
    const newValue = getValueFromPercentage(percentage)

    if (isDragging === 'min') {
      const newMin = Math.min(newValue, value[1] - step)
      onChange([Math.max(min, newMin), value[1]])
    } else {
      const newMax = Math.max(newValue, value[0] + step)
      onChange([value[0], Math.min(max, newMax)])
    }
  }, [isDragging, value, onChange, getValueFromPercentage, min, max, step])

  const handleMouseUp = useCallback(() => {
    setIsDragging(null)
  }, [])

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      return () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
      }
    }
  }, [isDragging, handleMouseMove, handleMouseUp])

  const handleThumbMouseDown = (type: 'min' | 'max') => (e: React.MouseEvent) => {
    e.preventDefault()
    setIsDragging(type)
  }

  const minPercentage = getPercentage(value[0])
  const maxPercentage = getPercentage(value[1])

  return (
    <div className={`range-slider ${className}`}>
      {label && (
        <label className="range-slider-label">
          {label}: {value[0]} - {value[1]}
        </label>
      )}
      <div className="range-slider-container">
        <div
          ref={sliderRef}
          className="range-slider-track"
        >
          {/* Background track */}
          <div className="range-slider-track-bg" />
          
          {/* Active range */}
          <div
            className="range-slider-track-active"
            style={{
              left: `${minPercentage}%`,
              width: `${maxPercentage - minPercentage}%`
            }}
          />
          
          {/* Min thumb */}
          <div
            className={`range-slider-thumb range-slider-thumb-min ${isDragging === 'min' ? 'dragging' : ''}`}
            style={{ left: `${minPercentage}%` }}
            onMouseDown={handleThumbMouseDown('min')}
          />
          
          {/* Max thumb */}
          <div
            className={`range-slider-thumb range-slider-thumb-max ${isDragging === 'max' ? 'dragging' : ''}`}
            style={{ left: `${maxPercentage}%` }}
            onMouseDown={handleThumbMouseDown('max')}
          />
        </div>
        
        {/* Value indicators */}
        <div className="range-slider-values">
          <span className="range-slider-value-min">{min}</span>
          <span className="range-slider-value-max">{max}</span>
        </div>
      </div>
    </div>
  )
}

export default RangeSlider
