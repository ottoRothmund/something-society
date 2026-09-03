import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

const host = '127.0.0.1'

export default defineConfig({
  // Lovable serves from the root; GitHub Pages serves under /umbra-society/.
  // GITHUB_ACTIONS covers the workflow; PAGES_BASE covers scripts/deploy-pages.sh.
  base: process.env.GITHUB_ACTIONS || process.env.PAGES_BASE ? '/umbra-society/' : '/',
  plugins: [react()],
  server: { host },
  preview: { host },
})
