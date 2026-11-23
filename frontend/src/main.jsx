import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Prevent accidental F7 (Caret Browsing mode) in browsers
if (typeof window !== 'undefined') {
  window.addEventListener('keydown', (e) => {
    if (e.key === 'F7') {
      e.preventDefault();
    }
  });

  // Register Service Worker for PWA (Production)
  if ('serviceWorker' in navigator && import.meta.env.PROD) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js').then((reg) => {
        console.log('PWA ServiceWorker registered:', reg.scope);
      }).catch((err) => {
        console.log('PWA ServiceWorker failed:', err);
      });
    });
  }
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
