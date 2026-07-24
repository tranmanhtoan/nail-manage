import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '@/store/authStore'
import { LanguageSwitch } from '@/components/LanguageSwitch'
import { Lock, ChevronLeft, Loader2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface ProfileOption {
  id: string
  full_name: string
  role: string
}

// Chibi emoji based on name hash (same as other pages)
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
  const login = useAuthStore((s) => s.login)
  const [profiles, setProfiles] = useState<ProfileOption[]>([])
  const [selectedProfile, setSelectedProfile] = useState<ProfileOption | null>(null)
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [loadingProfiles, setLoadingProfiles] = useState(true)

  useEffect(() => {
    loadProfiles()
  }, [])

  async function loadProfiles() {
    setLoadingProfiles(true)
    // Use the secure view that only exposes id, full_name, role
    const { data } = await supabase
      .from('login_profiles')
      .select('id, full_name, role')
      .order('role')
      .order('full_name')

    setProfiles((data as ProfileOption[]) ?? [])
    setLoadingProfiles(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedProfile) return
    setLoading(true)
    setError('')

    // Get email via RPC (not exposed in view)
    const { data: email } = await supabase.rpc('get_login_email', { profile_id: selectedProfile.id })
    if (!email) {
      setError('Account not found')
      setLoading(false)
      return
    }

    const err = await login(email as string, password)
    if (err) setError(err)
    setLoading(false)
  }

  function handleBack() {
    setSelectedProfile(null)
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

        {loadingProfiles ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="animate-spin text-[#864e5a]" size={32} />
          </div>
        ) : !selectedProfile ? (
          /* ═══ Profile Selection ═══ */
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {profiles.map((profile) => (
                <button
                  key={profile.id}
                  onClick={() => setSelectedProfile(profile)}
                  className="p-4 rounded-[1rem] text-center relative transition-all border border-gray-200 hover:border-[#864e5a] hover:shadow-[0_0_20px_rgba(134,78,90,0.15)] active:scale-95"
                  style={{
                    background: 'rgba(255, 248, 248, 0.6)',
                    backdropFilter: 'blur(12px)',
                  }}
                >
                  {/* Role badge */}
                  {profile.role === 'owner' && (
                    <div className="absolute -top-[1px] -right-[1px] bg-[#864e5a] text-white text-[10px] px-2 py-1 rounded-bl-lg rounded-tr-[1rem] font-bold">
                      Owner
                    </div>
                  )}

                  {/* Avatar */}
                  <div className="w-20 h-20 mx-auto rounded-full flex items-center justify-center text-3xl mb-3 bg-gray-100">
                    {getChibiEmoji(profile.full_name)}
                  </div>

                  {/* Name */}
                  <p className="font-semibold text-base truncate text-gray-900">
                    {profile.full_name}
                  </p>

                  {/* Role */}
                  <p className="text-xs mt-0.5 text-gray-500 capitalize">
                    {profile.role}
                  </p>
                </button>
              ))}
            </div>

            {profiles.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-400 text-sm">No accounts found</p>
                <FallbackLogin t={t} login={login} />
              </div>
            )}
          </div>
        ) : (
          /* ═══ Password Entry ═══ */
          <div className="bg-white rounded-2xl shadow-lg p-6 space-y-5">
            <button
              onClick={handleBack}
              className="flex items-center gap-1 text-sm text-[#864e5a] font-medium"
            >
              <ChevronLeft size={16} />
              {t('common.back')}
            </button>

            {/* Selected user */}
            <div className="flex flex-col items-center gap-3 py-2">
              <div className="w-20 h-20 rounded-full flex items-center justify-center text-3xl bg-gray-100 border-2 border-[#864e5a]">
                {getChibiEmoji(selectedProfile.full_name)}
              </div>
              <div className="text-center">
                <p className="font-bold text-lg text-gray-900">
                  {selectedProfile.full_name}
                </p>
                <p className="text-xs text-gray-500 capitalize">{selectedProfile.role}</p>
              </div>
            </div>

            {/* Password form */}
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

        <div className="mt-4 flex justify-center">
          <LanguageSwitch />
        </div>
      </div>
    </div>
  )
}

/* Fallback: manual username/password login when no profiles loaded */
function FallbackLogin({ t, login }: { t: (k: string) => string; login: (email: string, password: string) => Promise<string | null> }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const err = await login(username, password)
    if (err) setError(err)
    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-3 text-left">
      <input
        type="text"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder={t('auth.username')}
        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#864e5a] outline-none text-sm"
        required
        autoCapitalize="none"
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder={t('auth.password')}
        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#864e5a] outline-none text-sm"
        required
      />
      {error && <p className="text-red-500 text-sm">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 bg-[#864e5a] text-white font-semibold rounded-xl disabled:opacity-50 text-sm"
      >
        {loading ? '...' : t('auth.login')}
      </button>
    </form>
  )
}
