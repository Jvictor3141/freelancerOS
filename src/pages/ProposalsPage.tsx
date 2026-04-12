import { useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Modal } from '../components/Modal'
import { ProposalForm } from '../components/ProposalForm'
import { PageBanner } from '../components/page/PageBanner'
import { PageLoadingState } from '../components/page/PageLoadingState'
import { ProposalDetailModalContent } from '../features/proposals/ProposalDetailModalContent'
import { ProposalFiltersModalContent } from '../features/proposals/ProposalFiltersModalContent'
import { ProposalListSection } from '../features/proposals/ProposalListSection'
import { ProposalResponseNotificationsSection } from '../features/proposals/ProposalResponseNotificationsSection'
import { ProposalShareModalContent } from '../features/proposals/ProposalShareModalContent'
import { canEditProposal } from '../features/proposals/proposalRules'
import { ProposalsFiltersSection } from '../features/proposals/ProposalsFiltersSection'
import { ProposalsOverviewSection } from '../features/proposals/ProposalsOverviewSection'
import { useProposalsPage } from '../features/proposals/useProposalsPage'
import { isSupportedLanguage } from '../i18n/config'

export function ProposalsPage() {
  const { t, i18n } = useTranslation()
  const { lang } = useParams<{ lang?: string }>()
  const currentLang = lang && isSupportedLanguage(lang) ? lang : (i18n.resolvedLanguage ?? 'pt')
  const navigate = useNavigate()
  const {
    clients,
    combinedError,
    filteredProposals,
    generatedShareLink,
    hasActiveFilters,
    hasLoadError,
    isDetailModalOpen,
    isFilterModalOpen,
    isGeneratingShareLink,
    isLoading,
    isModalOpen,
    isShareModalOpen,
    isSubmitting,
    metrics,
    search,
    selectedProposal,
    viewProposal,
    shareExpiresInDays,
    shareFeedback,
    shareTargetProposal,
    statusFilter,
    statusFilterDraft,
    visibleClientResponseNotifications,
    applyFilterModal,
    clearFilterModal,
    closeDetailModal,
    closeModal,
    closeShareModal,
    handleAcceptProposal,
    handleCopyShareLink,
    handleDismissClientResponseNotification,
    handleProposalRemoval,
    handleProposalSubmit,
    handleRejectProposal,
    handleReopenProposal,
    handleRetryLoad,
    handleSendProposal,
    handleShareLinkGeneration,
    openCreateModal,
    openDetailModal,
    openEditModal,
    openFilterModal,
    openShareModal,
    resetAllFilters,
    resetGeneratedShareLink,
    setIsFilterModalOpen,
    setSearch,
    setShareExpiresInDays,
    setStatusFilter,
    setStatusFilterDraft,
  } = useProposalsPage()

  if (isLoading) {
    return (
      <PageLoadingState
        label={t('proposals.loading_label')}
        description={t('proposals.loading_description')}
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

      <ProposalsOverviewSection metrics={metrics} onCreate={openCreateModal} />

      {visibleClientResponseNotifications.length > 0 ? (
        <ProposalResponseNotificationsSection
          notifications={visibleClientResponseNotifications}
          onDismiss={handleDismissClientResponseNotification}
        />
      ) : null}

      <ProposalsFiltersSection
        search={search}
        statusFilter={statusFilter}
        hasActiveFilters={hasActiveFilters}
        onSearchChange={setSearch}
        onStatusFilterChange={setStatusFilter}
        onResetAllFilters={resetAllFilters}
        onOpenFilterModal={openFilterModal}
      />

      <ProposalListSection
        proposals={filteredProposals}
        onView={openDetailModal}
        onEdit={openEditModal}
        onOpenShare={openShareModal}
        onSend={(proposal) => {
          void handleSendProposal(proposal)
        }}
        onAccept={(proposal) => {
          void handleAcceptProposal(proposal)
        }}
        onReject={(proposal) => {
          void handleRejectProposal(proposal)
        }}
        onReopen={(proposal) => {
          void handleReopenProposal(proposal)
        }}
        onOpenProjects={() => navigate(`/${currentLang}/projetos`)}
        onRemove={(proposal) => {
          void handleProposalRemoval(proposal)
        }}
      />

      <Modal
        title={viewProposal?.title ?? ''}
        isOpen={isDetailModalOpen}
        onClose={closeDetailModal}
      >
        {viewProposal ? (
          <ProposalDetailModalContent
            proposal={viewProposal}
            canEdit={canEditProposal(viewProposal)}
            onEdit={() => {
              closeDetailModal()
              openEditModal(viewProposal)
            }}
          />
        ) : null}
      </Modal>

      <Modal
        title={t('proposals.modal_filter_title')}
        description={t('proposals.modal_filter_description')}
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
      >
        <ProposalFiltersModalContent
          statusFilterDraft={statusFilterDraft}
          onStatusChange={setStatusFilterDraft}
          onClear={clearFilterModal}
          onApply={applyFilterModal}
        />
      </Modal>

      <Modal
        title={selectedProposal ? t('proposals.modal_edit_title') : t('proposals.modal_new_title')}
        description={
          selectedProposal
            ? t('proposals.modal_edit_description')
            : t('proposals.modal_new_description')
        }
        isOpen={isModalOpen}
        onClose={closeModal}
      >
        <ProposalForm
          clients={clients}
          initialValues={selectedProposal}
          onCancel={closeModal}
          onSubmit={handleProposalSubmit}
          isSubmitting={isSubmitting}
        />
      </Modal>

      <Modal
        title={t('proposals.modal_share_title')}
        description={t('proposals.modal_share_description')}
        isOpen={isShareModalOpen}
        onClose={closeShareModal}
      >
        <ProposalShareModalContent
          shareTargetProposal={shareTargetProposal}
          shareExpiresInDays={shareExpiresInDays}
          generatedShareLink={generatedShareLink}
          shareFeedback={shareFeedback}
          isGeneratingShareLink={isGeneratingShareLink}
          onShareExpiresInDaysChange={setShareExpiresInDays}
          onCopyShareLink={() => {
            void handleCopyShareLink()
          }}
          onResetGeneratedLink={resetGeneratedShareLink}
          onClose={closeShareModal}
          onGenerateShareLink={() => {
            void handleShareLinkGeneration()
          }}
        />
      </Modal>
    </div>
  )
}
