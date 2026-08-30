import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

const host = '127.0.0.1'

export default defineConfig({
  // GitHub Pages serves this project under /something-society/.
  base: process.env.GITHUB_ACTIONS ? '/something-society/' : '/',
  plugins: [react()],
  server: { host },
  preview: { host },
})
