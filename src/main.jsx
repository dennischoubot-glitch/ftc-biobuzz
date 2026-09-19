import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

const is404 = new URLSearchParams(window.location.search).has('404');
if (is404) {
  window.history.replaceState(null, '', window.location.pathname);
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App initialView={is404 ? 'about-404' : null} />
  </StrictMode>,
)
