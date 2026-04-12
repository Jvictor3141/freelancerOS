import { useTranslation } from 'react-i18next'
import { Modal } from '../components/Modal'
import { PaymentForm } from '../components/PaymentForm'
import { PageBanner } from '../components/page/PageBanner'
import { PageLoadingState } from '../components/page/PageLoadingState'
import { PaymentFiltersModalContent } from '../features/payments/PaymentFiltersModalContent'
import { PaymentsListSection } from '../features/payments/PaymentsListSection'
import { usePaymentsPage } from '../features/payments/usePaymentsPage'

export function PaymentsPage() {
  const { t } = useTranslation()

  const {
    combinedError,
    filteredPayments,
    hasActiveFilters,
    hasLoadError,
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
    handleRetryLoad,
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
        label={t('payments.loading_label')}
        description={t('payments.loading_description')}
      />
    )
  }

  return (
    <div className="page-stack space-y-6">
      {combinedError ? (
        <PageBanner
          actionLabel={hasLoadError ? t('common.retry') : undefined}
          onAction={
            hasLoadError
              ? () => {
                  void handleRetryLoad()
                }
              : undefined
          }
        >
          {combinedError}
        </PageBanner>
      ) : null}

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
        title={t('payments.modal_filter_title')}
        description={t('payments.modal_filter_description')}
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
        title={selectedPayment ? t('payments.modal_edit_title') : t('payments.modal_new_title')}
        description={t('payments.modal_new_description')}
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
