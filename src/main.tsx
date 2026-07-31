import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './index.css'
import './i18n'

/**
 * Service Worker update detection for iOS Safari.
 * iOS doesn't reliably auto-update SW cache, so we detect new SW
 * and force a reload to pick up new assets.
 */
function registerSWUpdateHandler() {
  if (!('serviceWorker' in navigator)) return

  navigator.serviceWorker.ready.then((registration) => {
    // Check for updates every 60s (iOS doesn't check as frequently as Chrome)
    setInterval(() => {
      registration.update().catch(() => { /* ignore network errors */ })
    }, 60 * 1000)

    // Listen for new SW waiting to activate
    registration.addEventListener('updatefound', () => {
      const newWorker = registration.installing
      if (!newWorker) return

      newWorker.addEventListener('statechange', () => {
        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
          // New content available — reload to activate
          // On iOS PWA, this is the most reliable way to clear stale cache
          if (document.visibilityState === 'visible') {
            window.location.reload()
          } else {
            // If app is in background, reload on next focus
            document.addEventListener('visibilitychange', () => {
              if (document.visibilityState === 'visible') {
                window.location.reload()
              }
            }, { once: true })
          }
        }
      })
    })
  })

  // Handle controller change (new SW took over)
  let refreshing = false
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (!refreshing) {
      refreshing = true
      window.location.reload()
    }
  })
}

// Register SW update handler after page load to not block initial render
window.addEventListener('load', registerSWUpdateHandler)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
