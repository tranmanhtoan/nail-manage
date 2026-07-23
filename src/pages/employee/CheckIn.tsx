import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import type { Service } from '@/lib/database.types'

export function CheckIn() {
  const { t } = useTranslation()
  const user = useAuthStore((s) => s.user)
  const [services, setServices] = useState<Service[]>([])
  const [selectedService, setSelectedService] = useState('')
  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [tip, setTip] = useState(0)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    supabase.from('services').select('*').eq('is_active', true).order('name')
      .then(({ data }) => setServices((data as Service[]) ?? []))
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!user || !selectedService) return

    const { data: emp } = await supabase
      .from('employees')
      .select('id')
      .eq('profile_id', user.id)
      .single()

    if (!emp) return
    const empData = emp as { id: string }

    const service = services.find((s) => s.id === selectedService)!

    let customerId: string | null = null
    if (customerName) {
      const { data: existing } = await supabase
        .from('customers')
        .select('id')
        .eq('name', customerName)
        .maybeSingle()

      const existingData = existing as { id: string } | null
      if (existingData) {
        customerId = existingData.id
      } else {
        const { data: newCust } = await supabase
          .from('customers')
          .insert({ name: customerName, phone: customerPhone || null })
          .select('id')
          .single()
        const newCustData = newCust as { id: string } | null
        customerId = newCustData?.id ?? null
      }
    }

    const today = new Date().toISOString().slice(0, 10)
    const now = new Date().toTimeString().slice(0, 5)

    await supabase.from('appointments').insert({
      employee_id: empData.id,
      service_id: service.id,
      customer_id: customerId,
      date: today,
      time: now,
      price: service.price,
      tip,
      status: 'completed',
      source: 'walk_in',
      notes: null,
    })

    setSuccess(true)
    setCustomerName('')
    setCustomerPhone('')
    setSelectedService('')
    setTip(0)
    setTimeout(() => setSuccess(false), 3000)
  }

  return (
    <div className="max-w-lg mx-auto px-5 py-6 pb-24 space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">{t('nav.checkIn')}</h2>

      {success && (
        <div
          className="p-3 rounded-[1rem] text-sm font-medium text-[#864e5a] border border-[rgba(134,78,90,0.2)]"
          style={{ background: 'rgba(255, 248, 248, 0.8)' }}
        >
          ✓ Service recorded!
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-sm font-medium text-gray-700">{t('booking.selectService')}</label>
          <select
            value={selectedService}
            onChange={(e) => setSelectedService(e.target.value)}
            required
            className="w-full mt-1 px-4 py-3 rounded-xl border border-gray-200 focus:border-[#864e5a] outline-none"
          >
            <option value="">--</option>
            {services.map((s) => (
              <option key={s.id} value={s.id}>{s.name} — ${s.price}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700">{t('common.name')} (customer)</label>
          <input
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            placeholder="Optional"
            className="w-full mt-1 px-4 py-3 rounded-xl border border-gray-200 focus:border-[#864e5a] outline-none"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700">{t('common.phone')}</label>
          <input
            value={customerPhone}
            onChange={(e) => setCustomerPhone(e.target.value)}
            placeholder="Optional"
            className="w-full mt-1 px-4 py-3 rounded-xl border border-gray-200 focus:border-[#864e5a] outline-none"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700">{t('employee.tips')} ($)</label>
          <input
            type="number"
            value={tip}
            onChange={(e) => setTip(+e.target.value)}
            min={0}
            className="w-full mt-1 px-4 py-3 rounded-xl border border-gray-200 focus:border-[#864e5a] outline-none"
          />
        </div>

        <button type="submit" className="w-full py-3 bg-[#864e5a] text-white font-semibold rounded-xl active:scale-[0.98] transition-transform">
          {t('common.confirm')}
        </button>
      </form>
    </div>
  )
}
