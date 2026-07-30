import { useAuthStore } from '@/store/authStore'
import { useSyncStore } from '@/store/syncStore'
import { LanguageSwitch } from './LanguageSwitch'
import { LogOut, Settings, UserCircle, WifiOff, RefreshCw } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

export function Header() {
  const { user, logout } = useAuthStore()
  const { isOffline, syncQueue } = useSyncStore()
  const { t } = useTranslation()

  if (!user) return null

  return (
    <header className="sticky top-0 z-40 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 py-3 flex items-center justify-between safe-top transition-colors duration-300">
      <div className="flex items-center gap-2 min-w-0">
        <h1 className="text-lg font-bold text-primary shrink-0">{t('app.name')}</h1>
        
        {/* Show logged-in user for employee role */}
        {user.role === 'employee' && (
          <div className="flex items-center gap-1.5 ml-2 px-2 py-1 rounded-full bg-[rgba(134,78,90,0.08)] dark:bg-[rgba(255,255,255,0.08)] max-w-[140px]">
            <UserCircle size={16} className="text-[#864e5a] dark:text-[#c9949f] shrink-0" />
            <span className="text-xs font-medium text-[#864e5a] dark:text-[#c9949f] truncate">{user.name}</span>
          </div>
        )}

        {/* Offline / Sync Badge */}
        {isOffline && (
          <div className="flex items-center gap-1 ml-1 px-2.5 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-900/50 text-[10px] font-bold uppercase tracking-wider animate-pulse">
            <WifiOff size={11} />
            <span>Offline</span>
          </div>
        )}
        {!isOffline && syncQueue.length > 0 && (
          <div className="flex items-center gap-1 ml-1 px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-900/50 text-[10px] font-bold uppercase tracking-wider">
            <RefreshCw size={11} className="animate-spin" />
            <span>Syncing ({syncQueue.length})</span>
          </div>
        )}
      </div>
      <div className="flex items-center gap-2">
        <LanguageSwitch />
        {user.role === 'owner' && (
          <Link to="/settings" className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
            <Settings size={20} />
          </Link>
        )}
        <button onClick={logout} className="p-2 text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400" aria-label="Logout">
          <LogOut size={20} />
        </button>
      </div>
    </header>
  )
}

