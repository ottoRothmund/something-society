import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Palette preview: ?theme=slate|bone|ink (omit for the default paper palette).
const THEMES = ['slate', 'bone', 'ink']
const requested = new URLSearchParams(window.location.search).get('theme')
if (requested && THEMES.includes(requested)) {
  document.documentElement.setAttribute('data-theme', requested)
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
