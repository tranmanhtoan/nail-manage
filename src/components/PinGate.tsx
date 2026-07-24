import { useState, useCallback, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Delete, Lock, Loader2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { toAuthEmail } from '@/lib/auth-helpers'

const KIOSK_EMAIL = import.meta.env.VITE_KIOSK_EMAIL || ''
const KIOSK_PASSWORD = import.meta.env.VITE_KIOSK_PASSWORD || ''

interface PinGateProps {
  children: React.ReactNode
}

export function PinGate({ children }: PinGateProps) {
  const { t } = useTranslation()
  const [unlocked, setUnlocked] = useState(false)
  const [checking, setChecking] = useState(true)
  const [kioskPin, setKioskPin] = useState('')
  const [pin, setPin] = useState('')
  const [error, setError] = useState(false)
  const [logging, setLogging] = useState(false)
  const [loginError, setLoginError] = useState('')

  useEffect(() => {
    async function init() {
      // Check if already logged in
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        setUnlocked(true)
        setChecking(false)
        return
      }

      // Fetch PIN from shop_settings
      const { data } = await supabase
        .from('shop_settings')
        .select('value')
        .eq('key', 'kiosk_pin')
        .maybeSingle()

      const row = data as { value: string } | null
      setKioskPin(row?.value || '1234')
      setChecking(false)
    }
    init()
  }, [])

  const pinLength = kioskPin.length || 4

  const handleDigit = useCallback((digit: string) => {
    setError(false)
    setLoginError('')
    const next = pin + digit
    if (next.length === pinLength) {
      if (next === kioskPin) {
        loginKiosk()
      } else {
        setError(true)
        setTimeout(() => {
          setPin('')
          setError(false)
        }, 600)
      }
    }
    setPin(next.slice(0, pinLength))
  }, [pin, kioskPin, pinLength])

  const handleDelete = useCallback(() => {
    setPin((prev) => prev.slice(0, -1))
    setError(false)
    setLoginError('')
  }, [])

  async function loginKiosk() {
    setLogging(true)
    setLoginError('')

    const { error: authError } = await supabase.auth.signInWithPassword({
      email: toAuthEmail(KIOSK_EMAIL),
      password: KIOSK_PASSWORD,
    })

    setLogging(false)

    if (authError) {
      setLoginError(authError.message)
      setPin('')
      return
    }

    setUnlocked(true)
  }

  if (unlocked) return <>{children}</>

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-[#864e5a]" size={32} />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-white to-gray-50 px-6">
      {/* Lock icon */}
      <div className="w-16 h-16 rounded-full bg-[#864e5a]/10 flex items-center justify-center mb-4">
        <Lock className="text-[#864e5a]" size={28} />
      </div>

      <h1 className="text-xl font-bold text-gray-900 mb-1">{t('pin.title')}</h1>
      <p className="text-sm text-gray-500 mb-8">{t('pin.subtitle')}</p>

      {/* PIN dots */}
      <div className="flex gap-3 mb-8">
        {Array.from({ length: pinLength }).map((_, i) => (
          <div
            key={i}
            className={`w-4 h-4 rounded-full transition-all duration-150 ${
              error
                ? 'bg-red-400 animate-shake'
                : i < pin.length
                ? 'bg-[#864e5a] scale-110'
                : 'bg-gray-200'
            }`}
          />
        ))}
      </div>

      {/* Error messages */}
      {error && (
        <p className="text-red-500 text-sm font-medium mb-4">{t('pin.incorrect')}</p>
      )}
      {loginError && (
        <p className="text-red-500 text-sm font-medium mb-4">{loginError}</p>
      )}

      {/* Loading state */}
      {logging && (
        <div className="flex items-center gap-2 mb-4">
          <Loader2 className="animate-spin text-[#864e5a]" size={18} />
          <span className="text-sm text-gray-500">{t('pin.connecting')}</span>
        </div>
      )}

      {/* Number pad */}
      <div className="grid grid-cols-3 gap-3 w-full max-w-[280px]">
        {['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'del'].map((key) => {
          if (key === '') return <div key="empty" />
          if (key === 'del') {
            return (
              <button
                key="del"
                onClick={handleDelete}
                disabled={logging}
                className="h-16 rounded-2xl flex items-center justify-center text-gray-500 active:bg-gray-100 transition-colors disabled:opacity-40"
              >
                <Delete size={24} />
              </button>
            )
          }
          return (
            <button
              key={key}
              onClick={() => handleDigit(key)}
              disabled={logging}
              className="h-16 rounded-2xl bg-white border border-gray-200 text-2xl font-semibold text-gray-800 active:bg-[#864e5a]/10 active:border-[#864e5a]/30 transition-all active:scale-95 disabled:opacity-40"
            >
              {key}
            </button>
          )
        })}
      </div>
    </div>
  )
}
