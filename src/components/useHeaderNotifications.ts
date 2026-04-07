import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../stores/useAuthStore'
import { useClientStore } from '../stores/useClientStore'
import { usePaymentStore } from '../stores/usePaymentStore'
import { useProjectStore } from '../stores/useProjectStore'
import { useProposalStore } from '../stores/useProposalStore'
import {
  hasResourceLoadError,
  isResourcePending,
} from '../stores/resourceLoadState'
import { getPaymentsWithRelations } from '../features/payments/paymentsView'
import { getProjectsWithClient } from '../features/projects/projectsView'
import { getProposalsWithClient } from '../features/proposals/proposalsView'
import type { HeaderNotification } from './headerNotificationsModel'
import {
  getHeaderNotifications,
  getVisibleHeaderNotifications,
  readDismissedHeaderNotificationIds,
  writeDismissedHeaderNotificationIds,
} from './headerNotificationsModel'

export function useHeaderNotifications() {
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)

  const clients = useClientStore((state) => state.clients)
  const clientsLoadStatus = useClientStore((state) => state.loadStatus)
  const ensureClientsLoaded = useClientStore(
    (state) => state.ensureClientsLoaded,
  )
  const retryClientsLoad = useClientStore((state) => state.retryLoad)

  const projects = useProjectStore((state) => state.projects)
  const projectsLoadStatus = useProjectStore((state) => state.loadStatus)
  const ensureProjectsLoaded = useProjectStore(
    (state) => state.ensureProjectsLoaded,
  )
  const retryProjectsLoad = useProjectStore((state) => state.retryLoad)

  const payments = usePaymentStore((state) => state.payments)
  const paymentsLoadStatus = usePaymentStore((state) => state.loadStatus)
  const ensurePaymentsLoaded = usePaymentStore(
    (state) => state.ensurePaymentsLoaded,
  )
  const retryPaymentsLoad = usePaymentStore((state) => state.retryLoad)

  const proposals = useProposalStore((state) => state.proposals)
  const proposalsLoadStatus = useProposalStore((state) => state.loadStatus)
  const ensureProposalsLoaded = useProposalStore(
    (state) => state.ensureProposalsLoaded,
  )
  const retryProposalsLoad = useProposalStore((state) => state.retryLoad)

  const [dismissedNotificationIds, setDismissedNotificationIds] = useState<
    string[]
  >([])

  useEffect(() => {
    if (!user) return

    void Promise.all([
      ensureClientsLoaded(),
      ensureProjectsLoaded(),
      ensurePaymentsLoaded(),
      ensureProposalsLoaded(),
    ])
  }, [
    user,
    ensureClientsLoaded,
    ensureProjectsLoaded,
    ensurePaymentsLoaded,
    ensureProposalsLoaded,
  ])

  useEffect(() => {
    if (!user) {
      setDismissedNotificationIds([])
      return
    }

    setDismissedNotificationIds(readDismissedHeaderNotificationIds(user.id))
  }, [user])

  const notifications = getVisibleHeaderNotifications(
    getHeaderNotifications({
      proposals: getProposalsWithClient(proposals, clients),
      projects: getProjectsWithClient(projects, clients),
      payments: getPaymentsWithRelations(payments, projects, clients),
    }),
    dismissedNotificationIds,
  )

  const isLoading =
    Boolean(user) &&
    (isResourcePending(clientsLoadStatus) ||
      isResourcePending(projectsLoadStatus) ||
      isResourcePending(paymentsLoadStatus) ||
      isResourcePending(proposalsLoadStatus))

  const hasLoadError =
    hasResourceLoadError(clientsLoadStatus) ||
    hasResourceLoadError(projectsLoadStatus) ||
    hasResourceLoadError(paymentsLoadStatus) ||
    hasResourceLoadError(proposalsLoadStatus)

  async function handleRetryLoad() {
    await Promise.all([
      retryClientsLoad(),
      retryProjectsLoad(),
      retryPaymentsLoad(),
      retryProposalsLoad(),
    ])
  }

  function handleDismissNotification(notificationId: string) {
    setDismissedNotificationIds((current) => {
      if (current.includes(notificationId)) return current

      const next = [...current, notificationId]
      writeDismissedHeaderNotificationIds(user?.id ?? null, next)
      return next
    })
  }

  function handleNotificationClick(notification: HeaderNotification) {
    navigate(notification.path)
  }

  return {
    notifications,
    isLoading,
    hasLoadError,
    handleRetryLoad,
    handleDismissNotification,
    handleNotificationClick,
  }
}
