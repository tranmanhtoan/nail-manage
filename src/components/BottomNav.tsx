import { useTranslation } from 'react-i18next'
import { NavLink } from 'react-router-dom'
import { LayoutDashboard, CalendarDays, PenLine, BarChart3, Settings } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'

export function BottomNav() {
  const { t } = useTranslation()
  const role = useAuthStore((s) => s.user?.role)

  const ownerTabs = [
    { to: '/dashboard', icon: LayoutDashboard, label: t('nav.dashboard') },
    { to: '/appointments', icon: CalendarDays, label: t('nav.appointments') },
    { to: '/quick-entry', icon: PenLine, label: t('nav.quickEntry') },
    { to: '/reports', icon: BarChart3, label: t('nav.reports') },
    { to: '/admin', icon: Shield, label: 'Admin' },
  ]

  const employeeTabs = [
    { to: '/my-schedule', icon: CalendarDays, label: t('nav.mySchedule') },
    { to: '/quick-entry', icon: PenLine, label: t('nav.quickEntry') },
    { to: '/my-earnings', icon: BarChart3, label: t('nav.myEarnings') },
  ]

  const tabs = role === 'owner' ? ownerTabs : employeeTabs

  return (
    <nav className="fixed bottom-0 inset-x-0 bg-white border-t border-gray-200 safe-bottom z-50">
      <div className="flex justify-around items-center h-16">
        {tabs.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 px-2 py-1 text-xs transition-colors ${
                isActive ? 'text-primary' : 'text-gray-500'
              }`
            }
          >
            <Icon size={22} />
            <span>{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
