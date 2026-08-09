import { useEffect, useState, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { CalendarDays, Star, TrendingUp, Wallet, Banknote, CreditCard, ChevronLeft, ChevronRight } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import { useDataStore } from '@/store/dataStore'

type ViewMode = 'day' | 'week' | 'month'

interface Stats {
  totalRevenue: number
  cashRevenue: number
  cardRevenue: number
  dayAppointments: number
  waitingAppointments: number
  avgValue: number
  weeklyData: number[]
  weeklyLabels: string[]
  recentActivity: RecentItem[]
  lastWeekRevenue: number
  totalCustomers: number
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
const DAYS = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN']
export function Dashboard() {
  const { t, i18n } = useTranslation()
  const user = useAuthStore((s) => s.user)
  const [viewMode, setViewMode] = useState<ViewMode>('day')
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().slice(0, 10))
  const [stats, setStats] = useState<Stats>({
    totalRevenue: 0,
    cashRevenue: 0,
    cardRevenue: 0,
    dayAppointments: 0,
    waitingAppointments: 0,
    avgValue: 0,
    weeklyData: [0, 0, 0, 0, 0, 0, 0],
    weeklyLabels: DAYS,
    recentActivity: [],
    lastWeekRevenue: 0,
    totalCustomers: 0,
  })
  const [loading, setLoading] = useState(true)
  const [employees, setEmployees] = useState<EmployeeOption[]>([])
  const [activityFilter, setActivityFilter] = useState<string>('all')

  // Request counter to prevent stale responses from overwriting newer data
  // when user changes dates quickly
  const loadStatsRequestId = useRef(0)
  const realtimeDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    loadStats(selectedDate, viewMode)

    // Listen to realtime updates on the appointments table
    // Debounced: multiple rapid changes (e.g. bulk status updates) only trigger one reload
    const channel = supabase
      .channel('dashboard-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'appointments' },
        () => {
          if (realtimeDebounceRef.current) clearTimeout(realtimeDebounceRef.current)
          realtimeDebounceRef.current = setTimeout(() => {
            loadStats(selectedDate, viewMode)
          }, 1000)
        }
      )
      .subscribe()

    return () => {
      if (realtimeDebounceRef.current) clearTimeout(realtimeDebounceRef.current)
      supabase.removeChannel(channel)
    }
  }, [selectedDate, viewMode])
  useEffect(() => {
    loadEmployees()
  }, [])
  function goToPrevDay() {
    setSelectedDate((prev) => {
      const d = new Date(prev + 'T12:00:00')
      d.setDate(d.getDate() - 1)
      return d.toISOString().slice(0, 10)
    })
  }
  function goToNextDay() {
    setSelectedDate((prev) => {
      const d = new Date(prev + 'T12:00:00')
      d.setDate(d.getDate() + 1)
      return d.toISOString().slice(0, 10)
    })
  }
  function goToToday() {
    setSelectedDate(new Date().toISOString().slice(0, 10))
  }
  function isToday(dateStr: string) {
    return dateStr === new Date().toISOString().slice(0, 10)
  }
  function formatDateLabel(dateStr: string) {
    if (isToday(dateStr)) {
      return i18n.language === 'vi' ? 'Hôm nay' : 'Today'
    }
    const d = new Date(dateStr + 'T00:00:00')
    const day = d.getDate().toString().padStart(2, '0')
    const month = (d.getMonth() + 1).toString().padStart(2, '0')
    return `${day}/${month}`
  }
  async function loadStats(dateStr: string, mode: ViewMode) {
    const requestId = ++loadStatsRequestId.current

    const today = new Date(dateStr + 'T00:00:00')

    // Determine date range based on view mode
    let startDate: string
    let endDate: string
    let prevStartDate: string
    let prevEndDate: string

    if (mode === 'day') {
      startDate = dateStr
      endDate = dateStr
      // Previous period = previous day
      const prev = new Date(today)
      prev.setDate(today.getDate() - 1)
      prevStartDate = prev.toISOString().slice(0, 10)
      prevEndDate = prevStartDate
    } else if (mode === 'week') {
      // Last 7 days (including selected date)
      const start = new Date(today)
      start.setDate(today.getDate() - 6)
      startDate = start.toISOString().slice(0, 10)
      endDate = dateStr
      // Previous 7 days before that
      const prevEnd = new Date(start)
      prevEnd.setDate(start.getDate() - 1)
      const prevStart = new Date(prevEnd)
      prevStart.setDate(prevEnd.getDate() - 6)
      prevStartDate = prevStart.toISOString().slice(0, 10)
      prevEndDate = prevEnd.toISOString().slice(0, 10)
    } else {
      // Last 30 days (including selected date)
      const start = new Date(today)
      start.setDate(today.getDate() - 29)
      startDate = start.toISOString().slice(0, 10)
      endDate = dateStr
      // Previous 30 days before that
      const prevEnd = new Date(start)
      prevEnd.setDate(start.getDate() - 1)
      const prevStart = new Date(prevEnd)
      prevStart.setDate(prevEnd.getDate() - 29)
      prevStartDate = prevStart.toISOString().slice(0, 10)
      prevEndDate = prevEnd.toISOString().slice(0, 10)
    }

    const [completedRes, waitingRes, prevRes] = await Promise.all([
      // Completed appointments in the range
      supabase
        .from('appointments')
        .select('id, price, tip, date, time, customer_id, payment_method, service_id, employee_id, services(name), employees(name)')
        .gte('date', startDate)
        .lte('date', endDate)
        .eq('status', 'completed')
        .order('time', { ascending: false }),
      // Waiting/booked appointments (only for single day mode)
      mode === 'day'
        ? supabase
            .from('appointments')
            .select('id')
            .eq('date', dateStr)
            .in('status', ['booked', 'in_progress'])
        : Promise.resolve({ data: [] }),
      // Previous period for comparison
      supabase
        .from('appointments')
        .select('price, tip, date')
        .gte('date', prevStartDate)
        .lte('date', prevEndDate)
        .eq('status', 'completed'),
    ])

    const completedData = completedRes.data ?? []
    const prevData = prevRes.data ?? []

    // Revenue
    const totalRevenue = completedData.reduce((sum, r) => sum + r.price + r.tip, 0)
    const lastWeekRevenue = prevData.reduce((sum, r) => sum + r.price + r.tip, 0)

    // Cash vs Card breakdown
    const cashRevenue = completedData
      .filter((r) => (r.payment_method ?? 'cash') === 'cash')
      .reduce((sum, r) => sum + r.price + r.tip, 0)
    const cardRevenue = completedData
      .filter((r) => r.payment_method === 'card')
      .reduce((sum, r) => sum + r.price + r.tip, 0)

    // Total customers
    const withCustomerId = completedData.filter((r) => r.customer_id)
    const uniqueNamedCustomers = new Set(withCustomerId.map((r) => r.customer_id)).size
    const walkInCount = completedData.length - withCustomerId.length
    const totalCustomers = uniqueNamedCustomers + walkInCount
    const avgValue = totalCustomers > 0 ? totalRevenue / totalCustomers : 0

    // Chart data based on mode
    let weeklyBreakdown: number[]
    let weeklyLabels: string[]

    if (mode === 'day') {
      // Show current calendar week (Mon-Sun)
      const dayOfWeek = today.getDay()
      const mondayOffset = dayOfWeek === 0 ? 6 : dayOfWeek - 1
      const monday = new Date(today)
      monday.setDate(today.getDate() - mondayOffset)
      const mondayStr = monday.toISOString().slice(0, 10)
      const sunday = new Date(monday)
      sunday.setDate(monday.getDate() + 6)
      const sundayStr = sunday.toISOString().slice(0, 10)

      // Need to fetch week data for the chart
      const { data: weekChartData } = await supabase
        .from('appointments')
        .select('price, tip, date')
        .gte('date', mondayStr)
        .lte('date', sundayStr)
        .eq('status', 'completed')

      weeklyBreakdown = [0, 0, 0, 0, 0, 0, 0]
      for (const row of (weekChartData ?? [])) {
        const d = new Date(row.date + 'T00:00:00')
        const dow = d.getDay()
        const idx = dow === 0 ? 6 : dow - 1
        weeklyBreakdown[idx] += row.price + row.tip
      }
      weeklyLabels = DAYS
    } else if (mode === 'week') {
      // 7 bars, one per day
      weeklyBreakdown = [0, 0, 0, 0, 0, 0, 0]
      weeklyLabels = []
      for (let i = 6; i >= 0; i--) {
        const d = new Date(today)
        d.setDate(today.getDate() - i)
        const dayStr = d.toISOString().slice(0, 10)
        const idx = 6 - i
        weeklyLabels.push(`${d.getDate()}/${d.getMonth() + 1}`)
        for (const row of completedData) {
          if (row.date === dayStr) {
            weeklyBreakdown[idx] += row.price + row.tip
          }
        }
      }
    } else {
      // 30 days → group by ~5-day buckets (6 bars)
      const bucketCount = 6
      const daysPerBucket = 5
      weeklyBreakdown = new Array(bucketCount).fill(0)
      weeklyLabels = []
      for (let b = 0; b < bucketCount; b++) {
        const bucketEnd = new Date(today)
        bucketEnd.setDate(today.getDate() - (bucketCount - 1 - b) * daysPerBucket)
        const bucketStart = new Date(bucketEnd)
        bucketStart.setDate(bucketEnd.getDate() - daysPerBucket + 1)
        const bStartStr = bucketStart.toISOString().slice(0, 10)
        const bEndStr = bucketEnd.toISOString().slice(0, 10)
        weeklyLabels.push(`${bucketStart.getDate()}/${bucketStart.getMonth() + 1}`)
        for (const row of completedData) {
          if (row.date >= bStartStr && row.date <= bEndStr) {
            weeklyBreakdown[b] += row.price + row.tip
          }
        }
      }
    }

    // Recent activity (show most recent 20 for multi-day, all for single day)
    const sortedCompleted = [...completedData].sort((a, b) => {
      if (a.date !== b.date) return b.date.localeCompare(a.date)
      return b.time.localeCompare(a.time)
    })
    const recentSlice = mode === 'day' ? sortedCompleted : sortedCompleted.slice(0, 20)
    const recent: RecentItem[] = recentSlice.map((r) => {
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

    // Only update state if this is still the latest request
    if (requestId !== loadStatsRequestId.current) return

    setStats({
      totalRevenue,
      cashRevenue,
      cardRevenue,
      dayAppointments: completedData.length,
      waitingAppointments: waitingRes.data?.length ?? 0,
      avgValue,
      weeklyData: weeklyBreakdown,
      weeklyLabels,
      recentActivity: recent,
      lastWeekRevenue,
      totalCustomers,
    })
    setLoading(false)
  }
  async function loadEmployees() {
    const { fetchEmployees } = useDataStore.getState()
    const emps = await fetchEmployees()
    setEmployees(emps.map((e) => ({ id: e.id, name: e.name })))
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
    if (value >= 1000) return `${(value / 1000).toFixed(0)}k`
    return value.toFixed(0)
  }
  // Growth percentage (period over period)
  const growth = stats.lastWeekRevenue > 0
    ? ((stats.totalRevenue - stats.lastWeekRevenue) / stats.lastWeekRevenue * 100).toFixed(1)
    : '0'
  const isPositiveGrowth = parseFloat(growth) >= 0
  // Get initials for avatar
  function getInitials(name: string) {
    return name
      .split(' ')
      .map((w) => w[0])
      .join('')
      .slice(0, 2)
      .toUpperCase()
  }
  function getAvatarColor(name: string) {
    const colors = [
      'bg-emerald-100 text-emerald-700',
      'bg-sky-100 text-sky-700',
      'bg-violet-100 text-violet-700',
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
  // Chart max for scaling bars
  const chartMax = Math.max(...stats.weeklyData, 1)
  const selectedDayIndex = (() => {
    if (viewMode !== 'day') return -1 // no highlight for multi-day modes
    const d = new Date(selectedDate + 'T00:00:00').getDay()
    return d === 0 ? 6 : d - 1
  })()
  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-pulse text-emerald-500 font-bold text-xl">Loading...</div>
      </div>
    )
  }
  return (
    <div className="px-5 py-6 pb-24 space-y-6 max-w-lg mx-auto">
      {/* Greeting */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          {t('dashboard.greeting')}, {user?.name || 'Owner'}
        </h1>
        <div className="flex items-center mt-1">
          <p className="text-sm text-gray-500">{t('dashboard.subtitle')}</p>
        </div>
        {/* Period selector + Date navigator */}
        <div className="flex flex-col items-center gap-2 mt-3">
          {/* Period tabs */}
          <div className="flex items-center bg-gray-100 rounded-full p-1 gap-0.5">
            {([
              { key: 'day' as ViewMode, label: t('dashboard.periodToday') },
              { key: 'week' as ViewMode, label: t('dashboard.period7Days') },
              { key: 'month' as ViewMode, label: t('dashboard.period30Days') },
            ]).map(({ key, label }) => (
              <button
                key={key}
                type="button"
                onClick={() => { setViewMode(key); setSelectedDate(new Date().toISOString().slice(0, 10)) }}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all touch-manipulation ${
                  viewMode === key
                    ? 'bg-[#864e5a] text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          {/* Day navigator (only shown in day mode) */}
          {viewMode === 'day' && (
            <div className="flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={goToPrevDay}
                className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 active:bg-gray-200 transition-colors touch-manipulation"
              >
                <ChevronLeft size={20} className="text-gray-600" />
              </button>
              <button
                type="button"
                onClick={goToToday}
                className={`min-w-[80px] px-4 py-1.5 rounded-full text-sm font-semibold transition-colors touch-manipulation ${
                  isToday(selectedDate)
                    ? 'bg-[#864e5a] text-white'
                    : 'bg-[#864e5a]/10 text-[#864e5a] hover:bg-[#864e5a]/20'
                }`}
              >
                {formatDateLabel(selectedDate)}
              </button>
              <button
                type="button"
                onClick={goToNextDay}
                className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 active:bg-gray-200 transition-colors touch-manipulation"
              >
                <ChevronRight size={20} className="text-gray-600" />
              </button>
            </div>
          )}
        </div>
      </div>
      {/* Total Revenue Card — 2 columns */}
      <div
        className="rounded-[1rem] p-5 border border-[rgba(134,78,90,0.1)]"
        style={{ background: 'rgba(255, 248, 248, 0.6)', backdropFilter: 'blur(12px)' }}
      >
        <div className="flex gap-4">
          {/* Left column: Total */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-gray-600">{t('dashboard.totalRevenue')}</span>
              <div className="w-8 h-8 bg-[#864e5a]/10 rounded-lg flex items-center justify-center">
                <Wallet size={16} className="text-[#864e5a]" />
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900">
              ${formatCurrency(stats.totalRevenue)}
            </p>
            <div className="flex items-center gap-1 mt-2">
              <TrendingUp size={14} className={isPositiveGrowth ? 'text-emerald-500' : 'text-red-500'} />
              <span className={`text-xs font-medium ${isPositiveGrowth ? 'text-emerald-500' : 'text-red-500'}`}>
                {isPositiveGrowth ? '+' : ''}{growth}% {t('dashboard.fromLastWeek')}
              </span>
            </div>
          </div>
          {/* Right column: Cash & Card breakdown */}
          <div className="flex flex-col justify-center gap-2 min-w-[120px]">
            {/* Cash */}
            <div className="bg-white/70 rounded-xl px-3 py-2.5 flex items-center gap-2 border border-[rgba(134,78,90,0.08)]">
              <div className="w-7 h-7 bg-green-100 rounded-lg flex items-center justify-center">
                <Banknote size={14} className="text-green-600" />
              </div>
              <div>
                <p className="text-[10px] text-gray-500 leading-none">{t('dashboard.cash')}</p>
                <p className="text-sm font-bold text-gray-900">${formatCurrency(stats.cashRevenue)}</p>
              </div>
            </div>
            {/* Card */}
            <div className="bg-white/70 rounded-xl px-3 py-2.5 flex items-center gap-2 border border-[rgba(134,78,90,0.08)]">
              <div className="w-7 h-7 bg-blue-100 rounded-lg flex items-center justify-center">
                <CreditCard size={14} className="text-blue-600" />
              </div>
              <div>
                <p className="text-[10px] text-gray-500 leading-none">{t('dashboard.card')}</p>
                <p className="text-sm font-bold text-gray-900">${formatCurrency(stats.cardRevenue)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Two Mini Cards */}
      <div className="grid grid-cols-2 gap-3">
        {/* Day Appointments */}
        <div
          className="rounded-[1rem] p-4 border border-[rgba(134,78,90,0.1)]"
          style={{ background: 'rgba(255, 248, 248, 0.6)', backdropFilter: 'blur(12px)' }}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-gray-500">{formatDateLabel(selectedDate)}</span>
            <CalendarDays size={14} className="text-[#864e5a]" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.dayAppointments}</p>
          <p className="text-xs text-gray-500 mt-1">{t('dashboard.appointmentsBooked')}</p>
          {stats.waitingAppointments > 0 && (
            <p className="text-xs font-semibold text-emerald-500 mt-1.5">
              +{stats.waitingAppointments} {t('dashboard.waiting')}
            </p>
          )}
        </div>
        {/* Avg Value */}
        <div
          className="rounded-[1rem] p-4 border border-[rgba(134,78,90,0.1)]"
          style={{ background: 'rgba(255, 248, 248, 0.6)', backdropFilter: 'blur(12px)' }}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-gray-500">{t('dashboard.avgValue')}</span>
            <Star size={14} className="text-amber-400" />
          </div>
          <p className="text-2xl font-bold text-gray-900">${formatCurrency(stats.avgValue)}</p>
          <p className="text-xs text-gray-500 mt-1">{t('dashboard.perServiceAvg')}</p>
        </div>
      </div>
      {/* Weekly Trends */}
      <div
        className="rounded-[1rem] p-5 border border-[rgba(134,78,90,0.1)]"
        style={{ background: 'rgba(255, 248, 248, 0.6)', backdropFilter: 'blur(12px)' }}
      >
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-semibold text-gray-900">{t('dashboard.weeklyTrends')}</h3>
          <span className="text-xs text-[#864e5a] border border-[#864e5a]/20 rounded-full px-3 py-1 font-semibold">
            {t('dashboard.last7Days')}
          </span>
        </div>
        {/* Bar chart */}
        <div className="flex items-end justify-between gap-2 h-32 mb-3">
          {stats.weeklyData.map((value, i) => {
            const height = chartMax > 0 ? (value / chartMax) * 100 : 0
            const isSelected = i === selectedDayIndex
            return (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                {value > 0 && (
                  <span className="text-[10px] text-gray-500 font-medium">
                    ${formatCurrency(value)}
                  </span>
                )}
                <div
                  className={`w-full max-w-[28px] rounded-md transition-all ${
                    isSelected ? 'bg-[#864e5a]' : 'bg-[#864e5a]/20'
                  }`}
                  style={{ height: `${Math.max(height, 4)}%` }}
                />
              </div>
            )
          })}
        </div>
        <div className="flex justify-between gap-2">
          {DAYS.map((day, i) => (
            <span
              key={day}
              className={`flex-1 text-center text-[10px] font-medium ${
                i === selectedDayIndex ? 'text-[#864e5a] font-bold' : 'text-gray-400'
              }`}
            >
              {day}
            </span>
          ))}
        </div>
      </div>
      {/* Recent Activity */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-gray-900">{t('dashboard.recentActivity')}</h3>
          <button className="text-xs font-semibold text-[#864e5a]">{t('dashboard.viewAll')}</button>
        </div>
        {/* Employee filter tabs */}
        <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
          <button
            onClick={() => setActivityFilter('all')}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
              activityFilter === 'all'
                ? 'bg-[#864e5a] text-white'
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
                  ? 'bg-[#864e5a] text-white'
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              {emp.name}
            </button>
          ))}
        </div>
        {/* Activity List — scrollable */}
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
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold ${getAvatarColor(item.employeeName || 'U')}`}
                >
                  {getInitials(item.employeeName || 'U')}
                </div>
                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">{item.serviceName}</p>
                  <p className="text-xs text-gray-500">
                    {t('dashboard.completedBy')} <span className="font-semibold text-[#864e5a]">{item.employeeName}</span>
                  </p>
                </div>
                {/* Price & Time */}
                <div className="text-right">
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
