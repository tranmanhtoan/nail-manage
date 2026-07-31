import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

// ponytail: skip typed client generic — real types come from `supabase gen types`
// when connected to actual DB. Using untyped client for now.
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Separate client for creating new users (avoids session conflict with logged-in owner)
export const supabaseAdmin = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

/**
 * Auth token refresh listener.
 * Handles session expiry gracefully — notifies user and redirects to login
 * instead of silently failing API calls.
 */
let authListenerInitialized = false
let sessionCheckInterval: ReturnType<typeof setInterval> | null = null

export function initAuthListener(onSessionExpired: () => void) {
  if (authListenerInitialized) return
  authListenerInitialized = true

  // Skip auth listener in UAT mode — no real Supabase session
  const isUAT = import.meta.env.VITE_UAT_MODE === 'true'
  if (isUAT) return

  supabase.auth.onAuthStateChange((event, _session) => {
    if (event === 'TOKEN_REFRESHED') {
      console.debug('[auth] Token refreshed')
    }

    if (event === 'SIGNED_OUT') {
      // User was signed out (could be manual or forced by expired refresh token)
      // Clear the session check interval to prevent further checks after logout
      stopAuthListener()
      onSessionExpired()
    }
  })

  // Periodically check if session is still valid (handles edge case where
  // onAuthStateChange doesn't fire on network reconnect with expired token)
  const CHECK_INTERVAL = 60 * 1000 // every 60s
  sessionCheckInterval = setInterval(async () => {
    if (!navigator.onLine) return

    try {
      const { data: { session }, error } = await supabase.auth.getSession()

      if (error || !session) {
        const stored = localStorage.getItem('uat_user')
        if (!stored) {
          stopAuthListener()
          onSessionExpired()
        }
      }
    } catch {
      // Network error — ignore, will retry next interval
    }
  }, CHECK_INTERVAL)
}

/**
 * Stops the periodic session check interval.
 * Called on sign-out to prevent memory leaks and ghost checks.
 */
export function stopAuthListener() {
  if (sessionCheckInterval) {
    clearInterval(sessionCheckInterval)
    sessionCheckInterval = null
  }
  authListenerInitialized = false
}
