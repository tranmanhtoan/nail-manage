import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { supabase } from '@/lib/supabase'
import { LanguageSwitch } from '@/components/LanguageSwitch'
import type { Service } from '@/lib/database.types'

export function BookingPage() {
  const { t } = useTranslation()
  const [services, setServices] = useState<Service[]>([])
  const [step, setStep] = useState<'service' | 'datetime' | 'info' | 'done'>('service')
  const [selectedService, setSelectedService] = useState<Service | null>(null)
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')

  useEffect(() => {
    supabase.from('services').select('*').eq('is_active', true).order('category').order('name')
      .then(({ data }) => setServices((data as Service[]) ?? []))
  }, [])

  async function submit() {
    if (!selectedService) return

    let customerId: string | null = null
    if (name) {
      const { data: existing } = await supabase
        .from('customers')
        .select('id')
        .eq('phone', phone)
        .maybeSingle()

      const existingData = existing as { id: string } | null
      if (existingData) {
        customerId = existingData.id
      } else {
        const { data: newCust } = await supabase
          .from('customers')
          .insert({ name, phone: phone || null })
          .select('id')
          .single()
        const newCustData = newCust as { id: string } | null
        customerId = newCustData?.id ?? null
      }
    }

    await supabase.from('appointments').insert({
      service_id: selectedService.id,
      customer_id: customerId,
      employee_id: null,
      date,
      time,
      price: selectedService.price,
      tip: 0,
      status: 'booked',
      source: 'online',
      notes: null,
    })

    setStep('done')
  }

  if (step === 'done') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-purple-50 p-4">
        <div className="text-center">
          <p className="text-5xl mb-4">✅</p>
          <h2 className="text-xl font-bold">{t('booking.success')}</h2>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 p-4">
      <div className="max-w-md mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-primary">💅 {t('booking.title')}</h1>
          <LanguageSwitch />
        </div>

        {step === 'service' && (
          <div className="space-y-3">
            <p className="font-medium text-gray-700">{t('booking.selectService')}</p>
            {services.map((svc) => (
              <button
                key={svc.id}
                onClick={() => { setSelectedService(svc); setStep('datetime') }}
                className={`w-full text-left bg-white rounded-xl p-4 shadow-sm border-2 transition-colors ${
                  selectedService?.id === svc.id ? 'border-primary' : 'border-transparent'
                }`}
              >
                <div className="flex justify-between">
                  <div>
                    <p className="font-medium">{svc.name}</p>
                    <p className="text-xs text-gray-500">{svc.duration_minutes} min</p>
                  </div>
                  <p className="font-bold text-primary">${svc.price}</p>
                </div>
              </button>
            ))}
          </div>
        )}

        {step === 'datetime' && (
          <div className="space-y-4">
            <button onClick={() => setStep('service')} className="text-sm text-primary">← {t('common.back')}</button>
            <div>
              <label className="text-sm font-medium text-gray-700">{t('booking.selectDate')}</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                min={new Date().toISOString().slice(0, 10)}
                className="w-full mt-1 px-4 py-3 rounded-xl border border-gray-200 focus:border-primary outline-none"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">{t('booking.selectTime')}</label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full mt-1 px-4 py-3 rounded-xl border border-gray-200 focus:border-primary outline-none"
              />
            </div>
            <button
              onClick={() => setStep('info')}
              disabled={!date || !time}
              className="w-full py-3 bg-primary text-white font-semibold rounded-xl disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}

        {step === 'info' && (
          <div className="space-y-4">
            <button onClick={() => setStep('datetime')} className="text-sm text-primary">← {t('common.back')}</button>
            <p className="font-medium text-gray-700">{t('booking.yourInfo')}</p>
            <div>
              <label className="text-sm font-medium text-gray-700">{t('common.name')}</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full mt-1 px-4 py-3 rounded-xl border border-gray-200 focus:border-primary outline-none"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">{t('common.phone')}</label>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                type="tel"
                className="w-full mt-1 px-4 py-3 rounded-xl border border-gray-200 focus:border-primary outline-none"
              />
            </div>

            <div className="bg-white rounded-xl p-4 shadow-sm text-sm">
              <p className="font-medium">{selectedService?.name}</p>
              <p className="text-gray-500">{date} at {time}</p>
              <p className="text-primary font-bold">${selectedService?.price}</p>
            </div>

            <button
              onClick={submit}
              disabled={!name}
              className="w-full py-3 bg-primary text-white font-semibold rounded-xl disabled:opacity-50"
            >
              {t('booking.confirmBooking')}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
