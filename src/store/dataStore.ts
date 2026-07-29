import { create } from 'zustand'
import { supabase } from '@/lib/supabase'
import type { Employee, Service, Customer } from '@/lib/database.types'

/**
 * Simple stale-while-revalidate data cache.
 * - Returns cached data immediately if available
 * - Fetches fresh data in background
 * - Tracks loading/stale state per resource
 * - Falls back to localStorage when offline
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
  } catch {
    // localStorage full — silently ignore
  }
}

const emptyCache = <T>(): CacheEntry<T> => ({ data: [], fetchedAt: 0, loading: false })

export const useDataStore = create<DataState>((set, get) => ({
  employees: emptyCache<Employee>(),
  services: emptyCache<Service>(),
  customers: emptyCache<Customer>(),

  fetchEmployees: async (force = false) => {
    const current = get().employees

    // Return cached if fresh and not forced
    if (!force && current.data.length > 0 && !isStale(current.fetchedAt)) {
      return current.data
    }

    // Return stale data immediately, fetch in background
    if (current.data.length > 0 && !current.loading) {
      set((s) => ({ employees: { ...s.employees, loading: true } }))
    } else if (current.data.length === 0) {
      // Try localStorage cache first
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
        .select('*')
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
  },

  fetchServices: async (force = false) => {
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
        .select('*')
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
  },

  fetchCustomers: async (force = false) => {
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
        .select('*')
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
