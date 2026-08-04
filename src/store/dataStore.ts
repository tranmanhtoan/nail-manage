import { create } from 'zustand'
import { supabase } from '@/lib/supabase'
import type { Employee, Service, Customer } from '@/lib/database.types'

/**
 * Centralized data store with:
 * - Stale-while-revalidate caching
 * - Request deduplication (prevents concurrent duplicate fetches)
 * - localStorage fallback for offline mode
 * - Consistent cache keys across the app
 */

const STALE_TIME = 5 * 60 * 1000 // 5 minutes

interface CacheEntry<T> {
  data: T[]
  fetchedAt: number
  loading: boolean
}

interface DataState {
  employees: CacheEntry<Employee>
  services: CacheEntry<Service>
  customers: CacheEntry<Customer>

  fetchEmployees: (force?: boolean) => Promise<Employee[]>
  fetchServices: (force?: boolean) => Promise<Service[]>
  fetchCustomers: (force?: boolean) => Promise<Customer[]>
  invalidate: (key: 'employees' | 'services' | 'customers') => void
  invalidateAll: () => void
}

function isStale(fetchedAt: number): boolean {
  return Date.now() - fetchedAt > STALE_TIME
}

function getCached<T>(key: string): T[] | null {
  try {
    const raw = localStorage.getItem(`cache_${key}`)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function setCache<T>(key: string, data: T[]): void {
  try {
    localStorage.setItem(`cache_${key}`, JSON.stringify(data))
    // Also update legacy keys used by QuickEntry/CheckIn for backward compat
    if (key === 'employees') localStorage.setItem('cached_employees', JSON.stringify(data))
    if (key === 'services') localStorage.setItem('cached_services', JSON.stringify(data))
  } catch {
    // localStorage full — silently ignore
  }
}

const emptyCache = <T>(): CacheEntry<T> => ({ data: [], fetchedAt: 0, loading: false })

/**
 * In-flight promise map for request deduplication.
 * If a fetch is already in progress for a resource, subsequent callers
 * get the same promise instead of firing a new network request.
 */
const inflightRequests = new Map<string, Promise<any>>()

function deduplicatedFetch<T>(key: string, fetchFn: () => Promise<T>): Promise<T> {
  const existing = inflightRequests.get(key)
  if (existing) return existing as Promise<T>

  const promise = fetchFn().finally(() => {
    inflightRequests.delete(key)
  })
  inflightRequests.set(key, promise)
  return promise
}

export const useDataStore = create<DataState>((set, get) => ({
  employees: emptyCache<Employee>(),
  services: emptyCache<Service>(),
  customers: emptyCache<Customer>(),

  fetchEmployees: (force = false) => {
    return deduplicatedFetch('employees', async () => {
      const current = get().employees

      // Return cached if fresh and not forced
      if (!force && current.data.length > 0 && !isStale(current.fetchedAt)) {
        return current.data
      }

      // Return stale data immediately, fetch in background
      if (current.data.length > 0 && !current.loading) {
        set((s) => ({ employees: { ...s.employees, loading: true } }))
      } else if (current.data.length === 0) {
        const cached = getCached<Employee>('employees')
        if (cached && cached.length > 0) {
          set({ employees: { data: cached, fetchedAt: 0, loading: true } })
        } else {
          set((s) => ({ employees: { ...s.employees, loading: true } }))
        }
      }

      if (!navigator.onLine) {
        const cached = getCached<Employee>('employees') || []
        set({ employees: { data: cached, fetchedAt: Date.now(), loading: false } })
        return cached
      }

      try {
        const { data, error } = await supabase
          .from('employees')
          .select('id, profile_id, name, phone, email, pay_type, commission_rate, fixed_salary, split_rate, rotation_order, is_active, activated_at, created_at')
          .eq('is_active', true)
          .order('rotation_order')

        if (error) throw error

        const employees = (data ?? []) as Employee[]
        setCache('employees', employees)
        set({ employees: { data: employees, fetchedAt: Date.now(), loading: false } })
        return employees
      } catch (err) {
        console.error('fetchEmployees error:', err)
        set((s) => ({ employees: { ...s.employees, loading: false } }))
        return get().employees.data
      }
    })
  },

  fetchServices: (force = false) => {
    return deduplicatedFetch('services', async () => {
      const current = get().services

      if (!force && current.data.length > 0 && !isStale(current.fetchedAt)) {
        return current.data
      }

      if (current.data.length > 0 && !current.loading) {
        set((s) => ({ services: { ...s.services, loading: true } }))
      } else if (current.data.length === 0) {
        const cached = getCached<Service>('services')
        if (cached && cached.length > 0) {
          set({ services: { data: cached, fetchedAt: 0, loading: true } })
        } else {
          set((s) => ({ services: { ...s.services, loading: true } }))
        }
      }

      if (!navigator.onLine) {
        const cached = getCached<Service>('services') || []
        set({ services: { data: cached, fetchedAt: Date.now(), loading: false } })
        return cached
      }

      try {
        const { data, error } = await supabase
          .from('services')
          .select('id, name, category, price, duration_minutes, is_active')
          .eq('is_active', true)
          .order('name')

        if (error) throw error

        const services = (data ?? []) as Service[]
        setCache('services', services)
        set({ services: { data: services, fetchedAt: Date.now(), loading: false } })
        return services
      } catch (err) {
        console.error('fetchServices error:', err)
        set((s) => ({ services: { ...s.services, loading: false } }))
        return get().services.data
      }
    })
  },

  fetchCustomers: (force = false) => {
    return deduplicatedFetch('customers', async () => {
      const current = get().customers

      if (!force && current.data.length > 0 && !isStale(current.fetchedAt)) {
        return current.data
      }

      if (current.data.length > 0 && !current.loading) {
        set((s) => ({ customers: { ...s.customers, loading: true } }))
      } else if (current.data.length === 0) {
        const cached = getCached<Customer>('customers')
        if (cached && cached.length > 0) {
          set({ customers: { data: cached, fetchedAt: 0, loading: true } })
        } else {
          set((s) => ({ customers: { ...s.customers, loading: true } }))
        }
      }

      if (!navigator.onLine) {
        const cached = getCached<Customer>('customers') || []
        set({ customers: { data: cached, fetchedAt: Date.now(), loading: false } })
        return cached
      }

      try {
        const { data, error } = await supabase
          .from('customers')
          .select('id, name, phone, email, notes')
          .order('name')

        if (error) throw error

        const customers = (data ?? []) as Customer[]
        setCache('customers', customers)
        set({ customers: { data: customers, fetchedAt: Date.now(), loading: false } })
        return customers
      } catch (err) {
        console.error('fetchCustomers error:', err)
        set((s) => ({ customers: { ...s.customers, loading: false } }))
        return get().customers.data
      }
    })
  },

  invalidate: (key) => {
    set({ [key]: emptyCache() })
  },

  invalidateAll: () => {
    set({
      employees: emptyCache(),
      services: emptyCache(),
      customers: emptyCache(),
    })
  },
}))
