import { useEffect, useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { MoreHorizontal, Calendar, Info, ChevronRight } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'

interface Stats {
  totalRevenue: number
  cashRevenue: number
  cardRevenue: number
  dayAppointments: number
  waitingAppointments: number
  avgValue: number
  recentActivity: RecentItem[]
}

interface RecentItem {
  id: string
  serviceName: string
  employeeName: string
  price: number
  time: string
}

interface EmployeeOption {
  id: string
  name: string
}

interface DailyData {
  date: string
  revenue: number
  tip: number
}

type PerfTab = 'total' | 'gross' | 'net'

export function Dashboard() {
  const { t, i18n } = useTranslation()
  const user = useAuthStore((s) => s.user)
  const [selectedDate] = useState<string>(new Date().toISOString().slice(0, 10))
  const [stats, setStats] = useState<Stats>({
    totalRevenue: 0,
    cashRevenue: 0,
    cardRevenue: 0,
    dayAppointments: 0,
    waitingAppointments: 0,
    avgValue: 0,
    recentActivity: [],
  })
  const [loading, setLoading] = useState(true)
  const [employees, setEmployees] = useState<EmployeeOption[]>([])
  const [activityFilter, setActivityFilter] = useState<string>('all')
  const [perfTab, setPerfTab] = useState<PerfTab>('total')
  const [monthlyData, setMonthlyData] = useState<DailyData[]>([])
  const [lastUpdated, setLastUpdated] = useState<string>('')

  useEffect(() => {
    loadStats(selectedDate)
    loadMonthlyChart(selectedDate)
  }, [selectedDate])

  useEffect(() => {
    loadEmployees()
  }, [])

  function getMonthLabel(dateStr: string) {
    const d = new Date(dateStr + 'T00:00:00')
    return d.toLocaleDateString(i18n.language === 'vi' ? 'vi-VN' : 'en-US', { month: 'long', year: 'numeric' })
  }

  async function loadMonthlyChart(dateStr: string) {
    const d = new Date(dateStr + 'T00:00:00')
    const year = d.getFullYear()
    const month = d.getMonth()
    const firstDay = new Date(year, month, 1).toISOString().slice(0, 10)
    const lastDay = new Date(year, month + 1, 0).toISOString().slice(0, 10)

    const { data } = await supabase
      .from('appointments')
      .select('date, price, tip')
      .gte('date', firstDay)
      .lte('date', lastDay)
      .eq('status', 'completed')

    const rows = data ?? []
    const dailyMap = new Map<string, { revenue: number; tip: number }>()

    for (const row of rows) {
      const existing = dailyMap.get(row.date) ?? { revenue: 0, tip: 0 }
      existing.revenue += row.price
      existing.tip += row.tip
      dailyMap.set(row.date, existing)
    }

    const result: DailyData[] = []
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    for (let i = 1; i <= daysInMonth; i++) {
      const key = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`
      const entry = dailyMap.get(key)
      result.push({ date: key, revenue: entry?.revenue ?? 0, tip: entry?.tip ?? 0 })
    }

    setMonthlyData(result)
  }

  async function loadStats(dateStr: string) {
    const [dayCompletedRes, dayAllRes, dayWaitingRes, recentRes] = await Promise.all([
      supabase
        .from('appointments')
        .select('price, tip, customer_id, payment_method')
        .eq('date', dateStr)
        .eq('status', 'completed'),
      supabase
        .from('appointments')
        .select('id')
        .eq('date', dateStr)
        .eq('status', 'completed'),
      supabase
        .from('appointments')
        .select('id')
        .eq('date', dateStr)
        .in('status', ['booked', 'in_progress']),
      supabase
        .from('appointments')
        .select('id, price, tip, time, date, service_id, employee_id, services(name), employees(name)')
        .eq('date', dateStr)
        .eq('status', 'completed')
        .order('time', { ascending: false }),
    ])

    const dayCompletedData = dayCompletedRes.data ?? []

    const totalRevenue = dayCompletedData.reduce((sum, r) => sum + r.price + r.tip, 0)
    const cashRevenue = dayCompletedData
      .filter((r) => (r.payment_method ?? 'cash') === 'cash')
      .reduce((sum, r) => sum + r.price + r.tip, 0)
    const cardRevenue = dayCompletedData
      .filter((r) => r.payment_method === 'card')
      .reduce((sum, r) => sum + r.price + r.tip, 0)

    const withCustomerId = dayCompletedData.filter((r) => r.customer_id)
    const uniqueNamedCustomers = new Set(withCustomerId.map((r) => r.customer_id)).size
    const walkInCount = dayCompletedData.length - withCustomerId.length
    const totalCustomers = uniqueNamedCustomers + walkInCount || 1
    const avgValue = totalRevenue / totalCustomers

    const recent: RecentItem[] = (recentRes.data ?? []).map((r) => {
      const svc = r.services as unknown as { name: string } | null
      const emp = r.employees as unknown as { name: string } | null
      return {
        id: r.id,
        serviceName: svc?.name ?? 'Service',
        employeeName: emp?.name ?? '',
        price: r.price + r.tip,
        time: formatTime(r.date, r.time),
      }
    })

    setStats({
      totalRevenue,
      cashRevenue,
      cardRevenue,
      dayAppointments: dayAllRes.data?.length ?? 0,
      waitingAppointments: dayWaitingRes.data?.length ?? 0,
      avgValue,
      recentActivity: recent,
    })

    const now = new Date()
    setLastUpdated(`${now.getHours() % 12 || 12}:${String(now.getMinutes()).padStart(2, '0')} ${now.getHours() >= 12 ? 'PM' : 'AM'}`)
    setLoading(false)
  }

  async function loadEmployees() {
    const { data } = await supabase
      .from('employees')
      .select('id, name')
      .eq('is_active', true)
      .order('name')
    setEmployees((data ?? []) as EmployeeOption[])
  }

  function formatTime(_date: string, time: string) {
    const [h, m] = time.split(':')
    const hour = parseInt(h)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const h12 = hour % 12 || 12
    return `${h12}:${m} ${ampm}`
  }

  function formatCurrency(value: number) {
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`
    if (value >= 1000) return `${(value / 1000).toFixed(1)}k`
    return value.toFixed(0)
  }

  function formatCompact(value: number) {
    if (value >= 1000) return `${(value / 1000).toFixed(1)}k`
    return `${value}`
  }

  // Chart data based on perfTab
  const chartValues = useMemo(() => {
    return monthlyData.map((d) => {
      if (perfTab === 'gross') return d.revenue
      if (perfTab === 'net') return d.revenue - d.tip // ponytail: naive net = revenue - tips. upgrade: subtract actual employee costs
      return d.revenue + d.tip // total
    })
  }, [monthlyData, perfTab])

  // Stats for the performance card
  const monthTotal = monthlyData.reduce((s, d) => s + d.revenue + d.tip, 0)
  const monthDaysWithData = monthlyData.filter((d) => d.revenue > 0 || d.tip > 0).length
  const avgDailyOrders = monthDaysWithData > 0
    ? (stats.dayAppointments / 1).toFixed(0)
    : '0'

  // Get initials for avatar
  function getInitials(name: string) {
    return name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()
  }

  function getAvatarColor(name: string) {
    const colors = [
      'bg-violet-100 text-violet-700',
      'bg-emerald-100 text-emerald-700',
      'bg-sky-100 text-sky-700',
      'bg-amber-100 text-amber-700',
      'bg-rose-100 text-rose-700',
      'bg-teal-100 text-teal-700',
    ]
    let hash = 0
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash)
    }
    return colors[Math.abs(hash) % colors.length]
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-pulse text-violet-600 font-semibold text-lg">Loading...</div>
      </div>
    )
  }

  return (
    <div className="px-5 py-6 pb-24 space-y-6 max-w-lg mx-auto">
      {/* ═══ Page Title — "My store" style ═══ */}
      <div>
        <h1 className="text-[28px] font-black text-gray-900 tracking-tight leading-tight">
          {t('app.name')}
        </h1>
        <p className="text-sm text-gray-400 mt-0.5">{user?.name || 'Owner'}</p>
      </div>

      {/* ═══ Performance Card ═══ */}
      <section className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Card Header */}
        <div className="px-5 pt-5 pb-0 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">Performance</h2>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-gray-300" />
            <button className="p-0.5 text-gray-400 hover:text-gray-600">
              <MoreHorizontal size={18} />
            </button>
          </div>
        </div>

        {/* Month label */}
        <div className="px-5 mt-1 flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            <span className="text-sm font-semibold text-gray-900">
              {i18n.language === 'vi' ? 'Tháng này' : 'This Month'}
            </span>
            <span className="text-sm text-gray-400">{getMonthLabel(selectedDate)}</span>
          </div>
          <button className="p-1 text-gray-400 hover:text-gray-600">
            <Calendar size={16} />
          </button>
        </div>

        {/* Tabs: Total / Gross / Net */}
        <div className="px-5 mt-4">
          <div className="flex border border-gray-200 rounded-lg overflow-hidden">
            {(['total', 'gross', 'net'] as PerfTab[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setPerfTab(tab)}
                className={`flex-1 py-2.5 text-sm font-semibold transition-all ${
                  perfTab === tab
                    ? 'bg-gray-100 text-gray-900'
                    : 'bg-white text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Three big stat numbers */}
        <div className="px-5 mt-8 grid grid-cols-3 gap-2">
          <div>
            <p className="text-[28px] font-bold text-gray-900 leading-none">{avgDailyOrders}</p>
            <p className="text-[11px] text-gray-500 mt-2">
              {i18n.language === 'vi' ? 'Đơn hôm nay' : 'Paid orders'} <span className="text-gray-300">&#8964;</span>
            </p>
          </div>
          <div>
            <p className="text-[28px] font-bold text-gray-900 leading-none">{formatCompact(monthTotal)}</p>
            <p className="text-[11px] text-gray-500 mt-2">
              {i18n.language === 'vi' ? 'Khách tháng' : 'Visitors'}
            </p>
          </div>
          <div>
            <p className="text-[28px] font-bold text-gray-900 leading-none">
              {stats.dayAppointments > 0 && monthDaysWithData > 0
                ? `${((stats.dayAppointments / monthDaysWithData) * 100).toFixed(1)}%`
                : '0%'}
            </p>
            <p className="text-[11px] text-gray-500 mt-2">
              {i18n.language === 'vi' ? 'Tỷ lệ' : 'Conversion'}
            </p>
          </div>
        </div>

        {/* Last Updated */}
        <div className="px-5 mt-6 flex items-center justify-center gap-1.5">
          <span className="text-xs text-gray-400">Last Updated: {lastUpdated}</span>
          <Info size={13} className="text-gray-300" />
        </div>

        {/* Line Chart */}
        <div className="px-3 mt-4 pb-4">
          <LineChart data={chartValues} selectedDate={selectedDate} />
        </div>

        {/* View all analytics link */}
        <div className="px-5 pb-5 border-t border-gray-50 pt-4">
          <button className="flex items-center gap-1 text-sm font-medium text-violet-600 hover:text-violet-700 transition-colors">
            {i18n.language === 'vi' ? 'Xem toàn bộ phân tích' : 'View all store analytics'}
            <ChevronRight size={16} className="text-violet-400" />
          </button>
        </div>
      </section>

      {/* ═══ Recent Activity ═══ */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-900">{t('dashboard.recentActivity')}</h3>
          <button className="flex items-center gap-0.5 text-xs font-semibold text-violet-600">
            {i18n.language === 'vi' ? 'Xem tất cả' : 'View all Activity'}
            <ChevronRight size={14} className="text-violet-400" />
          </button>
        </div>

        {/* Employee filter tabs */}
        <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
          <button
            onClick={() => setActivityFilter('all')}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
              activityFilter === 'all'
                ? 'bg-violet-600 text-white'
                : 'bg-gray-100 text-gray-600'
            }`}
          >
            {t('common.all')}
          </button>
          {employees.map((emp) => (
            <button
              key={emp.id}
              onClick={() => setActivityFilter(emp.name)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                activityFilter === emp.name
                  ? 'bg-violet-600 text-white'
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              {emp.name}
            </button>
          ))}
        </div>

        {/* Activity List */}
        <div className="space-y-3 max-h-[50vh] overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
          {(() => {
            const filtered = activityFilter === 'all'
              ? stats.recentActivity
              : stats.recentActivity.filter((item) => item.employeeName === activityFilter)

            if (filtered.length === 0) {
              return <p className="text-sm text-gray-400 text-center py-8">{t('dashboard.noActivity')}</p>
            }

            return filtered.map((item) => (
              <div
                key={item.id}
                className="p-4 bg-white rounded-xl border border-gray-100 flex items-center gap-3 shadow-sm"
              >
                {/* Avatar */}
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${getAvatarColor(item.employeeName || 'U')}`}
                >
                  {getInitials(item.employeeName || 'U')}
                </div>
                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">{item.serviceName}</p>
                  <p className="text-xs text-gray-500">
                    {t('dashboard.completedBy')} <span className="font-semibold text-violet-600">{item.employeeName}</span>
                  </p>
                </div>
                {/* Price & Time */}
                <div className="text-right shrink-0">
                  <p className="text-sm font-bold text-gray-900">${formatCurrency(item.price)}</p>
                  <p className="text-[10px] text-gray-400">{item.time}</p>
                </div>
              </div>
            ))
          })()}
        </div>
      </section>
    </div>
  )
}

// ─── Line Chart Component ─────────────────────────────────────────────────────

function LineChart({ data, selectedDate }: { data: number[]; selectedDate: string }) {
  if (data.length === 0) return null

  const maxVal = Math.max(...data, 1)
  const width = 100
  const height = 36
  const paddingX = 1
  const paddingY = 3

  // Build points
  const points = data.map((val, i) => {
    const x = paddingX + (i / (data.length - 1)) * (width - paddingX * 2)
    const y = height - paddingY - (val / maxVal) * (height - paddingY * 2)
    return { x, y }
  })

  const pathD = points
    .map((p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`))
    .join(' ')

  // Area fill
  const areaD = `${pathD} L ${points[points.length - 1].x} ${height} L ${points[0].x} ${height} Z`

  // X-axis label days
  const daysInMonth = data.length
  const step = Math.max(Math.floor(daysInMonth / 6), 1)
  const labelDays: number[] = []
  for (let i = 0; i < daysInMonth; i += step) {
    labelDays.push(i + 1)
  }
  if (labelDays[labelDays.length - 1] !== daysInMonth) {
    labelDays.push(daysInMonth)
  }

  // Highlight selected day
  const selectedDay = new Date(selectedDate + 'T00:00:00').getDate() - 1
  const dot = points[selectedDay] || null

  return (
    <div>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-28"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="perfGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#7c3aed" stopOpacity="0.12" />
            <stop offset="100%" stopColor="#7c3aed" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Area */}
        <path d={areaD} fill="url(#perfGrad)" />

        {/* Line */}
        <path
          d={pathD}
          fill="none"
          stroke="#7c3aed"
          strokeWidth="0.45"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Dot */}
        {dot && (
          <circle
            cx={dot.x}
            cy={dot.y}
            r="0.9"
            fill="#7c3aed"
            stroke="white"
            strokeWidth="0.35"
          />
        )}
      </svg>

      {/* X-axis labels */}
      <div className="flex justify-between mt-1.5 px-0.5">
        {labelDays.map((day, i) => (
          <span key={i} className="text-[10px] text-gray-400 font-medium">
            {i === 0 ? `1 ${getMonthShort(selectedDate)}` : day}
          </span>
        ))}
      </div>
    </div>
  )
}

function getMonthShort(dateStr: string) {
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('en-US', { month: 'short' }).replace('.', '')
}
