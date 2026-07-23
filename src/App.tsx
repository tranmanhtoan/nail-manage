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

export default function App() {
  const { user, loading, checkSession } = useAuthStore()

  useEffect(() => { checkSession() }, [checkSession])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-primary text-xl font-bold">💅 NailPro</div>
      </div>
    )
  }

  return (
    <Routes>
      {/* Public booking page */}
      <Route path="/book" element={<BookingPage />} />

      {/* Auth */}
      {!user && <Route path="*" element={<Login />} />}

      {/* Owner routes */}
      {user?.role === 'owner' && (
        <Route
          path="*"
          element={
            <div className="min-h-screen bg-gray-50">
              <Header />
              <main className="pb-16">
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
              <main className="pb-16">
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
