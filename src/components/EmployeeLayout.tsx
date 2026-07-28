import { Routes, Route, Navigate } from 'react-router-dom'
import { Header } from '@/components/Header'
import { BottomNav } from '@/components/BottomNav'
import { FloatingBackHome } from '@/components/FloatingBackHome'
import { useInactivityTimeout } from '@/hooks/useInactivityTimeout'
import { MySchedule } from '@/pages/employee/MySchedule'
import { MyEarnings } from '@/pages/employee/MyEarnings'
import { CheckIn } from '@/pages/employee/CheckIn'
import { QuickEntry } from '@/pages/QuickEntry'

export function EmployeeLayout() {
  // Auto-logout after 2 minutes of inactivity
  useInactivityTimeout()

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-300 md:pl-64">
      <Header />
      <FloatingBackHome />
      <main className="pb-20 md:pb-6">
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
  )
}
