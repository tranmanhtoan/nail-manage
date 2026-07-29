import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { supabase } from '@/lib/supabase'

/**
 * Generate a stable idempotency key from action type + payload.
 * Prevents duplicate submissions when user taps submit multiple times offline.
 */
function generateIdempotencyKey(type: string, payload: any): string {
  const raw = JSON.stringify({ type, ...payload })
  // Simple hash — stable for same input
  let hash = 0
  for (let i = 0; i < raw.length; i++) {
    const char = raw.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash |= 0 // Convert to 32-bit int
  }
  return `${type}_${Math.abs(hash).toString(36)}`
}

export interface SyncAction {
  id: string
  idempotencyKey: string
  type: 'quick_entry_submit' | 'insert_appointment' | 'create_customer'
  payload: any
  timestamp: number
  retryCount?: number
}

export interface FailedAction extends SyncAction {
  error: string
  failedAt: number
}

interface SyncState {
  isOffline: boolean
  isSyncing: boolean
  syncQueue: SyncAction[]
  failedItems: FailedAction[]
  lastSyncedAt: number | null
  lastSyncedCount: number
  init: () => void
  enqueueAction: (type: SyncAction['type'], payload: any) => void
  syncPendingActions: () => Promise<void>
  retryFailed: () => void
  dismissFailed: (id: string) => void
  clearAllFailed: () => void
}

const MAX_RETRIES = 3

export const useSyncStore = create<SyncState>()(
  persist(
    (set, get) => ({
      isOffline: !navigator.onLine,
      isSyncing: false,
      syncQueue: [],
      failedItems: [],
      lastSyncedAt: null,
      lastSyncedCount: 0,

      init: () => {
        const updateOnlineStatus = () => {
          const online = navigator.onLine
          set({ isOffline: !online })
          if (online) {
            get().syncPendingActions()
          }
        }

        window.addEventListener('online', updateOnlineStatus)
        window.addEventListener('offline', updateOnlineStatus)
        
        // Initial state set
        set({ isOffline: !navigator.onLine })

        // Initial sync if online
        if (navigator.onLine && get().syncQueue.length > 0) {
          get().syncPendingActions()
        }
      },

      enqueueAction: (type, payload) => {
        const idempotencyKey = generateIdempotencyKey(type, payload)

        // Check for duplicate — skip if same action already in queue
        const existing = get().syncQueue.find((a) => a.idempotencyKey === idempotencyKey)
        if (existing) {
          console.warn('Duplicate sync action skipped:', idempotencyKey)
          return
        }

        const newAction: SyncAction = {
          id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2),
          idempotencyKey,
          type,
          payload,
          timestamp: Date.now(),
          retryCount: 0,
        }
        set((state) => ({
          syncQueue: [...state.syncQueue, newAction],
        }))
        // Try syncing immediately if online
        if (navigator.onLine) {
          get().syncPendingActions()
        }
      },

      syncPendingActions: async () => {
        const { syncQueue, isSyncing } = get()
        if (syncQueue.length === 0 || isSyncing) return

        set({ isSyncing: true })

        const remainingQueue = [...syncQueue]
        const newFailedItems: FailedAction[] = []
        let syncedCount = 0

        for (const action of syncQueue) {
          try {
            let res: { error: any }
            if (action.type === 'quick_entry_submit') {
              res = await supabase.rpc('quick_entry_submit', action.payload)
            } else if (action.type === 'insert_appointment') {
              res = await supabase.from('appointments').insert(action.payload)
            } else if (action.type === 'create_customer') {
              res = await supabase.from('customers').insert(action.payload)
            } else {
              res = { error: null }
            }

            if (res.error) {
              console.error('Offline sync item error:', res.error)
              // Check if it's a network error
              const isNetworkError = 
                res.error.message?.toLowerCase().includes('fetch') ||
                res.error.message?.toLowerCase().includes('network') ||
                res.error.status === 0 ||
                !navigator.onLine
                
              if (isNetworkError) {
                break // Stop sync loop, wait for reconnection
              }

              // Non-network error — increment retry count
              const retryCount = (action.retryCount || 0) + 1
              if (retryCount >= MAX_RETRIES) {
                // Move to failed items
                newFailedItems.push({
                  ...action,
                  retryCount,
                  error: res.error.message || 'Unknown error',
                  failedAt: Date.now(),
                })
                const index = remainingQueue.findIndex((item) => item.id === action.id)
                if (index > -1) remainingQueue.splice(index, 1)
              } else {
                // Update retry count in queue
                const index = remainingQueue.findIndex((item) => item.id === action.id)
                if (index > -1) remainingQueue[index] = { ...action, retryCount }
              }
            } else {
              // Success — remove from queue
              syncedCount++
              const index = remainingQueue.findIndex((item) => item.id === action.id)
              if (index > -1) remainingQueue.splice(index, 1)
            }
          } catch (err) {
            console.error('Offline sync exception:', err)
            if (!navigator.onLine) {
              break
            }
          }
        }

        set((state) => ({
          syncQueue: remainingQueue,
          failedItems: [...state.failedItems, ...newFailedItems],
          isSyncing: false,
          lastSyncedAt: syncedCount > 0 ? Date.now() : state.lastSyncedAt,
          lastSyncedCount: syncedCount > 0 ? syncedCount : state.lastSyncedCount,
        }))
      },

      retryFailed: () => {
        const { failedItems } = get()
        if (failedItems.length === 0) return

        // Move failed items back to queue with reset retry count
        const retryActions: SyncAction[] = failedItems.map((item) => ({
          id: item.id,
          idempotencyKey: item.idempotencyKey,
          type: item.type,
          payload: item.payload,
          timestamp: item.timestamp,
          retryCount: 0,
        }))

        set((state) => ({
          syncQueue: [...state.syncQueue, ...retryActions],
          failedItems: [],
        }))

        if (navigator.onLine) {
          get().syncPendingActions()
        }
      },

      dismissFailed: (id) => {
        set((state) => ({
          failedItems: state.failedItems.filter((item) => item.id !== id),
        }))
      },

      clearAllFailed: () => {
        set({ failedItems: [] })
      },
    }),
    {
      name: 'sync-storage',
      partialize: (state) => ({
        syncQueue: state.syncQueue,
        failedItems: state.failedItems,
        lastSyncedAt: state.lastSyncedAt,
      }),
    }
  )
)
