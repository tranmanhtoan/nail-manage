import { useTranslation } from 'react-i18next'
import { Cloud, CloudOff, Loader2, AlertTriangle, CheckCircle2, RefreshCw, X } from 'lucide-react'
import { useSyncStore } from '@/store/syncStore'

export function OfflineSyncBanner() {
  const { t } = useTranslation()
  const {
    isOffline,
    isSyncing,
    syncQueue,
    failedItems,
    lastSyncedAt,
    lastSyncedCount,
    retryFailed,
    clearAllFailed,
    syncPendingActions,
  } = useSyncStore()

  const pendingCount = syncQueue.length
  const failedCount = failedItems.length
  const hasContent = isOffline || pendingCount > 0 || failedCount > 0 || (lastSyncedAt && Date.now() - lastSyncedAt < 5000)

  if (!hasContent) return null

  // Just synced successfully — show brief success toast
  const justSynced = lastSyncedAt && Date.now() - lastSyncedAt < 5000 && pendingCount === 0 && failedCount === 0

  return (
    <div className="space-y-2 mb-4">
      {/* Offline banner */}
      {isOffline && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800">
          <CloudOff size={18} className="flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium">{t('sync.offline')}</p>
            <p className="text-xs text-amber-600 mt-0.5">{t('sync.offlineHint')}</p>
          </div>
        </div>
      )}

      {/* Pending items */}
      {pendingCount > 0 && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-blue-50 border border-blue-200 text-blue-800">
          {isSyncing ? (
            <Loader2 size={18} className="flex-shrink-0 animate-spin" />
          ) : (
            <Cloud size={18} className="flex-shrink-0" />
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium">
              {isSyncing
                ? t('sync.syncing')
                : t('sync.pending', { count: pendingCount })}
            </p>
            {!isSyncing && !isOffline && (
              <p className="text-xs text-blue-600 mt-0.5">{t('sync.willSync')}</p>
            )}
          </div>
          {!isSyncing && !isOffline && (
            <button
              onClick={() => syncPendingActions()}
              className="p-1.5 rounded-lg hover:bg-blue-100 transition-colors"
              aria-label={t('sync.syncNow')}
            >
              <RefreshCw size={16} />
            </button>
          )}
        </div>
      )}

      {/* Failed items */}
      {failedCount > 0 && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-800">
          <AlertTriangle size={18} className="flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium">
              {t('sync.failed', { count: failedCount })}
            </p>
            <p className="text-xs text-red-600 mt-0.5">{t('sync.failedHint')}</p>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={retryFailed}
              className="p-1.5 rounded-lg hover:bg-red-100 transition-colors"
              aria-label={t('sync.retry')}
            >
              <RefreshCw size={16} />
            </button>
            <button
              onClick={clearAllFailed}
              className="p-1.5 rounded-lg hover:bg-red-100 transition-colors"
              aria-label={t('common.delete')}
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Success toast (auto-hides after 5s via hasContent check) */}
      {justSynced && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-green-50 border border-green-200 text-green-800">
          <CheckCircle2 size={18} className="flex-shrink-0" />
          <p className="text-sm font-medium">
            {t('sync.success', { count: lastSyncedCount })}
          </p>
        </div>
      )}
    </div>
  )
}
