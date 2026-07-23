// ponytail: lightweight types for app use. Full generated types come from
// `npx supabase gen types typescript` when connected to real DB.

export type PayType = 'commission' | 'fixed' | 'split'
export type AppointmentStatus = 'booked' | 'in_progress' | 'completed' | 'cancelled' | 'no_show'
export type UserRole = 'owner' | 'employee'

export interface Employee {
  id: string
  profile_id: string | null
  name: string
  phone: string | null
  email: string | null
  pay_type: PayType
  commission_rate: number | null
  fixed_salary: number | null
  split_rate: number | null
  is_active: boolean
  created_at: string
}

export interface Service {
  id: string
  name: string
  category: string
  price: number
  duration_minutes: number
  is_active: boolean
  created_at: string
}

export interface Customer {
  id: string
  name: string
  phone: string | null
  email: string | null
  notes: string | null
  created_at: string
}

export interface Appointment {
  id: string
  customer_id: string | null
  employee_id: string | null
  service_id: string
  status: AppointmentStatus
  price: number
  tip: number
  date: string
  time: string
  notes: string | null
  source: 'walk_in' | 'online'
  created_at: string
}
