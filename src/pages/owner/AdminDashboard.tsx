import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { Users, Scissors, CalendarDays, UserCheck, Loader2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface AdminStats {
  totalProfiles: number
  totalEmployees: number
  activeEmployees: number
  totalServices: number
  activeServices: number
  totalAppointments: number
  todayAppointments: number
  totalCustomers: number
}

interface AdminDashboardProps {
  onSwitchTab?: (tab: string) => void
}

export function AdminDashboard({ onSwitchTab }: AdminDashboardProps) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [stats, setStats] = useState<AdminStats>({
    totalProfiles: 0,
    totalEmployees: 0,
    activeEmployees: 0,
    totalServices: 0,
    activeServices: 0,
    totalAppointments: 0,
    todayAppointments: 0,
    totalCustomers: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    load()
  }, [])

  async function load() {
    try {
      await supabase.rpc('sync_orphaned_employees')
    } catch (e) {
      console.warn('sync_orphaned_employees failed:', e)
    }

    const today = new Date().toISOString().slice(0, 10)

    const [profiles, employees, services, appointments, todayApts, customers] = await Promise.all([
      supabase.from('profiles').select('id', { count: 'exact', head: true }),
      supabase.from('employees').select('id, is_active'),
      supabase.from('services').select('id, is_active'),
      supabase.from('appointments').select('id', { count: 'exact', head: true }),
      supabase.from('appointments').select('id', { count: 'exact', head: true }).eq('date', today),
      supabase.from('customers').select('id', { count: 'exact', head: true }),
    ])

    const empData = (employees.data ?? []) as { id: string; is_active: boolean }[]
    const svcData = (services.data ?? []) as { id: string; is_active: boolean }[]

    setStats({
      totalProfiles: profiles.count ?? 0,
      totalEmployees: empData.length,
      activeEmployees: empData.filter((e) => e.is_active).length,
      totalServices: svcData.length,
      activeServices: svcData.filter((s) => s.is_active).length,
      totalAppointments: appointments.count ?? 0,
      todayAppointments: todayApts.count ?? 0,
      totalCustomers: customers.count ?? 0,
    })
    setLoading(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="animate-spin text-[#864e5a]" size={32} />
      </div>
    )
  }

  const cards = [
    {
      label: t('settings.userAccounts'),
      value: stats.totalProfiles,
      icon: UserCheck,
      color: 'bg-violet-100 text-violet-700',
      onClick: undefined as (() => void) | undefined,
    },
    {
      label: t('nav.employees'),
      value: `${stats.activeEmployees}/${stats.totalEmployees}`,
      sub: t('settings.activeTotal'),
      icon: Users,
      color: 'bg-emerald-100 text-emerald-700',
      onClick: () => onSwitchTab?.('employees'),
    },
    {
      label: t('nav.services'),
      value: `${stats.activeServices}/${stats.totalServices}`,
      sub: t('settings.activeTotal'),
      icon: Scissors,
      color: 'bg-amber-100 text-amber-700',
      onClick: () => onSwitchTab?.('services'),
    },
    {
      label: t('appointments.todayTitle'),
      value: stats.todayAppointments,
      icon: CalendarDays,
      color: 'bg-sky-100 text-sky-700',
      onClick: () => navigate('/appointments'),
    },
    {
      label: t('dashboard.totalAppointments'),
      value: stats.totalAppointments,
      icon: CalendarDays,
      color: 'bg-rose-100 text-rose-700',
      onClick: () => navigate('/appointments'),
    },
    {
      label: t('customer.title'),
      value: stats.totalCustomers,
      icon: UserCheck,
      color: 'bg-teal-100 text-teal-700',
      onClick: undefined as (() => void) | undefined,
    },
  ]

  return (
    <div className="px-5 py-6 pb-24 space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">{t('settings.systemOverview')}</h2>

      <div className="grid grid-cols-2 gap-3">
        {cards.map((card) => (
          <div
            key={card.label}
            onClick={card.onClick}
            className={`rounded-[1rem] p-4 border border-[rgba(134,78,90,0.1)] ${card.onClick ? 'cursor-pointer active:scale-[0.97] transition-transform' : ''}`}
            style={{ background: 'rgba(255, 248, 248, 0.6)', backdropFilter: 'blur(12px)' }}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-gray-500">{card.label}</span>
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${card.color}`}>
                <card.icon size={16} />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">{card.value}</p>
            {card.sub && <p className="text-xs text-gray-400 mt-1">{card.sub}</p>}
          </div>
        ))}
      </div>
    </div>
  )
}
