import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

// ponytail: skip typed client generic — real types come from `supabase gen types`
// when connected to actual DB. Using untyped client for now.
export const supabase = createClient(supabaseUrl, supabaseAnonKey)
