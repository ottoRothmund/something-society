import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

const host = '127.0.0.1'

export default defineConfig({
  // Lovable serves from the root; the GitHub Pages base is set at build time.
  base: '/',
  plugins: [react()],
  server: { host },
  preview: { host },
})
