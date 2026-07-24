import { useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'

const INACTIVITY_TIMEOUT = 2 * 60 * 1000 // 2 minutes

/**
 * Monitors user activity (touch, click, keypress, scroll).
 * If no interaction for 2 minutes, logs out and redirects to kiosk.
 */
export function useInactivityTimeout() {
  const navigate = useNavigate()
  const logout = useAuthStore((s) => s.logout)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleLogout = useCallback(async () => {
    await logout()
    navigate('/kiosk/personal', { replace: true })
  }, [logout, navigate])

  const resetTimer = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(handleLogout, INACTIVITY_TIMEOUT)
  }, [handleLogout])

  useEffect(() => {
    const events = ['touchstart', 'mousedown', 'keydown', 'scroll', 'pointermove']

    // Start the timer immediately
    resetTimer()

    // Reset on any user interaction
    events.forEach((event) => {
      window.addEventListener(event, resetTimer, { passive: true })
    })

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
      events.forEach((event) => {
        window.removeEventListener(event, resetTimer)
      })
    }
  }, [resetTimer])
}
