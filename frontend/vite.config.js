import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
  host: true, // listen on 0.0.0.0 so it’s reachable via LAN IP
  port: 5173,
    proxy: {
      '/backend': {
        target: 'http://localhost:8888',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/backend/, '/fs/backend'),
      },
    },
  },
})
