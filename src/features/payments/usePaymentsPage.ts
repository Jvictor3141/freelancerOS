import { useEffect, useState } from 'react'
import { useFeedback } from '../../components/FeedbackProvider'
import { getToastToneForMessage } from '../../lib/feedback'
import { getErrorMessage } from '../../lib/supabase'
import { useClientStore } from '../../stores/useClientStore'
import { usePaymentStore } from '../../stores/usePaymentStore'
import { useProjectStore } from '../../stores/useProjectStore'
import {
  hasResourceLoadError,
  isResourcePending,
} from '../../stores/resourceLoadState'
import type { PaymentInput } from '../../types/inputs'
import type { PaymentWithProjectAndClient } from '../../types/viewModels'
import {
  getFilteredPayments,
  getPaymentsWithRelations,
} from '../../utils/paymentsPage'
import type { PaymentStatusFilter } from '../../utils/paymentStatus'

export function usePaymentsPage() {
  const projects = useProjectStore((state) => state.projects)
  const projectError = useProjectStore((state) => state.error)
  const projectsLoadStatus = useProjectStore((state) => state.loadStatus)
  const ensureProjectsLoaded = useProjectStore(
    (state) => state.ensureProjectsLoaded,
  )
  const retryProjectsLoad = useProjectStore((state) => state.retryLoad)

  const clients = useClientStore((state) => state.clients)
  const clientError = useClientStore((state) => state.error)
  const clientsLoadStatus = useClientStore((state) => state.loadStatus)
  const ensureClientsLoaded = useClientStore(
    (state) => state.ensureClientsLoaded,
  )
  const retryClientsLoad = useClientStore((state) => state.retryLoad)

  const payments = usePaymentStore((state) => state.payments)
  const selectedPayment = usePaymentStore((state) => state.selectedPayment)
  const paymentError = usePaymentStore((state) => state.error)
  const paymentsLoadStatus = usePaymentStore((state) => state.loadStatus)
  const ensurePaymentsLoaded = usePaymentStore(
    (state) => state.ensurePaymentsLoaded,
  )
  const retryPaymentsLoad = usePaymentStore((state) => state.retryLoad)
  const selectPayment = usePaymentStore((state) => state.selectPayment)
  const addPayment = usePaymentStore((state) => state.addPayment)
  const editPayment = usePaymentStore((state) => state.editPayment)
  const removePayment = usePaymentStore((state) => state.removePayment)
  const markAsPaid = usePaymentStore((state) => state.markAsPaid)

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [statusFilter, setStatusFilter] = useState<PaymentStatusFilter>('all')
  const [statusFilterDraft, setStatusFilterDraft] =
    useState<PaymentStatusFilter>('all')
  const { confirm, notify } = useFeedback()

  function alert(message: string) {
    notify({
      tone: getToastToneForMessage(message),
      title: message,
    })
  }

  useEffect(() => {
    void Promise.all([
      ensureClientsLoaded(),
      ensureProjectsLoaded(),
      ensurePaymentsLoaded(),
    ])
  }, [ensureClientsLoaded, ensureProjectsLoaded, ensurePaymentsLoaded])

  const paymentsWithRelations = getPaymentsWithRelations(
    payments,
    projects,
    clients,
  )
  const filteredPayments = getFilteredPayments(paymentsWithRelations, statusFilter)

  function openCreateModal() {
    if (projects.length === 0) {
      alert('Cadastre pelo menos um projeto antes de criar um pagamento.')
      return
    }

    selectPayment(null)
    setIsModalOpen(true)
  }

  function openEditModal(payment: PaymentWithProjectAndClient) {
    selectPayment(payment)
    setIsModalOpen(true)
  }

  function closeModal() {
    selectPayment(null)
    setIsModalOpen(false)
  }

  async function handleRetryLoad() {
    await Promise.all([
      retryClientsLoad(),
      retryProjectsLoad(),
      retryPaymentsLoad(),
    ])
  }

  function openFilterModal() {
    setStatusFilterDraft(statusFilter)
    setIsFilterModalOpen(true)
  }

  function applyFilterModal() {
    setStatusFilter(statusFilterDraft)
    setIsFilterModalOpen(false)
  }

  function clearFilterModal() {
    setStatusFilterDraft('all')
    setStatusFilter('all')
  }

  async function handlePaymentSubmit(values: PaymentInput) {
    const isEditing = Boolean(selectedPayment)
    setIsSubmitting(true)

    try {
      if (selectedPayment) {
        await editPayment(selectedPayment.id, values)
      } else {
        await addPayment(values)
      }

      closeModal()
      alert(
        isEditing
          ? 'Pagamento atualizado com sucesso.'
          : 'Pagamento criado com sucesso.',
      )
    } catch (submitError) {
      alert(getErrorMessage(submitError, 'NÃ£o foi possÃ­vel salvar o pagamento.'))
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handlePaymentRemoval(payment: PaymentWithProjectAndClient) {
    const confirmed = await confirm({
      title: 'Excluir pagamento?',
      description: 'Deseja excluir este pagamento?',
      confirmLabel: 'Excluir pagamento',
      cancelLabel: 'Cancelar',
      tone: 'danger',
    })

    if (!confirmed) {
      return
    }

    try {
      await removePayment(payment.id)
      alert('Pagamento excluido com sucesso.')
    } catch (removeError) {
      alert(
        getErrorMessage(removeError, 'NÃ£o foi possÃ­vel excluir o pagamento.'),
      )
    }
  }

  async function handleMarkAsPaid(paymentId: string) {
    try {
      await markAsPaid(paymentId)
      alert('Pagamento marcado como pago.')
    } catch (markError) {
      alert(
        getErrorMessage(markError, 'NÃ£o foi possÃ­vel marcar o pagamento como pago.'),
      )
    }
  }

  return {
    combinedError: paymentError ?? projectError ?? clientError,
    filteredPayments,
    hasActiveFilters: statusFilter !== 'all',
    hasLoadError:
      hasResourceLoadError(clientsLoadStatus) ||
      hasResourceLoadError(projectsLoadStatus) ||
      hasResourceLoadError(paymentsLoadStatus),
    isFilterModalOpen,
    isLoading:
      isResourcePending(clientsLoadStatus) ||
      isResourcePending(projectsLoadStatus) ||
      isResourcePending(paymentsLoadStatus),
    isModalOpen,
    isSubmitting,
    projects,
    selectedPayment,
    statusFilter,
    statusFilterDraft,
    applyFilterModal,
    clearFilterModal,
    closeModal,
    handleMarkAsPaid,
    handlePaymentRemoval,
    handlePaymentSubmit,
    handleRetryLoad,
    openCreateModal,
    openEditModal,
    openFilterModal,
    setIsFilterModalOpen,
    setStatusFilter,
    setStatusFilterDraft,
  }
}
