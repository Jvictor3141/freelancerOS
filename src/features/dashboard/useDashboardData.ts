import { useEffect } from 'react'
import { useClientStore } from '../../stores/useClientStore'
import { usePaymentStore } from '../../stores/usePaymentStore'
import { useProjectStore } from '../../stores/useProjectStore'
import { getDashboardViewModel } from '../../utils/dashboard'

export function useDashboardData() {
  const clients = useClientStore((state) => state.clients)
  const clientError = useClientStore((state) => state.error)
  const clientsInitialized = useClientStore((state) => state.initialized)
  const ensureClientsLoaded = useClientStore(
    (state) => state.ensureClientsLoaded,
  )

  const projects = useProjectStore((state) => state.projects)
  const projectError = useProjectStore((state) => state.error)
  const projectsInitialized = useProjectStore((state) => state.initialized)
  const ensureProjectsLoaded = useProjectStore(
    (state) => state.ensureProjectsLoaded,
  )

  const payments = usePaymentStore((state) => state.payments)
  const paymentError = usePaymentStore((state) => state.error)
  const paymentsInitialized = usePaymentStore((state) => state.initialized)
  const ensurePaymentsLoaded = usePaymentStore(
    (state) => state.ensurePaymentsLoaded,
  )

  useEffect(() => {
    void Promise.all([
      ensureClientsLoaded(),
      ensureProjectsLoaded(),
      ensurePaymentsLoaded(),
    ])
  }, [ensureClientsLoaded, ensureProjectsLoaded, ensurePaymentsLoaded])

  return {
    ...getDashboardViewModel({
      clients,
      projects,
      payments,
    }),
    combinedError: paymentError ?? projectError ?? clientError,
    isLoading:
      !clientsInitialized || !projectsInitialized || !paymentsInitialized,
  }
}


