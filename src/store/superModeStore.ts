import { create } from 'zustand'

interface SuperModeState {
  superMode: boolean
  toggle: () => void
}

function getSuperMode(): boolean {
  try {
    return localStorage.getItem('superMode') === 'true'
  } catch {
    return false
  }
}

export const useSuperModeStore = create<SuperModeState>((set) => ({
  superMode: getSuperMode(),
  toggle: () =>
    set((state) => {
      const next = !state.superMode
      try { localStorage.setItem('superMode', String(next)) } catch { /* storage unavailable */ }
      return { superMode: next }
    }),
}))
