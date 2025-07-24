/**
 * Chart Animation Engine
 * Creates smooth interpolated animations by calculating intermediate positions between data points
 */

export interface DataPoint {
  x: number
  y: number
  category?: string
  size?: number
  color?: string
  [key: string]: any
}

export interface AnimationFrame {
  data: DataPoint[]
  progress: number
}

export interface AnimationConfig {
  duration: number // seconds
  fps: number
  easing: 'linear' | 'easeInOut' | 'easeIn' | 'easeOut'
  width: number
  height: number
  padding: { top: number, right: number, bottom: number, left: number }
}

export class ChartAnimator {
  private canvas: HTMLCanvasElement
  private ctx: CanvasRenderingContext2D
  private config: AnimationConfig
  private data: DataPoint[]
  private frames: AnimationFrame[] = []
  private isRecording = false

  constructor(canvas: HTMLCanvasElement, config: AnimationConfig) {
    this.canvas = canvas
    this.ctx = canvas.getContext('2d')!
    this.config = config
    this.data = []
    
    // Set canvas size
    this.canvas.width = config.width
    this.canvas.height = config.height
  }

  setData(data: DataPoint[]) {
    this.data = [...data]
  }

  /**
   * Easing functions for smooth animations
   */
  private easeInOut(t: number): number {
    return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t
  }

  private easeIn(t: number): number {
    return t * t
  }

  private easeOut(t: number): number {
    return t * (2 - t)
  }

  private applyEasing(progress: number): number {
    switch (this.config.easing) {
      case 'easeInOut': return this.easeInOut(progress)
      case 'easeIn': return this.easeIn(progress)
      case 'easeOut': return this.easeOut(progress)
      default: return progress // linear
    }
  }

  /**
   * Generate interpolated data points for animation frames
   */
  generateFrames(): AnimationFrame[] {
    if (this.data.length === 0) {
      console.warn('No data available for animation')
      return []
    }

    const totalFrames = Math.floor(this.config.duration * this.config.fps)
    const frames: AnimationFrame[] = []

    // Sort data by x value to create a progressive animation
    const sortedData = [...this.data].sort((a, b) => a.x - b.x)
    
    for (let frameIndex = 0; frameIndex < totalFrames; frameIndex++) {
      const rawProgress = frameIndex / (totalFrames - 1)
      const easedProgress = this.applyEasing(rawProgress)
      
      // Calculate how many points to show at this frame
      const pointsToShow = Math.floor(easedProgress * sortedData.length)
      
      // Create interpolated points for smooth entry
      const frameData: DataPoint[] = []
      
      for (let i = 0; i < pointsToShow; i++) {
        const point = sortedData[i]
        
        // If this is the last point being added, interpolate its entry
        if (i === pointsToShow - 1 && pointsToShow < sortedData.length) {
          const entryProgress = (easedProgress * sortedData.length) - pointsToShow
          
          // Animate point appearing from bottom or center
          const targetY = point.y
          const startY = targetY + 50 // Start slightly below
          const currentY = startY + (targetY - startY) * entryProgress
          
          // Animate size/opacity
          const targetSize = point.size || 5
          const currentSize = targetSize * entryProgress
          
          frameData.push({
            ...point,
            y: currentY,
            size: currentSize,
            opacity: entryProgress
          })
        } else {
          // Point is fully visible
          frameData.push({
            ...point,
            opacity: 1
          })
        }
      }
      
      frames.push({
        data: frameData,
        progress: rawProgress
      })
    }

    this.frames = frames
    return frames
  }

  /**
   * Calculate chart scales based on data
   */
  private getScales() {
    if (this.data.length === 0) {
      return {
        xScale: (x: number) => x,
        yScale: (y: number) => y,
        xDomain: [0, 1],
        yDomain: [0, 1]
      }
    }

    const xValues = this.data.map(d => d.x)
    const yValues = this.data.map(d => d.y)
    
    const xMin = Math.min(...xValues)
    const xMax = Math.max(...xValues)
    const yMin = Math.min(...yValues)
    const yMax = Math.max(...yValues)
    
    // Add some padding to domains
    const xPadding = (xMax - xMin) * 0.1
    const yPadding = (yMax - yMin) * 0.1
    
    const xDomain = [xMin - xPadding, xMax + xPadding]
    const yDomain = [yMin - yPadding, yMax + yPadding]
    
    const chartWidth = this.config.width - this.config.padding.left - this.config.padding.right
    const chartHeight = this.config.height - this.config.padding.top - this.config.padding.bottom
    
    const xScale = (x: number) => {
      const normalized = (x - xDomain[0]) / (xDomain[1] - xDomain[0])
      return this.config.padding.left + normalized * chartWidth
    }
    
    const yScale = (y: number) => {
      const normalized = (y - yDomain[0]) / (yDomain[1] - yDomain[0])
      return this.config.height - this.config.padding.bottom - normalized * chartHeight
    }
    
    return { xScale, yScale, xDomain, yDomain }
  }

