import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Users, Scissors, Settings2, ToggleLeft, ToggleRight, Shield, KeyRound } from 'lucide-react'
import { LanguageSwitch } from '@/components/LanguageSwitch'
import { useAuthStore } from '@/store/authStore'
import { useSuperModeStore } from '@/store/superModeStore'
import { Employees } from './Employees'
import { Services } from './Services'
import { supabase } from '@/lib/supabase'
import { useEffect } from 'react'

type Tab = 'general' | 'employees' | 'services'

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

export function Settings() {
  const { t } = useTranslation()
  const { logout } = useAuthStore()
  const { superMode, toggle: toggleSuperMode } = useSuperModeStore()
  const [tab, setTab] = useState<Tab>('general')
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

  const tabs: { id: Tab; label: string; icon: typeof Settings2 }[] = [
    { id: 'general', label: t('settings.general'), icon: Settings2 },
    { id: 'employees', label: t('nav.employees'), icon: Users },
    { id: 'services', label: t('nav.services'), icon: Scissors },
  ]

  return (
    <div className="max-w-lg mx-auto">
      {/* Tab bar */}
      <div className="flex border-b border-gray-200 bg-white sticky top-14 z-30">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-medium transition-colors border-b-2 ${
              tab === id
                ? 'border-[#864e5a] text-[#864e5a]'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Icon size={16} />
            {label}
          </button>
        ))}
      </div>

      {/* General tab */}
      {tab === 'general' && (
        <div className="px-5 py-6 pb-24 space-y-6">
          <h2 className="text-2xl font-bold text-gray-900">{t('settings.title')}</h2>

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
            <h3 className="text-[13px] font-semibold text-[#864e5a] uppercase tracking-widest">{t('settings.features')}</h3>

            <ToggleRow
              label={t('settings.featureQuickEntry')}
              description={t('settings.featureQuickEntryDesc')}
              enabled={toggles.quick_entry_enabled}
              onChange={() => toggleFeature('quick_entry_enabled')}
            />
            <ToggleRow
              label={t('settings.featureAppointments')}
              description={t('settings.featureAppointmentsDesc')}
              enabled={toggles.appointments_enabled}
              onChange={() => toggleFeature('appointments_enabled')}
            />
            <ToggleRow
              label={t('settings.featureReports')}
              description={t('settings.featureReportsDesc')}
              enabled={toggles.reports_enabled}
              onChange={() => toggleFeature('reports_enabled')}
            />

            {saving && (
              <p className="text-xs text-gray-400 text-center">{t('common.saving')}...</p>
            )}
          </div>

          {/* Super Mode */}
          <div
            className={`rounded-[1rem] p-5 space-y-3 border ${superMode ? 'border-red-300 bg-red-50/60' : 'border-[rgba(134,78,90,0.1)]'}`}
            style={!superMode ? { background: 'rgba(255, 248, 248, 0.6)', backdropFilter: 'blur(12px)' } : undefined}
          >
            <div className="flex items-center gap-2">
              <Shield size={16} className={superMode ? 'text-red-600' : 'text-gray-400'} />
              <h3 className="text-[13px] font-semibold text-red-600 uppercase tracking-widest">Super Mode</h3>
            </div>
            <div className="flex items-center justify-between py-1">
              <div className="flex-1 min-w-0 mr-3">
                <p className="text-sm font-medium text-gray-800">Chế độ quản trị nâng cao</p>
                <p className="text-xs text-gray-500 mt-0.5">Cho phép sửa trạng thái, giá, tip, nguồn tiền, dịch vụ của mọi cuộc hẹn</p>
              </div>
              <button
                onClick={toggleSuperMode}
                className={`shrink-0 transition-colors ${superMode ? 'text-red-600' : 'text-gray-300'}`}
              >
                {superMode ? <ToggleRight size={28} /> : <ToggleLeft size={28} />}
              </button>
            </div>
            {superMode && (
              <p className="text-xs text-red-500 font-medium">⚠️ Super Mode đang bật — cẩn thận khi chỉnh sửa</p>
            )}
          </div>

          {/* Logout */}
          <button
            onClick={logout}
            className="w-full py-3 bg-red-50 text-red-600 font-semibold rounded-xl"
          >
            {t('auth.logout')}
          </button>
        </div>
      )}

      {/* Employees tab */}
      {tab === 'employees' && <Employees />}

      {/* Services tab */}
      {tab === 'services' && <Services />}
    </div>
  )
}

function ToggleRow({
  label,
  description,
  enabled,
  onChange,
}: {
  label: string
  description: string
  enabled: boolean
  onChange: () => void
}) {
  return (
    <div className="flex items-center justify-between py-2">
      <div className="flex-1 min-w-0 mr-3">
        <p className="text-sm font-medium text-gray-800">{label}</p>
        <p className="text-xs text-gray-500 mt-0.5">{description}</p>
      </div>
      <button
        onClick={onChange}
        className={`shrink-0 transition-colors ${enabled ? 'text-[#864e5a]' : 'text-gray-300'}`}
      >
        {enabled ? <ToggleRight size={28} /> : <ToggleLeft size={28} />}
      </button>
    </div>
  )
}
