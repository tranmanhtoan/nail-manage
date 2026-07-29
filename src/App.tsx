import { useEffect, lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { useThemeStore } from '@/store/themeStore'
import { useSyncStore } from '@/store/syncStore'
import { initAuthListener } from '@/lib/supabase'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { Header } from '@/components/Header'
import { BottomNav } from '@/components/BottomNav'
import { Login } from '@/pages/Login'

// Lazy-loaded pages — split by role so employee doesn't load owner code
const Dashboard = lazy(() => import('@/pages/owner/Dashboard').then(m => ({ default: m.Dashboard })))
const Appointments = lazy(() => import('@/pages/owner/Appointments').then(m => ({ default: m.Appointments })))
const Customers = lazy(() => import('@/pages/owner/Customers').then(m => ({ default: m.Customers })))
const Settings = lazy(() => import('@/pages/owner/Settings').then(m => ({ default: m.Settings })))
const Reports = lazy(() => import('@/pages/owner/Reports').then(m => ({ default: m.Reports })))
const Admin = lazy(() => import('@/pages/owner/Admin').then(m => ({ default: m.Admin })))
const QuickEntry = lazy(() => import('@/pages/QuickEntry').then(m => ({ default: m.QuickEntry })))
const BookingPage = lazy(() => import('@/pages/booking/BookingPage').then(m => ({ default: m.BookingPage })))
const KioskLayout = lazy(() => import('@/pages/kiosk/KioskLayout').then(m => ({ default: m.KioskLayout })))
const EmployeeLayout = lazy(() => import('@/components/EmployeeLayout').then(m => ({ default: m.EmployeeLayout })))
const PinGate = lazy(() => import('@/components/PinGate').then(m => ({ default: m.PinGate })))

function PageLoader() {
  return (
    <div className="flex items-center justify-center p-12">
      <div className="animate-pulse text-primary text-lg font-semibold">Loading...</div>
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

          {/* Kiosk: only accessible when not logged in or logged in as kiosk */}
          {(!user || user.role === 'kiosk') && (
            <Route path="/kiosk/*" element={<PinGate><KioskLayout /></PinGate>} />
          )}

          {/* If employee/owner hits /kiosk, redirect to their home */}
          {user && user.role === 'employee' && (
            <Route path="/kiosk/*" element={<Navigate to="/my-schedule" replace />} />
          )}
          {user && user.role === 'owner' && (
            <Route path="/kiosk/*" element={<Navigate to="/dashboard" replace />} />
          )}

          {/* Auth */}
          {!user && <Route path="*" element={<Login />} />}

          {/* Kiosk user logged in but navigated away — keep on kiosk */}
          {user?.role === 'kiosk' && (
            <Route path="*" element={<Navigate to="/kiosk/quick" replace />} />
          )}

          {/* Owner routes */}
          {user?.role === 'owner' && (
            <Route
              path="*"
              element={
                <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-300 md:pl-64">
                  <Header />
                  <main className="pb-20 md:pb-6">
                    <ErrorBoundary>
                      <Routes>
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/appointments" element={<Appointments />} />
                        <Route path="/customers" element={<Customers />} />
                        <Route path="/quick-entry" element={<QuickEntry />} />
                        <Route path="/reports" element={<Reports />} />
                        <Route path="/admin" element={<Admin />} />
                        <Route path="/settings" element={<Settings />} />
                        <Route path="*" element={<Navigate to="/dashboard" replace />} />
                      </Routes>
                    </ErrorBoundary>
                  </main>
                  <BottomNav />
                </div>
              }
            />
          )}

          {/* Employee routes — with inactivity timeout & floating back/home */}
          {user?.role === 'employee' && (
            <Route path="*" element={<EmployeeLayout />} />
          )}
        </Routes>
      </Suspense>
    </ErrorBoundary>
  )
}
