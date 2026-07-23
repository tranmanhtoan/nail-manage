import { useAuthStore } from '@/store/authStore'
import { LanguageSwitch } from './LanguageSwitch'
import { LogOut, Settings } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

export function Header() {
  const { user, logout } = useAuthStore()
  const { t } = useTranslation()

  if (!user) return null

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
      <h1 className="text-lg font-bold text-primary">{t('app.name')}</h1>
      <div className="flex items-center gap-2">
        <LanguageSwitch />
        {user.role === 'owner' && (
          <Link to="/settings" className="p-2 text-gray-500 hover:text-gray-700">
            <Settings size={20} />
          </Link>
        )}
        <button onClick={logout} className="p-2 text-gray-500 hover:text-red-500" aria-label="Logout">
          <LogOut size={20} />
        </button>
      </div>
    </header>
  )
}
