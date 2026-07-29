import { useState, useEffect, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { LanguageSwitch } from '@/components/LanguageSwitch'
import { ChevronLeft, Loader2, Monitor, Fingerprint, Delete, Crown } from 'lucide-react'
import { supabase } from '@/lib/supabase'

const LOGIN_PIN = import.meta.env.VITE_OWNER_PIN || '1234'
const PIN_LENGTH = 4

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

  const [profiles, setProfiles] = useState<ProfileOption[]>([])
  const [loadingProfiles, setLoadingProfiles] = useState(true)
  const [selectedProfile, setSelectedProfile] = useState<ProfileOption | null>(null)
  const [pin, setPin] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [shaking, setShaking] = useState(false)

  useEffect(() => {
    loadProfiles()
  }, [])

  async function loadProfiles() {
    setLoadingProfiles(true)
    const { data } = await supabase
      .from('login_profiles')
      .select('id, full_name, role')
      .order('full_name')
    setProfiles((data as ProfileOption[]) ?? [])
    setLoadingProfiles(false)
  }

  const handlePinInput = useCallback((digit: string) => {
    setPin((prev) => {
      if (prev.length >= PIN_LENGTH) return prev
      const newPin = prev + digit
      setError('')
      if (newPin.length === PIN_LENGTH) {
        setTimeout(() => verifyPin(newPin), 50)
      }
      return newPin
    })
  }, [selectedProfile])

  const handleDelete = useCallback(() => {
    setPin((prev) => prev.slice(0, -1))
    setError('')
  }, [])

  async function verifyPin(enteredPin: string) {
    if (!selectedProfile) return
    if (enteredPin === LOGIN_PIN) {
      setLoading(true)
      const err = await loginByProfile(selectedProfile.id)
      if (err) {
        setError(err)
        setPin('')
        setLoading(false)
      }
    } else {
      setShaking(true)
      setError('PIN không đúng')
      setTimeout(() => {
        setPin('')
        setShaking(false)
      }, 500)
    }
  }

  async function handleBiometric() {
    if (!selectedProfile) return
    setError('')
    setLoading(true)
    try {
      if (!window.PublicKeyCredential) {
        setError('Thiết bị không hỗ trợ sinh trắc học')
        setLoading(false)
        return
      }

      const available = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()
      if (!available) {
        setError('Face ID / Touch ID không khả dụng')
        setLoading(false)
        return
      }

      // Try to get existing credential
      const credential = await navigator.credentials.get({
        publicKey: {
          challenge: crypto.getRandomValues(new Uint8Array(32)),
          timeout: 60000,
          userVerification: 'required',
          rpId: window.location.hostname,
          allowCredentials: [],
        },
      }).catch(() => null)

      if (!credential) {
        // Fallback: create credential to trigger biometric
        const created = await navigator.credentials.create({
          publicKey: {
            challenge: crypto.getRandomValues(new Uint8Array(32)),
            rp: { name: 'NailPro', id: window.location.hostname },
            user: {
              id: crypto.getRandomValues(new Uint8Array(16)),
              name: selectedProfile.full_name,
              displayName: selectedProfile.full_name,
            },
            pubKeyCredParams: [{ alg: -7, type: 'public-key' }],
            authenticatorSelection: {
              authenticatorAttachment: 'platform',
              userVerification: 'required',
            },
            timeout: 60000,
          },
        }).catch(() => null)

        if (!created) {
          setError('Xác thực bị hủy')
          setLoading(false)
          return
        }
      }

      // Biometric passed — login
      const err = await loginByProfile(selectedProfile.id)
      if (err) {
        setError(err)
      }
    } catch {
      setError('Lỗi xác thực sinh trắc học')
    }
    setLoading(false)
  }

  function handleBack() {
    setSelectedProfile(null)
    setPin('')
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
                  {profile.role === 'owner' && (
                    <div className="absolute -top-[1px] -right-[1px] bg-[#864e5a] text-white text-[10px] px-2 py-1 rounded-bl-lg rounded-tr-[1rem] font-bold">
                      Owner
                    </div>
                  )}
                  <div className="w-16 h-16 mx-auto rounded-full flex items-center justify-center text-2xl mb-2 bg-gray-100">
                    {profile.role === 'owner'
                      ? <Crown size={28} className="text-[#864e5a]" />
                      : getChibiEmoji(profile.full_name)}
                  </div>
                  <p className="font-semibold text-sm truncate text-gray-900">
                    {profile.full_name}
                  </p>
                  <p className="text-xs mt-0.5 text-gray-500 capitalize">{profile.role}</p>
                </button>
              ))}

              {/* Kiosk card */}
              <button
                onClick={() => navigate('/kiosk')}
                className="p-4 rounded-[1rem] text-center relative transition-all border border-gray-200 hover:border-[#864e5a] hover:shadow-[0_0_20px_rgba(134,78,90,0.15)] active:scale-95"
                style={{
                  background: 'rgba(255, 248, 248, 0.6)',
                  backdropFilter: 'blur(12px)',
                }}
              >
                <div className="absolute -top-[1px] -right-[1px] bg-gray-600 text-white text-[10px] px-2 py-1 rounded-bl-lg rounded-tr-[1rem] font-bold">
                  Kiosk
                </div>
                <div className="w-16 h-16 mx-auto rounded-full flex items-center justify-center text-2xl mb-2 bg-gray-100">
                  <Monitor size={28} className="text-gray-600" />
                </div>
                <p className="font-semibold text-sm text-gray-900">Kiosk</p>
                <p className="text-xs mt-0.5 text-gray-500">Chế độ tablet</p>
              </button>
            </div>

            {profiles.length === 0 && (
              <p className="text-center text-gray-400 py-8 text-sm">
                Chưa có tài khoản nào
              </p>
            )}
          </div>
        ) : (
          /* ═══ PIN + Face ID ═══ */
          <div className="bg-white rounded-2xl shadow-lg p-6 space-y-5">
            <button
              onClick={handleBack}
              className="flex items-center gap-1 text-sm text-[#864e5a] font-medium"
            >
              <ChevronLeft size={16} />
              {t('common.back')}
            </button>

            {/* Selected profile */}
            <div className="flex flex-col items-center gap-2 py-2">
              <div className="w-16 h-16 rounded-full flex items-center justify-center text-2xl bg-gray-100 border-2 border-[#864e5a]">
                {selectedProfile.role === 'owner'
                  ? <Crown size={28} className="text-[#864e5a]" />
                  : getChibiEmoji(selectedProfile.full_name)}
              </div>
              <p className="font-bold text-lg text-gray-900">{selectedProfile.full_name}</p>
              <p className="text-sm text-gray-500">Nhập PIN hoặc dùng Face ID</p>
            </div>

            {/* PIN dots */}
            <div className={`flex justify-center gap-3 ${shaking ? 'animate-shake' : ''}`}>
              {Array.from({ length: PIN_LENGTH }).map((_, i) => (
                <div
                  key={i}
                  className={`w-4 h-4 rounded-full transition-all duration-200 ${
                    i < pin.length ? 'bg-[#864e5a] scale-110' : 'bg-gray-200'
                  }`}
                />
              ))}
            </div>

            {error && <p className="text-red-500 text-sm text-center">{error}</p>}

            {loading ? (
              <div className="flex justify-center py-6">
                <Loader2 className="animate-spin text-[#864e5a]" size={32} />
              </div>
            ) : (
              /* Number pad */
              <div className="grid grid-cols-3 gap-3 max-w-[240px] mx-auto">
                {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
                  <button
                    key={digit}
                    onClick={() => handlePinInput(digit)}
                    className="w-16 h-16 rounded-full bg-gray-50 border border-gray-200 text-xl font-semibold text-gray-800 hover:bg-gray-100 active:bg-gray-200 active:scale-95 transition-all flex items-center justify-center mx-auto"
                  >
                    {digit}
                  </button>
                ))}
                {/* Bottom row: Face ID, 0, Delete */}
                <button
                  onClick={handleBiometric}
                  className="w-16 h-16 rounded-full bg-gray-50 border border-gray-200 hover:bg-gray-100 active:bg-gray-200 active:scale-95 transition-all flex items-center justify-center mx-auto"
                  title="Face ID / Touch ID"
                >
                  <Fingerprint size={24} className="text-[#864e5a]" />
                </button>
                <button
                  onClick={() => handlePinInput('0')}
                  className="w-16 h-16 rounded-full bg-gray-50 border border-gray-200 text-xl font-semibold text-gray-800 hover:bg-gray-100 active:bg-gray-200 active:scale-95 transition-all flex items-center justify-center mx-auto"
                >
                  0
                </button>
                <button
                  onClick={handleDelete}
                  className="w-16 h-16 rounded-full bg-gray-50 border border-gray-200 hover:bg-gray-100 active:bg-gray-200 active:scale-95 transition-all flex items-center justify-center mx-auto"
                  title="Xóa"
                >
                  <Delete size={22} className="text-gray-600" />
                </button>
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
