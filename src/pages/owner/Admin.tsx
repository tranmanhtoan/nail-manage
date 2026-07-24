import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { LayoutDashboard, Users, Scissors, Settings2 } from 'lucide-react'
import { AdminDashboard } from './admin/AdminDashboard'
import { AdminEmployees } from './admin/AdminEmployees'
import { AdminServices } from './admin/AdminServices'
import { AdminSettings } from './admin/AdminSettings'

type Tab = 'dashboard' | 'employees' | 'services' | 'settings'

export function Admin() {
  const { t } = useTranslation()
  const [tab, setTab] = useState<Tab>('dashboard')

  const tabs: { id: Tab; label: string; icon: typeof LayoutDashboard }[] = [
    { id: 'dashboard', label: 'Tổng quan', icon: LayoutDashboard },
    { id: 'employees', label: t('nav.employees'), icon: Users },
    { id: 'services', label: t('nav.services'), icon: Scissors },
    { id: 'settings', label: t('settings.general'), icon: Settings2 },
  ]

  return (
    <div className="max-w-lg mx-auto">
      {/* Tab bar */}
      <div className="flex border-b border-gray-200 bg-white sticky top-14 z-30">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-medium transition-colors border-b-2 ${
              tab === id
                ? 'border-[#864e5a] text-[#864e5a]'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Icon size={16} />
            {label}
          </button>
        ))}
      </div>

      {tab === 'dashboard' && <AdminDashboard />}
      {tab === 'employees' && <AdminEmployees />}
      {tab === 'services' && <AdminServices />}
      {tab === 'settings' && <AdminSettings />}
    </div>
  )
}
