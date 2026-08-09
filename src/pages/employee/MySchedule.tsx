import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import { useServices } from '@/hooks/useStoreData'
import { Plus, X } from 'lucide-react'

interface ScheduleItem {
  id: string
  date: string
  time: string
  status: string
  price: number
  tip: number
  customer: { name: string } | null
  service: { name: string } | null
}

export function MySchedule() {
  const { t } = useTranslation()
  const user = useAuthStore((s) => s.user)
  const { data: services } = useServices()
  const [items, setItems] = useState<ScheduleItem[]>([])
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const [showForm, setShowForm] = useState(false)

  // New appointment form state
  const [formCustomer, setFormCustomer] = useState('')
  const [formService, setFormService] = useState('')
  const [formDate, setFormDate] = useState(new Date().toISOString().slice(0, 10))
  const [formTime, setFormTime] = useState(new Date().toTimeString().slice(0, 5))
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => { if (user) load() }, [date, user])

  async function load() {
    const isOffline = !navigator.onLine
    const cacheKey = `my_schedule_${user?.id}_${date}`

    if (isOffline) {
      const cached = localStorage.getItem(cacheKey)
      if (cached) {
        setItems(JSON.parse(cached))
      } else {
        setItems([])
      }
      return
    }

    try {
      const { data } = await supabase.rpc('get_my_appointments', {
        p_date: date,
      })

      const rawRows = (data ?? []) as any[]

      const formattedItems = rawRows.map((r) => ({
        id: r.apt_id ?? r.id ?? '',
        date: r.apt_date ?? r.date ?? '',
        time: r.apt_time ?? r.time ?? '00:00',
        status: r.apt_status ?? r.status ?? '',
        price: Number(r.apt_price ?? r.price) || 0,
        tip: Number(r.apt_tip ?? r.tip) || 0,
        customer: (r.customer_name) ? { name: r.customer_name } : null,
        service: (r.service_name) ? { name: r.service_name } : null,
      }))

      setItems(formattedItems)
      localStorage.setItem(cacheKey, JSON.stringify(formattedItems))
    } catch (err) {
      console.error('Failed to load online schedule:', err)
      const cacheKey = `my_schedule_${user?.id}_${date}`
      const cached = localStorage.getItem(cacheKey)
      if (cached) setItems(JSON.parse(cached))
    }
  }

  async function handleAddAppointment(e: React.FormEvent) {
    e.preventDefault()
    if (!formService || submitting) return
    setSubmitting(true)

    try {
      // Get my employee ID
      let employeeId: string | null = null
      const { data: empRows, error: empErr } = await supabase.rpc('get_my_employee')
      if (!empErr && empRows && (empRows as any[]).length > 0) {
        employeeId = (empRows as any[])[0].id
      } else {
        const { data: directEmp } = await supabase
          .from('employees')
          .select('id')
          .eq('profile_id', user!.id)
          .single()
        if (directEmp) employeeId = (directEmp as { id: string }).id
      }

      if (!employeeId) {
        alert(t('common.error') || 'Employee record not found')
        setSubmitting(false)
        return
      }

      // Find or create customer
      let customerId: string | null = null
      if (formCustomer.trim() && formCustomer.trim().toLowerCase() !== 'walk-in') {
        const { data: existing } = await supabase
          .from('customers')
          .select('id')
          .eq('name', formCustomer.trim())
          .maybeSingle()

        if (existing) {
          customerId = (existing as { id: string }).id
        } else {
          const { data: newCust } = await supabase
            .from('customers')
            .insert({ name: formCustomer.trim() })
            .select('id')
            .single()
          if (newCust) customerId = (newCust as { id: string }).id
        }
      }

      const service = services.find((s) => s.id === formService)

      await supabase.from('appointments').insert({
        employee_id: employeeId,
        service_id: formService,
        customer_id: customerId,
        date: formDate,
        time: formTime,
        price: service?.price ?? 0,
        tip: 0,
        status: 'booked',
        source: 'walk_in',
      })

      // Reset form and reload
      setShowForm(false)
      setFormCustomer('')
      setFormService('')
      setFormDate(new Date().toISOString().slice(0, 10))
      setFormTime(new Date().toTimeString().slice(0, 5))

      // Reload if viewing the same date
      if (formDate === date) {
        load()
      }
    } catch (err) {
      console.error('Failed to add appointment:', err)
      alert(t('common.error') || 'Failed to add appointment')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-lg mx-auto px-5 py-6 pb-24 space-y-6 relative">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">{t('nav.mySchedule')}</h2>
        <button
          onClick={() => setShowForm(true)}
          className="w-10 h-10 rounded-full bg-[#864e5a] text-white flex items-center justify-center shadow-lg"
          aria-label="New Appointment"
        >
          <Plus size={20} />
        </button>
      </div>

      <input
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#864e5a] outline-none"
      />

      <div className="space-y-3 max-h-[60vh] overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
        {items.length === 0 && (
          <p className="text-center text-gray-400 py-8">No appointments for this day</p>
        )}
        {items.map((item) => {
          const [h, m] = (item.time ?? '00:00').split(':')
          const hour = parseInt(h)
          const timeStr = `${(hour % 12) || 12}:${m}`
          const ampm = hour >= 12 ? 'PM' : 'AM'

          const statusLabel =
            item.status === 'completed' ? 'Done' :
            item.status === 'booked' ? 'Waiting' :
            item.status === 'in_progress' ? 'In Progress' :
            item.status === 'cancelled' ? 'Cancelled' : item.status
          const statusColor =
            item.status === 'completed' ? 'bg-emerald-100 text-emerald-700' :
            item.status === 'booked' ? 'bg-amber-100 text-amber-700' :
            item.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
            item.status === 'cancelled' ? 'bg-gray-100 text-gray-500' :
            'bg-gray-100 text-gray-600'

          return (
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
              {/* Time */}
              <div className="flex flex-col items-center border-r border-gray-200 pr-4 min-w-[60px]">
                <span className="text-lg font-bold text-[#864e5a]">{timeStr}</span>
                <span className="text-xs text-gray-400 font-semibold">{ampm}</span>
              </div>
              {/* Content */}
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 truncate">{item.service?.name}</p>
                <p className="text-sm text-gray-500">{item.customer?.name ?? 'Walk-in'}</p>
              </div>
              {/* Price + Status */}
              <div className="text-right flex flex-col items-end gap-1">
                <p className="font-bold text-gray-900">${item.price}</p>
                {item.tip > 0 && <p className="text-xs text-[#864e5a]">+${item.tip} tip</p>}
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${statusColor}`}>
                  {statusLabel}
                </span>
              </div>
            </div>
          )
        })}
      </div>

      {/* New Appointment Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">New Appointment</h3>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddAppointment} className="space-y-4">
              {/* Customer Name */}
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Customer Name</label>
                <input
                  type="text"
                  value={formCustomer}
                  onChange={(e) => setFormCustomer(e.target.value)}
                  placeholder="Walk-in"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#864e5a] outline-none"
                />
              </div>

              {/* Service */}
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Service</label>
                <select
                  value={formService}
                  onChange={(e) => setFormService(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#864e5a] outline-none appearance-none bg-white"
                  required
                >
                  <option value="">Select a service...</option>
                  {services.map((s) => (
                    <option key={s.id} value={s.id}>{s.name} — ${s.price}</option>
                  ))}
                </select>
              </div>

              {/* Date & Time */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">Date</label>
                  <input
                    type="date"
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#864e5a] outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">Time</label>
                  <input
                    type="time"
                    value={formTime}
                    onChange={(e) => setFormTime(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#864e5a] outline-none"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting || !formService}
                className="w-full py-3 rounded-xl bg-[#864e5a] text-white font-semibold disabled:opacity-50"
              >
                {submitting ? '...' : 'Add Appointment'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
