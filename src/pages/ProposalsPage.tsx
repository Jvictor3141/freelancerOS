import { useNavigate } from 'react-router-dom'
import { Modal } from '../components/Modal'
import { PageBanner } from '../components/page/PageBanner'
import { PageLoadingState } from '../components/page/PageLoadingState'
import { ProposalFiltersModalContent } from '../features/proposals/ProposalFiltersModalContent'
import { ProposalListSection } from '../features/proposals/ProposalListSection'
import { ProposalResponseNotificationsSection } from '../features/proposals/ProposalResponseNotificationsSection'
import { ProposalShareModalContent } from '../features/proposals/ProposalShareModalContent'
import { ProposalForm } from '../components/ProposalForm'
import { ProposalsFiltersSection } from '../features/proposals/ProposalsFiltersSection'
import { ProposalsOverviewSection } from '../features/proposals/ProposalsOverviewSection'
import { useProposalsPage } from '../features/proposals/useProposalsPage'

export function ProposalsPage() {
  const navigate = useNavigate()
  const {
    clients,
    combinedError,
    filteredProposals,
    generatedShareLink,
    hasActiveFilters,
    isFilterModalOpen,
    isGeneratingShareLink,
    isLoading,
    isModalOpen,
    isShareModalOpen,
    isSubmitting,
    metrics,
    search,
    selectedProposal,
    shareExpiresInDays,
    shareFeedback,
    shareTargetProposal,
    statusFilter,
    statusFilterDraft,
    visibleClientResponseNotifications,
    applyFilterModal,
    clearFilterModal,
    closeModal,
    closeShareModal,
    handleAcceptProposal,
    handleCopyShareLink,
    handleDismissClientResponseNotification,
    handleProposalRemoval,
    handleProposalSubmit,
    handleRejectProposal,
    handleReopenProposal,
    handleSendProposal,
    handleShareLinkGeneration,
    openCreateModal,
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
        label="Propostas"
        description="Preparando clientes e propostas para montar o funil comercial."
      />
    )
  }

  return (
    <div className="page-stack space-y-6">
      {combinedError ? <PageBanner>{combinedError}</PageBanner> : null}

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
        onOpenProjects={() => navigate('/projetos')}
        onRemove={(proposal) => {
          void handleProposalRemoval(proposal)
        }}
      />

      <Modal
        title="Filtrar propostas"
        description="Escolha o status comercial para refinar a lista e aplique quando terminar."
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
        title={selectedProposal ? 'Editar proposta' : 'Nova proposta'}
        description={
          selectedProposal
            ? 'Ajuste a proposta antes de reenviar ao cliente.'
            : 'Preencha os dados comerciais para criar uma nova proposta.'
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
        title="Link seguro da proposta"
        description="Gere um link protegido por token e compartilhe apenas a visualização pública dessa proposta."
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

