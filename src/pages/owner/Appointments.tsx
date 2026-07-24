import { useEffect, useState, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Plus, Calendar, User, X } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useSuperModeStore } from '@/store/superModeStore'
import type { AppointmentStatus } from '@/lib/database.types'

interface AppointmentRow {
  id: string
  date: string
  time: string
  status: AppointmentStatus
  price: number
  tip: number
  source: 'walk_in' | 'online'
  notes: string | null
  customer: { name: string; phone: string | null } | null
  employee: { name: string } | null
  service: { name: string } | null
  employee_id: string | null
}

interface Employee {
  id: string
  name: string
  is_active: boolean
  rotation_order: number
}

interface Service {
  id: string
  name: string
  price: number
}

type RotationStatus = 'next' | 'available' | 'busy'

interface RotationEmployee {
  id: string
  name: string
  status: RotationStatus
  turnCount: number
  idleMinutes: number | null // minutes since last completed appointment, null if busy
}

// Chibi emoji based on name hash
function getChibiEmoji(name: string) {
  const chibis = ['👩‍🎨', '👩‍💼', '💇‍♀️', '💅', '👩‍🔧', '🧑‍🎨', '👩‍⚕️', '🧑‍💻']
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  return chibis[Math.abs(hash) % chibis.length]
}

