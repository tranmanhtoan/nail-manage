import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'

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
  const [items, setItems] = useState<ScheduleItem[]>([])
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))

  useEffect(() => { if (user) load() }, [date, user])

  async function load() {
    // Use RPC function to bypass RLS
    const { data } = await supabase.rpc('get_my_appointments', {
      p_date: date,
    })

    const rows = (data ?? []) as { id: string; date: string; time: string; status: string; price: number; tip: number; customer_name: string | null; service_name: string | null }[]
    setItems(rows.map((r) => ({
      id: r.id,
      date: r.date,
      time: r.time,
      status: r.status,
      price: r.price,
      tip: r.tip,
      customer: r.customer_name ? { name: r.customer_name } : null,
      service: r.service_name ? { name: r.service_name } : null,
    })))
  }

  return (
    <div className="max-w-lg mx-auto px-5 py-6 pb-24 space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">{t('nav.mySchedule')}</h2>

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
          const [h, m] = item.time.split(':')
          const hour = parseInt(h)
          const timeStr = `${(hour % 12) || 12}:${m}`
          const ampm = hour >= 12 ? 'PM' : 'AM'

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
              {/* Price */}
              <div className="text-right">
                <p className="font-bold text-gray-900">${item.price}</p>
                {item.tip > 0 && <p className="text-xs text-[#864e5a]">+${item.tip} tip</p>}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