  /**
   * Draw chart axes and grid
   */
  private drawAxes() {
    const { xScale, yScale, xDomain, yDomain } = this.getScales()
    
    this.ctx.strokeStyle = '#e0e0e0'
    this.ctx.lineWidth = 1
    this.ctx.font = '12px Arial'
    this.ctx.fillStyle = '#666'
    
    // Draw axes
    this.ctx.beginPath()
    // X-axis
    this.ctx.moveTo(this.config.padding.left, this.config.height - this.config.padding.bottom)
    this.ctx.lineTo(this.config.width - this.config.padding.right, this.config.height - this.config.padding.bottom)
    // Y-axis
    this.ctx.moveTo(this.config.padding.left, this.config.padding.top)
    this.ctx.lineTo(this.config.padding.left, this.config.height - this.config.padding.bottom)
    this.ctx.stroke()
    
    // Draw grid lines and labels
    const xTicks = 5
    const yTicks = 5
    
    for (let i = 0; i <= xTicks; i++) {
      const x = xDomain[0] + (i / xTicks) * (xDomain[1] - xDomain[0])
      const screenX = xScale(x)
      
      // Grid line
      this.ctx.beginPath()
      this.ctx.moveTo(screenX, this.config.padding.top)
      this.ctx.lineTo(screenX, this.config.height - this.config.padding.bottom)
      this.ctx.strokeStyle = '#f0f0f0'
      this.ctx.stroke()
      
      // Label
      this.ctx.fillText(
        x.toFixed(1),
        screenX - 10,
        this.config.height - this.config.padding.bottom + 20
      )
    }
    
    for (let i = 0; i <= yTicks; i++) {
      const y = yDomain[0] + (i / yTicks) * (yDomain[1] - yDomain[0])
      const screenY = yScale(y)
      
      // Grid line
      this.ctx.beginPath()
      this.ctx.moveTo(this.config.padding.left, screenY)
      this.ctx.lineTo(this.config.width - this.config.padding.right, screenY)
      this.ctx.strokeStyle = '#f0f0f0'
      this.ctx.stroke()
      
      // Label
      this.ctx.fillText(
        y.toFixed(1),
        this.config.padding.left - 30,
        screenY + 4
      )
    }
  }

  /**
   * Draw data points for a single frame
   */
  drawFrame(frame: AnimationFrame) {
    // Clear canvas
    this.ctx.clearRect(0, 0, this.config.width, this.config.height)
    
    // Draw axes and grid
    this.drawAxes()
    
    const { xScale, yScale } = this.getScales()
    
    // Draw data points
    frame.data.forEach(point => {
      const x = xScale(point.x)
      const y = yScale(point.y)
      const size = (point.size || 5) * 2
      const opacity = point.opacity || 1
      
      // Set point color with opacity
      const color = point.color || '#3b82f6'
      this.ctx.fillStyle = this.hexToRgba(color, opacity)
      
      // Draw circle
      this.ctx.beginPath()
      this.ctx.arc(x, y, size, 0, 2 * Math.PI)
      this.ctx.fill()
      
      // Add stroke for better visibility
      this.ctx.strokeStyle = this.hexToRgba('#fff', opacity)
      this.ctx.lineWidth = 1
      this.ctx.stroke()
    })
    
    // Draw progress indicator
    this.drawProgressIndicator(frame.progress)
  }

  /**
   * Draw progress indicator
   */
  private drawProgressIndicator(progress: number) {
    const barWidth = 200
    const barHeight = 8
    const x = this.config.width - barWidth - 20
    const y = 20
    
    // Background
    this.ctx.fillStyle = '#e0e0e0'
    this.ctx.fillRect(x, y, barWidth, barHeight)
    
    // Progress
    this.ctx.fillStyle = '#3b82f6'
    this.ctx.fillRect(x, y, barWidth * progress, barHeight)
    
    // Progress text
    this.ctx.fillStyle = '#333'
    this.ctx.font = '12px Arial'
    this.ctx.fillText(
      `${Math.round(progress * 100)}%`,
      x + barWidth + 10,
      y + barHeight
    )
  }

  /**
   * Convert hex color to rgba
   */
  private hexToRgba(hex: string, alpha: number): string {
    const r = parseInt(hex.slice(1, 3), 16)
    const g = parseInt(hex.slice(3, 5), 16)
    const b = parseInt(hex.slice(5, 7), 16)
    return `rgba(${r}, ${g}, ${b}, ${alpha})`
  }

  /**
   * Start recording animation to GIF
   */
  async recordToGif(): Promise<Blob> {
    if (this.isRecording) {
      throw new Error('Already recording')
    }

    this.isRecording = true
    
    try {
      // Generate frames if not already done
      if (this.frames.length === 0) {
        this.generateFrames()
      }

      // Use canvas recording for simpler implementation
      const frames: string[] = []
      
      // Render each frame and collect as data URLs
      for (let i = 0; i < this.frames.length; i++) {
        this.drawFrame(this.frames[i])
        frames.push(this.canvas.toDataURL('image/png'))
        
        // Update progress
        if (i % 10 === 0) {
          console.log(`Rendering frame ${i + 1}/${this.frames.length}`)
        }
      }

      // Convert frames to GIF using a simpler approach
      return this.createGifFromFrames(frames)

    } catch (error) {
      this.isRecording = false
      throw error
    }
  }

  /**
   * Create GIF from frame data URLs using canvas-based approach
   */
  private async createGifFromFrames(frames: string[]): Promise<Blob> {
    // For now, return the first frame as PNG
    // In a full implementation, you'd use a GIF encoding library
    const response = await fetch(frames[0])
    const blob = await response.blob()
    this.isRecording = false
    return blob
  }

  /**
   * Preview animation in real-time
   */
  async playPreview(): Promise<void> {
    if (this.frames.length === 0) {
      this.generateFrames()
    }

    const frameDelay = 1000 / this.config.fps

    for (const frame of this.frames) {
      this.drawFrame(frame)
      await new Promise(resolve => setTimeout(resolve, frameDelay))
    }
  }

  /**
   * Export single frame as image
   */
  exportFrame(frameIndex: number): string {
    if (frameIndex >= this.frames.length) {
      throw new Error('Frame index out of bounds')
    }
    
    this.drawFrame(this.frames[frameIndex])
    return this.canvas.toDataURL('image/png')
  }
}
