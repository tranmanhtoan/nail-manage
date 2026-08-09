import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import type { PayType } from '@/lib/database.types'

interface EarningData {
  totalServices: number
  totalRevenue: number
  totalTips: number
  myEarnings: number
}

interface MyEmployee {
  id: string
  name: string
  pay_type: string
  commission_rate: number | null
  fixed_salary: number | null
  split_rate: number | null
}

interface AppointmentRow {
  apt_id: string
  apt_date: string
  apt_time: string
  apt_status: string
  apt_price: number
  apt_tip: number
  customer_name: string | null
  service_name: string | null
}

export function MyEarnings() {
  const { t, i18n } = useTranslation()
  const user = useAuthStore((s) => s.user)
  const [period, setPeriod] = useState<'today' | 'week' | 'month'>('week')
  const [data, setData] = useState<EarningData>({ totalServices: 0, totalRevenue: 0, totalTips: 0, myEarnings: 0 })
  const [employee, setEmployee] = useState<MyEmployee | null>(null)
  const [appointments, setAppointments] = useState<AppointmentRow[]>([])

  useEffect(() => { if (user) load() }, [period, user])

  async function load() {
    const isOffline = !navigator.onLine
    const empCacheKey = `my_employee_${user?.id}`
    const earningsCacheKey = `my_earnings_${user?.id}_${period}`

    if (isOffline) {
      const cachedEmp = localStorage.getItem(empCacheKey)
      let empData: MyEmployee | null = null
      if (cachedEmp) {
        empData = JSON.parse(cachedEmp)
        setEmployee(empData)
      }

      const cachedEarnings = localStorage.getItem(earningsCacheKey)
      if (cachedEarnings) {
        const parsed = JSON.parse(cachedEarnings)
        setAppointments(parsed.appointments)
        setData(parsed.data)
      } else {
        setAppointments([])
        setData({ totalServices: 0, totalRevenue: 0, totalTips: 0, myEarnings: 0 })
      }
      return
    }

    try {
      // Get my employee record via RPC (bypasses RLS)
      const { data: empRows } = await supabase.rpc('get_my_employee')
      const empArr = empRows as MyEmployee[] | null
      let empData: MyEmployee | null = null

      if (empArr && empArr.length > 0) {
        empData = empArr[0]
      } else {
        // Fallback: try direct query using user ID as profile_id
        const { data: directEmp } = await supabase
          .from('employees')
          .select('id, name, pay_type, commission_rate, fixed_salary, split_rate')
          .eq('profile_id', user!.id)
          .single()
        if (directEmp) {
          empData = directEmp as MyEmployee
        }
      }

      if (!empData) {
        setData({ totalServices: 0, totalRevenue: 0, totalTips: 0, myEarnings: 0 })
        setAppointments([])
        return
      }

      setEmployee(empData)
      localStorage.setItem(empCacheKey, JSON.stringify(empData))

      const today = new Date().toISOString().slice(0, 10)
      const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString().slice(0, 10)
      const monthStart = today.slice(0, 8) + '01'

      let dateFrom = today
      if (period === 'week') dateFrom = weekAgo
      if (period === 'month') dateFrom = monthStart

      // Get appointments via RPC (bypasses RLS)
      let rows: AppointmentRow[] = []
      const { data: aptData } = await supabase.rpc('get_my_appointments', {
        p_date: today,
        p_date_from: dateFrom,
      })
      rows = (aptData ?? []) as AppointmentRow[]

      // Fallback: if RPC returned empty, try direct query using employee ID
      if (rows.length === 0 && empData.id) {
        const { data: directApts } = await supabase
          .from('appointments')
          .select('id, date, time, status, price, tip, customers(name), services(name)')
          .eq('employee_id', empData.id)
          .eq('status', 'completed')
          .gte('date', dateFrom)
          .order('date', { ascending: false })
          .order('time', { ascending: false })

        if (directApts && directApts.length > 0) {
          rows = (directApts as any[]).map((a) => ({
            apt_id: a.id,
            apt_date: a.date,
            apt_time: a.time ?? '00:00',
            apt_status: a.status,
            apt_price: Number(a.price) || 0,
            apt_tip: Number(a.tip) || 0,
            customer_name: a.customers?.name ?? null,
            service_name: a.services?.name ?? null,
          }))
        }
      }

      setAppointments(rows)

      const totalRevenue = rows.reduce((s, a) => s + (Number(a.apt_price) || 0), 0)
      const totalTips = rows.reduce((s, a) => s + (Number(a.apt_tip) || 0), 0)
      const myEarnings = calcEarnings(empData, totalRevenue, totalTips, period)

      const payloadData = {
        totalServices: rows.length,
        totalRevenue,
        totalTips,
        myEarnings,
      }
      setData(payloadData)

      localStorage.setItem(
        earningsCacheKey,
        JSON.stringify({ appointments: rows, data: payloadData })
      )
    } catch (err) {
      console.error('Failed to load online earnings:', err)
      const cachedEmp = localStorage.getItem(empCacheKey)
      if (cachedEmp) setEmployee(JSON.parse(cachedEmp))
      
      const cachedEarnings = localStorage.getItem(earningsCacheKey)
      if (cachedEarnings) {
        const parsed = JSON.parse(cachedEarnings)
        setAppointments(parsed.appointments)
        setData(parsed.data)
      }
    }
  }

  function formatTime(time: string) {
    const [h, m] = (time ?? '00:00').split(':')
    const hour = parseInt(h)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const h12 = hour % 12 || 12
    return `${h12}:${m} ${ampm}`
  }

  return (
    <div className="max-w-lg mx-auto px-5 py-6 pb-24 space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">{t('nav.myEarnings')}</h2>

      {/* Period filter tabs */}
      <div className="flex gap-2">
        {(['today', 'week', 'month'] as const).map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={`flex-1 py-2 rounded-full text-sm font-semibold transition-all ${
              period === p ? 'bg-[#864e5a] text-white' : 'bg-gray-100 text-gray-600'
            }`}
          >
            {t(`common.${p}`)}
          </button>
        ))}
      </div>

      {/* Main earnings card */}
      <div
        className="rounded-[1rem] p-6 text-center border border-[rgba(134,78,90,0.1)]"
        style={{ background: 'rgba(255, 248, 248, 0.6)', backdropFilter: 'blur(12px)' }}
      >
        <p className="text-gray-500 text-sm">{t('nav.myEarnings')}</p>
        <p className="text-4xl font-bold text-[#864e5a] mt-1">${data.myEarnings.toFixed(0)}</p>
        {employee && (
          <p className="text-xs text-gray-400 mt-2">
            {employee.pay_type === 'commission' && `${employee.commission_rate}% ${t('employee.commission').toLowerCase()}`}
            {employee.pay_type === 'fixed' && `${t('employee.payTypes.fixed')}`}
            {employee.pay_type === 'split' && `${employee.split_rate}/${100 - (employee.split_rate ?? 0)} ${t('employee.payTypes.split').toLowerCase()}`}
          </p>
        )}
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-3 gap-3">
        <div
          className="rounded-[1rem] p-4 text-center border border-[rgba(134,78,90,0.1)]"
          style={{ background: 'rgba(255, 248, 248, 0.6)', backdropFilter: 'blur(12px)' }}
        >
          <p className="text-2xl font-bold text-gray-900">{data.totalServices}</p>
          <p className="text-xs text-gray-500 mt-1">{t('nav.services')}</p>
        </div>
        <div
          className="rounded-[1rem] p-4 text-center border border-[rgba(134,78,90,0.1)]"
          style={{ background: 'rgba(255, 248, 248, 0.6)', backdropFilter: 'blur(12px)' }}
        >
          <p className="text-2xl font-bold text-gray-900">${data.totalRevenue}</p>
          <p className="text-xs text-gray-500 mt-1">{t('dashboard.revenue')}</p>
        </div>
        <div
          className="rounded-[1rem] p-4 text-center border border-[rgba(134,78,90,0.1)]"
          style={{ background: 'rgba(255, 248, 248, 0.6)', backdropFilter: 'blur(12px)' }}
        >
          <p className="text-2xl font-bold text-gray-900">${data.totalTips}</p>
          <p className="text-xs text-gray-500 mt-1">{t('employee.tips')}</p>
        </div>
      </div>

      {/* Appointment detail list */}
      <section className="space-y-3">
        <h3 className="text-lg font-bold text-gray-900">{t('common.details')}</h3>

        {appointments.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-6">{t('common.noData')}</p>
        ) : (
          <div className="overflow-x-auto rounded-[1rem] border border-[rgba(134,78,90,0.1)]" style={{ background: 'rgba(255, 248, 248, 0.6)' }}>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-gray-500 border-b border-gray-200">
                  <th className="text-left py-3 px-3 font-medium">{t('common.date')}</th>
                  <th className="text-left py-3 px-3 font-medium">{t('common.service')}</th>
                  <th className="text-right py-3 px-3 font-medium">{t('common.price')}</th>
                  <th className="text-right py-3 px-3 font-medium">{t('common.tip')}</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map((apt) => (
                  <tr key={apt.apt_id} className="border-b border-gray-50">
                    <td className="py-2.5 px-3 text-gray-700 whitespace-nowrap">
                      {new Date(apt.apt_date + 'T00:00:00').toLocaleDateString(i18n.language === 'vi' ? 'vi-VN' : 'en-US', { day: '2-digit', month: '2-digit' })}
                      <span className="text-gray-400 ml-1 text-xs">{formatTime(apt.apt_time)}</span>
                    </td>
                    <td className="py-2.5 px-3 text-gray-700 truncate max-w-[120px]">{apt.service_name ?? '-'}</td>
                    <td className="py-2.5 px-3 text-right font-medium">${apt.apt_price}</td>
                    <td className="py-2.5 px-3 text-right text-emerald-600">${apt.apt_tip}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-gray-200 font-bold">
                  <td colSpan={2} className="py-3 px-3">{t('common.total')}</td>
                  <td className="py-3 px-3 text-right">${data.totalRevenue}</td>
                  <td className="py-3 px-3 text-right text-emerald-600">${data.totalTips}</td>
                </tr>
                <tr className="bg-[#864e5a]/5">
                  <td colSpan={2} className="py-3 px-3 font-bold text-[#864e5a]">{t('reports.myEarningsLabel')}</td>
                  <td colSpan={2} className="py-3 px-3 text-right font-bold text-[#864e5a] text-lg">${data.myEarnings.toFixed(0)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}

function calcEarnings(emp: MyEmployee, revenue: number, tips: number, period: 'today' | 'week' | 'month'): number {
  const payType = emp.pay_type as PayType
  switch (payType) {
    case 'commission':
      return revenue * ((emp.commission_rate ?? 0) / 100) + tips
    case 'fixed': {
      const weeklySalary = emp.fixed_salary ?? 0
      if (period === 'today') {
        return (weeklySalary / 7) + tips
      } else if (period === 'month') {
        return (weeklySalary * 30 / 7) + tips
      }
      return weeklySalary + tips
    }
    case 'split':
      return (revenue + tips) * ((emp.split_rate ?? 0) / 100)
    default:
      return 0
  }
}
