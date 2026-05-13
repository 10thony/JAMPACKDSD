import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'
import { leadershipReportStaticRoute } from './vite-plugin-leadership-report'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    leadershipReportStaticRoute(),
    react(),
    tsconfigPaths(),
  ],
  server: {
    port: 3000,
    open: true
  },
  build: {
    outDir: 'dist',
    sourcemap: true
  },
  define: {
    // Define any global constants here
  }
})
