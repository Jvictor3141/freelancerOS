import { useEffect } from 'react'
import { useClientStore } from '../../store/useClientStore'
import { usePaymentStore } from '../../store/usePaymentStore'
import { useProjectStore } from '../../store/useProjectStore'
import { getDashboardViewModel } from '../../utils/dashboard'

export function useDashboardData() {
  const clients = useClientStore((state) => state.clients)
  const clientError = useClientStore((state) => state.error)
  const clientsInitialized = useClientStore((state) => state.initialized)
  const loadClients = useClientStore((state) => state.loadClients)

  const projects = useProjectStore((state) => state.projects)
  const projectError = useProjectStore((state) => state.error)
  const projectsInitialized = useProjectStore((state) => state.initialized)
  const loadProjects = useProjectStore((state) => state.loadProjects)

  const payments = usePaymentStore((state) => state.payments)
  const paymentError = usePaymentStore((state) => state.error)
  const paymentsInitialized = usePaymentStore((state) => state.initialized)
  const loadPayments = usePaymentStore((state) => state.loadPayments)
  const markAsOverdueIfNeeded = usePaymentStore(
    (state) => state.markAsOverdueIfNeeded,
  )

  useEffect(() => {
    void Promise.all([loadClients(), loadProjects(), loadPayments()])
  }, [loadClients, loadProjects, loadPayments])

  useEffect(() => {
    if (!paymentsInitialized) {
      return
    }

    void markAsOverdueIfNeeded()
  }, [paymentsInitialized, markAsOverdueIfNeeded])

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
