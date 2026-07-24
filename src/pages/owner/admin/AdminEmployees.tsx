import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Plus, X, KeyRound, User, Check, Copy, Loader2 } from 'lucide-react'
import { supabase, supabaseAdmin } from '@/lib/supabase'
import { toAuthEmail } from '@/lib/auth-helpers'
import type { Employee, PayType } from '@/lib/database.types'

export function AdminEmployees() {
  const { t } = useTranslation()
  const [employees, setEmployees] = useState<Employee[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Employee | null>(null)
  const [showResetPassword, setShowResetPassword] = useState<Employee | null>(null)
  const [newPassword, setNewPassword] = useState('')
  const [resetLoading, setResetLoading] = useState(false)
  const [resetSuccess, setResetSuccess] = useState(false)

  useEffect(() => { load() }, [])

  async function load() {
    const { data } = await supabase.from('employees').select('*').order('name')
    setEmployees((data as Employee[]) ?? [])
  }

  async function save(form: Partial<Employee> & { create_username?: string }) {
    const { create_username, ...empData } = form

    if (editing) {
      await supabase.from('employees').update(empData).eq('id', editing.id)
    } else {
      // Create new employee with login account
      const loginId = create_username || empData.name?.toLowerCase().replace(/[^a-z0-9]/g, '') || 'employee'
      const tempPassword = generateTempPassword()
      const authEmail = toAuthEmail(loginId)

      const { data: signUpData, error: signUpError } = await supabaseAdmin.auth.signUp({
        email: authEmail,
        password: tempPassword,
        options: { data: { full_name: empData.name, role: 'employee' } },
      })

      if (signUpError) {
        alert(`Lỗi tạo tài khoản: ${signUpError.message}`)
        return
      }

      const userId = signUpData.user?.id
      const hasIdentities = (signUpData.user?.identities?.length ?? 0) > 0

      if (userId && hasIdentities) {
        await supabase.from('employees').insert({ ...empData, profile_id: userId })
        alert(`Tạo thành công!\nLogin: ${loginId}\nPassword: ${tempPassword}`)
      } else {
        await supabase.from('employees').insert(empData)
        alert(`Tài khoản "${loginId}" đã tồn tại. NV được tạo nhưng chưa link.`)
      }
    }
    setShowForm(false)
    setEditing(null)
    load()
  }

  async function resetPassword(emp: Employee) {
    if (!emp.profile_id) {
      alert('Nhân viên chưa có tài khoản đăng nhập')
      return
    }
    setResetLoading(true)
    const pass = newPassword || generateTempPassword()

    const { error } = await supabaseAdmin.auth.admin.updateUserById(emp.profile_id, {
      password: pass,
    })

    if (error) {
      alert(`Lỗi đổi password: ${error.message}`)
      setResetLoading(false)
      return
    }

    setNewPassword(pass)
    setResetLoading(false)
    setResetSuccess(true)
  }

  return (
    <div className="px-5 py-6 pb-24 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Quản lý nhân viên</h2>
        <button
          onClick={() => { setEditing(null); setShowForm(true) }}
          className="flex items-center gap-1 bg-[#864e5a] text-white px-3 py-2 rounded-xl text-sm font-semibold"
        >
          <Plus size={16} /> Thêm
        </button>
      </div>

      {/* Employee list */}
      <div className="space-y-3">
        {employees.map((emp) => (
          <div
            key={emp.id}
            className={`p-4 rounded-[1rem] border-l-4 ${
              emp.is_active ? 'border-[#864e5a]/30' : 'border-gray-300 opacity-60'
            }`}
            style={{
              background: emp.is_active ? 'rgba(255, 248, 248, 0.6)' : 'rgba(245, 245, 245, 0.8)',
              backdropFilter: 'blur(12px)',
              borderRight: '1px solid rgba(134,78,90,0.1)',
              borderTop: '1px solid rgba(134,78,90,0.1)',
              borderBottom: '1px solid rgba(134,78,90,0.1)',
            }}
          >
            <div className="flex items-center justify-between">
              <div className="min-w-0">
                <p className="font-semibold text-gray-900 truncate">{emp.name}</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {emp.pay_type === 'commission' && `Commission ${emp.commission_rate}%`}
                  {emp.pay_type === 'fixed' && `Fixed $${emp.fixed_salary}/wk`}
                  {emp.pay_type === 'split' && `Split ${emp.split_rate}%`}
                  {!emp.profile_id && <span className="ml-2 text-amber-600">• Chưa có tài khoản</span>}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => { setShowResetPassword(emp); setNewPassword(''); setResetSuccess(false) }}
                  className="p-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-amber-50 hover:text-amber-700"
                  title="Đổi password"
                >
                  <KeyRound size={16} />
                </button>
                <button
                  onClick={() => { setEditing(emp); setShowForm(true) }}
                  className="p-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-[#864e5a]/10 hover:text-[#864e5a]"
                  title="Sửa"
                >
                  <User size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Edit form modal */}
      {showForm && (
        <EmployeeForm
          employee={editing}
          onSave={save}
          onClose={() => { setShowForm(false); setEditing(null) }}
        />
      )}

      {/* Reset password modal */}
      {showResetPassword && (
        <div className="fixed inset-0 bg-black/40 z-[60] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">Đổi mật khẩu</h3>
              <button onClick={() => setShowResetPassword(null)} className="p-1 text-gray-400">
                <X size={20} />
              </button>
            </div>

            <p className="text-sm text-gray-600">
              Nhân viên: <strong>{showResetPassword.name}</strong>
            </p>

            {!resetSuccess ? (
              <>
                <div>
                  <label className="text-sm font-medium text-gray-700">Mật khẩu mới</label>
                  <input
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Để trống = tạo tự động"
                    className="w-full mt-1 px-4 py-3 rounded-xl border border-gray-200 focus:border-[#864e5a] outline-none"
                  />
                </div>
                <button
                  onClick={() => resetPassword(showResetPassword)}
                  disabled={resetLoading}
                  className="w-full py-3 bg-[#864e5a] text-white font-semibold rounded-xl disabled:opacity-50"
                >
                  {resetLoading ? <Loader2 className="animate-spin mx-auto" size={20} /> : 'Đổi mật khẩu'}
                </button>
              </>
            ) : (
              <PasswordResult password={newPassword} onClose={() => setShowResetPassword(null)} />
            )}
          </div>
        </div>
      )}
    </div>
  )
}
