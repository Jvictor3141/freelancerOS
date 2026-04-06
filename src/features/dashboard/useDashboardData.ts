import { useEffect, useState } from 'react'
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
            : 'Não foi possível carregar o dashboard.',
        )
      }
    }

    void loadDashboard()

    return () => {
      isDisposed = true
    }
  }, [dashboardVersion, userId])

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
          : 'Não foi possível carregar o dashboard.',
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
