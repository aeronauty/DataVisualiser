declare module 'gif.js' {
  interface GIFOptions {
    workers?: number
    quality?: number
    width?: number
    height?: number
    workerScript?: string
  }

  interface FrameOptions {
    delay?: number
  }

  class GIF {
    constructor(options?: GIFOptions)
    addFrame(canvas: HTMLCanvasElement, options?: FrameOptions): void
    on(event: 'finished', callback: (blob: Blob) => void): void
    render(): void
  }

  export = GIF
}
