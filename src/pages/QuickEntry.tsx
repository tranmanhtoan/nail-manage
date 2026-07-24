import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Check, ChevronLeft, Loader2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface Employee {
  id: string
  name: string
  rotation_order: number
}

interface Service {
  id: string
  name: string
  price: number
}

type Step = 'form' | 'review'

export function QuickEntry() {
  const { t } = useTranslation()

  const [employees, setEmployees] = useState<Employee[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [step, setStep] = useState<Step>('form')

  // Form state
  const [employeeId, setEmployeeId] = useState('')
  const [serviceId, setServiceId] = useState('')
  const [amount, setAmount] = useState('')
  const [tip, setTip] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card'>('cash')

  // Derived
  const selectedEmployee = employees.find((e) => e.id === employeeId)
  const selectedService = services.find((s) => s.id === serviceId)

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    setLoading(true)
    const [empRes, svcRes] = await Promise.all([
      supabase.from('employees').select('id, name').eq('is_active', true).order('name'),
      supabase.from('services').select('id, name, price').eq('is_active', true).order('name'),
    ])
    setEmployees(empRes.data ?? [])
    setServices(svcRes.data ?? [])
    setLoading(false)
  }

  function handleServiceChange(id: string) {
    setServiceId(id)
    const svc = services.find((s) => s.id === id)
    if (svc) setAmount(svc.price.toString())
  }

  function handleOk() {
    setStep('review')
  }

  function handleBack() {
    setStep('form')
  }

  async function handleSubmit() {
    if (!serviceId || !amount) return
    setSubmitting(true)

    const { error } = await supabase.from('appointments').insert({
      employee_id: employeeId || null,
      service_id: serviceId,
      price: parseFloat(amount),
      tip: tip ? parseFloat(tip) : 0,
      date: new Date().toISOString().split('T')[0],
      time: new Date().toTimeString().split(' ')[0].slice(0, 5),
      status: 'completed',
      source: 'walk_in',
      payment_method: paymentMethod,
    })

    setSubmitting(false)

    if (!error) {
      setSuccess(true)
      setTimeout(() => {
        resetForm()
      }, 1500)
    }
  }

  function resetForm() {
    setEmployeeId('')
    setServiceId('')
    setAmount('')
    setTip('')
    setPaymentMethod('cash')
    setStep('form')
    setSuccess(false)
  }

  // Get initials for avatar
  function getInitials(name: string) {
    return name
      .split(' ')
      .map((w) => w[0])
      .join('')
      .slice(0, 2)
      .toUpperCase()
  }

  // Generate a consistent pastel color from name
  function getAvatarColor(name: string) {
    const colors = [
      'bg-rose-100 text-rose-700',
      'bg-sky-100 text-sky-700',
      'bg-violet-100 text-violet-700',
      'bg-amber-100 text-amber-700',
      'bg-teal-100 text-teal-700',
      'bg-indigo-100 text-indigo-700',
      'bg-orange-100 text-orange-700',
      'bg-emerald-100 text-emerald-700',
    ]
    let hash = 0
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash)
    }
    return colors[Math.abs(hash) % colors.length]
  }

  const isFormValid = serviceId && amount && parseFloat(amount) > 0

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="animate-spin text-[#864e5a]" size={32} />
      </div>
    )
  }

  return (
    <div className="max-w-lg mx-auto px-5 py-6">
      {/* Title */}
      <h1 className="text-2xl font-bold text-gray-900">{t('quickEntry.title')}</h1>
      <p className="text-sm text-gray-500 mt-1">{t('quickEntry.subtitle')}</p>

      {/* Form Step */}
      {step === 'form' && (
        <div className="mt-6 space-y-6">
          {/* Employee avatar selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-3">
              {t('quickEntry.selectEmployee')}
            </label>
            <div className="flex gap-4 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none' }}>
              {employees.map((emp) => (
                <button
                  key={emp.id}
                  type="button"
                  onClick={() => setEmployeeId(emp.id)}
                  className={`flex flex-col items-center gap-1.5 min-w-[64px] transition-all ${
                    employeeId === emp.id ? 'scale-105' : 'opacity-70'
                  }`}
                >
                  <div
                    className={`w-14 h-14 rounded-full flex items-center justify-center text-sm font-bold ring-2 transition-all ${
                      getAvatarColor(emp.name)
                    } ${
                      employeeId === emp.id
                        ? 'ring-[#864e5a] ring-offset-2'
                        : 'ring-transparent'
                    }`}
                  >
                    {getInitials(emp.name)}
                  </div>
                  <span
                    className={`text-xs text-center leading-tight max-w-[64px] truncate ${
                      employeeId === emp.id ? 'font-semibold text-gray-900' : 'text-gray-600'
                    }`}
                  >
                    {emp.name.split(' ').slice(0, 2).join(' ')}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Service select */}
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2">
              {t('quickEntry.selectService')}
            </label>
            <select
              value={serviceId}
              onChange={(e) => handleServiceChange(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-base text-gray-800 focus:ring-2 focus:ring-[#864e5a]/40 focus:border-[#864e5a] appearance-none"
              style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='none' viewBox='0 0 24 24' stroke='%239ca3af' stroke-width='2'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center' }}
            >
              <option value="">{t('quickEntry.chooseService')}</option>
              {services.map((svc) => (
                <option key={svc.id} value={svc.id}>
                  {svc.name}
                </option>
              ))}
            </select>
          </div>

          {/* Amount */}
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2">
              {t('quickEntry.amount')}
            </label>
            <div className="flex items-center gap-3 border-b border-gray-200 pb-2">
              <span className="text-[#864e5a] font-bold text-lg">$</span>
              <input
                type="number"
                inputMode="decimal"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0"
                className="flex-1 text-lg font-medium text-gray-800 placeholder-gray-300 outline-none bg-transparent"
              />
            </div>
          </div>

          {/* Tip */}
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2">
              {t('quickEntry.tip')}
            </label>
            <div className="flex items-center gap-3 border-b border-gray-200 pb-2">
              <span className="text-[#864e5a] font-bold text-lg">$</span>
              <input
                type="number"
                inputMode="decimal"
                value={tip}
                onChange={(e) => setTip(e.target.value)}
                placeholder="0"
                className="flex-1 text-lg font-medium text-gray-800 placeholder-gray-300 outline-none bg-transparent"
              />
            </div>
          </div>

          {/* Payment Method */}
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2">
              {t('quickEntry.paymentMethod')}
            </label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setPaymentMethod('cash')}
                className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border-2 transition-all ${
                  paymentMethod === 'cash'
                    ? 'border-[#864e5a] bg-[#864e5a]/5 text-[#864e5a]'
                    : 'border-gray-200 text-gray-500'
                }`}
              >
                {t('dashboard.cash')}
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('card')}
                className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border-2 transition-all ${
                  paymentMethod === 'card'
                    ? 'border-[#864e5a] bg-[#864e5a]/5 text-[#864e5a]'
                    : 'border-gray-200 text-gray-500'
                }`}
              >
                {t('dashboard.card')}
              </button>
            </div>
          </div>

          {/* OK Button */}
          <button
            onClick={handleOk}
            disabled={!isFormValid}
            className="w-full bg-[#864e5a] text-white font-bold text-lg py-4 rounded-2xl disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-[0.98]"
          >
            OK
          </button>
        </div>
      )}

      {/* Review Modal Overlay */}
      {step === 'review' && (
        <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 space-y-5 shadow-xl max-h-[85vh] overflow-y-auto">
            <h2 className="text-lg font-bold text-center text-gray-900">
              {t('quickEntry.reviewTitle')}
            </h2>

            {success ? (
              <div className="flex flex-col items-center gap-3 py-8">
                <div className="w-16 h-16 bg-[#864e5a]/10 rounded-full flex items-center justify-center">
                  <Check className="text-[#864e5a]" size={32} />
                </div>
                <p className="text-[#864e5a] font-semibold text-lg">{t('quickEntry.success')}</p>
              </div>
            ) : (
              <>
                {/* Summary */}
                <div
                  className="rounded-[1rem] p-4 space-y-3 border border-[rgba(134,78,90,0.1)]"
                  style={{ background: 'rgba(255, 248, 248, 0.6)', backdropFilter: 'blur(12px)' }}
                >
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500 text-sm">{t('quickEntry.selectEmployee')}</span>
                    <div className="flex items-center gap-2">
                      {selectedEmployee && (
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${getAvatarColor(selectedEmployee.name)}`}>
                          {getInitials(selectedEmployee.name)}
                        </div>
                      )}
                      <span className="font-medium text-sm">
                        {selectedEmployee?.name || t('quickEntry.anyEmployee')}
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500 text-sm">{t('quickEntry.selectService')}</span>
                    <span className="font-medium text-sm">{selectedService?.name}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500 text-sm">{t('quickEntry.amount')}</span>
                    <span className="font-semibold text-[#864e5a]">
                      ${parseFloat(amount).toFixed(2)}
                    </span>
                  </div>
                  {tip && parseFloat(tip) > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500 text-sm">{t('quickEntry.tip')}</span>
                      <span className="font-medium text-sm">${parseFloat(tip).toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500 text-sm">{t('quickEntry.paymentMethod')}</span>
                    <span className="font-medium text-sm">
                      {paymentMethod === 'cash' ? t('dashboard.cash') : t('dashboard.card')}
                    </span>
                  </div>
                  <hr className="border-gray-200" />
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-gray-800">{t('common.total')}</span>
                    <span className="font-bold text-lg text-[#864e5a]">
                      ${(parseFloat(amount || '0') + parseFloat(tip || '0')).toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <button
                    onClick={handleBack}
                    className="flex-1 flex items-center justify-center gap-1.5 border border-gray-200 text-gray-700 font-semibold py-3 rounded-xl hover:bg-gray-50 transition-colors active:scale-[0.98]"
                  >
                    <ChevronLeft size={18} />
                    {t('common.back')}
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="flex-1 bg-[#864e5a] text-white font-bold py-3 rounded-xl disabled:opacity-50 transition-all active:scale-[0.98] flex items-center justify-center gap-1.5"
                  >
                    {submitting ? (
                      <Loader2 className="animate-spin" size={18} />
                    ) : (
                      <Check size={18} />
                    )}
                    {t('quickEntry.submit')}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
