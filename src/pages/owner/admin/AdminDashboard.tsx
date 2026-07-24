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
