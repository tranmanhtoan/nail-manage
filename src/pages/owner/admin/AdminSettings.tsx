import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { ToggleLeft, ToggleRight, KeyRound, LogOut } from 'lucide-react'
import { LanguageSwitch } from '@/components/LanguageSwitch'
import { useAuthStore } from '@/store/authStore'
import { supabase } from '@/lib/supabase'

interface FeatureToggles {
  quick_entry_enabled: boolean
  appointments_enabled: boolean
  reports_enabled: boolean
}

const DEFAULT_TOGGLES: FeatureToggles = {
  quick_entry_enabled: true,
  appointments_enabled: true,
  reports_enabled: true,
}
