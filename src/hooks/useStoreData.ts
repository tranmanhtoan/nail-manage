import { useEffect } from 'react'
import { useDataStore } from '@/store/dataStore'
import type { Employee, Service, Customer } from '@/lib/database.types'

/**
 * Centralized data hooks that wrap the dataStore.
 * Components should use these hooks instead of calling dataStore directly
 * or making their own supabase queries for shared master data.
 *
 * Benefits:
 * - Automatic fetch on mount (with SWR)
 * - Request deduplication across components
 * - Consistent offline fallback
 * - Single source of truth for employees/services/customers
 */

interface UseDataResult<T> {
  data: T[]
  loading: boolean
  refetch: () => Promise<T[]>
}

/**
 * Hook for accessing active employees with automatic fetch-on-mount.
 * Uses SWR caching - returns stale data immediately while refreshing in background.
 */
export function useEmployees(autoFetch = true): UseDataResult<Employee> {
  const employees = useDataStore((s) => s.employees)
  const fetchEmployees = useDataStore((s) => s.fetchEmployees)

  useEffect(() => {
    if (autoFetch) {
      fetchEmployees()
    }
  }, [autoFetch, fetchEmployees])

  return {
    data: employees.data,
    loading: employees.loading,
    refetch: () => fetchEmployees(true),
  }
}

/**
 * Hook for accessing active services with automatic fetch-on-mount.
 */
export function useServices(autoFetch = true): UseDataResult<Service> {
  const services = useDataStore((s) => s.services)
  const fetchServices = useDataStore((s) => s.fetchServices)

  useEffect(() => {
    if (autoFetch) {
      fetchServices()
    }
  }, [autoFetch, fetchServices])

  return {
    data: services.data,
    loading: services.loading,
    refetch: () => fetchServices(true),
  }
}

/**
 * Hook for accessing customers with automatic fetch-on-mount.
 */
export function useCustomers(autoFetch = true): UseDataResult<Customer> {
  const customers = useDataStore((s) => s.customers)
  const fetchCustomers = useDataStore((s) => s.fetchCustomers)

  useEffect(() => {
    if (autoFetch) {
      fetchCustomers()
    }
  }, [autoFetch, fetchCustomers])

  return {
    data: customers.data,
    loading: customers.loading,
    refetch: () => fetchCustomers(true),
  }
}

/**
 * Hook for loading both employees and services together (common in QuickEntry, CheckIn, etc.)
 * Fires both fetches in parallel and returns combined loading state.
 */
export function useEmployeesAndServices(): {
  employees: Employee[]
  services: Service[]
  loading: boolean
  refetch: () => Promise<void>
} {
  const employees = useDataStore((s) => s.employees)
  const services = useDataStore((s) => s.services)
  const fetchEmployees = useDataStore((s) => s.fetchEmployees)
  const fetchServices = useDataStore((s) => s.fetchServices)

  useEffect(() => {
    fetchEmployees()
    fetchServices()
  }, [fetchEmployees, fetchServices])

  return {
    employees: employees.data,
    services: services.data,
    loading: employees.loading || services.loading,
    refetch: async () => {
      await Promise.all([fetchEmployees(true), fetchServices(true)])
    },
  }
}
