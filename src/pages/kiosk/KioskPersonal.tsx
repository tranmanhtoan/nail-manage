import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Loader2, Lock, ChevronLeft } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'

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

export function KioskPersonal() {
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
    // Only show employees (not owners)
    const { data } = await supabase
      .from('login_profiles')
      .select('id, full_name, role')
      .eq('role', 'employee')
      .order('full_name')

    setProfiles((data as ProfileOption[]) ?? [])
    setLoadingProfiles(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedProfile) return
    setLoading(true)
    setError('')

    // Get email via RPC
    const { data: email } = await supabase.rpc('get_login_email', { profile_id: selectedProfile.id })
    if (!email) {
      setError('Không tìm thấy tài khoản')
      setLoading(false)
      return
    }

    const err = await login(email as string, password)
    if (err) {
      setError(err)
      setLoading(false)
    }
    // If login succeeds, the auth state changes and App.tsx will redirect to employee routes
  }

  function handleBack() {
    setSelectedProfile(null)
    setPassword('')
    setError('')
  }

  if (loadingProfiles) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="animate-spin text-[#864e5a]" size={32} />
      </div>
    )
  }

  return (
    <div className="max-w-lg mx-auto px-5 py-6">
      <h1 className="text-2xl font-bold text-gray-900">Cá nhân</h1>
      <p className="text-sm text-gray-500 mt-1">Chọn tên để đăng nhập vào trang cá nhân</p>

      {!selectedProfile ? (
        /* Profile grid */
        <div className="mt-6 grid grid-cols-2 gap-4">
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
              {/* Avatar */}
              <div className="w-20 h-20 mx-auto rounded-full flex items-center justify-center text-3xl mb-3 bg-gray-100">
                {getChibiEmoji(profile.full_name)}
              </div>

              {/* Name */}
              <p className="font-semibold text-base truncate text-gray-900">
                {profile.full_name}
              </p>
            </button>
          ))}

          {profiles.length === 0 && (
            <p className="col-span-2 text-center text-gray-400 py-8 text-sm">
              Chưa có nhân viên nào có tài khoản
            </p>
          )}
        </div>
      ) : (
        /* Password entry */
        <div className="mt-6 bg-white rounded-2xl shadow-lg p-6 space-y-5">
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
            <p className="font-bold text-lg text-gray-900">
              {selectedProfile.full_name}
            </p>
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
    </div>
  )
}
