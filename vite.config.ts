import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  worker: {
    format: 'es'
  },
  build: {
    rollupOptions: {
      external: []
    }
  },
  assetsInclude: ['**/*.worker.js']
})
