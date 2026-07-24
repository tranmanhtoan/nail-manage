import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Plus, X, Mail, Copy, Check, User } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { toAuthEmail } from '@/lib/auth-helpers'
import type { Employee, PayType } from '@/lib/database.types'

export function Employees() {
  const { t } = useTranslation()
  const [employees, setEmployees] = useState<Employee[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Employee | null>(null)
  const [createdCreds, setCreatedCreds] = useState<{ login: string; password: string } | null>(null)
  const [bulkCreds, setBulkCreds] = useState<{ login: string; password: string; name: string }[] | null>(null)

  useEffect(() => { load() }, [])

  async function load() {
    const { data } = await supabase.from('employees').select('*').order('name')
    setEmployees((data as Employee[]) ?? [])
  }

  async function save(form: Partial<Employee> & { create_username?: string; create_email?: string }) {
    const { create_username, create_email, ...empData } = form

    if (editing) {
      // If editing an employee without a profile, create one now
      if (!editing.profile_id) {
        const loginId = empData.name?.toLowerCase().replace(/[^a-z0-9]/g, '') || editing.name.toLowerCase().replace(/[^a-z0-9]/g, '')
        const tempPassword = generateTempPassword()
        const authEmail = toAuthEmail(loginId)

        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email: authEmail,
          password: tempPassword,
          options: {
            data: { full_name: empData.name || editing.name, role: 'employee' },
            emailRedirectTo: window.location.origin,
          },
        })

        if (!signUpError && signUpData.user) {
          await supabase.from('employees').update({ ...empData, profile_id: signUpData.user.id }).eq('id', editing.id)
          setCreatedCreds({ login: loginId, password: tempPassword })
        } else {
          await supabase.from('employees').update(empData).eq('id', editing.id)
          if (signUpError) alert(`Lỗi tạo tài khoản: ${signUpError.message}`)
        }
      } else {
        await supabase.from('employees').update(empData).eq('id', editing.id)
      }

      setShowForm(false)
      setEditing(null)
      load()
      return
    }

    // Creating new employee — always create login account
    const loginId = create_username || empData.name?.toLowerCase().replace(/[^a-z0-9]/g, '') || 'employee'
    const tempPassword = generateTempPassword()
    const authEmail = create_email ? create_email : toAuthEmail(loginId)

    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: authEmail,
      password: tempPassword,
      options: {
        data: { full_name: empData.name, role: 'employee' },
        emailRedirectTo: window.location.origin,
      },
    })

    if (signUpError) {
      alert(`Lỗi tạo tài khoản: ${signUpError.message}`)
      return
    }

    const profileId = signUpData.user?.id ?? null
    await supabase.from('employees').insert({ ...empData, profile_id: profileId })

    setCreatedCreds({ login: create_email || loginId, password: tempPassword })
    setShowForm(false)
    setEditing(null)
    load()
  }

  const missingProfiles = employees.filter((e) => !e.profile_id && e.is_active)

  async function createMissingAccounts() {
    if (!confirm(`Tạo tài khoản đăng nhập cho ${missingProfiles.length} nhân viên chưa có?`)) return

    const results: { login: string; password: string; name: string }[] = []

    for (const emp of missingProfiles) {
      const loginId = emp.name.toLowerCase().replace(/[^a-z0-9]/g, '')
      const tempPassword = generateTempPassword()
      const authEmail = toAuthEmail(loginId)

      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: authEmail,
        password: tempPassword,
        options: {
          data: { full_name: emp.name, role: 'employee' },
          emailRedirectTo: window.location.origin,
        },
      })

      if (!signUpError && signUpData.user) {
        await supabase.from('employees').update({ profile_id: signUpData.user.id }).eq('id', emp.id)
        results.push({ login: loginId, password: tempPassword, name: emp.name })
      }
    }

    if (results.length > 0) {
      setBulkCreds(results)
    }
    load()
  }

  return (
    <div className="max-w-lg mx-auto px-5 py-6 pb-24 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">{t('employee.title')}</h2>
        <button
          onClick={() => { setEditing(null); setShowForm(true) }}
          className="flex items-center gap-1 bg-[#864e5a] text-white px-3 py-2 rounded-xl text-sm font-semibold"
        >
          <Plus size={16} /> {t('employee.addNew')}
        </button>
      </div>

      {/* Banner: create accounts for employees missing profiles */}
      {missingProfiles.length > 0 && (
        <button
          onClick={createMissingAccounts}
          className="w-full p-3 rounded-xl bg-amber-50 border border-amber-200 text-sm text-amber-800 font-medium text-left"
        >
          ⚠️ {missingProfiles.length} nhân viên chưa có tài khoản đăng nhập. Bấm để tạo tất cả.
        </button>
      )}

      <div className="space-y-3">
        {employees.map((emp) => (
          <div
            key={emp.id}
            onClick={() => { setEditing(emp); setShowForm(true) }}
            className="p-4 rounded-[1rem] flex items-center justify-between cursor-pointer active:scale-[0.98] transition-transform border-l-4 border-[#864e5a]/30"
            style={{
              background: 'rgba(255, 248, 248, 0.6)',
              backdropFilter: 'blur(12px)',
              borderRight: '1px solid rgba(134,78,90,0.1)',
              borderTop: '1px solid rgba(134,78,90,0.1)',
              borderBottom: '1px solid rgba(134,78,90,0.1)',
            }}
          >
            <div>
              <p className="font-semibold text-gray-900">{emp.name}</p>
              <p className="text-xs text-gray-500 mt-0.5">{emp.phone}</p>
            </div>
            <div className="text-right text-xs">
              <span className={`inline-block px-2.5 py-1 rounded-full font-semibold ${emp.is_active ? 'bg-[#864e5a]/10 text-[#864e5a]' : 'bg-gray-100 text-gray-500'}`}>
                {emp.is_active ? 'Active' : 'Inactive'}
              </span>
              <p className="text-gray-500 mt-1.5">
                {emp.pay_type === 'commission' && `${emp.commission_rate}%`}
                {emp.pay_type === 'fixed' && `$${emp.fixed_salary}/wk`}
                {emp.pay_type === 'split' && `${emp.split_rate}%`}
              </p>
            </div>
          </div>
        ))}
      </div>

      {showForm && (
        <EmployeeForm
          employee={editing}
          onSave={save}
          onClose={() => { setShowForm(false); setEditing(null) }}
        />
      )}

      {createdCreds && (
        <CredsModal creds={createdCreds} onClose={() => setCreatedCreds(null)} />
      )}

      {bulkCreds && (
        <BulkCredsModal creds={bulkCreds} onClose={() => setBulkCreds(null)} />
      )}
    </div>
  )
}

