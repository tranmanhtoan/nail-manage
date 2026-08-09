import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { NavLink } from 'react-router-dom'
import { LayoutDashboard, CalendarDays, PenLine, BarChart3, Settings } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'

export function BottomNav() {
  const { t } = useTranslation()
  const role = useAuthStore((s) => s.user?.role)
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false)

  useEffect(() => {
    const handleResize = () => {
      if (window.visualViewport) {
        setIsKeyboardOpen(window.visualViewport.height < window.innerHeight * 0.85)
      }
    }
    window.visualViewport?.addEventListener('resize', handleResize)
    return () => window.visualViewport?.removeEventListener('resize', handleResize)
  }, [])

  const ownerTabs = [
    { to: '/dashboard', icon: LayoutDashboard, label: t('nav.dashboard') },
    { to: '/appointments', icon: CalendarDays, label: t('nav.appointments') },
    { to: '/reports', icon: BarChart3, label: t('nav.reports') },
    { to: '/quick-entry', icon: PenLine, label: t('nav.quickEntry') },
    { to: '/settings', icon: Settings, label: t('nav.settings') },
  ]

  const employeeTabs = [
    { to: '/my-schedule', icon: CalendarDays, label: t('nav.mySchedule') },
    { to: '/quick-entry', icon: PenLine, label: t('nav.quickEntry') },
    { to: '/my-earnings', icon: BarChart3, label: t('nav.myEarnings') },
  ]

  const tabs = role === 'owner' ? ownerTabs : employeeTabs

  return (
    <>
      {/* Mobile view */}
      <nav className={`fixed bottom-0 inset-x-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 safe-bottom z-50 transition-colors duration-300 md:hidden ${
        isKeyboardOpen ? 'hidden' : 'block'
      }`} role="navigation" aria-label="Main navigation">
        <div className="flex justify-around items-center h-16">
          {tabs.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex flex-col items-center gap-0.5 px-2 py-1 text-xs transition-colors ${
                  isActive ? 'text-primary dark:text-[#c9949f]' : 'text-gray-500 dark:text-gray-400'
                }`
              }
            >
              <Icon size={22} />
              <span>{label}</span>
            </NavLink>
          ))}
        </div>
      </nav>

      {/* Desktop/Tablet Sidebar view */}
      <aside className="fixed left-0 top-0 bottom-0 w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 z-50 hidden md:flex flex-col py-6 px-4 transition-colors duration-300" role="navigation" aria-label="Sidebar navigation">
        <div className="flex items-center gap-2 mb-8 px-2 select-none">
          <span className="text-2xl">💅</span>
          <span className="font-bold text-lg text-primary dark:text-[#c9949f]">{t('app.name')}</span>
        </div>
        <div className="flex-1 space-y-1">
          {tabs.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                  isActive
                    ? 'bg-primary/10 text-primary dark:bg-[#864e5a]/20 dark:text-[#c9949f]'
                    : 'text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800/40'
                }`
              }
            >
              <Icon size={20} />
              <span>{label}</span>
            </NavLink>
          ))}
        </div>
      </aside>
    </>
  )
}