export function Appointments() {
  const { t } = useTranslation()
  const superMode = useSuperModeStore((s) => s.superMode)
  const [appointments, setAppointments] = useState<AppointmentRow[]>([])
  const [weekCounts, setWeekCounts] = useState<Record<string, number>>({})
  const [rotation, setRotation] = useState<RotationEmployee[]>([])
  const [employees, setEmployees] = useState<Employee[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [showForm, setShowForm] = useState(false)
  const [editingApt, setEditingApt] = useState<AppointmentRow | null>(null)
  const [dragIdx, setDragIdx] = useState<number | null>(null)
  const [statusFilter, setStatusFilter] = useState<'all' | AppointmentStatus>('all')
  const [unassignedCount, setUnassignedCount] = useState(0)
  const dateInputRef = useRef<HTMLInputElement>(null)

  const dateStr = selectedDate.toISOString().slice(0, 10)

  useEffect(() => { load() }, [dateStr])
  useEffect(() => { loadFormData() }, [])

  // Auto-refresh every 30s so idle times stay current
  useEffect(() => {
    const interval = setInterval(() => { load() }, 30000)
    return () => clearInterval(interval)
  }, [dateStr])

  async function loadFormData() {
    const [empsRes, svcsRes] = await Promise.all([
      supabase.from('employees').select('id, name, is_active, rotation_order').eq('is_active', true).order('rotation_order'),
      supabase.from('services').select('id, name, price').eq('is_active', true).order('name'),
    ])
    setEmployees((empsRes.data ?? []) as Employee[])
    setServices((svcsRes.data ?? []) as Service[])
  }

  async function load() {
    const weekDays = getWeekDays()
    const weekStart = weekDays[0].toISOString().slice(0, 10)
    const weekEnd = weekDays[6].toISOString().slice(0, 10)

    const [aptsRes, empsRes, weekRes] = await Promise.all([
      supabase
        .from('appointments')
        .select('*, customer:customers(name, phone), employee:employees(name), service:services(name)')
        .eq('date', dateStr)
        .order('time'),
      supabase.from('employees').select('id, name, is_active, rotation_order').eq('is_active', true).order('rotation_order'),
      supabase.from('appointments').select('date').gte('date', weekStart).lte('date', weekEnd),
    ])

    const apts = (aptsRes.data as unknown as AppointmentRow[]) ?? []
    setAppointments(apts)

    const counts: Record<string, number> = {}
    for (const row of (weekRes.data ?? [])) {
      counts[row.date] = (counts[row.date] ?? 0) + 1
    }
    setWeekCounts(counts)

    const empList = (empsRes.data ?? []) as Employee[]
    setEmployees(empList)

    const turnCounts = new Map<string, number>()
    const lastCompletedTime = new Map<string, string>() // employee_id -> latest completed time
    const busyStartTime = new Map<string, string>() // employee_id -> time they started (in_progress)
    const unassigned = apts.filter((a) => !a.employee_id && a.status !== 'cancelled').length
    setUnassignedCount(unassigned)

    for (const apt of apts) {
      // Lượt = tất cả appointments được gán cho NV (completed + in_progress + booked), trừ cancelled
      if (apt.employee_id && apt.status !== 'cancelled') {
        turnCounts.set(apt.employee_id, (turnCounts.get(apt.employee_id) ?? 0) + 1)
      }
      // Track last completed time for idle calculation
      if (apt.status === 'completed' && apt.employee_id) {
        const prev = lastCompletedTime.get(apt.employee_id)
        if (!prev || apt.time > prev) lastCompletedTime.set(apt.employee_id, apt.time)
      }
      // Track busy start time
      if (apt.status === 'in_progress' && apt.employee_id) {
        const prev = busyStartTime.get(apt.employee_id)
        if (!prev || apt.time < prev) busyStartTime.set(apt.employee_id, apt.time)
      }
    }

    const busyEmployeeIds = new Set(
      apts.filter((a) => a.status === 'in_progress' && a.employee_id).map((a) => a.employee_id!)
    )

    const now = new Date()
    const todayStr = now.toISOString().slice(0, 10)
    const nowMinutes = now.getHours() * 60 + now.getMinutes()
    const shiftStartMinutes = 9 * 60 // Ca bắt đầu 9:00 AM

    const rotationList: RotationEmployee[] = empList.map((emp) => {
      const isBusy = busyEmployeeIds.has(emp.id)
      let idleMinutes: number | null = null

      // Calculate idle for today (only for non-busy employees)
      if (!isBusy && dateStr === todayStr) {
        const lastTime = lastCompletedTime.get(emp.id)
        if (lastTime) {
          // Idle since last completed
          const [h, m] = lastTime.split(':')
          const completedMinutes = parseInt(h) * 60 + parseInt(m)
          idleMinutes = Math.max(0, nowMinutes - completedMinutes)
        } else {
          // No completed today — idle since shift start
          idleMinutes = Math.max(0, nowMinutes - shiftStartMinutes)
        }
      }

      return {
        id: emp.id,
        name: emp.name,
        status: isBusy ? 'busy' as RotationStatus : 'available' as RotationStatus,
        turnCount: turnCounts.get(emp.id) ?? 0,
        idleMinutes,
      }
    })

    // Sort: busy employees first (sorted by start time asc), then available by rotation_order
    rotationList.sort((a, b) => {
      if (a.status === 'busy' && b.status !== 'busy') return -1
      if (a.status !== 'busy' && b.status === 'busy') return 1
      if (a.status === 'busy' && b.status === 'busy') {
        const aTime = busyStartTime.get(a.id) ?? '99:99'
        const bTime = busyStartTime.get(b.id) ?? '99:99'
        return aTime.localeCompare(bTime)
      }
      // Both available — keep rotation_order from empList
      const aIdx = empList.findIndex((e) => e.id === a.id)
      const bIdx = empList.findIndex((e) => e.id === b.id)
      return aIdx - bIdx
    })

    // First available in list order = "next"
    const firstAvailable = rotationList.find((r) => r.status !== 'busy')
    if (firstAvailable) firstAvailable.status = 'next'
    setRotation(rotationList)
  }

  async function updateStatus(id: string, status: AppointmentStatus) {
    const updateData: Record<string, unknown> = { status }

    // Khi chuyển sang "in_progress": cập nhật time = thời điểm hiện tại
    if (status === 'in_progress') {
      const now = new Date()
      const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:00`
      updateData.time = currentTime
    }

    await supabase.from('appointments').update(updateData).eq('id', id)
    load()
  }

  async function createAppointment(form: {
    customerName: string; serviceId: string; employeeId: string; date: string; time: string
  }) {
    let employeeId = form.employeeId || null
    if (!employeeId) {
      const nextEmp = rotation.find((r) => r.status === 'next')
      employeeId = nextEmp?.id ?? null
    }
    let customerId: string | null = null
    if (form.customerName.trim()) {
      const { data: existing } = await supabase.from('customers').select('id').ilike('name', form.customerName.trim()).limit(1)
      if (existing && existing.length > 0) { customerId = existing[0].id }
      else {
        const { data: newCust } = await supabase.from('customers').insert({ name: form.customerName.trim() }).select('id').single()
        customerId = newCust?.id ?? null
      }
    }
    const service = services.find((s) => s.id === form.serviceId)
    await supabase.from('appointments').insert({
      customer_id: customerId, employee_id: employeeId, service_id: form.serviceId,
      date: form.date, time: form.time, price: service?.price ?? 0, tip: 0,
      status: 'booked', source: 'walk_in', payment_method: 'cash',
    })
    setShowForm(false)
    setEditingApt(null)
    load()
  }

  async function editAppointment(id: string, form: {
    customerName: string; serviceId: string; employeeId: string; date: string; time: string
  }) {
    const service = services.find((s) => s.id === form.serviceId)
    await supabase.from('appointments').update({
      employee_id: form.employeeId || null,
      service_id: form.serviceId,
      date: form.date,
      time: form.time,
      price: service?.price ?? 0,
    }).eq('id', id)
    setShowForm(false)
    setEditingApt(null)
    load()
  }

  // Drag & Drop — desktop: HTML5 drag, mobile: tap to select + arrow buttons
  const [selectedRotationIdx, setSelectedRotationIdx] = useState<number | null>(null)

  function handleDragStart(idx: number) { setDragIdx(idx) }
  function handleDragOver(e: React.DragEvent, idx: number) {
    e.preventDefault()
    if (dragIdx === null || dragIdx === idx) return
    const n = [...rotation]; const [d] = n.splice(dragIdx, 1); n.splice(idx, 0, d)
    setRotation(n); setDragIdx(idx)
  }
  async function handleDragEnd() {
    setDragIdx(null)
    await saveRotationOrder()
  }

  // Mobile: tap to select, then use arrows to move (only non-busy)
  function handleCardTap(idx: number) {
    // Không cho chọn NV đang busy
    if (rotation[idx]?.status === 'busy') return
    setSelectedRotationIdx(selectedRotationIdx === idx ? null : idx)
  }

  async function moveEmployee(direction: 'left' | 'right') {
    if (selectedRotationIdx === null) return
    const targetIdx = direction === 'left' ? selectedRotationIdx - 1 : selectedRotationIdx + 1
    if (targetIdx < 0 || targetIdx >= rotation.length) return
    // Không cho nhảy qua NV đang busy
    if (rotation[targetIdx]?.status === 'busy') return

    const n = [...rotation]
    const [moved] = n.splice(selectedRotationIdx, 1)
    n.splice(targetIdx, 0, moved)
    setRotation(n)
    setSelectedRotationIdx(targetIdx)
    await saveRotationOrder(n)
  }

  async function saveRotationOrder(list?: RotationEmployee[]) {
    const toSave = list ?? rotation
    for (let i = 0; i < toSave.length; i++) {
      await supabase.from('employees').update({ rotation_order: i }).eq('id', toSave[i].id)
    }
    const updated = toSave.map((emp) => ({
      ...emp,
      status: (emp.status === 'busy' ? 'busy' : 'available') as RotationStatus,
    }))
    const firstAvailable = updated.find((r) => r.status !== 'busy')
    if (firstAvailable) firstAvailable.status = 'next'
    setRotation(updated)
  }

  function getWeekDays() {
    const days: Date[] = []
    const start = new Date(selectedDate)
    const dow = start.getDay()
    start.setDate(start.getDate() - (dow === 0 ? 6 : dow - 1))
    for (let i = 0; i < 7; i++) { const d = new Date(start); d.setDate(start.getDate() + i); days.push(d) }
    return days
  }

  const weekDays = getWeekDays()
  const dayLabels = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7']

  const formattedDate = selectedDate.toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'long' })

  return (
    <div className="max-w-lg mx-auto px-5 py-6 pb-24 space-y-10">

      {/* ═══ Vòng tua ═══ */}
      <section>
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-2xl font-bold text-gray-900">
            {t('appointments.rotation')}
          </h2>
          <span className="text-[13px] font-semibold text-[#864e5a] uppercase tracking-widest">
            {t('appointments.active')}
          </span>
        </div>

        <div className="flex gap-4 overflow-x-auto pb-3 -mx-2 px-2" style={{ scrollbarWidth: 'none' }}>
          {rotation.map((emp, idx) => {
            const isNext = emp.status === 'next'
            const isBusy = emp.status === 'busy'
            const isSelected = selectedRotationIdx === idx
            return (
              <div
                key={emp.id}
                draggable
                onDragStart={(e) => { e.dataTransfer.effectAllowed = 'move'; handleDragStart(idx) }}
                onDragOver={(e) => handleDragOver(e, idx)}
                onDragEnd={handleDragEnd}
                onClick={() => handleCardTap(idx)}
                className={`flex-shrink-0 w-40 p-4 rounded-[1rem] text-center relative cursor-grab active:cursor-grabbing transition-all ${
                  dragIdx === idx ? 'opacity-50 scale-95' : ''
                } ${isSelected ? 'ring-2 ring-[#864e5a] ring-offset-2' : ''} ${
                  isNext
                    ? 'border-2 border-[#864e5a] shadow-[0_0_20px_rgba(134,78,90,0.15)]'
                    : 'opacity-80 border border-gray-200'
                }`}
                style={{
                  background: 'rgba(255, 248, 248, 0.6)',
                  backdropFilter: 'blur(12px)',
                }}
              >
                {/* Badge KẾ TIẾP */}
                {isNext && (
                  <div className="absolute -top-[1px] -right-[1px] bg-[#864e5a] text-white text-[10px] px-2 py-1 rounded-bl-lg rounded-tr-[1rem] font-bold z-10">
                    {t('appointments.nextUp')}
                  </div>
                )}

                {/* Avatar */}
                <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center text-3xl mb-3 ${
                  isNext
                    ? 'p-1 border-2 border-[#864e5a]'
                    : 'bg-gray-100'
                }`}>
                  {getChibiEmoji(emp.name)}
                </div>

                {/* Name */}
                <p className={`font-semibold text-base truncate ${
                  isNext ? 'text-[#864e5a]' : 'text-gray-900'
                }`}>
                  {emp.name.split(' ').slice(0, 2).join(' ')}
                </p>

                {/* Status */}
                <p className={`text-xs mt-0.5 ${
                  isBusy ? 'text-amber-600 flex items-center justify-center gap-1' :
                  isNext ? 'text-[#864e5a]/70' :
                  'text-gray-500'
                }`}>
                  {isBusy ? <><span className="w-2 h-2 rounded-full bg-amber-500 inline-block" /> {t('appointments.working')}</> :
                   emp.idleMinutes !== null && emp.idleMinutes > 0
                     ? `${t('appointments.idle')} ${emp.idleMinutes >= 60 ? `${Math.floor(emp.idleMinutes / 60)}h${emp.idleMinutes % 60 > 0 ? emp.idleMinutes % 60 + 'm' : ''}` : emp.idleMinutes + 'm'}`
                     : t('appointments.ready')}
                </p>
              </div>
            )
          })}
        </div>

        {/* Mobile reorder controls — hiện khi tap chọn 1 NV */}
        {selectedRotationIdx !== null && (
          <div className="flex items-center justify-center gap-4 mt-3">
            <button
              onClick={() => moveEmployee('left')}
              disabled={selectedRotationIdx === 0 || rotation[selectedRotationIdx! - 1]?.status === 'busy'}
              className="w-10 h-10 rounded-full bg-[#864e5a] text-white flex items-center justify-center disabled:opacity-30 active:scale-90 transition-transform text-lg font-bold"
            >
              ◀
            </button>
            <span className="text-sm text-gray-600 font-medium">
              {rotation[selectedRotationIdx]?.name.split(' ')[0]}
            </span>
            <button
              onClick={() => moveEmployee('right')}
              disabled={selectedRotationIdx === rotation.length - 1}
              className="w-10 h-10 rounded-full bg-[#864e5a] text-white flex items-center justify-center disabled:opacity-30 active:scale-90 transition-transform text-lg font-bold"
            >
              ▶
            </button>
            <button
              onClick={() => setSelectedRotationIdx(null)}
              className="w-8 h-8 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center text-sm"
            >
              ✕
            </button>
          </div>
        )}

        {/* Turn stats */}
        {rotation.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {rotation.map((emp) => (
              <span key={emp.id} className="text-sm bg-white/80 border border-gray-100 rounded-full px-3 py-1.5 text-gray-600 backdrop-blur-sm">
                {emp.name.split(' ')[0]}: <strong className="text-gray-900">{emp.turnCount}</strong> {t('appointments.turns')}
              </span>
            ))}
            {unassignedCount > 0 && (
              <span className="text-sm bg-gray-50 border border-gray-200 rounded-full px-3 py-1.5 text-gray-500 backdrop-blur-sm">
                Unassigned: <strong className="text-gray-700">{unassignedCount}</strong> {t('appointments.turns')}
              </span>
            )}
          </div>
        )}
      </section>

      {/* ═══ Lịch hẹn hôm nay ═══ */}
      <section className="space-y-4">
        <div className="flex justify-between items-end">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{t('appointments.todayTitle')}</h2>
            <p className="text-base text-gray-500 capitalize">{formattedDate}</p>
          </div>
          <div className="relative">
            <input
              ref={dateInputRef}
              type="date"
              value={dateStr}
              onChange={(e) => { if (e.target.value) setSelectedDate(new Date(e.target.value + 'T00:00:00')) }}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            />
            <span className="flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-full text-[#864e5a] font-semibold text-sm">
              <Calendar size={16} />
              {t('appointments.pickDate')}
            </span>
          </div>
        </div>

        {/* Date Strip */}
        <div className="flex justify-between py-2 gap-2">
          {weekDays.map((day) => {
            const ds = day.toISOString().slice(0, 10)
            const isSelected = ds === dateStr
            const dayIndex = day.getDay()
            const count = weekCounts[ds] ?? 0
            return (
              <button
                key={ds}
                onClick={() => setSelectedDate(day)}
                className={`flex flex-col items-center justify-center min-w-[50px] py-3 rounded-xl relative transition-all ${
                  isSelected
                    ? 'bg-[#864e5a] text-white'
                    : 'text-gray-500'
                }`}
                style={!isSelected ? { background: 'rgba(255,248,248,0.6)', backdropFilter: 'blur(12px)', border: '1px solid rgba(134,78,90,0.1)' } : undefined}
              >
                <span className="text-[13px] font-semibold tracking-wide">{dayLabels[dayIndex]}</span>
                <span className="text-lg font-bold">{day.getDate()}</span>
                {count > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#864e5a] text-white rounded-full text-[10px] flex items-center justify-center font-bold shadow-sm">
                    {count}
                  </span>
                )}
              </button>
            )
          })}
        </div>

        {/* Status Tabs — contextual based on date */}
        {(() => {
          const today = new Date().toISOString().slice(0, 10)
          const isToday = dateStr === today
          const isPast = dateStr < today

          // Which tabs to show per date context
          const tabs: { key: 'all' | AppointmentStatus; label: string }[] = [
            { key: 'all', label: t('common.all') },
          ]
          if (isToday) {
            tabs.push({ key: 'booked', label: t('appointments.waiting') })
            tabs.push({ key: 'in_progress', label: t('appointments.inProgress') })
            tabs.push({ key: 'completed', label: t('appointments.completed') })
          } else if (isPast) {
            tabs.push({ key: 'completed', label: t('appointments.completed') })
          } else {
            // future
            tabs.push({ key: 'booked', label: t('appointments.waiting') })
          }
          tabs.push({ key: 'cancelled', label: t('appointments.cancelled') })

          return (
            <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
              {tabs.map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setStatusFilter(key)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                    statusFilter === key
                      ? 'bg-[#864e5a] text-white'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          )
        })()}

        {/* Appointment List — sorted & filtered */}
        <div className="space-y-3 max-h-[50vh] overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
          {(() => {
            // Sort: booked first, then in_progress, then completed, then cancelled
            const statusOrder: Record<string, number> = { booked: 0, in_progress: 1, completed: 2, cancelled: 3, no_show: 4 }
            const sorted = [...appointments].sort((a, b) => {
              const orderDiff = (statusOrder[a.status] ?? 9) - (statusOrder[b.status] ?? 9)
              if (orderDiff !== 0) return orderDiff
              return a.time.localeCompare(b.time)
            })
            const filtered = statusFilter === 'all' ? sorted : sorted.filter((a) => a.status === statusFilter)
            
            if (filtered.length === 0) {
              return <p className="text-center text-gray-400 py-8">{t('appointments.noAppointments')}</p>
            }
            return filtered.map((apt) => (
              <AppointmentCard
                key={apt.id}
                apt={apt}
                onStatusChange={updateStatus}
                onEdit={() => { setEditingApt(apt); setShowForm(true) }}
                t={t}
                superMode={superMode}
                services={services}
                employees={employees}
                onReload={load}
              />
            ))
          })()}
        </div>
      </section>

      {/* FAB */}
      <button
        onClick={() => { setEditingApt(null); setShowForm(true) }}
        className="fixed bottom-20 right-5 w-14 h-14 bg-[#864e5a] text-white rounded-full shadow-lg flex items-center justify-center active:scale-90 transition-transform z-40"
      >
        <Plus size={24} />
      </button>

      {/* Form Modal */}
      {showForm && (
        <NewAppointmentForm
          employees={employees} services={services}
          onSave={editingApt ? (form) => editAppointment(editingApt.id, form) : createAppointment}
          onClose={() => { setShowForm(false); setEditingApt(null) }}
          t={t} defaultDate={editingApt?.date ?? dateStr}
          editing={editingApt}
        />
      )}
    </div>
  )
}

