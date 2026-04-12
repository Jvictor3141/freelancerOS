import { useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Modal } from '../components/Modal'
import { ProjectForm } from '../components/ProjectForm'
import { PageBanner } from '../components/page/PageBanner'
import { PageLoadingState } from '../components/page/PageLoadingState'
import { ProjectFiltersModalContent } from '../features/projects/ProjectFiltersModalContent'
import { ProjectsCommercialBanner } from '../features/projects/ProjectsCommercialBanner'
import { ProjectsListSection } from '../features/projects/ProjectsListSection'
import { ProjectsToolbar } from '../features/projects/ProjectsToolbar'
import { useProjectsPage } from '../features/projects/useProjectsPage'
import { isSupportedLanguage } from '../i18n/config'

export function ProjectsPage() {
  const { t, i18n } = useTranslation()
  const { lang } = useParams<{ lang?: string }>()
  const currentLang = lang && isSupportedLanguage(lang) ? lang : (i18n.resolvedLanguage ?? 'pt')
  const navigate = useNavigate()
  const {
    clients,
    clientFilter,
    clientFilterDraft,
    combinedError,
    commercialSummary,
    filteredProjects,
    hasActiveSelectionFilters,
    hasCommercialSummaryLoadError,
    hasLoadError,
    isFilterModalOpen,
    isLoading,
    isModalOpen,
    isSubmitting,
    proposalError,
    search,
    selectedProject,
    showCommercialSummary,
    statusFilter,
    statusFilterDraft,
    applyFilterModal,
    clearFilterModal,
    closeModal,
    handleProjectRemoval,
    handleProjectSubmit,
    handleRetryCommercialSummaryLoad,
    handleRetryLoad,
    openCreateModal,
    openEditModal,
    openFilterModal,
    resetAllFilters,
    setClientFilter,
    setClientFilterDraft,
    setIsFilterModalOpen,
    setSearch,
    setStatusFilter,
    setStatusFilterDraft,
  } = useProjectsPage()

  if (isLoading) {
    return (
      <PageLoadingState
        label={t('projects.loading_label')}
        description={t('projects.loading_description')}
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

      {proposalError ? (
        <PageBanner
          tone="warning"
          actionLabel={
            hasCommercialSummaryLoadError ? t('common.retry') : undefined
          }
          onAction={
            hasCommercialSummaryLoadError
              ? () => {
                  void handleRetryCommercialSummaryLoad()
                }
              : undefined
          }
        >
          {t('projects.error_proposal_summary')}
        </PageBanner>
      ) : null}

      {showCommercialSummary ? (
        <ProjectsCommercialBanner
          summary={commercialSummary}
          onOpenProposals={() => navigate(`/${currentLang}/propostas`)}
        />
      ) : null}

      <ProjectsToolbar
        clients={clients}
        search={search}
        statusFilter={statusFilter}
        clientFilter={clientFilter}
        hasActiveSelectionFilters={hasActiveSelectionFilters}
        onSearchChange={setSearch}
        onStatusFilterChange={setStatusFilter}
        onClientFilterChange={setClientFilter}
        onResetAllFilters={resetAllFilters}
        onOpenCreateModal={openCreateModal}
        onOpenFilterModal={openFilterModal}
      />

      <ProjectsListSection
        projects={filteredProjects}
        onEdit={openEditModal}
        onRemove={(project) => {
          void handleProjectRemoval(project)
        }}
      />

      <Modal
        title={t('projects.modal_filter_title')}
        description={t('projects.modal_filter_description')}
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
      >
        <ProjectFiltersModalContent
          clients={clients}
          statusFilterDraft={statusFilterDraft}
          clientFilterDraft={clientFilterDraft}
          onStatusChange={setStatusFilterDraft}
          onClientChange={setClientFilterDraft}
          onClear={clearFilterModal}
          onApply={applyFilterModal}
        />
      </Modal>

      <Modal
        title={selectedProject ? t('projects.modal_edit_title') : t('projects.modal_new_title')}
        description={
          selectedProject
            ? t('projects.modal_edit_description')
            : t('projects.modal_new_description')
        }
        isOpen={isModalOpen}
        onClose={closeModal}
      >
        <ProjectForm
          clients={clients}
          initialValues={selectedProject}
          onCancel={closeModal}
          onSubmit={handleProjectSubmit}
          isSubmitting={isSubmitting}
        />
      </Modal>
    </div>
  )
}
