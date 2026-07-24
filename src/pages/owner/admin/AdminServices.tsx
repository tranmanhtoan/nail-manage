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

  async function save(form: Partial<Service>) {
    if (editing) {
      await supabase.from('services').update(form).eq('id', editing.id)
    } else {
      await supabase.from('services').insert(form)
    }
    setShowForm(false)
    setEditing(null)
    load()
  }

  async function toggleActive(svc: Service, e: React.MouseEvent) {
    e.stopPropagation()
    await supabase.from('services').update({ is_active: !svc.is_active }).eq('id', svc.id)
    load()
  }

  async function deleteService(svc: Service, e: React.MouseEvent) {
    e.stopPropagation()
    if (!confirm(`Xóa dịch vụ "${svc.name}"?`)) return
    await supabase.from('services').delete().eq('id', svc.id)
    load()
  }

  const grouped = services.reduce((acc, s) => {
    const cat = s.category || 'other'
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(s)
    return acc
  }, {} as Record<string, Service[]>)

  return (
    <div className="px-5 py-6 pb-24 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Quản lý dịch vụ</h2>
        <button
          onClick={() => { setEditing(null); setShowForm(true) }}
          className="flex items-center gap-1 bg-[#864e5a] text-white px-3 py-2 rounded-xl text-sm font-semibold"
        >
          <Plus size={16} /> Thêm
        </button>
      </div>
