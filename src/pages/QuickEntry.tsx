import { useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Check, ChevronLeft, Loader2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import { useSyncStore } from '@/store/syncStore'
import { useDataStore } from '@/store/dataStore'
import { calculateIdleMinutes } from '@/lib/idle-minutes'
import { OfflineSyncBanner } from '@/components/OfflineSyncBanner'

interface Employee {
  id: string
  name: string
  rotation_order: number
  activated_at: string | null
}

interface Service {
  id: string
  name: string
  price: number
}

type Step = 'form' | 'review'

export function QuickEntry() {
  const { t } = useTranslation()
  const user = useAuthStore((s) => s.user)

  const [employees, setEmployees] = useState<Employee[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [step, setStep] = useState<Step>('form')

  // Form state
  const [employeeId, setEmployeeId] = useState('')
  const [myEmployeeId, setMyEmployeeId] = useState<string | null>(null)
  const [serviceId, setServiceId] = useState('')
  const [amount, setAmount] = useState('')
  const [tip, setTip] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card'>('cash')

  // Rotation data
  const [idleMinutes, setIdleMinutes] = useState<Record<string, number | null>>({})

  // Ref to track timeout for cleanup on unmount
  const resetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Cleanup timeout on unmount to prevent setState on unmounted component
  useEffect(() => {
    return () => {
      if (resetTimerRef.current) {
        clearTimeout(resetTimerRef.current)
        resetTimerRef.current = null
      }
    }
  }, [])

  // Derived
  const selectedEmployee = employees.find((e) => e.id === employeeId)
  const selectedService = services.find((s) => s.id === serviceId)

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    setLoading(true)
    const isOffline = !navigator.onLine

    // Use centralized dataStore for employees and services (benefits from dedup + SWR cache)
    const fetchEmployees = useDataStore.getState().fetchEmployees
    const fetchServices = useDataStore.getState().fetchServices

    if (isOffline) {
      const empList = (await fetchEmployees()) as Employee[]
      const svcList = (await fetchServices()) as Service[]

      setEmployees(empList)
      setServices(svcList)

      const idleMap: Record<string, number | null> = {}
      for (const emp of empList) {
        idleMap[emp.id] = 0 // ready/available
      }
      setIdleMinutes(idleMap)

      // Auto-select employee if logged in as employee
      if (user?.role === 'employee' && empList.length > 0) {
        const cachedMyEmpId = localStorage.getItem(`my_employee_id_${user.id}`)
        if (cachedMyEmpId) {
          setMyEmployeeId(cachedMyEmpId)
          setEmployeeId(cachedMyEmpId)
        } else {
          const myEmp = empList.find((e: any) => e.name === user.name)
          if (myEmp) {
            setMyEmployeeId(myEmp.id)
            setEmployeeId(myEmp.id)
            localStorage.setItem(`my_employee_id_${user.id}`, myEmp.id)
          }
        }
      }

      setLoading(false)
      return
    }

    try {
      // Fetch employees and services from centralized store (deduplicated),
      // only appointments need a direct query (date-specific, not cacheable globally)
      const [empList, svcList, aptsRes] = await Promise.all([
        fetchEmployees(true) as Promise<Employee[]>,
        fetchServices(true) as Promise<Service[]>,
        supabase.from('appointments').select('employee_id, status, time').eq('date', new Date().toISOString().split('T')[0]),
      ])

      setEmployees(empList)
      setServices(svcList)

      // If logged in as employee, find their employee_id and auto-select
      if (user?.role === 'employee') {
        const myEmp = empList.find((e) => e.id === localStorage.getItem(`my_employee_id_${user.id}`))
        if (myEmp) {
          setMyEmployeeId(myEmp.id)
          setEmployeeId(myEmp.id)
        } else {
          // Look up by profile_id
          const { data: empByProfile } = await supabase
            .from('employees')
            .select('id')
            .eq('profile_id', user.id)
            .single()
          if (empByProfile) {
            const me = empByProfile as { id: string }
            setMyEmployeeId(me.id)
            setEmployeeId(me.id)
            localStorage.setItem(`my_employee_id_${user.id}`, me.id)
          }
        }
      }

      // Calculate idle minutes using shared utility
      const apts = aptsRes.data ?? []
      setIdleMinutes(calculateIdleMinutes(empList, apts))
    } catch (err) {
      console.error('Error fetching online data, loading cache', err)
      // Centralized store already handles offline fallback
      const empList = useDataStore.getState().employees.data
      const svcList = useDataStore.getState().services.data
      setEmployees(empList as Employee[])
      setServices(svcList as Service[])
    } finally {
      setLoading(false)
    }
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

    // For employee role, always use their own ID
    const effectiveEmployeeId = user?.role === 'employee' && myEmployeeId
      ? myEmployeeId
      : employeeId || null

    const payload = {
      p_employee_id: effectiveEmployeeId,
      p_service_id: serviceId,
      p_price: parseFloat(amount),
      p_tip: tip ? parseFloat(tip) : 0,
      p_payment_method: paymentMethod,
    }

    if (!navigator.onLine) {
      useSyncStore.getState().enqueueAction('quick_entry_submit', payload)
      
      setSubmitting(false)
      setSuccess(true)
      resetTimerRef.current = setTimeout(() => {
        resetForm()
      }, 1500)
      return
    }

    // Always use RPC to bypass RLS for all roles
    const { error } = await supabase.rpc('quick_entry_submit', payload)

    setSubmitting(false)

    if (!error) {
      setSuccess(true)
      // Reload data so idle time resets
      loadData()
      resetTimerRef.current = setTimeout(() => {
        resetForm()
      }, 1500)
    } else {
      console.error('Submit error:', error)
      alert(`Error: ${error.message}`)
    }
  }

  function resetForm() {
    setEmployeeId(myEmployeeId || '')
    setServiceId('')
    setAmount('')
    setTip('')
    setPaymentMethod('cash')
    setStep('form')
    setSuccess(false)
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

  function formatIdle(minutes: number) {
    if (minutes >= 60) {
      const h = Math.floor(minutes / 60)
      const m = minutes % 60
      return `${t('appointments.idle')} ${h}h${m > 0 ? m + 'm' : ''}`
    }
    return `${t('appointments.idle')} ${minutes}m`
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

      {/* Offline Sync Status */}
      <div className="mt-4">
        <OfflineSyncBanner />
      </div>

      {/* Form Step */}
      {step === 'form' && (
        <div className="mt-6 space-y-6">
          {/* Employee card selection — hidden when logged in as employee */}
          {user?.role !== 'employee' && (
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-3">
              {t('quickEntry.selectEmployee')}
            </label>
            <div className="flex gap-4 overflow-x-auto pb-3 -mx-2 px-2" style={{ scrollbarWidth: 'none' }}>
              {employees.map((emp) => {
                const isSelected = employeeId === emp.id
                const idle = idleMinutes[emp.id]
                const isBusy = idle === null

                return (
                  <button
                    key={emp.id}
                    type="button"
                    onClick={() => setEmployeeId(emp.id)}
                    className={`flex-shrink-0 w-40 p-4 rounded-[1rem] text-center relative transition-all ${
                      isSelected
                        ? 'border-2 border-[#864e5a] shadow-[0_0_20px_rgba(134,78,90,0.15)]'
                        : 'opacity-80 border border-gray-200'
                    }`}
                    style={{
                      background: 'rgba(255, 248, 248, 0.6)',
                      backdropFilter: 'blur(12px)',
                    }}
                  >
                    {/* Badge Next - not shown in QuickEntry */}

                    {/* Avatar */}
                    <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center text-3xl mb-3 ${
                      isSelected
                        ? 'p-1 border-2 border-[#864e5a]'
                        : 'bg-gray-100'
                    }`}>
                      {getChibiEmoji(emp.name)}
                    </div>

                    {/* Name */}
                    <p className={`font-semibold text-base truncate ${
                      isSelected ? 'text-[#864e5a]' : 'text-gray-900'
                    }`}>
                      {emp.name.split(' ').slice(0, 2).join(' ')}
                    </p>

                    {/* Idle/Status */}
                    <p className={`text-xs mt-0.5 ${
                      isBusy ? 'text-amber-600' :
                      isSelected ? 'text-[#864e5a]/70' :
                      'text-gray-500'
                    }`}>
                      {isBusy
                        ? t('appointments.working')
                        : idle !== null && idle > 0
                          ? formatIdle(idle)
                          : t('appointments.ready')}
                    </p>
                  </button>
                )
              })}
            </div>
          </div>
          )}

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
                        <div className="w-6 h-6 rounded-full flex items-center justify-center text-sm bg-gray-100">
                          {getChibiEmoji(selectedEmployee.name)}
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
