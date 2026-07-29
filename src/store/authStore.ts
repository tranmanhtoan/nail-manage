import { create } from 'zustand'
import type { UserRole } from '@/lib/database.types'
import { supabase } from '@/lib/supabase'
import { toAuthEmail } from '@/lib/auth-helpers'

const UAT_MODE = import.meta.env.VITE_UAT_MODE === 'true'

interface AuthState {
  user: { id: string; email: string; role: UserRole; name: string } | null
  loading: boolean
  login: (email: string, password: string) => Promise<string | null>
  loginByProfile: (profileId: string) => Promise<string | null>
  logout: () => Promise<void>
  checkSession: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,

  login: async (email, password) => {
    if (UAT_MODE) {
      // In UAT mode, skip Supabase Auth — lookup profile by email
      // Email is passed directly (e.g. bd.nail@gmail.com) or as username (converted via toAuthEmail)
      const lookupEmail = email.includes('@') ? email : toAuthEmail(email)
      const { data: profile } = await supabase
        .from('profiles')
        .select('id, role, full_name, email')
        .eq('email', lookupEmail)
        .single()

      if (!profile) return 'Account not found'

      const p = profile as { id: string; role: UserRole; full_name: string; email: string }
      set({
        user: {
          id: p.id,
          email: p.email,
          role: p.role ?? 'employee',
          name: p.full_name ?? '',
        },
      })
      // Persist to sessionStorage for checkSession
      sessionStorage.setItem('uat_user', JSON.stringify({
        id: p.id,
        email: p.email,
        role: p.role ?? 'employee',
        name: p.full_name ?? '',
      }))
      return null
    }

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

  loginByProfile: async (profileId: string) => {
    // UAT shortcut: login directly by profile ID (no password needed)
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, email, role, full_name')
      .eq('id', profileId)
      .single()

    if (!profile) return 'Account not found'

    const p = profile as { id: string; email: string; role: UserRole; full_name: string }
    const user = {
      id: p.id,
      email: p.email ?? '',
      role: p.role ?? 'employee',
      name: p.full_name ?? '',
    }
    set({ user })
    sessionStorage.setItem('uat_user', JSON.stringify(user))
    return null
  },

  logout: async () => {
    if (UAT_MODE) {
      sessionStorage.removeItem('uat_user')
      set({ user: null })
      return
    }
    await supabase.auth.signOut()
    set({ user: null })
  },

  checkSession: async () => {
    if (UAT_MODE) {
      const stored = sessionStorage.getItem('uat_user')
      if (stored) {
        set({ user: JSON.parse(stored), loading: false })
      } else {
        set({ user: null, loading: false })
      }
      return
    }

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
