import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  
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