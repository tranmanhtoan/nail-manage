import { create } from 'zustand'
import type { UserRole } from '@/lib/database.types'
import { supabase } from '@/lib/supabase'
import { toAuthEmail } from '@/lib/auth-helpers'

interface AuthState {
  user: { id: string; email: string; role: UserRole; name: string } | null
  loading: boolean
  login: (email: string, password: string) => Promise<string | null>
  logout: () => Promise<void>
  checkSession: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,

  login: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email: toAuthEmail(email), password })
    if (error) return error.message

    const { data: profile } = await supabase
      .from('profiles')
      .select('role, full_name')
      .eq('id', data.user.id)
      .single()

    const p = profile as { role: UserRole; full_name: string } | null

    set({
      user: {
        id: data.user.id,
        email: data.user.email!,
        role: p?.role ?? 'employee',
        name: p?.full_name ?? '',
      },
    })
    return null
  },

  logout: async () => {
    await supabase.auth.signOut()
    set({ user: null })
  },

  checkSession: async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      set({ user: null, loading: false })
      return
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role, full_name')
      .eq('id', session.user.id)
      .single()

    const p = profile as { role: UserRole; full_name: string } | null

    set({
      user: {
        id: session.user.id,
        email: session.user.email!,
        role: p?.role ?? 'employee',
        name: p?.full_name ?? '',
      },
      loading: false,
    })
  },
}))
