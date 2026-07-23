import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Download, Wallet } from 'lucide-react'
import { supabase } from '@/lib/supabase'

type Period = 'day' | 'week' | 'month'

interface ServiceRevenue {
  name: string
  revenue: number
}

interface StaffProductivity {
  name: string
  count: number
}

interface TopPerformer {
  name: string
  title: string
  revenue: number
}

export function Reports() {
  const { t } = useTranslation()
  const [period, setPeriod] = useState<Period>('week')
  const [serviceRevenue, setServiceRevenue] = useState<ServiceRevenue[]>([])
  const [staffProductivity, setStaffProductivity] = useState<StaffProductivity[]>([])
  const [topPerformers, setTopPerformers] = useState<TopPerformer[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadReport()
  }, [period])

  function getDateRange(): string {
    const today = new Date()
    const todayStr = today.toISOString().slice(0, 10)

    if (period === 'day') return todayStr

    if (period === 'week') {
      const dayOfWeek = today.getDay()
      const mondayOffset = dayOfWeek === 0 ? 6 : dayOfWeek - 1
      const monday = new Date(today)
      monday.setDate(today.getDate() - mondayOffset)
      return monday.toISOString().slice(0, 10)
    }

    // month
    return todayStr.slice(0, 8) + '01'
  }

  async function loadReport() {
    setLoading(true)
    const startDate = getDateRange()

    const { data } = await supabase
      .from('appointments')
      .select('price, tip, employee_id, service_id, services(name), employees(name)')
      .gte('date', startDate)
      .eq('status', 'completed')

    const rows = data ?? []

    // Service Revenue — group by service
    const svcMap = new Map<string, { name: string; revenue: number }>()
    for (const row of rows) {
      const svc = row.services as unknown as { name: string } | null
      const key = row.service_id
      const existing = svcMap.get(key) ?? { name: svc?.name ?? 'Unknown', revenue: 0 }
      existing.revenue += row.price + row.tip
      svcMap.set(key, existing)
    }
    const svcList = [...svcMap.values()].sort((a, b) => b.revenue - a.revenue).slice(0, 5)
    setServiceRevenue(svcList)

    // Staff Productivity — count appointments per employee
    const empCountMap = new Map<string, { name: string; count: number; revenue: number }>()
    for (const row of rows) {
      const emp = row.employees as unknown as { name: string } | null
      const key = row.employee_id ?? 'unknown'
      const existing = empCountMap.get(key) ?? { name: emp?.name ?? 'Unknown', count: 0, revenue: 0 }
      existing.count += 1
      existing.revenue += row.price + row.tip
      empCountMap.set(key, existing)
    }
    const staffList = [...empCountMap.values()].sort((a, b) => b.count - a.count).slice(0, 6)
    setStaffProductivity(staffList)

    // Top Performers — by revenue
    const topList = [...empCountMap.values()]
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5)
      .map((emp) => ({
        name: emp.name,
        title: emp.count >= 10 ? 'Senior Specialist' : 'Technician',
        revenue: emp.revenue,
      }))
    setTopPerformers(topList)

    setLoading(false)
  }

  function formatCurrency(value: number) {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`
    if (value >= 1000) return `$${(value / 1000).toFixed(1)}k`
    return `$${value.toFixed(0)}`
  }

  // Bar color gradient based on rank
  const barColors = [
    'bg-[#864e5a]',
    'bg-[#864e5a]/80',
    'bg-[#864e5a]/60',
    'bg-[#864e5a]/40',
    'bg-[#864e5a]/25',
  ]

  // Avatar helpers
  function getInitials(name: string) {
    return name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()
  }

  function getAvatarColor(name: string) {
    const colors = [
      'bg-rose-100 text-rose-700',
      'bg-amber-100 text-amber-700',
      'bg-violet-100 text-violet-700',
      'bg-sky-100 text-sky-700',
      'bg-emerald-100 text-emerald-700',
      'bg-teal-100 text-teal-700',
    ]
    let hash = 0
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash)
    }
    return colors[Math.abs(hash) % colors.length]
  }

  const maxServiceRevenue = serviceRevenue.length > 0 ? serviceRevenue[0].revenue : 1
  const maxStaffCount = staffProductivity.length > 0 ? Math.max(...staffProductivity.map((s) => s.count), 1) : 1

  const periodLabel = period === 'day' ? t('reports.thisDay') : period === 'week' ? t('reports.thisWeek') : t('reports.thisMonth')

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-pulse text-[#864e5a] font-bold text-xl">Loading...</div>
      </div>
    )
  }

  return (
    <div className="max-w-lg mx-auto px-5 py-6 pb-24 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('reports.title')}</h1>
          <p className="text-sm text-gray-500 mt-0.5">{t('reports.subtitle')}</p>
        </div>
        <button className="flex items-center gap-1.5 bg-[#864e5a] text-white text-xs font-semibold px-3 py-2 rounded-xl">
          <Download size={14} />
          {t('reports.export')}
        </button>
      </div>

      {/* Period Filters */}
      <div className="flex gap-2">
        {(['day', 'week', 'month'] as Period[]).map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all ${
              period === p
                ? 'bg-[#864e5a] text-white'
                : 'bg-gray-100 text-gray-600'
            }`}
          >
            {p === 'day' ? t('reports.day') : p === 'week' ? t('reports.week') : t('reports.month')}
          </button>
        ))}
      </div>

      {/* Service Revenue Card */}
      <div
        className="rounded-[1rem] p-5 border border-[rgba(134,78,90,0.1)]"
        style={{ background: 'rgba(255, 248, 248, 0.6)', backdropFilter: 'blur(12px)' }}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900">{t('reports.serviceRevenue')}</h2>
          <div className="w-9 h-9 bg-[#864e5a]/10 rounded-xl flex items-center justify-center">
            <Wallet size={18} className="text-[#864e5a]" />
          </div>
        </div>

        {serviceRevenue.length === 0 ? (
          <p className="text-sm text-gray-400 py-4 text-center">{t('reports.noData')}</p>
        ) : (
          <div className="space-y-3">
            {serviceRevenue.map((svc, i) => (
              <div key={i}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm text-gray-700">{svc.name}</span>
                  <span className="text-sm font-bold text-gray-900">{formatCurrency(svc.revenue)}</span>
                </div>
                <div className="h-2 bg-white/50 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${barColors[i] ?? barColors[barColors.length - 1]}`}
                    style={{ width: `${(svc.revenue / maxServiceRevenue) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Staff Productivity Card */}
      <div
        className="rounded-[1rem] p-5 border border-[rgba(134,78,90,0.1)]"
        style={{ background: 'rgba(255, 248, 248, 0.6)', backdropFilter: 'blur(12px)' }}
      >
        <h2 className="text-lg font-bold text-gray-900 mb-4">{t('reports.staffProductivity')}</h2>

        {staffProductivity.length === 0 ? (
          <p className="text-sm text-gray-400 py-4 text-center">{t('reports.noData')}</p>
        ) : (
          <>
            {/* Bar chart */}
            <div className="flex items-end justify-between gap-3 h-32 mb-3">
              {staffProductivity.map((staff, i) => {
                const height = (staff.count / maxStaffCount) * 100
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <span className="text-[10px] font-medium text-gray-500">{staff.count}</span>
                    <div
                      className="w-full max-w-[32px] bg-[#864e5a] rounded-md"
                      style={{ height: `${Math.max(height, 8)}%` }}
                    />
                  </div>
                )
              })}
            </div>
            <div className="flex justify-between gap-3">
              {staffProductivity.map((staff, i) => (
                <span key={i} className="flex-1 text-center text-[10px] text-gray-500 truncate">
                  {staff.name.split(' ')[0]}
                </span>
              ))}
            </div>
            <p className="text-[10px] text-gray-400 text-center mt-2 uppercase tracking-wide">
              {t('reports.appointmentsPerWeek')}
            </p>
          </>
        )}
      </div>

      {/* Top Performers */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold text-gray-900">{t('reports.topPerformers')}</h2>

        {topPerformers.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-4">{t('reports.noData')}</p>
        ) : (
          <div className="space-y-3">
            {topPerformers.map((performer, i) => (
              <div
                key={i}
                className="p-4 rounded-[1rem] flex items-center gap-4 border-l-4 border-[#864e5a]/30"
                style={{
                  background: 'rgba(255, 248, 248, 0.6)',
                  backdropFilter: 'blur(12px)',
                  borderRight: '1px solid rgba(134,78,90,0.1)',
                  borderTop: '1px solid rgba(134,78,90,0.1)',
                  borderBottom: '1px solid rgba(134,78,90,0.1)',
                }}
              >
                {/* Avatar */}
                <div
                  className={`w-11 h-11 rounded-full flex items-center justify-center text-xs font-bold ${getAvatarColor(performer.name)}`}
                >
                  {getInitials(performer.name)}
                </div>
                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900">{performer.name}</p>
                  <p className="text-xs text-gray-500">{performer.title}</p>
                </div>
                {/* Revenue */}
                <div className="text-right">
                  <p className="text-sm font-bold text-gray-900">{formatCurrency(performer.revenue)}</p>
                  <p className="text-[10px] text-gray-400">{periodLabel}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
