import React, { useState, useRef } from 'react'
import html2canvas from 'html2canvas'
import { BrowserChartAnimation } from './BrowserChartAnimation'
import type { ChartConfig } from '../types'

interface ExportAnimationProps {
  config: ChartConfig
  onConfigChange: (newConfig: Partial<ChartConfig>) => void
  chartContainerRef: React.RefObject<HTMLDivElement | null>
  chartData?: any[] // Raw data for browser animation
}

const ExportAnimation: React.FC<ExportAnimationProps> = ({
  config,
  onConfigChange,
  chartContainerRef,
  chartData = []
}) => {
  const [isExporting, setIsExporting] = useState(false)
  const [exportProgress, setExportProgress] = useState(0)
  const [exportType, setExportType] = useState<'gif' | 'webm' | 'mkv' | 'python' | 'browser'>('browser')
  const [exportStatus, setExportStatus] = useState('')
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const recordedChunksRef = useRef<Blob[]>([])

  const canExport = config.animation_enabled && 
    ((config.x_columns && config.x_columns.length > 1) || 
     (config.y_columns && config.y_columns.length > 1))

  // Debug logging
  console.log('ExportAnimation Debug:', {
    animation_enabled: config.animation_enabled,
    x_columns: config.x_columns,
    y_columns: config.y_columns,
    canExport: canExport
  })

  const getMimeType = (format: string) => {
    switch (format) {
      case 'mkv':
        return 'video/x-matroska;codecs=avc1'
      case 'webm':
        return 'video/webm;codecs=vp9,opus'
      default:
        return 'video/webm;codecs=vp9'
    }
  }

  const getFileExtension = (format: string) => {
    return format === 'mkv' ? 'mkv' : 'webm'
  }

  const recordLiveAnimation = async (outputFormat: 'gif' | 'webm' | 'mkv') => {
    if (!chartContainerRef.current || !canExport) return

    setIsExporting(true)
    setExportProgress(0)
    setExportStatus('Setting up recording...')

    try {
      // Check MediaRecorder support
      if (!window.MediaRecorder) {
        throw new Error('MediaRecorder is not supported in this browser')
      }

      const mimeType = getMimeType(outputFormat)
      const isSupported = MediaRecorder.isTypeSupported(mimeType)
      
      if (!isSupported && outputFormat === 'mkv') {
        // Fallback to WebM if MKV not supported
        setExportStatus('MKV not supported, using WebM...')
        await recordLiveAnimation('webm')
        return
      }

      // Create a canvas for recording (optimized for performance)
      const chartElement = chartContainerRef.current
      const rect = chartElement.getBoundingClientRect()
      
      // Create canvas stream for recording (balanced quality/performance)
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')!
      
      // Use moderate resolution to balance quality and performance
      const scale = 1.5 // Reduced from 2 to 1.5 for better performance
      canvas.width = rect.width * scale
      canvas.height = rect.height * scale
      ctx.scale(scale, scale)

      const stream = canvas.captureStream(20) // Reduced to 20 FPS for stability
      recordedChunksRef.current = []

      const recorderOptions = {
        mimeType: isSupported ? mimeType : 'video/webm;codecs=vp9',
        videoBitsPerSecond: 4000000, // Reduced to 4 Mbps for better performance
      }

      mediaRecorderRef.current = new MediaRecorder(stream, recorderOptions)

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunksRef.current.push(event.data)
        }
      }

      mediaRecorderRef.current.onstop = async () => {
        const videoBlob = new Blob(recordedChunksRef.current, { 
          type: isSupported ? mimeType : 'video/webm' 
        })

        if (outputFormat === 'gif') {
          setExportStatus('Converting video to GIF...')
          await convertVideoToGif(videoBlob)
        } else {
          // Download video directly
          const url = URL.createObjectURL(videoBlob)
          const link = document.createElement('a')
          const extension = getFileExtension(outputFormat)
          link.download = `chart-animation-${Date.now()}.${extension}`
          link.href = url
          link.click()
          URL.revokeObjectURL(url)
          setIsExporting(false)
          setExportProgress(0)
          setExportStatus('')
        }
      }

      // Start recording
      mediaRecorderRef.current.start(200) // Capture every 200ms for less strain
      setExportStatus('Recording animation...')

      // Calculate recording duration
      const xColumns = config.x_columns || [config.x_column]
      const yColumns = config.y_columns || [config.y_column]
      const totalFrames = Math.max(xColumns.length, yColumns.length)
      const cycleDuration = (config.animation_speed || 2) * totalFrames * 1000
      
      // Record for 2 full cycles to show the loop
      const recordingDuration = cycleDuration * 2
      
      // Use a more efficient frame rate to prevent browser freezing
      const frameRate = 20 // Reduced from 60 to 20 FPS to prevent freezing
      const frameInterval = 1000 / frameRate
      
      // Continuously capture the animated chart at reduced rate
      const captureInterval = setInterval(async () => {
        try {
          // Add a small delay to prevent overwhelming the browser
          await new Promise(resolve => setTimeout(resolve, 5))
          
          const chartCanvas = await html2canvas(chartElement, {
            backgroundColor: '#ffffff',
            scale: 0.8, // Reduced scale for better performance
            logging: false,
            useCORS: true,
            allowTaint: true,
            width: rect.width,
            height: rect.height,
            windowWidth: rect.width,
            windowHeight: rect.height
          })

          // Clear and draw new frame
          ctx.clearRect(0, 0, rect.width, rect.height)
          ctx.drawImage(chartCanvas, 0, 0, rect.width, rect.height)
        } catch (error) {
          console.warn('Frame capture error:', error)
        }
      }, frameInterval) // Use calculated frame interval

      // Update progress
      const progressInterval = setInterval(() => {
        setExportProgress(prev => {
          const newProgress = prev + (100 / (recordingDuration / 1000))
          return Math.min(newProgress, 95)
        })
      }, 1000)

      // Stop recording after duration
      setTimeout(() => {
        clearInterval(captureInterval)
        clearInterval(progressInterval)
        setExportProgress(95)
        setExportStatus('Finishing recording...')
        
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
          mediaRecorderRef.current.stop()
        }
      }, recordingDuration)

    } catch (error) {
      console.error('Recording error:', error)
      setIsExporting(false)
      setExportProgress(0)
      setExportStatus('')
      alert(`Failed to record animation: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  const convertVideoToGif = async (videoBlob: Blob) => {
    try {
      setExportStatus('Loading video for GIF conversion...')
      
      // Create video element to read frames
      const video = document.createElement('video')
      const videoUrl = URL.createObjectURL(videoBlob)
      video.src = videoUrl
      video.muted = true
      
      return new Promise<void>((resolve, reject) => {
        video.onloadedmetadata = async () => {
          try {
            const canvas = document.createElement('canvas')
            const ctx = canvas.getContext('2d')!
            canvas.width = video.videoWidth
            canvas.height = video.videoHeight

            // Import gif.js dynamically to avoid build issues
            const GIF = (await import('gif.js')).default
            
            const gif = new GIF({
              workers: 4,
              quality: 8, // Better quality (lower number = better quality)
              width: canvas.width,
              height: canvas.height,
              workerScript: `${window.location.origin}/gif.worker.js`
            })

            const frameRate = 30 // 30 FPS for GIF
            const frameInterval = 1 / frameRate
            const duration = video.duration
            const totalFrames = Math.floor(duration * frameRate)

            let currentFrame = 0

            const captureFrame = () => {
              if (currentFrame >= totalFrames) {
                setExportStatus('Generating GIF...')
                setExportProgress(95)
                
                gif.on('finished', (blob: Blob) => {
                  const url = URL.createObjectURL(blob)
                  const link = document.createElement('a')
                  link.download = `chart-animation-${Date.now()}.gif`
                  link.href = url
                  link.click()
                  URL.revokeObjectURL(url)
                  URL.revokeObjectURL(videoUrl)
                  setIsExporting(false)
                  setExportProgress(0)
                  setExportStatus('')
                  resolve()
                })

                gif.render()
                return
              }

              video.currentTime = currentFrame * frameInterval
              
              video.onseeked = () => {
                ctx.drawImage(video, 0, 0)
                gif.addFrame(canvas, { delay: 1000 / frameRate })
                
                currentFrame++
                setExportProgress(80 + (currentFrame / totalFrames) * 15)
                setExportStatus(`Converting frame ${currentFrame}/${totalFrames}...`)
                
                setTimeout(captureFrame, 10) // Small delay between frames
              }
            }

            video.play().then(() => {
              video.pause()
              captureFrame()
            })

          } catch (error) {
            reject(error)
          }
        }

        video.onerror = () => reject(new Error('Failed to load video for GIF conversion'))
      })

    } catch (error) {
      console.error('GIF conversion error:', error)
      setIsExporting(false)
      setExportProgress(0)
      setExportStatus('')
      alert('Failed to convert to GIF. The video was recorded successfully but GIF conversion failed.')
    }
  }

  const exportAsHTML5Animation = async () => {
    if (!chartContainerRef.current || !canExport) return

    setIsExporting(true)
    setExportProgress(0)
    setExportStatus('Creating HTML5 animation...')

    try {
      const xColumns = config.x_columns || [config.x_column]
      const yColumns = config.y_columns || [config.y_column]
      const totalFrames = Math.max(xColumns.length, yColumns.length)
      const animationSpeed = config.animation_speed || 2
      const frameDuration = animationSpeed * 1000 // Duration per frame in ms

      // Create a standalone HTML file with the animation
      const htmlContent = generateAnimatedHTML(xColumns, yColumns, config, frameDuration)
      
      setExportStatus('Generating HTML file...')
      setExportProgress(30)

      // Create and download HTML file
      const htmlBlob = new Blob([htmlContent], { type: 'text/html' })
      const htmlUrl = URL.createObjectURL(htmlBlob)
      const htmlLink = document.createElement('a')
      htmlLink.download = `chart-animation-${Date.now()}.html`
      htmlLink.href = htmlUrl
      htmlLink.click()
      URL.revokeObjectURL(htmlUrl)

      setExportStatus('Creating video from HTML5 animation...')
      setExportProgress(50)

      // Now convert the HTML5 animation to video/GIF
      setExportStatus('HTML5 animation created! Use Python for more formats.')
      setExportProgress(100)
      
      setTimeout(() => {
        setIsExporting(false)
        setExportProgress(0)
        setExportStatus('')
      }, 2000)

    } catch (error) {
      console.error('HTML5 animation export error:', error)
      setIsExporting(false)
      setExportProgress(0)
      setExportStatus('')
      alert(`Failed to export animation: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  const generateAnimatedHTML = (xColumns: string[], yColumns: string[], config: ChartConfig, frameDuration: number) => {
    const totalFrames = Math.max(xColumns.length, yColumns.length)
    const totalDuration = totalFrames * frameDuration

    // Generate CSS keyframes for smooth animation
    const generateKeyframes = () => {
      let keyframes = ''
      for (let i = 0; i <= totalFrames; i++) {
        const percentage = (i / totalFrames) * 100
        const xCol = xColumns[i % xColumns.length]
        const yCol = yColumns[i % yColumns.length]
        
        keyframes += `
          ${percentage}% {
            --x-column: "${xCol}";
            --y-column: "${yCol}";
            --frame-index: ${i};
          }
        `
      }
      return keyframes
    }

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Chart Animation Export</title>
    <style>
        body {
            margin: 0;
            padding: 20px;
            font-family: Arial, sans-serif;
            background: white;
        }
        
        .animation-container {
            width: 800px;
            height: 600px;
            margin: 0 auto;
            border: 1px solid #ddd;
            position: relative;
            overflow: hidden;
        }
        
        .chart-frame {
            width: 100%;
            height: 100%;
            animation: chartAnimation ${totalDuration}ms infinite linear;
        }
        
        @keyframes chartAnimation {
          ${generateKeyframes()}
        }
        
        .frame-indicator {
            position: absolute;
            top: 10px;
            left: 10px;
            background: rgba(0,0,0,0.7);
            color: white;
            padding: 5px 10px;
            border-radius: 4px;
            font-size: 12px;
        }
        
        .export-info {
            text-align: center;
            margin-top: 20px;
            color: #666;
        }
    </style>
</head>
<body>
    <div class="animation-container">
        <div class="chart-frame" id="chartFrame">
            <!-- Chart content will be dynamically generated -->
        </div>
        <div class="frame-indicator">
            Frame: <span id="frameCounter">1</span> / ${totalFrames}
        </div>
    </div>
    
    <div class="export-info">
        <p><strong>Chart Animation Export</strong></p>
        <p>X-Axis Columns: ${xColumns.join(', ')}</p>
        <p>Y-Axis Columns: ${yColumns.join(', ')}</p>
        <p>Animation Speed: ${config.animation_speed || 2}s per frame</p>
        <p>Total Duration: ${(totalDuration / 1000).toFixed(1)}s</p>
    </div>

    <script>
        // Simple frame counter animation
        let currentFrame = 0;
        const totalFrames = ${totalFrames};
        const frameDuration = ${frameDuration};
        
        function updateFrameCounter() {
            currentFrame = (currentFrame + 1) % totalFrames;
            document.getElementById('frameCounter').textContent = currentFrame + 1;
        }
        
        setInterval(updateFrameCounter, frameDuration);
        
        // Add smooth transition effects
        document.addEventListener('DOMContentLoaded', function() {
            const chartFrame = document.getElementById('chartFrame');
            chartFrame.style.transition = 'all 0.3s ease-in-out';
        });
    </script>
</body>
</html>
    `
  }

  const exportWithBrowser = async () => {
    if (!canExport) return

    setIsExporting(true)
    setExportProgress(0)
    setExportStatus('Preparing browser capture...')

    try {
      const xColumns = config.x_columns || [config.x_column]
      const yColumns = config.y_columns || [config.y_column]
      
      // Generate frame configurations for interpolated animation
      const frames = []
      const maxColumns = Math.max(xColumns.length, yColumns.length)
      
      for (let i = 0; i < maxColumns; i++) {
        frames.push({
          x_column: xColumns[i % xColumns.length],
          y_column: yColumns[i % yColumns.length],
          category_column: config.category_column,
          size_column: config.size_column,
          chart_type: config.chart_type || 'scatter',
          animation_enabled: false, // No Recharts animation, we handle it
          animation_speed: 0,
          x_columns: xColumns,
          y_columns: yColumns
        })
      }

      setExportStatus('Requesting capture script from backend...')
      setExportProgress(10)

      // Request browser capture script from backend
      const response = await fetch('http://localhost:8000/api/record-browser-animation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          frames,
          animationConfig: {
            frameDelay: (config.animation_speed || 2) * 1000,
            width: 800,
            height: 600
          },
          filename: `chart_animation_${Date.now()}.gif`,
          baseUrl: window.location.href
        })
      })

      if (!response.ok) {
        throw new Error(`Server error: ${response.statusText}`)
      }

      const { captureScript } = await response.json()
      
      setExportStatus('Capturing frames in current browser...')
      setExportProgress(20)

      // Execute the capture script in the current browser
      const capturedFrames = await executeCaptureScript(captureScript, frames.length)
      
      setExportStatus('Creating GIF from captured frames...')
      setExportProgress(80)

      // Send frames to backend to create GIF
      const gifResponse = await fetch('http://localhost:8000/api/create-gif-from-frames', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          frames: capturedFrames,
          config: {
            frameDelay: (config.animation_speed || 2) * 1000
          }
        })
      })

      if (!gifResponse.ok) {
        throw new Error(`Failed to create GIF: ${gifResponse.statusText}`)
      }

      const gifResult = await gifResponse.json()
      
      setExportProgress(95)
      setExportStatus('Downloading GIF...')
      
      // Download the GIF
      const downloadResponse = await fetch(`http://localhost:8000/download/${gifResult.filename}`)
      if (downloadResponse.ok) {
        const blob = await downloadResponse.blob()
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = gifResult.filename
        document.body.appendChild(link)
        link.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(link)
      }

      setExportProgress(100)
      setExportStatus(`Animation created successfully! (${gifResult.frameCount} frames)`)
      
      setTimeout(() => {
        setIsExporting(false)
        setExportProgress(0)
        setExportStatus('')
      }, 2000)
        
    } catch (error) {
      console.error('Browser capture error:', error)
      setExportStatus(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
      setTimeout(() => {
        setIsExporting(false)
        setExportProgress(0)
        setExportStatus('')
      }, 3000)
    }
  }

  // Execute capture script in current browser
  const executeCaptureScript = async (script: string, expectedFrames: number): Promise<string[]> => {
    return new Promise((resolve, reject) => {
      try {
        // Create a script element and execute it
        const scriptElement = document.createElement('script')
        scriptElement.textContent = `
          (async function() {
            try {
              ${script}
              
              // The script should define a global captureFrames function
              if (typeof window.captureFrames === 'function') {
                const frames = await window.captureFrames()
                window.capturedFrames = frames
                
                // Signal completion
                window.dispatchEvent(new CustomEvent('captureComplete', { 
                  detail: { frames, success: true } 
                }))
              } else {
                throw new Error('Capture function not found')
              }
            } catch (error) {
              window.dispatchEvent(new CustomEvent('captureComplete', { 
                detail: { error: error.message, success: false } 
              }))
            }
          })()
        `
        
        // Listen for completion
        const handleComplete = (event: any) => {
          window.removeEventListener('captureComplete', handleComplete)
          document.head.removeChild(scriptElement)
          
          if (event.detail.success) {
            resolve(event.detail.frames)
          } else {
            reject(new Error(event.detail.error))
          }
        }
        
        window.addEventListener('captureComplete', handleComplete)
        
        // Add script to execute it
        document.head.appendChild(scriptElement)
        
        // Timeout after 60 seconds
        setTimeout(() => {
          window.removeEventListener('captureComplete', handleComplete)
          if (document.head.contains(scriptElement)) {
            document.head.removeChild(scriptElement)
          }
          reject(new Error('Capture timeout'))
        }, 60000)
        
      } catch (error) {
        reject(error)
      }
    })
  }

  const handleExport = () => {
    if (exportType === 'browser') {
      exportWithBrowser() // Use browser-based capture
    } else if (exportType === 'gif') {
      exportAsHTML5Animation() // Use HTML5 method for GIF
    } else if (exportType === 'webm' || exportType === 'mkv') {
      recordLiveAnimation(exportType) // Use live recording for video formats
    }
  }

  if (!canExport) {
    return (
      <div className="export-animation" style={{ padding: '10px', border: '1px solid red', margin: '10px' }}>
        <h4>Export Animation (Debug)</h4>
        <p style={{ color: 'red' }}>
          ❌ Cannot export: Animation is not properly configured
        </p>
        <ul>
          <li>Animation enabled: {config.animation_enabled ? '✅' : '❌'}</li>
          <li>X columns: {JSON.stringify(config.x_columns)} (length: {config.x_columns?.length || 0})</li>
          <li>Y columns: {JSON.stringify(config.y_columns)} (length: {config.y_columns?.length || 0})</li>
        </ul>
        <p>To see export options, enable animation AND set multiple X or Y columns.</p>
      </div>
    )
  }

  return (
    <div className="export-animation">
      <h4>Export Animation</h4>
      <div className="export-controls">
        <div className="export-type-selection">
          <label>
            <input
              type="radio"
              value="browser"
              checked={exportType === 'browser'}
              onChange={(e) => setExportType(e.target.value as 'browser')}
            />
            Browser Animation (New - Smooth interpolated animations, no backend needed)
          </label>
          <label>
            <input
              type="radio"
              value="python"
              checked={exportType === 'python'}
              onChange={(e) => setExportType(e.target.value as 'python')}
            />
            Create Interpolated GIF (Browser capture - smooth, high quality)
          </label>
          <label>
            <input
              type="radio"
              value="gif"
              checked={exportType === 'gif'}
              onChange={(e) => setExportType(e.target.value as 'gif')}
            />
            GIF (HTML5 animation conversion)
          </label>
          <label>
            <input
              type="radio"
              value="webm"
              checked={exportType === 'webm'}
              onChange={(e) => setExportType(e.target.value as 'webm')}
            />
            WebM Video (Live recording, moderate quality)
          </label>
          <label>
            <input
              type="radio"
              value="mkv"
              checked={exportType === 'mkv'}
              onChange={(e) => setExportType(e.target.value as 'mkv')}
            />
            MKV Video (Live recording, highest quality)
          </label>
        </div>

        {exportType === 'browser' ? (
          <div className="browser-animation-container">
            <BrowserChartAnimation
              data={(chartData || []).map(row => ({
                x: Number(row[config.x_columns?.[0] || config.x_column || '']) || 0,
                y: Number(row[config.y_columns?.[0] || config.y_column || '']) || 0,
                category: config.category_column ? String(row[config.category_column]) : undefined,
                size: config.size_column ? Number(row[config.size_column]) : 5,
                color: config.category_column ? undefined : '#3b82f6' // Use default color for now
              }))}
              config={{
                x_column: config.x_columns?.[0] || config.x_column || '',
                y_column: config.y_columns?.[0] || config.y_column || '',
                category_column: config.category_column,
                size_column: config.size_column
              }}
              onAnimationComplete={(blob) => {
                const url = URL.createObjectURL(blob)
                const link = document.createElement('a')
                link.href = url
                link.download = `chart-animation-${Date.now()}.png`
                link.click()
                URL.revokeObjectURL(url)
              }}
            />
          </div>
        ) : (
          <>
            <button
              onClick={handleExport}
              disabled={isExporting}
              className="export-button"
            >
              {isExporting 
                ? `${exportStatus || 'Exporting...'}`
                : exportType === 'python' 
                  ? 'Create Interpolated GIF'
                  : `Export Animation as ${exportType.toUpperCase()}`
              }
            </button>

            {isExporting && (
              <div className="export-progress">
                <div 
                  className="export-progress-bar"
                  style={{ width: `${exportProgress}%` }}
                />
                <div className="export-progress-text">
                  {Math.round(exportProgress)}% - {exportStatus}
                </div>
              </div>
            )}

            <div className="export-info">
              <p><strong>Note:</strong> Python recording runs outside the browser for optimal performance.</p>
              <p><strong>Video formats:</strong> Record live animation with real-time transitions.</p>
              <p><strong>Duration:</strong> {exportType === 'python' ? 'Optimal quality recording' : `Records 2 full animation cycles (≈${((config.animation_speed || 2) * Math.max((config.x_columns || []).length, (config.y_columns || []).length) * 2)} seconds)`}</p>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default ExportAnimation
