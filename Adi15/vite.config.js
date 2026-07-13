import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // 1. Target One: Routes starting with '/data' go to Port 8000
      '/data': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
      
      // 2. Target Two: Routes starting with '/codecoverage' go to Port 8001
      '/codecoverage': {
        target: 'http://127.0.0.1:8001',
        changeOrigin: true,
      }
    }
  },
  
  // NEW: Code Splitting Configuration
  build: {
    // 1. Increase the warning limit slightly (standard practice for React apps)
    chunkSizeWarningLimit: 1000, 
    
    // 2. Tell Vite how to split the code into smaller files
    rollupOptions: {
      output: {
        manualChunks(id) {
          // If the code comes from a downloaded library (node_modules)...
          if (id.includes('node_modules')) {
            
            // Put all Ant Design code in its own separate file
            if (id.includes('antd') || id.includes('@ant-design')) {
              return 'vendor_antd';
            }
            
            // Put all Recharts code in its own separate file
            if (id.includes('recharts')) {
              return 'vendor_recharts';
            }
            
            // Put everything else (React, standard libs) in a generic vendor file
            return 'vendor_core';
          }
        }
      }
    }
  }
})