// ─── AppointmentCard with edit/delete ─────────────────────────────────────────

// ─── AppointmentCard: tap for detail ─────────────────────────────────────────

function AppointmentCard({ apt, onStatusChange, onEdit, t, superMode, services, employees, onReload }: {
  apt: AppointmentRow
  onStatusChange: (id: string, status: AppointmentStatus) => void
  onEdit: () => void
  t: (k: string) => string
  superMode: boolean
  services: { id: string; name: string; price: number }[]
  employees: { id: string; name: string }[]
  onReload: () => void
}) {
  const [showDetail, setShowDetail] = useState(false)
  const [tipInput, setTipInput] = useState(apt.tip?.toString() ?? '0')
  const [priceInput, setPriceInput] = useState(apt.price?.toString() ?? '0')
  const [savingPayment, setSavingPayment] = useState(false)

  // Super mode edit states
  const [editStatus, setEditStatus] = useState<AppointmentStatus>(apt.status)
  const [editServiceId, setEditServiceId] = useState(apt.service ? services.find(s => s.name === apt.service?.name)?.id ?? '' : '')
  const [editEmployeeId, setEditEmployeeId] = useState(apt.employee_id ?? '')
  const [editPaymentMethod, setEditPaymentMethod] = useState<string>('cash')
  const [savingSuper, setSavingSuper] = useState(false)

  const { time, ampm } = (() => {
    const [h, m] = apt.time.split(':')
    const hour = parseInt(h)
    return { time: `${(hour % 12) || 12}:${m}`, ampm: hour >= 12 ? 'PM' : 'AM' }
  })()

  const isInProgress = apt.status === 'in_progress'
  const isCompleted = apt.status === 'completed'
  const isCancelled = apt.status === 'cancelled'
  const isLocked = isCompleted || isCancelled // cannot edit

  const statusLabel = apt.status === 'booked' ? t('appointments.waiting')
    : apt.status === 'in_progress' ? t('appointments.inProgress')
    : apt.status === 'completed' ? t('appointments.completed')
    : apt.status === 'cancelled' ? t('appointments.cancelled')
    : t('appointments.noShow')
  const statusClasses = apt.status === 'booked' ? 'bg-amber-100 text-amber-800'
    : apt.status === 'in_progress' ? 'bg-gray-200 text-gray-700'
    : apt.status === 'completed' ? 'bg-green-100 text-green-800'
    : 'bg-gray-100 text-gray-500'

  async function savePayment() {
    setSavingPayment(true)
    await supabase.from('appointments').update({
      price: parseFloat(priceInput) || 0,
      tip: parseFloat(tipInput) || 0,
    }).eq('id', apt.id)
    setSavingPayment(false)
    setShowDetail(false)
    onReload()
  }

  async function saveSuperEdit() {
    setSavingSuper(true)
    const updates: Record<string, unknown> = {
      status: editStatus,
      price: parseFloat(priceInput) || 0,
      tip: parseFloat(tipInput) || 0,
      payment_method: editPaymentMethod,
    }
    if (editServiceId) updates.service_id = editServiceId
    if (editEmployeeId) updates.employee_id = editEmployeeId
    else updates.employee_id = null

    await supabase.from('appointments').update(updates).eq('id', apt.id)
    setSavingSuper(false)
    setShowDetail(false)
    onReload()
  }

  return (
    <>
      {/* Card */}
      <div
        onClick={() => setShowDetail(true)}
        className={`p-4 rounded-[1rem] flex items-center gap-4 transition-all cursor-pointer ${
          isInProgress
            ? 'bg-[#864e5a]/5 border border-[#864e5a]/20'
            : isCancelled
            ? 'opacity-50'
            : 'border-l-4 border-[#864e5a]/30'
        }`}
        style={(!isInProgress && !isCancelled) ? { background: 'rgba(255,248,248,0.6)', backdropFilter: 'blur(12px)', borderRight: '1px solid rgba(134,78,90,0.1)', borderTop: '1px solid rgba(134,78,90,0.1)', borderBottom: '1px solid rgba(134,78,90,0.1)' } : isCancelled ? { background: 'rgba(245,245,245,0.8)' } : undefined}
      >
        {/* Time */}
        <div className="flex flex-col items-center border-r border-gray-200 pr-4 min-w-[70px]">
          <span className={`text-lg font-bold ${isCancelled ? 'text-gray-400 line-through' : 'text-[#864e5a]'}`}>{time}</span>
          <span className="text-xs text-gray-400 font-semibold">{ampm}</span>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start">
            <h4 className={`font-semibold text-base truncate ${isCancelled ? 'text-gray-400 line-through' : 'text-gray-900'}`}>{apt.customer?.name ?? 'Walk-in'}</h4>
            <span className={`px-3 py-1 text-[10px] rounded-full font-bold uppercase ${statusClasses}`}>
              {statusLabel}
            </span>
          </div>
          <p className={`text-sm mt-0.5 ${isCancelled ? 'text-gray-400' : 'text-gray-500'}`}>{apt.service?.name ?? ''}</p>
          <div className="flex items-center gap-2 mt-2">
            <User size={14} className={isCancelled ? 'text-gray-400' : 'text-[#864e5a]'} />
            <span className={`text-[13px] font-semibold ${isCancelled ? 'text-gray-400' : 'text-[#864e5a]'}`}>NV: {apt.employee?.name ?? t('appointments.unassigned')}</span>
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      {showDetail && (
        <div className="fixed inset-0 bg-black/40 z-[60] flex items-center justify-center p-4" onClick={() => setShowDetail(false)}>
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 space-y-4 max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-gray-900">{t('appointments.detail')}</h3>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">{t('appointments.customerName')}</span>
                <span className="font-medium">{apt.customer?.name ?? 'Walk-in'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">{t('appointments.service')}</span>
                <span className="font-medium">{apt.service?.name ?? '-'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">{t('appointments.assignStaff')}</span>
                <span className="font-medium">{apt.employee?.name ?? t('appointments.unassigned')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">{t('appointments.time')}</span>
                <span className="font-medium">{time} {ampm}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500">{t('common.status')}</span>
                <span className={`px-3 py-0.5 text-[10px] rounded-full font-bold uppercase ${statusClasses}`}>{statusLabel}</span>
              </div>
            </div>

            <hr className="border-gray-100" />

            {/* ══ SUPER MODE: Full edit form ══ */}
            {superMode && (
              <div className="space-y-3 border border-red-200 rounded-xl p-4 bg-red-50/30">
                <p className="text-xs font-bold text-red-600 uppercase">⚡ Super Mode Edit</p>

                {/* Status */}
                <div>
                  <label className="text-xs font-medium text-gray-600">Trạng thái</label>
                  <select value={editStatus} onChange={(e) => setEditStatus(e.target.value as AppointmentStatus)}
                    className="w-full mt-1 px-3 py-2 rounded-lg border border-gray-200 text-sm outline-none focus:border-[#864e5a]">
                    <option value="booked">Đang chờ</option>
                    <option value="in_progress">Đang xử lý</option>
                    <option value="completed">Hoàn thành</option>
                    <option value="cancelled">Đã hủy</option>
                    <option value="no_show">No Show</option>
                  </select>
                </div>

                {/* Service */}
                <div>
                  <label className="text-xs font-medium text-gray-600">Dịch vụ</label>
                  <select value={editServiceId} onChange={(e) => setEditServiceId(e.target.value)}
                    className="w-full mt-1 px-3 py-2 rounded-lg border border-gray-200 text-sm outline-none focus:border-[#864e5a]">
                    <option value="">-- Chọn --</option>
                    {services.map((s) => <option key={s.id} value={s.id}>{s.name} — ${s.price}</option>)}
                  </select>
                </div>

                {/* Employee */}
                <div>
                  <label className="text-xs font-medium text-gray-600">Nhân viên</label>
                  <select value={editEmployeeId} onChange={(e) => setEditEmployeeId(e.target.value)}
                    className="w-full mt-1 px-3 py-2 rounded-lg border border-gray-200 text-sm outline-none focus:border-[#864e5a]">
                    <option value="">Unassigned</option>
                    {employees.map((emp) => <option key={emp.id} value={emp.id}>{emp.name}</option>)}
                  </select>
                </div>

                {/* Price & Tip */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-gray-600">Giá ($)</label>
                    <input type="number" inputMode="decimal" value={priceInput} onChange={(e) => setPriceInput(e.target.value)}
                      className="w-full mt-1 px-3 py-2 rounded-lg border border-gray-200 text-sm outline-none focus:border-[#864e5a]" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600">Tip ($)</label>
                    <input type="number" inputMode="decimal" value={tipInput} onChange={(e) => setTipInput(e.target.value)}
                      className="w-full mt-1 px-3 py-2 rounded-lg border border-gray-200 text-sm outline-none focus:border-[#864e5a]" />
                  </div>
                </div>

                {/* Payment method */}
                <div>
                  <label className="text-xs font-medium text-gray-600">Nguồn tiền</label>
                  <select value={editPaymentMethod} onChange={(e) => setEditPaymentMethod(e.target.value)}
                    className="w-full mt-1 px-3 py-2 rounded-lg border border-gray-200 text-sm outline-none focus:border-[#864e5a]">
                    <option value="cash">Tiền mặt</option>
                    <option value="card">Thẻ</option>
                    <option value="zelle">Zelle</option>
                    <option value="other">Khác</option>
                  </select>
                </div>

                <button
                  onClick={saveSuperEdit}
                  disabled={savingSuper}
                  className="w-full py-2.5 bg-red-600 text-white font-semibold rounded-xl text-sm disabled:opacity-50"
                >
                  {savingSuper ? '...' : 'Lưu thay đổi (Super)'}
                </button>
              </div>
            )}

            {/* ══ Normal mode actions ══ */}
            {!superMode && (
              <>
                {/* Completed: show price/tip inputs */}
                {isCompleted && (
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs font-medium text-gray-500">{t('appointments.pricePaid')}</label>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-gray-400">$</span>
                        <input type="number" inputMode="decimal" value={priceInput} onChange={(e) => setPriceInput(e.target.value)}
                          className="flex-1 px-3 py-2 rounded-lg border border-gray-200 outline-none focus:border-[#864e5a] text-sm" />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500">{t('quickEntry.tip')}</label>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-gray-400">$</span>
                        <input type="number" inputMode="decimal" value={tipInput} onChange={(e) => setTipInput(e.target.value)}
                          className="flex-1 px-3 py-2 rounded-lg border border-gray-200 outline-none focus:border-[#864e5a] text-sm" />
                      </div>
                    </div>
                    <button onClick={savePayment} disabled={savingPayment}
                      className="w-full py-2.5 bg-[#864e5a] text-white font-semibold rounded-xl text-sm disabled:opacity-50">
                      {savingPayment ? '...' : t('common.save')}
                    </button>
                  </div>
                )}

                {/* Not locked: show action buttons */}
                {!isLocked && (
                  <div className="flex flex-col gap-2">
                    {apt.status === 'booked' && (
                      <button onClick={() => { onStatusChange(apt.id, 'in_progress'); setShowDetail(false) }}
                        className="w-full py-2.5 bg-amber-50 text-amber-800 font-semibold rounded-xl text-sm">
                        {t('appointments.startWork')}
                      </button>
                    )}
                    {apt.status === 'in_progress' && (
                      <button onClick={() => { onStatusChange(apt.id, 'completed'); setShowDetail(false) }}
                        className="w-full py-2.5 bg-green-50 text-green-800 font-semibold rounded-xl text-sm">
                        {t('appointments.complete')}
                      </button>
                    )}
                    {apt.status === 'booked' && (
                      <button onClick={() => { setShowDetail(false); onEdit() }}
                        className="w-full py-2.5 bg-[#864e5a]/10 text-[#864e5a] font-semibold rounded-xl text-sm">
                        {t('common.edit')}
                      </button>
                    )}
                    <button onClick={() => { onStatusChange(apt.id, 'cancelled'); setShowDetail(false) }}
                      className="w-full py-2.5 text-red-500 font-medium text-sm">
                      {t('appointments.cancelAppointment')}
                    </button>
                  </div>
                )}

                {/* Cancelled: just close */}
                {isCancelled && (
                  <button onClick={() => setShowDetail(false)}
                    className="w-full py-2.5 text-gray-500 font-medium text-sm">
                    {t('common.cancel')}
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </>
  )
}

// ─── Form (create + edit) ────────────────────────────────────────────────────

function NewAppointmentForm({ employees, services, onSave, onClose, t, defaultDate, editing }: {
  employees: Employee[]; services: Service[]
  onSave: (f: { customerName: string; serviceId: string; employeeId: string; date: string; time: string }) => void
  onClose: () => void; t: (k: string) => string; defaultDate: string
  editing: AppointmentRow | null
}) {
  const [customerName, setCustomerName] = useState(editing?.customer?.name ?? '')
  const [serviceId, setServiceId] = useState(editing?.service ? services.find(s => s.name === editing.service?.name)?.id ?? '' : '')
  const [employeeId, setEmployeeId] = useState(editing?.employee_id ?? '')
  const [date, setDate] = useState(editing?.date ?? defaultDate)
  const [time, setTime] = useState(editing?.time?.slice(0, 5) ?? new Date().toTimeString().slice(0, 5))
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!serviceId) return
    setSubmitting(true)
    await onSave({ customerName, serviceId, employeeId, date, time })
    setSubmitting(false)
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-[60] flex items-end sm:items-center justify-center">
      <div className="bg-white w-full max-w-md rounded-t-2xl sm:rounded-2xl p-6 pb-10 max-h-[90vh] overflow-y-auto modal-sheet">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold">{editing ? t('appointments.editAppointment') : t('appointments.newAppointment')}</h3>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600"><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700">{t('appointments.customerName')}</label>
            <input value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="Walk-in"
              className="w-full mt-1 px-4 py-3 rounded-xl border border-gray-200 focus:border-[#864e5a] outline-none" />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">{t('appointments.service')}</label>
            <select value={serviceId} onChange={(e) => setServiceId(e.target.value)} required
              className="w-full mt-1 px-4 py-3 rounded-xl border border-gray-200 focus:border-[#864e5a] outline-none">
              <option value="">{t('quickEntry.chooseService')}</option>
              {services.map((s) => <option key={s.id} value={s.id}>{s.name} — ${s.price}</option>)}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">{t('appointments.assignStaff')}</label>
            <select value={employeeId} onChange={(e) => setEmployeeId(e.target.value)}
              className="w-full mt-1 px-4 py-3 rounded-xl border border-gray-200 focus:border-[#864e5a] outline-none">
              <option value="">{t('appointments.autoRotation')}</option>
              {employees.map((emp) => <option key={emp.id} value={emp.id}>{emp.name}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-gray-700">{t('appointments.date')}</label>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required
                className="w-full mt-1 px-4 py-3 rounded-xl border border-gray-200 focus:border-[#864e5a] outline-none" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">{t('appointments.time')}</label>
              <input type="time" value={time} onChange={(e) => setTime(e.target.value)} required
                className="w-full mt-1 px-4 py-3 rounded-xl border border-gray-200 focus:border-[#864e5a] outline-none" />
            </div>
          </div>
          <button type="submit" disabled={submitting || !serviceId}
            className="w-full py-3 bg-[#864e5a] text-white font-semibold rounded-xl disabled:opacity-50 active:scale-[0.98] transition-all">
            {submitting ? '...' : editing ? t('common.save') : t('appointments.addAppointment')}
          </button>
        </form>
      </div>
    </div>
  )
}
