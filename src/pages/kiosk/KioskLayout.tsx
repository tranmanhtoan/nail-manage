import { NavLink, Routes, Route, Navigate } from 'react-router-dom'
import { PenLine, UserCircle } from 'lucide-react'
import { QuickEntry } from '@/pages/QuickEntry'
import { KioskPersonal } from './KioskPersonal'

export function KioskLayout() {
  return (
    <div className="min-h-screen bg-gray-50">
      <main className="pb-20">
        <Routes>
          <Route path="quick" element={<QuickEntry />} />
          <Route path="personal" element={<KioskPersonal />} />
          <Route path="*" element={<Navigate to="/kiosk/quick" replace />} />
        </Routes>
      </main>

      {/* Bottom nav for kiosk */}
      <nav className="fixed bottom-0 inset-x-0 bg-white border-t border-gray-200 safe-bottom z-50">
        <div className="flex justify-around items-center h-16">
          <NavLink
            to="/kiosk/quick"
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 px-2 py-1 text-xs transition-colors ${
                isActive ? 'text-[#864e5a]' : 'text-gray-500'
              }`
            }
          >
            <PenLine size={22} />
            <span>Quick Entry</span>
          </NavLink>
          <NavLink
            to="/kiosk/personal"
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 px-2 py-1 text-xs transition-colors ${
                isActive ? 'text-[#864e5a]' : 'text-gray-500'
              }`
            }
          >
            <UserCircle size={22} />
            <span>Cá nhân</span>
          </NavLink>
        </div>
      </nav>
    </div>
  )
}
