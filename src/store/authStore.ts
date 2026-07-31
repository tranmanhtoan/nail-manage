import { create } from 'zustand'
import type { UserRole } from '@/lib/database.types'
import { supabase, stopAuthListener } from '@/lib/supabase'
import { toAuthEmail } from '@/lib/auth-helpers'

const UAT_MODE = import.meta.env.VITE_UAT_MODE === 'true'

interface AuthState {
  user: { id: string; email: string; role: UserRole; name: string } | null
  loading: boolean
  login: (email: string, password: string) => Promise<string | null>
  loginByProfile: (profileId: string, pin: string) => Promise<string | null>
  logout: () => Promise<void>
  checkSession: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,

  login: async (email, password) => {
    if (UAT_MODE) {
      // In UAT mode, skip Supabase Auth — lookup profile by email
      const lookupEmail = email.includes('@') ? email : toAuthEmail(email)
      const { data: profile } = await supabase
        .from('profiles')
        .select('id, role, full_name, email')
        .eq('email', lookupEmail)
        .single()

      if (!profile) return 'Account not found'

      const p = profile as { id: string; role: UserRole; full_name: string; email: string }
      const user = {
        id: p.id,
        email: p.email,
        role: p.role ?? 'employee',
        name: p.full_name ?? '',
      }
      set({ user })
      localStorage.setItem('uat_user', JSON.stringify(user))
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
    const user = {
      id: data.user.id,
      email: data.user.email!,
      role: p?.role ?? 'employee',
      name: p?.full_name ?? '',
    }

    set({ user })
    sessionStorage.setItem('sb_user_profile', JSON.stringify(user))
    return null
  },

  loginByProfile: async (profileId: string, pin: string) => {
    // 1. Verify PIN via RPC
    const { data: isValid, error: verifyErr } = await supabase.rpc('verify_profile_pin', {
      p_id: profileId,
      p_pin: pin,
    })

    if (verifyErr) return `Verification error: ${verifyErr.message}`
    if (!isValid) return 'PIN không đúng'

    if (UAT_MODE) {
      // In UAT mode, bypass Supabase Auth — fetch profile details and set user state
      const { data: profile } = await supabase
        .from('profiles')
        .select('id, role, full_name, email')
        .eq('id', profileId)
        .single()

      if (!profile) return 'Account not found'
      const p = profile as { id: string; role: UserRole; full_name: string; email: string }
      const user = {
        id: p.id,
        email: p.email,
        role: p.role ?? 'employee',
        name: p.full_name ?? '',
      }
      set({ user })
      localStorage.setItem('uat_user', JSON.stringify(user))
      return null
    }

    // 2. Production: get email and sign in
    const { data: email, error: emailErr } = await supabase.rpc('get_login_email', { profile_id: profileId })
    if (emailErr || !email) return `Cannot find email for login: ${emailErr?.message || 'no email'}`

    const { data, error: authErr } = await supabase.auth.signInWithPassword({
      email,
      password: pin,
    })

    if (authErr) return authErr.message

    const { data: profile } = await supabase
      .from('profiles')
      .select('role, full_name')
      .eq('id', data.user.id)
      .single()

    const p = profile as { role: UserRole; full_name: string } | null
    const user = {
      id: data.user.id,
      email: data.user.email!,
      role: p?.role ?? 'employee',
      name: p?.full_name ?? '',
    }

    set({ user })
    sessionStorage.setItem('sb_user_profile', JSON.stringify(user))
    return null
  },

  logout: async () => {
    // Stop session check interval to prevent memory leak
    stopAuthListener()

    if (UAT_MODE) {
      localStorage.removeItem('uat_user')
      set({ user: null })
      return
    }
    sessionStorage.removeItem('sb_user_profile')
    await supabase.auth.signOut()
    set({ user: null })
  },

  checkSession: async () => {
    if (UAT_MODE) {
      try {
        const stored = localStorage.getItem('uat_user')
        if (stored) {
          set({ user: JSON.parse(stored), loading: false })
        } else {
          set({ user: null, loading: false })
        }
      } catch {
        set({ user: null, loading: false })
      }
      return
    }

    // Tối ưu hóa: tải ngay lập tức từ sessionStorage trước để tránh bị đơ màn hình loading
    let cachedProfile: string | null = null
    try {
      cachedProfile = sessionStorage.getItem('sb_user_profile')
    } catch { /* storage unavailable */ }

    if (cachedProfile) {
      try {
        set({ user: JSON.parse(cachedProfile), loading: false })
      } catch (e) {
        console.error('Error parsing cached profile', e)
      }
    }

    // Timeout: nếu Supabase quá chậm (3G/4G yếu), bỏ loading sau 5s
    const SESSION_TIMEOUT = 5000
    const timeoutId = setTimeout(() => {
      // Only force loading=false if still loading (no cache resolved it)
      if (!cachedProfile) {
        set({ user: null, loading: false })
      } else {
        set({ loading: false })
      }
    }, SESSION_TIMEOUT)

    try {
      const { data: { session } } = await supabase.auth.getSession()
      clearTimeout(timeoutId)

      if (!session) {
        try { sessionStorage.removeItem('sb_user_profile') } catch { /* ignore */ }
        set({ user: null, loading: false })
        return
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('role, full_name')
        .eq('id', session.user.id)
        .single()

      const p = profile as { role: UserRole; full_name: string } | null
      const user = {
        id: session.user.id,
        email: session.user.email!,
        role: p?.role ?? 'employee',
        name: p?.full_name ?? '',
      }

      try { sessionStorage.setItem('sb_user_profile', JSON.stringify(user)) } catch { /* ignore */ }
      set({ user, loading: false })
    } catch (err) {
      clearTimeout(timeoutId)
      console.error('checkSession error:', err)
      // Nếu có lỗi mạng và có cache cũ, tiếp tục giữ cache cũ để app hoạt động ngoại tuyến
      if (!cachedProfile) {
        set({ user: null, loading: false })
      } else {
        set({ loading: false })
      }
    }
  },
}))
