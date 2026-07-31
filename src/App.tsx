import { useEffect, lazy, Suspense } from 'react'
import { Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { useThemeStore } from '@/store/themeStore'
import { useSyncStore } from '@/store/syncStore'
import { initAuthListener } from '@/lib/supabase'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { Header } from '@/components/Header'
import { BottomNav } from '@/components/BottomNav'
import { Login } from '@/pages/Login'

/**
 * Retry wrapper for lazy-loaded chunks.
 * On iOS, transient network drops during page load can fail dynamic imports.
 * This retries up to 2 times with a short delay, then forces a page reload
 * (clears stale SW cache) if all retries fail.
 */
function lazyRetry(importFn: () => Promise<any>, retries = 2): ReturnType<typeof lazy> {
  return lazy(() =>
    importFn().catch((err: unknown) => {
      if (retries <= 0) {
        // All retries exhausted — likely stale SW cache; force reload
        window.location.reload()
        return new Promise(() => {}) // never resolves, page will reload
      }
      return new Promise<any>((resolve) => {
        setTimeout(() => resolve(lazyRetry(importFn, retries - 1)), 1500)
      }).then((mod: any) => mod)
    })
  )
}

// Lazy-loaded pages — split by role so employee doesn't load owner code
const Dashboard = lazyRetry(() => import('@/pages/owner/Dashboard').then(m => ({ default: m.Dashboard })))
const Appointments = lazyRetry(() => import('@/pages/owner/Appointments').then(m => ({ default: m.Appointments })))
const Customers = lazyRetry(() => import('@/pages/owner/Customers').then(m => ({ default: m.Customers })))
const Settings = lazyRetry(() => import('@/pages/owner/Settings').then(m => ({ default: m.Settings })))
const Reports = lazyRetry(() => import('@/pages/owner/Reports').then(m => ({ default: m.Reports })))
const QuickEntry = lazyRetry(() => import('@/pages/QuickEntry').then(m => ({ default: m.QuickEntry })))
const BookingPage = lazyRetry(() => import('@/pages/booking/BookingPage').then(m => ({ default: m.BookingPage })))
const KioskLayout = lazyRetry(() => import('@/pages/kiosk/KioskLayout').then(m => ({ default: m.KioskLayout })))
const EmployeeLayout = lazyRetry(() => import('@/components/EmployeeLayout').then(m => ({ default: m.EmployeeLayout })))
const PinGate = lazyRetry(() => import('@/components/PinGate').then(m => ({ default: m.PinGate })))

function PageLoader() {
  return (
    <div className="flex items-center justify-center p-12">
      <div className="animate-pulse text-primary text-lg font-semibold">Loading...</div>
    </div>
  )
}

/** Layout wrapper for owner pages */
function OwnerLayout() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-300 md:pl-64">
      <Header />
      <main className="pb-20 md:pb-6">
        <ErrorBoundary>
          <Outlet />
        </ErrorBoundary>
      </main>
      <BottomNav />
    </div>
  )
}

export default function App() {
  const { user, loading, checkSession } = useAuthStore()
  const { initTheme } = useThemeStore()
  const { init: initSync } = useSyncStore()

  useEffect(() => {
    checkSession()
    initTheme()
    initSync()
    initAuthListener(() => {
      useAuthStore.getState().logout()
    })
  }, [checkSession, initTheme, initSync])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-primary text-xl font-bold">💅 MCC Nail & Spa</div>
      </div>
    )
  }

  return (
    <ErrorBoundary>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Public pages */}
          <Route path="/book" element={<BookingPage />} />

          {/* Kiosk routes */}
          {(!user || user.role === 'kiosk') && (
            <Route path="/kiosk/*" element={<PinGate><KioskLayout /></PinGate>} />
          )}
          {user && user.role === 'employee' && (
            <Route path="/kiosk/*" element={<Navigate to="/my-schedule" replace />} />
          )}
          {user && user.role === 'owner' && (
            <Route path="/kiosk/*" element={<Navigate to="/dashboard" replace />} />
          )}

          {/* Not logged in */}
          {!user && <Route path="*" element={<Login />} />}

          {/* Kiosk user logged in but navigated away */}
          {user?.role === 'kiosk' && (
            <Route path="*" element={<Navigate to="/kiosk/quick" replace />} />
          )}

          {/* Owner routes — flat structure with layout */}
          {user?.role === 'owner' && (
            <Route element={<OwnerLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/appointments" element={<Appointments />} />
              <Route path="/customers" element={<Customers />} />
              <Route path="/quick-entry" element={<QuickEntry />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Route>
          )}

          {/* Employee routes */}
          {user?.role === 'employee' && (
            <Route path="*" element={<EmployeeLayout />} />
          )}
        </Routes>
      </Suspense>
    </ErrorBoundary>
  )
}
