import { useEffect, useState, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Wallet, X, Printer } from 'lucide-react'
import { supabase } from '@/lib/supabase'

type Period = 'day' | 'week' | 'month'

interface ServiceRevenue {
  name: string
  revenue: number
}

interface EmployeeSummary {
  id: string
  name: string
  count: number
  revenue: number
  commission: number
  payType: string
  payRate: number | null
}

interface EmployeeAppointment {
  date: string
  time: string
  service: string
  price: number
  tip: number
}

export function Reports() {
  const { t } = useTranslation()
  const [period, setPeriod] = useState<Period>('week')
  const [serviceRevenue, setServiceRevenue] = useState<ServiceRevenue[]>([])
  const [employeeSummaries, setEmployeeSummaries] = useState<EmployeeSummary[]>([])
  const [loading, setLoading] = useState(true)

  // Detail modal
  const [selectedEmployee, setSelectedEmployee] = useState<EmployeeSummary | null>(null)
  const [employeeAppointments, setEmployeeAppointments] = useState<EmployeeAppointment[]>([])
  const [loadingDetail, setLoadingDetail] = useState(false)
  const printRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    loadReport()
  }, [period])

  function getDateRange(): { start: string; end: string } {
    const today = new Date()
    const todayStr = today.toISOString().slice(0, 10)

    if (period === 'day') return { start: todayStr, end: todayStr }

    if (period === 'week') {
      const dayOfWeek = today.getDay()
      const mondayOffset = dayOfWeek === 0 ? 6 : dayOfWeek - 1
      const monday = new Date(today)
      monday.setDate(today.getDate() - mondayOffset)
      const sunday = new Date(monday)
      sunday.setDate(monday.getDate() + 6)
      return { start: monday.toISOString().slice(0, 10), end: sunday.toISOString().slice(0, 10) }
    }

    // month
    const monthStart = todayStr.slice(0, 8) + '01'
    const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0)
    return { start: monthStart, end: nextMonth.toISOString().slice(0, 10) }
  }

  async function loadReport() {
    setLoading(true)
    const { start, end } = getDateRange()

    const { data } = await supabase
      .from('appointments')
      .select('price, tip, employee_id, service_id, services(name), employees(name, commission_rate, pay_type, split_rate, fixed_salary)')
      .gte('date', start)
      .lte('date', end)
      .eq('status', 'completed')

    const rows = data ?? []

    // Service Revenue
    const svcMap = new Map<string, { name: string; revenue: number }>()
    for (const row of rows) {
      const svc = row.services as unknown as { name: string } | null
      const key = row.service_id
      const existing = svcMap.get(key) ?? { name: svc?.name ?? 'Unknown', revenue: 0 }
      existing.revenue += row.price + row.tip
      svcMap.set(key, existing)
    }
    setServiceRevenue([...svcMap.values()].sort((a, b) => b.revenue - a.revenue).slice(0, 5))

    // Employee Summaries — by revenue
    const empMap = new Map<string, EmployeeSummary>()
    for (const row of rows) {
      const emp = row.employees as unknown as { name: string; commission_rate: number | null; pay_type: string | null; split_rate: number | null; fixed_salary: number | null } | null
      const key = row.employee_id ?? 'unknown'
      const payType = emp?.pay_type ?? 'commission'
      const rate = payType === 'split' ? (emp?.split_rate ?? 60) : (emp?.commission_rate ?? 60)

      const existing = empMap.get(key) ?? { id: key, name: emp?.name ?? 'Unknown', count: 0, revenue: 0, commission: 0, payType, payRate: rate }
      existing.count += 1
      existing.revenue += row.price + row.tip

      // Calculate employee earnings based on pay type
      if (payType === 'commission') {
        existing.commission += (row.price * rate / 100) + row.tip
      } else if (payType === 'split') {
        existing.commission += ((row.price + row.tip) * rate / 100)
      } else {
        // fixed salary — show tip only as variable income
        existing.commission += row.tip
      }

      empMap.set(key, existing)
    }
    setEmployeeSummaries([...empMap.values()].sort((a, b) => b.revenue - a.revenue))

    setLoading(false)
  }

  async function openEmployeeDetail(emp: EmployeeSummary) {
    setSelectedEmployee(emp)
    setLoadingDetail(true)

    const { start, end } = getDateRange()
    const { data } = await supabase
      .from('appointments')
      .select('date, time, price, tip, services(name)')
      .eq('employee_id', emp.id)
      .gte('date', start)
      .lte('date', end)
      .eq('status', 'completed')
      .order('date', { ascending: true })
      .order('time', { ascending: true })

    const apts: EmployeeAppointment[] = (data ?? []).map((row) => ({
      date: row.date,
      time: row.time,
      service: (row.services as unknown as { name: string } | null)?.name ?? '-',
      price: row.price,
      tip: row.tip,
    }))
    setEmployeeAppointments(apts)
    setLoadingDetail(false)
  }

  function handlePrint() {
    if (!printRef.current) return
    const printContent = printRef.current.innerHTML
    const win = window.open('', '_blank', 'width=400,height=600')
    if (!win) return
    win.document.write(`
      <html>
        <head>
          <title>Pay Statement - ${selectedEmployee?.name}</title>
          <style>
            body { font-family: -apple-system, sans-serif; padding: 20px; font-size: 12px; color: #333; }
            h2 { font-size: 16px; margin-bottom: 4px; }
            h3 { font-size: 13px; color: #666; margin-top: 0; }
            table { width: 100%; border-collapse: collapse; margin-top: 12px; }
            th, td { text-align: left; padding: 6px 4px; border-bottom: 1px solid #eee; font-size: 11px; }
            th { font-weight: 600; color: #555; border-bottom: 2px solid #ddd; }
            .right { text-align: right; }
            .total-row { border-top: 2px solid #333; font-weight: bold; font-size: 13px; }
            .footer { margin-top: 20px; text-align: center; color: #999; font-size: 10px; }
            @media print { body { padding: 10px; } }
          </style>
        </head>
        <body>
          ${printContent}
          <div class="footer">Generated by MCC Nail & Spa &bull; ${new Date().toLocaleDateString('vi-VN')}</div>
        </body>
      </html>
    `)
    win.document.close()
    setTimeout(() => { win.print(); win.close() }, 300)
  }

  function formatCurrency(value: number) {
    return `$${value.toFixed(0)}`
  }

  const barColors = [
    'bg-[#864e5a]',
    'bg-[#864e5a]/80',
    'bg-[#864e5a]/60',
    'bg-[#864e5a]/40',
    'bg-[#864e5a]/25',
  ]

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
  const periodLabel = period === 'day' ? t('reports.thisDay') : period === 'week' ? t('reports.thisWeek') : t('reports.thisMonth')
  const { start: periodStart, end: periodEnd } = getDateRange()

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

      {/* Top Performers — clickable */}
      <section className="space-y-3">
        <h2 className="text-lg font-bold text-gray-900">{t('reports.topPerformers')}</h2>

        {employeeSummaries.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-4">{t('reports.noData')}</p>
        ) : (
          <div className="space-y-3">
            {employeeSummaries.map((emp, i) => (
              <div
                key={emp.id}
                onClick={() => openEmployeeDetail(emp)}
                className="p-4 rounded-[1rem] flex items-center gap-4 border-l-4 border-[#864e5a]/30 cursor-pointer active:scale-[0.98] transition-transform"
                style={{
                  background: 'rgba(255, 248, 248, 0.6)',
                  backdropFilter: 'blur(12px)',
                  borderRight: '1px solid rgba(134,78,90,0.1)',
                  borderTop: '1px solid rgba(134,78,90,0.1)',
                  borderBottom: '1px solid rgba(134,78,90,0.1)',
                }}
              >
                {/* Rank */}
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                  i === 0 ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-500'
                }`}>
                  {i + 1}
                </div>
                {/* Avatar */}
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold ${getAvatarColor(emp.name)}`}
                >
                  {getInitials(emp.name)}
                </div>
                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900">{emp.name}</p>
                  <p className="text-xs text-gray-500">{emp.count} {t('appointments.turns')} &bull; {periodLabel}</p>
                </div>
                {/* Revenue */}
                <div className="text-right">
                  <p className="text-sm font-bold text-[#864e5a]">{formatCurrency(emp.revenue)}</p>
                  <p className="text-[10px] text-gray-400">doanh thu</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

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

      {/* ═══ Employee Detail Modal ═══ */}
      {selectedEmployee && (
        <div className="fixed inset-0 bg-black/40 z-[60] flex items-end sm:items-center justify-center" onClick={() => setSelectedEmployee(null)}>
          <div className="bg-white w-full max-w-md rounded-t-2xl sm:rounded-2xl max-h-[90vh] overflow-hidden flex flex-col modal-sheet" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 pb-3 border-b border-gray-100">
              <div>
                <h3 className="text-lg font-bold text-gray-900">{selectedEmployee.name}</h3>
                <p className="text-xs text-gray-500">
                  {new Date(periodStart).toLocaleDateString('vi-VN')} — {new Date(periodEnd).toLocaleDateString('vi-VN')}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrint}
                  className="p-2 bg-[#864e5a]/10 text-[#864e5a] rounded-xl active:scale-90 transition-transform"
                  title="Print / PDF"
                >
                  <Printer size={18} />
                </button>
                <button onClick={() => setSelectedEmployee(null)} className="p-2 text-gray-400">
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="overflow-y-auto flex-1 p-5 space-y-4">
              {loadingDetail ? (
                <p className="text-center text-gray-400 py-8">Loading...</p>
              ) : (
                <>
                  {/* Summary stats */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-gray-50 rounded-xl p-3 text-center">
                      <p className="text-lg font-bold text-gray-900">{selectedEmployee.count}</p>
                      <p className="text-[10px] text-gray-500 uppercase">Lượt</p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-3 text-center">
                      <p className="text-lg font-bold text-[#864e5a]">{formatCurrency(selectedEmployee.revenue)}</p>
                      <p className="text-[10px] text-gray-500 uppercase">Doanh thu</p>
                    </div>
                    <div className="bg-emerald-50 rounded-xl p-3 text-center">
                      <p className="text-lg font-bold text-emerald-600">{formatCurrency(selectedEmployee.commission)}</p>
                      <p className="text-[10px] text-gray-500 uppercase">NV nhận</p>
                    </div>
                  </div>

                  {/* Pay type info */}
                  <div className="bg-amber-50 rounded-xl p-3 flex items-center justify-between">
                    <span className="text-xs text-amber-800 font-medium">Hình thức chia:</span>
                    <span className="text-xs font-bold text-amber-900">
                      {selectedEmployee.payType === 'commission' && `Hoa hồng ${selectedEmployee.payRate}% giá + 100% tip`}
                      {selectedEmployee.payType === 'split' && `Chia ${selectedEmployee.payRate}% tổng (giá + tip)`}
                      {selectedEmployee.payType === 'fixed' && `Lương cố định + tip`}
                    </span>
                  </div>

                  {/* Appointment table */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-xs text-gray-500 border-b border-gray-200">
                          <th className="text-left py-2 font-medium">Ngày</th>
                          <th className="text-left py-2 font-medium">Dịch vụ</th>
                          <th className="text-right py-2 font-medium">Giá</th>
                          <th className="text-right py-2 font-medium">Tip</th>
                        </tr>
                      </thead>
                      <tbody>
                        {employeeAppointments.map((apt, i) => (
                          <tr key={i} className="border-b border-gray-50">
                            <td className="py-2 text-gray-700 whitespace-nowrap">
                              {new Date(apt.date + 'T00:00:00').toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })}
                              <span className="text-gray-400 ml-1 text-xs">{apt.time.slice(0, 5)}</span>
                            </td>
                            <td className="py-2 text-gray-700 truncate max-w-[100px]">{apt.service}</td>
                            <td className="py-2 text-right font-medium">${apt.price}</td>
                            <td className="py-2 text-right text-emerald-600">${apt.tip}</td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr className="border-t-2 border-gray-200 font-bold">
                          <td colSpan={2} className="py-2">Tổng</td>
                          <td className="py-2 text-right">{formatCurrency(employeeAppointments.reduce((s, a) => s + a.price, 0))}</td>
                          <td className="py-2 text-right text-emerald-600">{formatCurrency(employeeAppointments.reduce((s, a) => s + a.tip, 0))}</td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </>
              )}
            </div>

            {/* Hidden print content */}
            <div className="hidden">
              <div ref={printRef}>
                <h2>Pay Statement — {selectedEmployee.name}</h2>
                <h3>{new Date(periodStart).toLocaleDateString('vi-VN')} — {new Date(periodEnd).toLocaleDateString('vi-VN')}</h3>
                <table>
                  <thead>
                    <tr>
                      <th>Ngày</th>
                      <th>Giờ</th>
                      <th>Dịch vụ</th>
                      <th className="right">Giá</th>
                      <th className="right">Tip</th>
                    </tr>
                  </thead>
                  <tbody>
                    {employeeAppointments.map((apt, i) => (
                      <tr key={i}>
                        <td>{new Date(apt.date + 'T00:00:00').toLocaleDateString('vi-VN')}</td>
                        <td>{apt.time.slice(0, 5)}</td>
                        <td>{apt.service}</td>
                        <td className="right">${apt.price}</td>
                        <td className="right">${apt.tip}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="total-row">
                      <td colSpan={3}>Tổng cộng</td>
                      <td className="right">${employeeAppointments.reduce((s, a) => s + a.price, 0)}</td>
                      <td className="right">${employeeAppointments.reduce((s, a) => s + a.tip, 0)}</td>
                    </tr>
                    <tr>
                      <td colSpan={5}>
                        Hình thức: {selectedEmployee.payType === 'commission' ? `Hoa hồng ${selectedEmployee.payRate}% giá + 100% tip` :
                          selectedEmployee.payType === 'split' ? `Chia ${selectedEmployee.payRate}% tổng` : 'Lương cố định + tip'}
                      </td>
                    </tr>
                    <tr className="total-row">
                      <td colSpan={3}>NV nhận</td>
                      <td colSpan={2} className="right">${selectedEmployee.commission.toFixed(0)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
