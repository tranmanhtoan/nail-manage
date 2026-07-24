import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Plus, X } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import type { Service } from '@/lib/database.types'

const CATEGORIES = ['manicure', 'pedicure', 'gel', 'acrylic', 'dip', 'wax', 'other'] as const

export function Services() {
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

  const grouped = services.reduce((acc, s) => {
    const cat = s.category || 'other'
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(s)
    return acc
  }, {} as Record<string, Service[]>)

  return (
    <div className="max-w-lg mx-auto px-5 py-6 pb-24 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">{t('service.title')}</h2>
        <button
          onClick={() => { setEditing(null); setShowForm(true) }}
          className="flex items-center gap-1 bg-[#864e5a] text-white px-3 py-2 rounded-xl text-sm font-semibold"
        >
          <Plus size={16} /> {t('service.addNew')}
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
                <div className="flex items-center gap-3">
                  <p className={`font-bold ${svc.is_active ? 'text-[#864e5a]' : 'text-gray-400'}`}>${svc.price}</p>
                  {/* Toggle */}
                  <button
                    onClick={(e) => toggleActive(svc, e)}
                    className={`relative w-11 h-6 rounded-full transition-colors ${
                      svc.is_active ? 'bg-[#864e5a]' : 'bg-gray-300'
                    }`}
                  >
                    <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                      svc.is_active ? 'translate-x-[22px]' : 'translate-x-0.5'
                    }`} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {showForm && (
        <ServiceForm
          service={editing}
          onSave={save}
          onClose={() => { setShowForm(false); setEditing(null) }}
        />
      )}
    </div>
  )
}

function ServiceForm({ service, onSave, onClose }: {
  service: Service | null
  onSave: (form: Partial<Service>) => void
  onClose: () => void
}) {
  const { t } = useTranslation()
  const [name, setName] = useState(service?.name ?? '')
  const [category, setCategory] = useState(service?.category ?? 'manicure')
  const [price, setPrice] = useState(service?.price ?? 0)
  const [duration, setDuration] = useState(service?.duration_minutes ?? 30)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({ name, category, price, duration_minutes: duration, is_active: true })
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-[60] flex items-end sm:items-center justify-center">
      <div className="bg-white w-full max-w-md rounded-t-2xl sm:rounded-2xl p-6 pb-10 max-h-[90vh] overflow-y-auto modal-sheet">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold">{service ? t('common.edit') : t('service.addNew')}</h3>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600"><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700">{t('common.name')}</label>
            <input value={name} onChange={(e) => setName(e.target.value)} required
              className="w-full mt-1 px-4 py-3 rounded-xl border border-gray-200 focus:border-[#864e5a] outline-none" />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">{t('service.category')}</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)}
              className="w-full mt-1 px-4 py-3 rounded-xl border border-gray-200 focus:border-[#864e5a] outline-none">
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{t(`service.categories.${c}`)}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-gray-700">{t('service.price')} ($)</label>
              <input type="number" value={price} onChange={(e) => setPrice(+e.target.value)} min={0}
                className="w-full mt-1 px-4 py-3 rounded-xl border border-gray-200 focus:border-[#864e5a] outline-none" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">{t('service.duration')}</label>
              <input type="number" value={duration} onChange={(e) => setDuration(+e.target.value)} min={5} step={5}
                className="w-full mt-1 px-4 py-3 rounded-xl border border-gray-200 focus:border-[#864e5a] outline-none" />
            </div>
          </div>

          <button type="submit" className="w-full py-3 bg-[#864e5a] text-white font-semibold rounded-xl active:scale-[0.98] transition-transform">
            {t('common.save')}
          </button>
        </form>
      </div>
    </div>
  )
}
