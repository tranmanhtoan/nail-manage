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
