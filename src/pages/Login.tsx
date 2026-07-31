import { useState, useCallback, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { LanguageSwitch } from '@/components/LanguageSwitch'
import { ChevronLeft, Loader2, Monitor, Crown, Fingerprint, Delete } from 'lucide-react'
import { supabase } from '@/lib/supabase'

const PIN_LENGTH = 4

interface OwnerProfile {
  id: string
  full_name: string
  role: string
  pin: string | null
}

export function Login() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const loginByProfile = useAuthStore((s) => s.loginByProfile)

  const [ownerProfile, setOwnerProfile] = useState<OwnerProfile | null>(null)
  const [showPinPad, setShowPinPad] = useState(false)
  const [pin, setPin] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [shaking, setShaking] = useState(false)

  async function handleOwnerClick() {
    setLoading(true)
    setError('')
    // Fetch owner profile from DB
    const { data, error: fetchError } = await supabase
      .from('login_profiles')
      .select('id, full_name, role')
      .eq('role', 'owner')
      .limit(1)
      .single()

    if (fetchError || !data) {
      setError(t('auth.ownerNotFound', { error: fetchError?.message || 'no data' }))
      setLoading(false)
      return
    }

    setOwnerProfile(data as OwnerProfile)
    setShowPinPad(true)
    setLoading(false)
  }

  const handlePinInput = useCallback((digit: string) => {
    setError('')
    setPin((prev) => {
      if (prev.length >= PIN_LENGTH) return prev
      return prev + digit
    })
  }, [])

  // Trigger verification when PIN reaches full length
  useEffect(() => {
    if (pin.length === PIN_LENGTH && ownerProfile && !loading) {
      verifyPin(pin)
    }
  }, [pin])

  const handleDelete = useCallback(() => {
    setPin((prev) => prev.slice(0, -1))
    setError('')
  }, [])

  async function verifyPin(enteredPin: string) {
    if (!ownerProfile) return

    setLoading(true)
    const err = await loginByProfile(ownerProfile.id, enteredPin)
    if (err) {
      setShaking(true)
      setError(err === 'PIN không đúng' ? t('pin.incorrect') : `Login failed: ${err}`)
      setPin('')
      setLoading(false)
      setTimeout(() => {
        setShaking(false)
      }, 500)
    } else {
      // Save PIN locally to support future Biometric logins
      localStorage.setItem(`bio_pin_${ownerProfile.id}`, enteredPin)
    }
  }

  async function handleBiometric() {
    if (!ownerProfile) return
    setError('')
    setLoading(true)
    try {
      if (!window.PublicKeyCredential) {
        setError(t('auth.biometricNotSupported'))
        setLoading(false)
        return
      }

      const available = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()
      if (!available) {
        setError(t('auth.biometricNotAvailable'))
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
              name: ownerProfile.full_name,
              displayName: ownerProfile.full_name,
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
          setError(t('auth.biometricCancelled'))
          setLoading(false)
          return
        }
      }

      // Biometric passed — login with saved PIN
      const savedPin = localStorage.getItem(`bio_pin_${ownerProfile.id}`) || ''
      const err = await loginByProfile(ownerProfile.id, savedPin)
      if (err) setError(err === 'PIN không đúng' ? t('auth.biometricActivatePrompt') : err)
    } catch {
      setError(t('auth.biometricFailed'))
    }
    setLoading(false)
  }

  function handleBack() {
    setShowPinPad(false)
    setOwnerProfile(null)
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

        {!showPinPad ? (
          /* ═══ Mode Selection: Owner vs Kiosk ═══ */
          <div className="grid grid-cols-2 gap-4">
            {/* Owner card */}
            <button
              onClick={handleOwnerClick}
              disabled={loading}
              className="p-6 rounded-[1rem] text-center relative transition-all border border-gray-200 hover:border-[#864e5a] hover:shadow-[0_0_20px_rgba(134,78,90,0.15)] active:scale-95 disabled:opacity-50"
              style={{
                background: 'rgba(255, 248, 248, 0.6)',
                backdropFilter: 'blur(12px)',
              }}
            >
              <div className="absolute -top-[1px] -right-[1px] bg-[#864e5a] text-white text-[10px] px-2 py-1 rounded-bl-lg rounded-tr-[1rem] font-bold">
                Owner
              </div>
              <div className="w-20 h-20 mx-auto rounded-full flex items-center justify-center text-3xl mb-3 bg-gray-100">
                {loading ? <Loader2 className="animate-spin text-[#864e5a]" size={28} /> : <Crown size={32} className="text-[#864e5a]" />}
              </div>
              <p className="font-semibold text-base text-gray-900">Owner</p>
              <p className="text-xs mt-0.5 text-gray-500">{t('auth.ownerDesc')}</p>
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
              <p className="text-xs mt-0.5 text-gray-500">{t('auth.kioskDesc')}</p>
            </button>

            {error && <p className="col-span-2 text-red-500 text-sm text-center mt-2">{error}</p>}
          </div>
        ) : (
          /* ═══ Owner PIN + Face ID ═══ */
          <div className="bg-white rounded-2xl shadow-lg p-6 space-y-5">
            <button
              onClick={handleBack}
              className="flex items-center gap-1 text-sm text-[#864e5a] font-medium"
            >
              <ChevronLeft size={16} />
              {t('common.back')}
            </button>

            <div className="flex flex-col items-center gap-2 py-2">
              <div className="w-16 h-16 rounded-full flex items-center justify-center bg-gray-100 border-2 border-[#864e5a]">
                <Crown size={28} className="text-[#864e5a]" />
              </div>
              <p className="font-bold text-lg text-gray-900">{ownerProfile?.full_name}</p>
              <p className="text-sm text-gray-500">{t('auth.enterPinOrFaceId')}</p>
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
                  title={t('auth.deleteChar')}
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
