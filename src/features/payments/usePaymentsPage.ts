import { useEffect, useState } from 'react'
import { useFilterModal } from '../../lib/useFilterModal'
import { getErrorMessage } from '../../lib/supabase'
import { useAlert } from '../../lib/useAlert'
import { useRemovalHandler } from '../../lib/useRemovalHandler'
import { useSubmitHandler } from '../../lib/useSubmitHandler'
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
} from './paymentsView'
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
  const statusFilterModal = useFilterModal<PaymentStatusFilter>('all')
  const { alert } = useAlert()
  const handlePaymentRemoval = useRemovalHandler<PaymentWithProjectAndClient>({
    confirmLabel: 'Excluir pagamento',
    description: () => 'Deseja excluir este pagamento?',
    remove: removePayment,
    successMessage: 'Pagamento excluido com sucesso.',
    errorMessage: 'Não foi possível excluir o pagamento.',
  })
  const { isSubmitting, handleSubmit: handlePaymentSubmit } = useSubmitHandler<PaymentInput, PaymentWithProjectAndClient>({
    selected: selectedPayment,
    add: addPayment,
    edit: editPayment,
    onSuccess: closeModal,
    createdMessage: 'Pagamento criado com sucesso.',
    updatedMessage: 'Pagamento atualizado com sucesso.',
    errorMessage: 'Não foi possível salvar o pagamento.',
  })

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
  const filteredPayments = getFilteredPayments(paymentsWithRelations, statusFilterModal.value)

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

  async function handleMarkAsPaid(paymentId: string) {
    try {
      await markAsPaid(paymentId)
      alert('Pagamento marcado como pago.')
    } catch (markError) {
      alert(
        getErrorMessage(markError, 'Não foi possível marcar o pagamento como pago.'),
      )
    }
  }

  return {
    combinedError: paymentError ?? projectError ?? clientError,
    filteredPayments,
    hasActiveFilters: statusFilterModal.value !== 'all',
    hasLoadError:
      hasResourceLoadError(clientsLoadStatus) ||
      hasResourceLoadError(projectsLoadStatus) ||
      hasResourceLoadError(paymentsLoadStatus),
    isFilterModalOpen: statusFilterModal.isOpen,
    isLoading:
      isResourcePending(clientsLoadStatus) ||
      isResourcePending(projectsLoadStatus) ||
      isResourcePending(paymentsLoadStatus),
    isModalOpen,
    isSubmitting,
    projects,
    selectedPayment,
    statusFilter: statusFilterModal.value,
    statusFilterDraft: statusFilterModal.draft,
    applyFilterModal: statusFilterModal.apply,
    clearFilterModal: statusFilterModal.clear,
    closeModal,
    handleMarkAsPaid,
    handlePaymentRemoval,
    handlePaymentSubmit,
    handleRetryLoad,
    openCreateModal,
    openEditModal,
    openFilterModal: statusFilterModal.open,
    setIsFilterModalOpen: statusFilterModal.setIsOpen,
    setStatusFilter: statusFilterModal.setValue,
    setStatusFilterDraft: statusFilterModal.setDraft,
  }
}
