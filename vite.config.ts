import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  preview: {
    host: true,
    port: 3000,
    allowedHosts: ['mbudget.45.136.71.153.nip.io']
  },
  server: {
    host: true,
    origin: 'http://0.0.0.0:3000'
  }
})
