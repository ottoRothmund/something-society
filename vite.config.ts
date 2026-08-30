import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

const host = '127.0.0.1'

export default defineConfig({
  plugins: [react()],
  server: { host },
  preview: { host },
})
