import { useNavigate } from 'react-router-dom'
import { Modal } from '../components/Modal'
import { ProjectForm } from '../components/ProjectForm'
import { PageBanner } from '../components/page/PageBanner'
import { PageLoadingState } from '../components/page/PageLoadingState'
import { ProjectFiltersModalContent } from '../features/projects/ProjectFiltersModalContent'
import { ProjectsCommercialBanner } from '../features/projects/ProjectsCommercialBanner'
import { ProjectsListSection } from '../features/projects/ProjectsListSection'
import { ProjectsToolbar } from '../features/projects/ProjectsToolbar'
import { useProjectsPage } from '../features/projects/useProjectsPage'

export function ProjectsPage() {
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
        label="Projetos"
        description="Sincronizando clientes e projetos no Supabase."
      />
    )
  }

  return (
    <div className="page-stack space-y-6">
      {combinedError ? (
        <PageBanner
          actionLabel={hasLoadError ? 'Tentar novamente' : undefined}
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
            hasCommercialSummaryLoadError ? 'Tentar novamente' : undefined
          }
          onAction={
            hasCommercialSummaryLoadError
              ? () => {
                  void handleRetryCommercialSummaryLoad()
                }
              : undefined
          }
        >
          NÃ£o foi possÃ­vel carregar o resumo comercial das propostas nesta
          pÃ¡gina. A operaÃ§Ã£o de projetos continua disponÃ­vel normalmente.
        </PageBanner>
      ) : null}

      {showCommercialSummary ? (
        <ProjectsCommercialBanner
          summary={commercialSummary}
          onOpenProposals={() => navigate('/propostas')}
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
        title="Filtrar projetos"
        description="Escolha os filtros do pipeline operacional e aplique quando terminar."
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
        title={selectedProject ? 'Editar projeto' : 'Novo projeto'}
        description={
          selectedProject
            ? 'Atualize as informaÃ§Ãµes do projeto.'
            : 'Preencha os dados para cadastrar um novo projeto.'
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
