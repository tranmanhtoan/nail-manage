import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { LanguageSwitch } from '@/components/LanguageSwitch'
import { ChevronLeft, Loader2, Monitor, Crown } from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface ProfileOption {
  id: string
  full_name: string
  role: string
}

// Chibi emoji based on name hash
function getChibiEmoji(name: string) {
  const chibis = ['👩‍🎨', '👩‍💼', '💇‍♀️', '💅', '👩‍🔧', '🧑‍🎨', '👩‍⚕️', '🧑‍💻']
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  return chibis[Math.abs(hash) % chibis.length]
}

export function Login() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const loginByProfile = useAuthStore((s) => s.loginByProfile)
  const [showOwnerLogin, setShowOwnerLogin] = useState(false)
  const [profiles, setProfiles] = useState<ProfileOption[]>([])
  const [loadingProfiles, setLoadingProfiles] = useState(false)
  const [loginLoadingId, setLoginLoadingId] = useState<string | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    if (showOwnerLogin) {
      loadProfiles()
    }
  }, [showOwnerLogin])

  async function loadProfiles() {
    setLoadingProfiles(true)
    const { data } = await supabase
      .from('login_profiles')
      .select('id, full_name, role')
      .eq('role', 'owner')
      .order('full_name')

    setProfiles((data as ProfileOption[]) ?? [])
    setLoadingProfiles(false)
  }

  async function handleProfileClick(profile: ProfileOption) {
    setLoginLoadingId(profile.id)
    setError('')
    const err = await loginByProfile(profile.id)
    if (err) {
      setError(err)
      setLoginLoadingId(null)
    }
    // If login succeeds, App.tsx will redirect to owner routes
  }

  function handleBack() {
    setShowOwnerLogin(false)
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
          /* ═══ Owner Login: Profile list — click to login ═══ */
          <div className="bg-white rounded-2xl shadow-lg p-6 space-y-5">
            <button
              onClick={handleBack}
              className="flex items-center gap-1 text-sm text-[#864e5a] font-medium"
            >
              <ChevronLeft size={16} />
              {t('common.back')}
            </button>

            <div className="flex flex-col items-center gap-2 py-1">
              <p className="font-bold text-lg text-gray-900">Owner Login</p>
              <p className="text-sm text-gray-500">Chọn tài khoản để đăng nhập</p>
            </div>

            {error && <p className="text-red-500 text-sm text-center">{error}</p>}

            {loadingProfiles ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="animate-spin text-[#864e5a]" size={32} />
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                {profiles.map((profile) => (
                  <button
                    key={profile.id}
                    onClick={() => handleProfileClick(profile)}
                    disabled={loginLoadingId !== null}
                    className="p-4 rounded-[1rem] text-center relative transition-all border border-gray-200 hover:border-[#864e5a] hover:shadow-[0_0_20px_rgba(134,78,90,0.15)] active:scale-95 disabled:opacity-50"
                    style={{
                      background: 'rgba(255, 248, 248, 0.6)',
                      backdropFilter: 'blur(12px)',
                    }}
                  >
                    {loginLoadingId === profile.id && (
                      <div className="absolute inset-0 flex items-center justify-center bg-white/70 rounded-[1rem] z-10">
                        <Loader2 className="animate-spin text-[#864e5a]" size={24} />
                      </div>
                    )}
                    <div className="w-16 h-16 mx-auto rounded-full flex items-center justify-center text-2xl mb-2 bg-gray-100 border-2 border-[#864e5a]">
                      {getChibiEmoji(profile.full_name)}
                    </div>
                    <p className="font-semibold text-sm truncate text-gray-900">
                      {profile.full_name}
                    </p>
                  </button>
                ))}

                {profiles.length === 0 && (
                  <p className="col-span-2 text-center text-gray-400 py-8 text-sm">
                    Chưa có tài khoản owner nào
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        <div className="mt-4 flex items-center justify-center">
          <LanguageSwitch />
        </div>
      </div>
    </div>
  )
}
