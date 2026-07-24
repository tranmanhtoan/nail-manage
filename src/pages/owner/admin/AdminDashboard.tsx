import { useEffect, useState } from 'react'
import { Users, Scissors, CalendarDays, UserCheck } from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface AdminStats {
  totalProfiles: number
  totalEmployees: number
  activeEmployees: number
  totalServices: number
  activeServices: number
  totalAppointments: number
  todayAppointments: number
  totalCustomers: number
}
