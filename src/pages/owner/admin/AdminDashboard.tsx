import { useEffect, useState } from 'react'
import { Users, Scissors, CalendarDays, UserCheck } from 'lucide-react'
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

export function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats>({
    totalProfiles: 0, totalEmployees: 0, activeEmployees: 0,
    totalServices: 0, activeServices: 0,
    totalAppointments: 0, todayAppointments: 0, totalCustomers: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => { load() }, [])

  async function load() {
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
    return <div className="flex items-center justify-center p-12">
      <div className="animate-pulse text-[#864e5a] font-bold">Loading...</div>
    </div>
  }

  const cards = [
    { label: 'Tài khoản (Users)', value: stats.totalProfiles, icon: UserCheck, color: 'bg-violet-100 text-violet-700' },
    { label: 'Nhân viên', value: `${stats.activeEmployees}/${stats.totalEmployees}`, sub: 'active/total', icon: Users, color: 'bg-emerald-100 text-emerald-700' },
    { label: 'Dịch vụ', value: `${stats.activeServices}/${stats.totalServices}`, sub: 'active/total', icon: Scissors, color: 'bg-amber-100 text-amber-700' },
    { label: 'Lịch hẹn hôm nay', value: stats.todayAppointments, icon: CalendarDays, color: 'bg-sky-100 text-sky-700' },
    { label: 'Tổng lịch hẹn', value: stats.totalAppointments, icon: CalendarDays, color: 'bg-rose-100 text-rose-700' },
    { label: 'Khách hàng', value: stats.totalCustomers, icon: UserCheck, color: 'bg-teal-100 text-teal-700' },
  ]

  return (
    <div className="px-5 py-6 pb-24 space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Tổng quan hệ thống</h2>

      <div className="grid grid-cols-2 gap-3">
        {cards.map((card) => (
          <div
            key={card.label}
            className="rounded-[1rem] p-4 border border-[rgba(134,78,90,0.1)]"
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
