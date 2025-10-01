import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  preview: {
    allowedHosts: ["dev.usebyteme.com", "localhost", "127.0.0.1"],  
    host: true,     
    port: 4173          
  },
  server: {
    allowedHosts: ["dev.usebyteme.com", "127.0.0.1"],  
    host: true,     
    port: 4173   
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
    extensions: ['.mjs', '.js', '.jsx', '.ts', '.tsx', '.json']
  },
  optimizeDeps: {
    esbuildOptions: {
      loader: {
        '.js': 'jsx',
      },
    },
  },
}) 
