import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '../../stores/useAuthStore'
import { useRealtimeInvalidationStore } from '../../stores/useRealtimeInvalidationStore'
import type { ClientDetailsSnapshot } from '../../types/clientDetails'
import {
  hasResourceLoadError,
  isResourcePending,
  type ResourceLoadStatus,
} from '../../stores/resourceLoadState'
import { getClientDetailsSnapshot } from '../../services/clientDetailsSnapshotService'

type UseClientDetailsDataResult = {
  snapshot: ClientDetailsSnapshot | null
  combinedError: string | null
  hasLoadError: boolean
  isLoading: boolean
  retryLoad: () => Promise<void>
}

export function useClientDetailsData(
  clientId: string | undefined,
): UseClientDetailsDataResult {
  const { t } = useTranslation()
  const user = useAuthStore((state) => state.user)
  const userId = user?.id ?? null
  const clientDetailsVersion = useRealtimeInvalidationStore(
    (state) => state.versions.clientDetails,
  )
  const [snapshot, setSnapshot] = useState<ClientDetailsSnapshot | null>(null)
  const [loadStatus, setLoadStatus] = useState<ResourceLoadStatus>('idle')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!userId || !clientId) {
      setSnapshot(null)
      setLoadStatus('idle')
      setError(null)
      return
    }

    let isDisposed = false
    const targetClientId = clientId

    async function loadClientDetails() {
      setLoadStatus('loading')
      setError(null)

      try {
        const clientDetailsSnapshot =
          await getClientDetailsSnapshot(targetClientId)

        if (isDisposed) {
          return
        }

        setSnapshot(clientDetailsSnapshot)
        setLoadStatus('ready')
      } catch (loadError) {
        if (isDisposed) {
          return
        }

        setSnapshot(null)
        setLoadStatus('error')
        setError(
          loadError instanceof Error
            ? loadError.message
            : t('clients.load_error'),
        )
      }
    }

    void loadClientDetails()

    return () => {
      isDisposed = true
    }
  }, [clientDetailsVersion, clientId, userId, t])

  async function retryLoad() {
    if (!userId || !clientId) {
      return
    }

    setLoadStatus('loading')
    setError(null)

    try {
      setSnapshot(await getClientDetailsSnapshot(clientId))
      setLoadStatus('ready')
    } catch (loadError) {
      setSnapshot(null)
      setLoadStatus('error')
      setError(
        loadError instanceof Error
          ? loadError.message
          : t('clients.load_error'),
      )
    }
  }

  return {
    snapshot,
    combinedError: error,
    hasLoadError: hasResourceLoadError(loadStatus),
    isLoading: Boolean(userId && clientId) && isResourcePending(loadStatus),
    retryLoad,
  }
}
