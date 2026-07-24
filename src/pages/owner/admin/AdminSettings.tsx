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
