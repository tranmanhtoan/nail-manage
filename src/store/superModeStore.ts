import { create } from 'zustand'

interface SuperModeState {
  superMode: boolean
  toggle: () => void
}

export const useSuperModeStore = create<SuperModeState>((set) => ({
  superMode: localStorage.getItem('superMode') === 'true',
  toggle: () =>
    set((state) => {
      const next = !state.superMode
      localStorage.setItem('superMode', String(next))
      return { superMode: next }
    }),
}))
