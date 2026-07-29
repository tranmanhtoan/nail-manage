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

export function initAuthListener(onSessionExpired: () => void) {
  if (authListenerInitialized) return
  authListenerInitialized = true

  supabase.auth.onAuthStateChange((event, session) => {
    if (event === 'TOKEN_REFRESHED') {
      // Token refreshed successfully — no action needed
      console.debug('[auth] Token refreshed')
    }

    if (event === 'SIGNED_OUT') {
      // User was signed out (could be manual or forced by expired refresh token)
      onSessionExpired()
    }
  })

  // Periodically check if session is still valid (handles edge case where
  // onAuthStateChange doesn't fire on network reconnect with expired token)
  const CHECK_INTERVAL = 60 * 1000 // every 60s
  setInterval(async () => {
    if (!navigator.onLine) return

    const { data: { session }, error } = await supabase.auth.getSession()

    if (error || !session) {
      // Session is gone — could be expired refresh token
      const stored = localStorage.getItem('uat_user')
      if (!stored) {
        // Only trigger for real Supabase auth (not UAT mode)
        onSessionExpired()
      }
    }
  }, CHECK_INTERVAL)
}
