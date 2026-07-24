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
