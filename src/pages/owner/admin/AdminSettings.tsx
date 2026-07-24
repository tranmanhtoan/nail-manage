import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { ToggleLeft, ToggleRight, KeyRound, LogOut } from 'lucide-react'
import { LanguageSwitch } from '@/components/LanguageSwitch'
import { useAuthStore } from '@/store/authStore'
import { supabase } from '@/lib/supabase'

interface FeatureToggles {
  quick_entry_enabled: boolean
  appointments_enabled: boolean
  reports_enabled: boolean
}

const DEFAULT_TOGGLES: FeatureToggles = {
  quick_entry_enabled: true,
  appointments_enabled: true,
  reports_enabled: true,
}

export function AdminSettings() {
  const { t } = useTranslation()
  const { logout } = useAuthStore()
  const [toggles, setToggles] = useState<FeatureToggles>(DEFAULT_TOGGLES)
  const [saving, setSaving] = useState(false)
  const [kioskPin, setKioskPin] = useState('')
  const [pinSaved, setPinSaved] = useState(false)

  useEffect(() => {
    loadToggles()
    loadKioskPin()
  }, [])

  async function loadKioskPin() {
    const { data } = await supabase
      .from('shop_settings')
      .select('value')
      .eq('key', 'kiosk_pin')
      .maybeSingle()
    const row = data as { value: string } | null
    setKioskPin(row?.value || '1234')
  }

  async function saveKioskPin() {
    if (!kioskPin || kioskPin.length < 4) return
    setSaving(true)
    await supabase
      .from('shop_settings')
      .upsert({ key: 'kiosk_pin', value: kioskPin }, { onConflict: 'key' })
    setSaving(false)
    setPinSaved(true)
    setTimeout(() => setPinSaved(false), 2000)
  }

  async function loadToggles() {
    const { data } = await supabase
      .from('shop_settings')
      .select('key, value')
      .in('key', ['quick_entry_enabled', 'appointments_enabled', 'reports_enabled'])

    if (data && data.length > 0) {
      const loaded = { ...DEFAULT_TOGGLES }
      for (const row of data) {
        if (row.key in loaded) {
          (loaded as Record<string, boolean>)[row.key] = row.value === 'true'
        }
      }
      setToggles(loaded)
    }
  }

  async function toggleFeature(key: keyof FeatureToggles) {
    const newValue = !toggles[key]
    setToggles((prev) => ({ ...prev, [key]: newValue }))
    setSaving(true)
    await supabase
      .from('shop_settings')
      .upsert({ key, value: String(newValue) }, { onConflict: 'key' })
    setSaving(false)
  }

  return (
    <div className="px-5 py-6 pb-24 space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Cài đặt</h2>

      {/* Language */}
      <div
        className="rounded-[1rem] p-4 border border-[rgba(134,78,90,0.1)]"
        style={{ background: 'rgba(255, 248, 248, 0.6)', backdropFilter: 'blur(12px)' }}
      >
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-800">{t('settings.language')}</span>
          <LanguageSwitch />
        </div>
      </div>
