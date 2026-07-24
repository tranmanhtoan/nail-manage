import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Plus, X, ToggleLeft, ToggleRight, Trash2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import type { Service } from '@/lib/database.types'

const CATEGORIES = ['manicure', 'pedicure', 'gel', 'acrylic', 'dip', 'wax', 'other'] as const

export function AdminServices() {
  const { t } = useTranslation()
  const [services, setServices] = useState<Service[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Service | null>(null)

  useEffect(() => { load() }, [])

  async function load() {
    const { data } = await supabase.from('services').select('*').order('category').order('name')
    setServices((data as Service[]) ?? [])
  }
