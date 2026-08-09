/**
 * Hand-authored equivalent of `supabase gen types typescript`, derived from
 * supabase/schema.sql (the in-repo source of truth). We author this by hand
 * because the Supabase CLI / a DB access token is not available in this
 * environment (only the public anon key is).
 *
 * Regenerate with the CLI once credentials are available:
 *   npx supabase gen types typescript --project-id <ref> > src/lib/database.generated.ts
 *
 * Shapes mirror the columns, defaults, nullability and RPC signatures in
 * schema.sql. `Insert` marks columns with DB defaults / nullable columns as
 * optional, matching Supabase's generated output.
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string
          role: string
          phone: string | null
          avatar_url: string | null
          pin: string | null
          created_at: string
        }
        Insert: {
          id: string
          email: string
          full_name: string
          role?: string
          phone?: string | null
          avatar_url?: string | null
          pin?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string
          role?: string
          phone?: string | null
          avatar_url?: string | null
          pin?: string | null
          created_at?: string
        }
        Relationships: []
      }
      employees: {
        Row: {
          id: string
          profile_id: string | null
          name: string
          phone: string | null
          email: string | null
          pay_type: string
          commission_rate: number | null
          fixed_salary: number | null
          split_rate: number | null
          rotation_order: number
          is_active: boolean
          activated_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          profile_id?: string | null
          name: string
          phone?: string | null
          email?: string | null
          pay_type?: string
          commission_rate?: number | null
          fixed_salary?: number | null
          split_rate?: number | null
          rotation_order?: number
          is_active?: boolean
          activated_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          profile_id?: string | null
          name?: string
          phone?: string | null
          email?: string | null
          pay_type?: string
          commission_rate?: number | null
          fixed_salary?: number | null
          split_rate?: number | null
          rotation_order?: number
          is_active?: boolean
          activated_at?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'employees_profile_id_fkey'
            columns: ['profile_id']
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
      services: {
        Row: {
          id: string
          name: string
          category: string
          price: number
          duration_minutes: number
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          category?: string
          price?: number
          duration_minutes?: number
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          category?: string
          price?: number
          duration_minutes?: number
          is_active?: boolean
          created_at?: string
        }
        Relationships: []
      }
      customers: {
        Row: {
          id: string
          name: string
          phone: string | null
          email: string | null
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          phone?: string | null
          email?: string | null
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          phone?: string | null
          email?: string | null
          notes?: string | null
          created_at?: string
        }
        Relationships: []
      }
      appointments: {
        Row: {
          id: string
          customer_id: string | null
          employee_id: string | null
          service_id: string
          status: string
          date: string
          time: string
          price: number
          tip: number
          notes: string | null
          source: string
          payment_method: string
          created_at: string
        }
        Insert: {
          id?: string
          customer_id?: string | null
          employee_id?: string | null
          service_id: string
          status?: string
          date: string
          time: string
          price?: number
          tip?: number
          notes?: string | null
          source?: string
          payment_method?: string
          created_at?: string
        }
        Update: {
          id?: string
          customer_id?: string | null
          employee_id?: string | null
          service_id?: string
          status?: string
          date?: string
          time?: string
          price?: number
          tip?: number
          notes?: string | null
          source?: string
          payment_method?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'appointments_customer_id_fkey'
            columns: ['customer_id']
            referencedRelation: 'customers'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'appointments_employee_id_fkey'
            columns: ['employee_id']
            referencedRelation: 'employees'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'appointments_service_id_fkey'
            columns: ['service_id']
            referencedRelation: 'services'
            referencedColumns: ['id']
          },
        ]
      }
      shop_settings: {
        Row: {
          key: string
          value: string
          updated_at: string
        }
        Insert: {
          key: string
          value: string
          updated_at?: string
        }
        Update: {
          key?: string
          value?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      login_profiles: {
        Row: {
          id: string | null
          full_name: string | null
          role: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      verify_profile_pin: {
        Args: { p_id: string; p_pin: string }
        Returns: boolean
      }
      update_employee_pin: {
        Args: { p_profile_id: string; p_new_pin: string }
        Returns: undefined
      }
      get_login_email: {
        Args: { profile_id: string }
        Returns: string
      }
      get_owner_profile: {
        Args: Record<PropertyKey, never>
        Returns: {
          id: string
          email: string
          role: string
          full_name: string
        }[]
      }
      quick_entry_submit: {
        Args: {
          p_employee_id?: string | null
          p_service_id?: string | null
          p_price?: number
          p_tip?: number
          p_payment_method?: string
        }
        Returns: string
      }
      get_my_employee: {
        Args: Record<PropertyKey, never>
        Returns: {
          id: string
          name: string
          pay_type: string
          commission_rate: number | null
          fixed_salary: number | null
          split_rate: number | null
        }[]
      }
      get_my_appointments: {
        Args: { p_date: string; p_date_from?: string | null }
        Returns: {
          apt_id: string
          apt_date: string
          apt_time: string
          apt_status: string
          apt_price: number
          apt_tip: number
          customer_name: string | null
          service_name: string | null
        }[]
      }
      sync_orphaned_employees: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      delete_employee: {
        Args: { p_employee_id: string }
        Returns: undefined
      }
      is_owner: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_employee: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_kiosk: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
    }
    Enums: Record<PropertyKey, never>
    CompositeTypes: Record<PropertyKey, never>
  }
}
