import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { LanguageSwitch } from '@/components/LanguageSwitch'
import { ChevronLeft, Lock, Loader2, Monitor, Crown } from 'lucide-react'

export function Login() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const login = useAuthStore((s) => s.login)
  const [showOwnerLogin, setShowOwnerLogin] = useState(false)
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    // Login as owner with fixed email, only password needed
    const err = await login('owner', password)
    if (err) setError(err)
    setLoading(false)
  }

  function handleBack() {
    setShowOwnerLogin(false)
    setPassword('')
    setError('')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-purple-50 p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary">💅 {t('app.name')}</h1>
          <p className="text-gray-500 mt-1">{t('auth.login')}</p>
        </div>

        {!showOwnerLogin ? (
          /* ═══ Mode Selection: Owner vs Kiosk ═══ */
          <div className="grid grid-cols-2 gap-4">
            {/* Owner card */}
            <button
              onClick={() => setShowOwnerLogin(true)}
              className="p-6 rounded-[1rem] text-center relative transition-all border border-gray-200 hover:border-[#864e5a] hover:shadow-[0_0_20px_rgba(134,78,90,0.15)] active:scale-95"
              style={{
                background: 'rgba(255, 248, 248, 0.6)',
                backdropFilter: 'blur(12px)',
              }}
            >
              <div className="absolute -top-[1px] -right-[1px] bg-[#864e5a] text-white text-[10px] px-2 py-1 rounded-bl-lg rounded-tr-[1rem] font-bold">
                Owner
              </div>
              <div className="w-20 h-20 mx-auto rounded-full flex items-center justify-center text-3xl mb-3 bg-gray-100">
                <Crown size={32} className="text-[#864e5a]" />
              </div>
              <p className="font-semibold text-base text-gray-900">Owner</p>
              <p className="text-xs mt-0.5 text-gray-500">Quản lý tiệm</p>
            </button>

            {/* Kiosk card */}
            <button
              onClick={() => navigate('/kiosk')}
              className="p-6 rounded-[1rem] text-center relative transition-all border border-gray-200 hover:border-[#864e5a] hover:shadow-[0_0_20px_rgba(134,78,90,0.15)] active:scale-95"
              style={{
                background: 'rgba(255, 248, 248, 0.6)',
                backdropFilter: 'blur(12px)',
              }}
            >
              <div className="absolute -top-[1px] -right-[1px] bg-gray-600 text-white text-[10px] px-2 py-1 rounded-bl-lg rounded-tr-[1rem] font-bold">
                Kiosk
              </div>
              <div className="w-20 h-20 mx-auto rounded-full flex items-center justify-center text-3xl mb-3 bg-gray-100">
                <Monitor size={32} className="text-gray-600" />
              </div>
              <p className="font-semibold text-base text-gray-900">Kiosk</p>
              <p className="text-xs mt-0.5 text-gray-500">Chế độ tablet</p>
            </button>
          </div>
        ) : (
          /* ═══ Owner Login: Password only ═══ */
          <div className="bg-white rounded-2xl shadow-lg p-6 space-y-5">
            <button
              onClick={handleBack}
              className="flex items-center gap-1 text-sm text-[#864e5a] font-medium"
            >
              <ChevronLeft size={16} />
              {t('common.back')}
            </button>

            <div className="flex flex-col items-center gap-3 py-2">
              <div className="w-20 h-20 rounded-full flex items-center justify-center text-3xl bg-gray-100 border-2 border-[#864e5a]">
                <Crown size={32} className="text-[#864e5a]" />
              </div>
              <p className="font-bold text-lg text-gray-900">Owner Login</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('auth.password')}</label>
                <div className="relative">
                  <Lock size={18} className="absolute left-3 top-3.5 text-gray-400" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-[#864e5a] focus:ring-1 focus:ring-[#864e5a] outline-none transition-colors"
                    placeholder={t('auth.password')}
                    required
                    autoFocus
                  />
                </div>
              </div>

              {error && <p className="text-red-500 text-sm">{error}</p>}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-[#864e5a] text-white font-semibold rounded-xl disabled:opacity-50 transition-all active:scale-[0.98]"
              >
                {loading ? <Loader2 className="animate-spin mx-auto" size={20} /> : t('auth.login')}
              </button>
            </form>
          </div>
        )}

        <div className="mt-4 flex items-center justify-center">
          <LanguageSwitch />
        </div>
      </div>
    </div>
  )
}
