import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  base: '/login/',
  build: {
    outDir: 'htdocs',
    emptyOutDir: true,
  },
  server: {
    proxy: {
      // Proxy DKA API to avoid CORS (dev only)
      '/api/dka': {
        target: 'https://driverkiawaz.truckmitr.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/dka/, '/api'),
      },
    },
  },
})
