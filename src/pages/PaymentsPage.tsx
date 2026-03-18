import { Modal } from '../components/Modal'
import { PaymentForm } from '../components/PaymentForm'
import { PageBanner } from '../components/page/PageBanner'
import { PageLoadingState } from '../components/page/PageLoadingState'
import { PaymentFiltersModalContent } from '../components/payments/PaymentFiltersModalContent'
import { PaymentsListSection } from '../components/payments/PaymentsListSection'
import { usePaymentsPage } from '../components/payments/usePaymentsPage'

export function PaymentsPage() {
  const {
    combinedError,
    filteredPayments,
    hasActiveFilters,
    isFilterModalOpen,
    isLoading,
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
  } = usePaymentsPage()

  if (isLoading) {
    return (
      <PageLoadingState
        label="Pagamentos"
        description="Sincronizando clientes, projetos e pagamentos no Supabase."
      />
    )
  }

  return (
    <div className="page-stack space-y-6">
      {combinedError ? <PageBanner>{combinedError}</PageBanner> : null}

      <PaymentsListSection
        payments={filteredPayments}
        statusFilter={statusFilter}
        hasActiveFilters={hasActiveFilters}
        onStatusFilterChange={setStatusFilter}
        onOpenFilterModal={openFilterModal}
        onOpenCreateModal={openCreateModal}
        onEdit={openEditModal}
        onRemove={(payment) => {
          void handlePaymentRemoval(payment)
        }}
        onMarkAsPaid={(paymentId) => {
          void handleMarkAsPaid(paymentId)
        }}
      />

      <Modal
        title="Filtrar pagamentos"
        description="Escolha o status para refinar a lista e aplique quando terminar."
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
      >
        <PaymentFiltersModalContent
          statusFilterDraft={statusFilterDraft}
          onStatusChange={setStatusFilterDraft}
          onClear={clearFilterModal}
          onApply={applyFilterModal}
        />
      </Modal>

      <Modal
        title={selectedPayment ? 'Editar pagamento' : 'Novo pagamento'}
        description="Preencha os dados para registrar o pagamento."
        isOpen={isModalOpen}
        onClose={closeModal}
      >
        <PaymentForm
          projects={projects}
          initialValues={selectedPayment}
          onCancel={closeModal}
          onSubmit={handlePaymentSubmit}
          isSubmitting={isSubmitting}
        />
      </Modal>
    </div>
  )
}
