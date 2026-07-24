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

      {/* Feature Toggles */}
      <div
        className="rounded-[1rem] p-5 space-y-4 border border-[rgba(134,78,90,0.1)]"
        style={{ background: 'rgba(255, 248, 248, 0.6)', backdropFilter: 'blur(12px)' }}
      >
        <h3 className="text-[13px] font-semibold text-[#864e5a] uppercase tracking-widest">Tính năng</h3>

        <ToggleRow
          label="Quick Entry"
          description="Cho phép nhập nhanh từ màn hình chính"
          enabled={toggles.quick_entry_enabled}
          onChange={() => toggleFeature('quick_entry_enabled')}
        />
        <ToggleRow
          label="Lịch hẹn"
          description="Quản lý lịch hẹn và booking"
          enabled={toggles.appointments_enabled}
          onChange={() => toggleFeature('appointments_enabled')}
        />
        <ToggleRow
          label="Báo cáo"
          description="Xem báo cáo doanh thu và thống kê"
          enabled={toggles.reports_enabled}
          onChange={() => toggleFeature('reports_enabled')}
        />

        {saving && <p className="text-xs text-gray-400 text-center">Đang lưu...</p>}
      </div>

      {/* Kiosk PIN */}
      <div
        className="rounded-[1rem] p-5 space-y-3 border border-[rgba(134,78,90,0.1)]"
        style={{ background: 'rgba(255, 248, 248, 0.6)', backdropFilter: 'blur(12px)' }}
      >
        <div className="flex items-center gap-2">
          <KeyRound size={16} className="text-[#864e5a]" />
          <h3 className="text-[13px] font-semibold text-[#864e5a] uppercase tracking-widest">Mã PIN Kiosk</h3>
        </div>
        <p className="text-xs text-gray-500">PIN để mở khóa màn hình kiosk</p>
        <div className="flex items-center gap-3">
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            value={kioskPin}
            onChange={(e) => setKioskPin(e.target.value.replace(/\D/g, '').slice(0, 8))}
            maxLength={8}
            className="flex-1 px-4 py-3 rounded-xl border border-gray-200 focus:border-[#864e5a] outline-none text-center text-lg font-mono tracking-[0.3em]"
          />
          <button
            onClick={saveKioskPin}
            disabled={!kioskPin || kioskPin.length < 4}
            className="px-4 py-3 bg-[#864e5a] text-white font-semibold rounded-xl text-sm disabled:opacity-40 active:scale-[0.98] transition-transform"
          >
            {pinSaved ? '✓' : t('common.save')}
          </button>
        </div>
      </div>
