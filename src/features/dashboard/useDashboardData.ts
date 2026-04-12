import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '../../stores/useAuthStore'
import { useRealtimeInvalidationStore } from '../../stores/useRealtimeInvalidationStore'
import {
  hasResourceLoadError,
  isResourcePending,
  type ResourceLoadStatus,
} from '../../stores/resourceLoadState'
import {
  emptyDashboardViewModel,
  getDashboardSnapshot,
} from '../../services/dashboardSnapshotService'

export function useDashboardData() {
  const { t } = useTranslation()
  const user = useAuthStore((state) => state.user)
  const userId = user?.id ?? null
  const dashboardVersion = useRealtimeInvalidationStore(
    (state) => state.versions.dashboard,
  )
  const [dashboard, setDashboard] = useState(emptyDashboardViewModel)
  const [loadStatus, setLoadStatus] = useState<ResourceLoadStatus>('idle')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!userId) {
      setDashboard(emptyDashboardViewModel)
      setLoadStatus('idle')
      setError(null)
      return
    }

    let isDisposed = false

    async function loadDashboard() {
      setLoadStatus('loading')
      setError(null)

      try {
        const dashboardSnapshot = await getDashboardSnapshot()

        if (isDisposed) {
          return
        }

        setDashboard(dashboardSnapshot)
        setLoadStatus('ready')
      } catch (loadError) {
        if (isDisposed) {
          return
        }

        setDashboard(emptyDashboardViewModel)
        setLoadStatus('error')
        setError(
          loadError instanceof Error
            ? loadError.message
            : t('dashboard.load_error'),
        )
      }
    }

    void loadDashboard()

    return () => {
      isDisposed = true
    }
  }, [dashboardVersion, userId, t])

  async function retryLoad() {
    if (!userId) {
      return
    }

    setLoadStatus('loading')
    setError(null)

    try {
      setDashboard(await getDashboardSnapshot())
      setLoadStatus('ready')
    } catch (loadError) {
      setDashboard(emptyDashboardViewModel)
      setLoadStatus('error')
      setError(
        loadError instanceof Error
          ? loadError.message
          : t('dashboard.load_error'),
      )
    }
  }

  return {
    ...dashboard,
    combinedError: error,
    hasLoadError: hasResourceLoadError(loadStatus),
    isLoading: Boolean(userId) && isResourcePending(loadStatus),
    retryLoad,
  }
}
