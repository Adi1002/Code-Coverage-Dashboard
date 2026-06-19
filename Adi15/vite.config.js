import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/Code-Coverage-Dashboard/',
  server: {
    proxy: {
      // 1. Target One: Routes starting with '/data' go to Port 8000
      '/data': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
        // (Optional) secure: false, // If you are using https and have certificate issues
      },
      
      // 2. Target Two: Routes starting with '/codecoverage' go to Port 8001
      '/codecoverage': {
        target: 'http://127.0.0.1:8001',
        changeOrigin: true,
      }
    }
  }
})