import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import type { Employee, PayType } from '@/lib/database.types'

interface EarningData {
  totalServices: number
  totalRevenue: number
  totalTips: number
  myEarnings: number
}

export function MyEarnings() {
  const { t } = useTranslation()
  const user = useAuthStore((s) => s.user)
  const [period, setPeriod] = useState<'today' | 'week' | 'month'>('week')
  const [data, setData] = useState<EarningData>({ totalServices: 0, totalRevenue: 0, totalTips: 0, myEarnings: 0 })
  const [employee, setEmployee] = useState<Employee | null>(null)

  useEffect(() => { if (user) load() }, [period, user])

  async function load() {
    // Try to find employee by profile_id first, then fallback to name match
    let empData: Employee | null = null

    const { data: empByProfile } = await supabase
      .from('employees')
      .select('*')
      .eq('profile_id', user!.id)
      .single()

    if (empByProfile) {
      empData = empByProfile as Employee
    } else {
      // Fallback: match by name if profile_id not linked
      const { data: empByName } = await supabase
        .from('employees')
        .select('*')
        .eq('name', user!.name)
        .single()

      if (empByName) {
        empData = empByName as Employee
      }
    }

    if (!empData) return
    setEmployee(empData)

    const today = new Date().toISOString().slice(0, 10)
    const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString().slice(0, 10)
    const monthStart = today.slice(0, 8) + '01'

    let dateFrom = today
    if (period === 'week') dateFrom = weekAgo
    if (period === 'month') dateFrom = monthStart

    let query = supabase
      .from('appointments')
      .select('price, tip')
      .eq('employee_id', empData.id)
      .eq('status', 'completed')
      .gte('date', dateFrom)

    if (period === 'today') {
      query = query.eq('date', today)
    }

    const { data: appointments } = await query
    const rows = (appointments as { price: number; tip: number }[]) ?? []

    const totalRevenue = rows.reduce((s, a) => s + a.price, 0)
    const totalTips = rows.reduce((s, a) => s + a.tip, 0)
    const myEarnings = calcEarnings(empData, totalRevenue, totalTips)

    setData({
      totalServices: rows.length,
      totalRevenue,
      totalTips,
      myEarnings,
    })
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
            {employee.pay_type === 'commission' && `${employee.commission_rate}% commission`}
            {employee.pay_type === 'fixed' && `Fixed + Tips`}
            {employee.pay_type === 'split' && `${employee.split_rate}/${100 - (employee.split_rate ?? 0)} split`}
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
          <p className="text-xs text-gray-500 mt-1">Services</p>
        </div>
        <div
          className="rounded-[1rem] p-4 text-center border border-[rgba(134,78,90,0.1)]"
          style={{ background: 'rgba(255, 248, 248, 0.6)', backdropFilter: 'blur(12px)' }}
        >
          <p className="text-2xl font-bold text-gray-900">${data.totalRevenue}</p>
          <p className="text-xs text-gray-500 mt-1">Revenue</p>
        </div>
        <div
          className="rounded-[1rem] p-4 text-center border border-[rgba(134,78,90,0.1)]"
          style={{ background: 'rgba(255, 248, 248, 0.6)', backdropFilter: 'blur(12px)' }}
        >
          <p className="text-2xl font-bold text-gray-900">${data.totalTips}</p>
          <p className="text-xs text-gray-500 mt-1">Tips</p>
        </div>
      </div>
    </div>
  )
}

function calcEarnings(emp: Employee, revenue: number, tips: number): number {
  const payType = emp.pay_type as PayType
  switch (payType) {
    case 'commission':
      return revenue * ((emp.commission_rate ?? 0) / 100) + tips
    case 'fixed':
      return tips
    case 'split':
      return (revenue + tips) * ((emp.split_rate ?? 0) / 100)
    default:
      return 0
  }
}
