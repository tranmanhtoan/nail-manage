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

      {Object.entries(grouped).map(([cat, items]) => (
        <div key={cat}>
          <h3 className="text-[13px] font-semibold text-[#864e5a] uppercase tracking-widest mb-3">
            {t(`service.categories.${cat}` as `service.categories.${typeof CATEGORIES[number]}`)}
          </h3>
          <div className="space-y-3">
            {items.map((svc) => (
              <div
                key={svc.id}
                onClick={() => { setEditing(svc); setShowForm(true) }}
                className={`p-4 rounded-[1rem] flex justify-between items-center cursor-pointer active:scale-[0.98] transition-transform border-l-4 ${
                  svc.is_active ? 'border-[#864e5a]/30' : 'border-gray-300 opacity-60'
                }`}
                style={{
                  background: svc.is_active ? 'rgba(255, 248, 248, 0.6)' : 'rgba(245, 245, 245, 0.8)',
                  backdropFilter: 'blur(12px)',
                  borderRight: '1px solid rgba(134,78,90,0.1)',
                  borderTop: '1px solid rgba(134,78,90,0.1)',
                  borderBottom: '1px solid rgba(134,78,90,0.1)',
                }}
              >
                <div>
                  <p className={`font-semibold ${svc.is_active ? 'text-gray-900' : 'text-gray-400 line-through'}`}>{svc.name}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{svc.duration_minutes} min</p>
                </div>
                <div className="flex items-center gap-2">
                  <p className={`font-bold ${svc.is_active ? 'text-[#864e5a]' : 'text-gray-400'}`}>${svc.price}</p>
                  <button onClick={(e) => toggleActive(svc, e)}
                    className={`shrink-0 transition-colors ${svc.is_active ? 'text-[#864e5a]' : 'text-gray-300'}`}>
                    {svc.is_active ? <ToggleRight size={24} /> : <ToggleLeft size={24} />}
                  </button>
                  <button onClick={(e) => deleteService(svc, e)}
                    className="shrink-0 text-gray-300 hover:text-red-500 transition-colors">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
