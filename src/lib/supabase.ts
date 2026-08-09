import { createClient } from '@supabase/supabase-js'
import type { Database } from './database.generated'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

// Typed client — the Database generic is derived from supabase/schema.sql
// (see database.generated.ts). This gives compile-time checking of table
// columns and RPC argument/return shapes.
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)

// Separate client for creating new users (avoids session conflict with logged-in owner).
// Uses the same anon key — NOT a service-role key (kept out of the frontend bundle).
export const supabaseAdmin = createClient<Database>(supabaseUrl, supabaseAnonKey, {
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
let authSubscription: { unsubscribe: () => void } | null = null

export function initAuthListener(onSessionExpired: () => void) {
  if (authListenerInitialized) return
  authListenerInitialized = true

  // Skip auth listener in UAT mode — no real Supabase session
  const isUAT = import.meta.env.VITE_UAT_MODE === 'true'
  if (isUAT) return

  const { data } = supabase.auth.onAuthStateChange((event, _session) => {
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
  authSubscription = data.subscription

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
  if (authSubscription) {
    authSubscription.unsubscribe()
    authSubscription = null
  }
  authListenerInitialized = false
}
