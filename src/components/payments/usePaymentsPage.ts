import { useEffect, useState } from 'react'
import { useFeedback } from '../FeedbackProvider'
import type { PaymentInput } from '../../lib/database'
import { getToastToneForMessage } from '../../lib/feedback'
import { getErrorMessage } from '../../lib/supabase'
import { useClientStore } from '../../store/useClientStore'
import { usePaymentStore } from '../../store/usePaymentStore'
import { useProjectStore } from '../../store/useProjectStore'
import type { PaymentStatus } from '../../types/payment'
import type { PaymentWithRelations } from '../../utils/paymentsPage'
import {
  getFilteredPayments,
  getPaymentsWithRelations,
} from '../../utils/paymentsPage'

export function usePaymentsPage() {
  const projects = useProjectStore((state) => state.projects)
  const projectError = useProjectStore((state) => state.error)
  const projectsInitialized = useProjectStore((state) => state.initialized)
  const loadProjects = useProjectStore((state) => state.loadProjects)

  const clients = useClientStore((state) => state.clients)
  const clientError = useClientStore((state) => state.error)
  const clientsInitialized = useClientStore((state) => state.initialized)
  const loadClients = useClientStore((state) => state.loadClients)

  const payments = usePaymentStore((state) => state.payments)
  const selectedPayment = usePaymentStore((state) => state.selectedPayment)
  const paymentError = usePaymentStore((state) => state.error)
  const paymentsInitialized = usePaymentStore((state) => state.initialized)
  const loadPayments = usePaymentStore((state) => state.loadPayments)
  const selectPayment = usePaymentStore((state) => state.selectPayment)
  const addPayment = usePaymentStore((state) => state.addPayment)
  const editPayment = usePaymentStore((state) => state.editPayment)
  const removePayment = usePaymentStore((state) => state.removePayment)
  const markAsPaid = usePaymentStore((state) => state.markAsPaid)
  const markAsOverdueIfNeeded = usePaymentStore(
    (state) => state.markAsOverdueIfNeeded,
  )

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [statusFilter, setStatusFilter] = useState<PaymentStatus | 'all'>(
    'all',
  )
  const [statusFilterDraft, setStatusFilterDraft] =
    useState<PaymentStatus | 'all'>('all')
  const { confirm, notify } = useFeedback()

  function alert(message: string) {
    notify({
      tone: getToastToneForMessage(message),
      title: message,
    })
  }

  useEffect(() => {
    void Promise.all([loadClients(), loadProjects(), loadPayments()])
  }, [loadClients, loadProjects, loadPayments])

  useEffect(() => {
    if (!paymentsInitialized) {
      return
    }

    void markAsOverdueIfNeeded()
  }, [paymentsInitialized, markAsOverdueIfNeeded])

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

  function openEditModal(payment: PaymentWithRelations) {
    selectPayment(payment)
    setIsModalOpen(true)
  }

  function closeModal() {
    selectPayment(null)
    setIsModalOpen(false)
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
      alert(getErrorMessage(submitError, 'Não foi possível salvar o pagamento.'))
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handlePaymentRemoval(payment: PaymentWithRelations) {
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
        getErrorMessage(removeError, 'Não foi possível excluir o pagamento.'),
      )
    }
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
    hasActiveFilters: statusFilter !== 'all',
    isFilterModalOpen,
    isLoading:
      !clientsInitialized || !projectsInitialized || !paymentsInitialized,
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
    openCreateModal,
    openEditModal,
    openFilterModal,
    setIsFilterModalOpen,
    setStatusFilter,
    setStatusFilterDraft,
  }
}
