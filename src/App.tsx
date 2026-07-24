import { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { Header } from '@/components/Header'
import { BottomNav } from '@/components/BottomNav'
import { Login } from '@/pages/Login'
import { Dashboard } from '@/pages/owner/Dashboard'
import { Appointments } from '@/pages/owner/Appointments'
import { Customers } from '@/pages/owner/Customers'
import { Settings } from '@/pages/owner/Settings'
import { Reports } from '@/pages/owner/Reports'
import { MySchedule } from '@/pages/employee/MySchedule'
import { MyEarnings } from '@/pages/employee/MyEarnings'
import { CheckIn } from '@/pages/employee/CheckIn'
import { BookingPage } from '@/pages/booking/BookingPage'
import { QuickEntry } from '@/pages/QuickEntry'
import { PinGate } from '@/components/PinGate'
import { KioskLayout } from '@/pages/kiosk/KioskLayout'

export default function App() {
  const { user, loading, checkSession } = useAuthStore()

  useEffect(() => { checkSession() }, [checkSession])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-primary text-xl font-bold">💅 MCC Nail & Spa</div>
      </div>
    )
  }

  return (
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
            <div className="min-h-screen bg-gray-50">
              <Header />
              <main className="pb-20">
                <Routes>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/appointments" element={<Appointments />} />
                  <Route path="/customers" element={<Customers />} />
                  <Route path="/quick-entry" element={<QuickEntry />} />
                  <Route path="/reports" element={<Reports />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="*" element={<Navigate to="/dashboard" replace />} />
                </Routes>
              </main>
              <BottomNav />
            </div>
          }
        />
      )}

      {/* Employee routes */}
      {user?.role === 'employee' && (
        <Route
          path="*"
          element={
            <div className="min-h-screen bg-gray-50">
              <Header />
              <main className="pb-20">
                <Routes>
                  <Route path="/my-schedule" element={<MySchedule />} />
                  <Route path="/my-earnings" element={<MyEarnings />} />
                  <Route path="/check-in" element={<CheckIn />} />
                  <Route path="/quick-entry" element={<QuickEntry />} />
                  <Route path="*" element={<Navigate to="/my-schedule" replace />} />
                </Routes>
              </main>
              <BottomNav />
            </div>
          }
        />
      )}
    </Routes>
  )
}
