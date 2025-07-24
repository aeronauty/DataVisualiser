import React, { useRef, useEffect, useState } from 'react'
import { ChartAnimator } from '../utils/chartAnimator'
import type { DataPoint, AnimationConfig } from '../utils/chartAnimator'

interface BrowserAnimationProps {
  data: DataPoint[]
  config: {
    x_column: string
    y_column: string
    category_column?: string
    size_column?: string
    color_column?: string
  }
  onAnimationComplete?: (blob: Blob) => void
}

export const BrowserChartAnimation: React.FC<BrowserAnimationProps> = ({
  data,
  config,
  onAnimationComplete
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animatorRef = useRef<ChartAnimator | null>(null)
  const [isRecording, setIsRecording] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)

  // Initialize animator
  useEffect(() => {
    if (!canvasRef.current) return

    const animationConfig: AnimationConfig = {
      duration: 5, // 5 seconds
      fps: 30,
      easing: 'easeInOut',
      width: 800,
      height: 600,
      padding: { top: 40, right: 40, bottom: 80, left: 80 }
    }

    const animator = new ChartAnimator(canvasRef.current, animationConfig)
    animatorRef.current = animator

    return () => {
      animatorRef.current = null
    }
  }, [])

  // Update data when props change
  useEffect(() => {
    console.log('BrowserChartAnimation: Received data:', data, 'Config:', config)
    if (!animatorRef.current) return

    // Data is already in the correct format from parent component
    animatorRef.current.setData(data)
    
    // Draw initial static frame
    if (data.length > 0) {
      console.log('Drawing initial frame with', data.length, 'data points')
      // Show complete chart initially
      const completeFrame = {
        data: data.map(d => ({ ...d, opacity: 1 })),
        progress: 1
      }
      animatorRef.current.drawFrame(completeFrame)
    } else {
      console.log('No data to draw')
    }
  }, [data, config])

  const handlePreview = async () => {
    if (!animatorRef.current || isPlaying) return

    setIsPlaying(true)
    try {
      await animatorRef.current.playPreview()
    } finally {
      setIsPlaying(false)
    }
  }

  const handleRecord = async () => {
    if (!animatorRef.current || isRecording) return

    setIsRecording(true)
    try {
      const blob = await animatorRef.current.recordToGif()
      if (onAnimationComplete) {
        onAnimationComplete(blob)
      } else {
        // Auto-download if no callback provided
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `chart-animation-${Date.now()}.png` // Currently exports as PNG
        link.click()
        URL.revokeObjectURL(url)
      }
    } catch (error) {
      console.error('Recording failed:', error)
    } finally {
      setIsRecording(false)
    }
  }

  return (
    <div className="browser-animation">
      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-2">Browser-Based Animation</h3>
        <p className="text-sm text-gray-600 mb-4">
          Generate smooth interpolated animations directly in the browser
        </p>
      </div>

      <div className="mb-4">
        <canvas
          ref={canvasRef}
          className="border border-gray-300 rounded"
          style={{ maxWidth: '100%', height: 'auto' }}
        />
      </div>

      <div className="flex gap-2 mb-4">
        <button
          onClick={handlePreview}
          disabled={isPlaying || isRecording}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {isPlaying ? 'Playing...' : 'Preview Animation'}
        </button>

        <button
          onClick={handleRecord}
          disabled={isRecording || isPlaying}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
        >
          {isRecording ? 'Recording...' : 'Record GIF'}
        </button>
      </div>

      {(isRecording || isPlaying) && (
        <div className="mb-4">
          <div className="text-sm text-gray-600 mb-1">
            {isRecording ? 'Recording animation...' : 'Playing preview...'}
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300 animate-pulse"
              style={{ width: '60%' }}
            />
          </div>
        </div>
      )}

      <div className="text-sm text-gray-500">
        <p>Features:</p>
        <ul className="list-disc list-inside ml-2">
          <li>Smooth easing animations</li>
          <li>Points appear progressively</li>
          <li>No backend required</li>
          <li>Real-time preview</li>
        </ul>
      </div>
    </div>
  )
}