function CredsModal({ creds, onClose }: { creds: { login: string; password: string }; onClose: () => void }) {
  const [copied, setCopied] = useState(false)

  const copyAll = () => {
    navigator.clipboard.writeText(`Login: ${creds.login}\nPassword: ${creds.password}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-[60] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-sm rounded-2xl p-6 space-y-4">
        <h3 className="text-lg font-bold text-center text-gray-900">Tạo thành công!</h3>
        <p className="text-sm text-gray-600 text-center">
          Đưa thông tin này cho nhân viên để đăng nhập:
        </p>

        <div
          className="rounded-[1rem] p-4 space-y-2 font-mono text-sm border border-[rgba(134,78,90,0.1)]"
          style={{ background: 'rgba(255, 248, 248, 0.6)', backdropFilter: 'blur(12px)' }}
        >
          <div className="flex justify-between">
            <span className="text-gray-500">Login:</span>
            <span className="font-medium text-gray-900">{creds.login}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Password:</span>
            <span className="font-medium text-gray-900">{creds.password}</span>
          </div>
        </div>

        <button
          onClick={copyAll}
          className="w-full py-3 bg-gray-100 rounded-xl text-sm font-medium flex items-center justify-center gap-2"
        >
          {copied ? <><Check size={16} className="text-[#864e5a]" /> Copied!</> : <><Copy size={16} /> Copy thông tin</>}
        </button>

        <p className="text-xs text-[#864e5a] text-center font-medium">
          Nhắc nhân viên đổi password sau khi đăng nhập lần đầu
        </p>

        <button onClick={onClose} className="w-full py-3 bg-[#864e5a] text-white font-semibold rounded-xl">
          Đóng
        </button>
      </div>
    </div>
  )
}

function EmployeeForm({ employee, onSave, onClose }: {
  employee: Employee | null
  onSave: (form: Partial<Employee> & { create_username?: string; create_email?: string }) => void
  onClose: () => void
}) {
  const { t } = useTranslation()
  const [name, setName] = useState(employee?.name ?? '')
  const [phone, setPhone] = useState(employee?.phone ?? '')
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState(employee?.email ?? '')
  const [payType, setPayType] = useState<PayType>(employee?.pay_type ?? 'commission')
  const [commissionRate, setCommissionRate] = useState(employee?.commission_rate ?? 60)
  const [fixedSalary, setFixedSalary] = useState(employee?.fixed_salary ?? 0)
  const [splitRate, setSplitRate] = useState(employee?.split_rate ?? 60)
  const [isActive, setIsActive] = useState(employee?.is_active ?? true)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({
      name, phone, email: email || null,
      pay_type: payType,
      commission_rate: payType === 'commission' ? commissionRate : null,
      fixed_salary: payType === 'fixed' ? fixedSalary : null,
      split_rate: payType === 'split' ? splitRate : null,
      is_active: isActive,
      ...(!employee && username ? { create_username: username } : {}),
      ...(!employee && !username && email ? { create_email: email } : {}),
    })
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-[60] flex items-end sm:items-center justify-center">
      <div className="bg-white w-full max-w-md rounded-t-2xl sm:rounded-2xl p-6 pb-10 max-h-[90vh] overflow-y-auto modal-sheet">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold">{employee ? t('common.edit') : t('employee.addNew')}</h3>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600"><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700">{t('common.name')}</label>
            <input value={name} onChange={(e) => setName(e.target.value)} required
              className="w-full mt-1 px-4 py-3 rounded-xl border border-gray-200 focus:border-[#864e5a] outline-none" />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">{t('common.phone')}</label>
            <input value={phone ?? ''} onChange={(e) => setPhone(e.target.value)}
              className="w-full mt-1 px-4 py-3 rounded-xl border border-gray-200 focus:border-[#864e5a] outline-none" />
          </div>

          {!employee && (
            <div>
              <label className="text-sm font-medium text-gray-700">
                {t('auth.username')} <span className="text-gray-400 font-normal">(đăng nhập)</span>
              </label>
              <div className="relative">
                <User size={18} className="absolute left-3 top-3.5 text-gray-400" />
                <input
                  value={username}
                  onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9._-]/g, ''))}
                  placeholder="vd: anna, minh.nguyen"
                  autoCapitalize="none"
                  autoCorrect="off"
                  className="w-full mt-1 pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-[#864e5a] outline-none"
                />
              </div>
              {username && (
                <p className="text-xs text-[#864e5a] mt-1 font-medium">
                  NV đăng nhập bằng: <strong>{username}</strong> + password tạm
                </p>
              )}
            </div>
          )}

          <div>
            <label className="text-sm font-medium text-gray-700">
              {t('common.email')} <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <div className="relative">
              <Mail size={18} className="absolute left-3 top-3.5 text-gray-400" />
              <input
                value={email ?? ''}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                placeholder="optional"
                className="w-full mt-1 pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-[#864e5a] outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">{t('employee.payType')}</label>
            <select value={payType} onChange={(e) => setPayType(e.target.value as PayType)}
              className="w-full mt-1 px-4 py-3 rounded-xl border border-gray-200 focus:border-[#864e5a] outline-none">
              <option value="commission">{t('employee.payTypes.commission')}</option>
              <option value="fixed">{t('employee.payTypes.fixed')}</option>
              <option value="split">{t('employee.payTypes.split')}</option>
            </select>
          </div>

          {payType === 'commission' && (
            <div>
              <label className="text-sm font-medium text-gray-700">{t('employee.commissionRate')} (%)</label>
              <input type="number" value={commissionRate ?? 0} onChange={(e) => setCommissionRate(+e.target.value)}
                min={0} max={100}
                className="w-full mt-1 px-4 py-3 rounded-xl border border-gray-200 focus:border-[#864e5a] outline-none" />
            </div>
          )}

          {payType === 'fixed' && (
            <div>
              <label className="text-sm font-medium text-gray-700">{t('employee.salary')} ($/week)</label>
              <input type="number" value={fixedSalary ?? 0} onChange={(e) => setFixedSalary(+e.target.value)}
                className="w-full mt-1 px-4 py-3 rounded-xl border border-gray-200 focus:border-[#864e5a] outline-none" />
            </div>
          )}

          {payType === 'split' && (
            <div>
              <label className="text-sm font-medium text-gray-700">{t('employee.splitRate')} (% cho NV)</label>
              <input type="number" value={splitRate ?? 0} onChange={(e) => setSplitRate(+e.target.value)}
                min={0} max={100}
                className="w-full mt-1 px-4 py-3 rounded-xl border border-gray-200 focus:border-[#864e5a] outline-none" />
            </div>
          )}

          <div className="flex items-center gap-2">
            <input type="checkbox" id="active" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} className="rounded accent-[#864e5a]" />
            <label htmlFor="active" className="text-sm">Active</label>
          </div>

          <button type="submit" className="w-full py-3 bg-[#864e5a] text-white font-semibold rounded-xl active:scale-[0.98] transition-transform">
            {t('common.save')}
          </button>
        </form>
      </div>
    </div>
  )
}

function generateTempPassword(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let pass = ''
  for (let i = 0; i < 6; i++) {
    pass += chars[Math.floor(Math.random() * chars.length)]
  }
  return pass
}
