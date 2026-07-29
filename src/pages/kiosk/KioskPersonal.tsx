import { useState, useEffect, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { ChevronLeft, Loader2, Fingerprint, Delete } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'

const PIN_LENGTH = 4

interface ProfileOption {
  id: string
  full_name: string
  role: string
  pin: string | null
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
  const loginByProfile = useAuthStore((s) => s.loginByProfile)
  const [profiles, setProfiles] = useState<ProfileOption[]>([])
  const [selectedProfile, setSelectedProfile] = useState<ProfileOption | null>(null)
  const [pin, setPin] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [loadingProfiles, setLoadingProfiles] = useState(true)
  const [shaking, setShaking] = useState(false)

  useEffect(() => {
    loadProfiles()
  }, [])

  async function loadProfiles() {
    setLoadingProfiles(true)
    const { data } = await supabase
      .from('login_profiles')
      .select('id, full_name, role, pin')
      .eq('role', 'employee')
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

    // Check against the profile's own PIN
    if (!selectedProfile.pin) {
      setShaking(true)
      setError('Chưa đặt PIN. Liên hệ Owner để cài đặt.')
      setTimeout(() => {
        setPin('')
        setShaking(false)
      }, 500)
      return
    }

    if (enteredPin === selectedProfile.pin) {
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
              <div className="w-20 h-20 mx-auto rounded-full flex items-center justify-center text-3xl mb-3 bg-gray-100">
                {getChibiEmoji(profile.full_name)}
              </div>
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
        /* PIN + Face ID entry */
        <div className="mt-6 bg-white rounded-2xl shadow-lg p-6 space-y-5">
          <button
            onClick={handleBack}
            className="flex items-center gap-1 text-sm text-[#864e5a] font-medium"
          >
            <ChevronLeft size={16} />
            {t('common.back')}
          </button>

          {/* Selected user */}
          <div className="flex flex-col items-center gap-2 py-2">
            <div className="w-16 h-16 rounded-full flex items-center justify-center text-2xl bg-gray-100 border-2 border-[#864e5a]">
              {getChibiEmoji(selectedProfile.full_name)}
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
    </div>
  )
}
