import { useEffect, useState, useCallback, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Plus, Search, X, ChevronDown } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import type { Customer } from '@/lib/database.types'
import type { TablesInsert } from '@/lib/database.generated'

const PAGE_SIZE = 30

export function Customers() {
  const { t } = useTranslation()
  const [customers, setCustomers] = useState<Customer[]>([])
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Customer | null>(null)
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [totalCount, setTotalCount] = useState(0)
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => { load(true) }, [])

  // Debounced server-side search
  useEffect(() => {
    if (searchTimeout.current) clearTimeout(searchTimeout.current)
    searchTimeout.current = setTimeout(() => {
      load(true)
    }, 300)
    return () => {
      if (searchTimeout.current) clearTimeout(searchTimeout.current)
    }
  }, [search])

  const load = useCallback(async (reset = false) => {
    setLoading(true)
    const offset = reset ? 0 : customers.length

    let query = supabase
      .from('customers')
      .select('id, name, phone, email, notes', { count: 'exact' })
      .order('name')
      .range(offset, offset + PAGE_SIZE - 1)

    // Server-side search filtering (uses Supabase ilike for indexed search)
    if (search.trim()) {
      const term = `%${search.trim()}%`
      query = query.or(`name.ilike.${term},phone.ilike.${term}`)
    }

    const { data, count } = await query
    const rows = (data as Customer[]) ?? []

    if (reset) {
      setCustomers(rows)
    } else {
      setCustomers((prev) => [...prev, ...rows])
    }
    setTotalCount(count ?? 0)
    setHasMore(rows.length === PAGE_SIZE)
    setLoading(false)
  }, [search, customers.length])

  async function save(form: Partial<Customer>) {
    if (editing) {
      await supabase.from('customers').update(form).eq('id', editing.id)
    } else {
      await supabase.from('customers').insert(form as TablesInsert<'customers'>)
    }
    setShowForm(false)
    setEditing(null)
    load(true)
  }

  return (
    <div className="max-w-lg mx-auto px-5 py-6 pb-24 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">
          {t('customer.title')}
          {totalCount > 0 && <span className="text-sm font-normal text-gray-400 ml-2">({totalCount})</span>}
        </h2>
        <button
          onClick={() => { setEditing(null); setShowForm(true) }}
          className="flex items-center gap-1 bg-[#864e5a] text-white px-3 py-2 rounded-xl text-sm font-semibold"
        >
          <Plus size={16} /> {t('customer.addNew')}
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={18} className="absolute left-3 top-3.5 text-gray-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t('common.search')}
          className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-[#864e5a] outline-none"
        />
      </div>

      {/* Customer List */}
      <div className="space-y-3 max-h-[60vh] overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
        {customers.map((cust) => (
          <div
            key={cust.id}
            onClick={() => { setEditing(cust); setShowForm(true) }}
            className="p-4 rounded-[1rem] cursor-pointer active:scale-[0.98] transition-transform border-l-4 border-[#864e5a]/30"
            style={{
              background: 'rgba(255, 248, 248, 0.6)',
              backdropFilter: 'blur(12px)',
              borderRight: '1px solid rgba(134,78,90,0.1)',
              borderTop: '1px solid rgba(134,78,90,0.1)',
              borderBottom: '1px solid rgba(134,78,90,0.1)',
            }}
          >
            <p className="font-semibold text-gray-900">{cust.name}</p>
            <p className="text-xs text-gray-500 mt-0.5">{cust.phone}</p>
            {cust.notes && <p className="text-xs text-gray-400 mt-1">{cust.notes}</p>}
          </div>
        ))}

        {/* Load more button */}
        {hasMore && !loading && customers.length > 0 && (
          <button
            onClick={() => load(false)}
            className="w-full py-3 text-sm text-[#864e5a] font-medium flex items-center justify-center gap-1"
          >
            <ChevronDown size={16} /> {t('common.loadMore') || 'Load more'}
          </button>
        )}

        {loading && (
          <p className="text-center text-gray-400 py-4 text-sm animate-pulse">Loading...</p>
        )}

        {!loading && customers.length === 0 && (
          <p className="text-center text-gray-400 py-8">{t('common.noData') || 'No results'}</p>
        )}
      </div>

      {showForm && (
        <CustomerForm
          customer={editing}
          onSave={save}
          onClose={() => { setShowForm(false); setEditing(null) }}
        />
      )}
    </div>
  )
}

function CustomerForm({ customer, onSave, onClose }: {
  customer: Customer | null
  onSave: (form: Partial<Customer>) => void
  onClose: () => void
}) {
  const { t } = useTranslation()
  const [name, setName] = useState(customer?.name ?? '')
  const [phone, setPhone] = useState(customer?.phone ?? '')
  const [email, setEmail] = useState(customer?.email ?? '')
  const [notes, setNotes] = useState(customer?.notes ?? '')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({ name, phone: phone || null, email: email || null, notes: notes || null })
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-[60] flex items-end sm:items-center justify-center">
      <div className="bg-white w-full max-w-md rounded-t-2xl sm:rounded-2xl p-6 pb-10 max-h-[90vh] overflow-y-auto modal-sheet">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold">{customer ? t('common.edit') : t('customer.addNew')}</h3>
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
            <input value={phone ?? ''} onChange={(e) => setPhone(e.target.value)} type="tel"
              className="w-full mt-1 px-4 py-3 rounded-xl border border-gray-200 focus:border-[#864e5a] outline-none" />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">{t('common.email')}</label>
            <input value={email ?? ''} onChange={(e) => setEmail(e.target.value)} type="email"
              className="w-full mt-1 px-4 py-3 rounded-xl border border-gray-200 focus:border-[#864e5a] outline-none" />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">{t('common.notes')}</label>
            <textarea value={notes ?? ''} onChange={(e) => setNotes(e.target.value)} rows={2}
              className="w-full mt-1 px-4 py-3 rounded-xl border border-gray-200 focus:border-[#864e5a] outline-none resize-none" />
          </div>
          <button type="submit" className="w-full py-3 bg-[#864e5a] text-white font-semibold rounded-xl active:scale-[0.98] transition-transform">
            {t('common.save')}
          </button>
        </form>
      </div>
    </div>
  )
}
