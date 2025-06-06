import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  assetsInclude: ['**/*.worker.mjs'],
  build: {},
  server: {
    allowedHosts: ['prototype-mileage-lifetime-length.trycloudflare.com']
  }
})
