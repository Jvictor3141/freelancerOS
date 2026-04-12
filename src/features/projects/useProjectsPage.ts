import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useFilterModal } from '../../lib/useFilterModal'
import { useAlert } from '../../lib/useAlert'
import { useRemovalHandler } from '../../lib/useRemovalHandler'
import { useSubmitHandler } from '../../lib/useSubmitHandler'
import { useClientStore } from '../../stores/useClientStore'
import { useProjectStore } from '../../stores/useProjectStore'
import { useProposalStore } from '../../stores/useProposalStore'
import {
  hasResourceLoadError,
  isResourcePending,
} from '../../stores/resourceLoadState'
import type { ProjectWithClient } from '../../types/viewModels'
import type { ProjectStatusFilter } from '../../utils/projectStatus'
import {
  getFilteredProjects,
  getProjectsCommercialSummary,
  getProjectsWithClient,
} from './projectsView'

export function useProjectsPage() {
  const { t } = useTranslation()
  const [searchParams, setSearchParams] = useSearchParams()

  const clients = useClientStore((state) => state.clients)
  const clientError = useClientStore((state) => state.error)
  const clientsLoadStatus = useClientStore((state) => state.loadStatus)
  const ensureClientsLoaded = useClientStore(
    (state) => state.ensureClientsLoaded,
  )
  const retryClientsLoad = useClientStore((state) => state.retryLoad)

  const projects = useProjectStore((state) => state.projects)
  const selectedProject = useProjectStore((state) => state.selectedProject)
  const projectError = useProjectStore((state) => state.error)
  const projectsLoadStatus = useProjectStore((state) => state.loadStatus)
  const ensureProjectsLoaded = useProjectStore(
    (state) => state.ensureProjectsLoaded,
  )
  const retryProjectsLoad = useProjectStore((state) => state.retryLoad)
  const selectProject = useProjectStore((state) => state.selectProject)
  const addProject = useProjectStore((state) => state.addProject)
  const editProject = useProjectStore((state) => state.editProject)
  const removeProject = useProjectStore((state) => state.removeProject)

  const proposals = useProposalStore((state) => state.proposals)
  const proposalError = useProposalStore((state) => state.error)
  const proposalsLoadStatus = useProposalStore((state) => state.loadStatus)
  const ensureProposalsLoaded = useProposalStore(
    (state) => state.ensureProposalsLoaded,
  )
  const retryProposalsLoad = useProposalStore((state) => state.retryLoad)

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [search, setSearch] = useState('')
  const filtersModal = useFilterModal<{ status: ProjectStatusFilter; clientId: string }>({
    status: 'all',
    clientId: 'all',
  })
  const { alert } = useAlert()
  const handleProjectRemoval = useRemovalHandler<ProjectWithClient>({
    confirmLabel: t('projects.delete_confirm_label'),
    description: (project) => t('projects.delete_confirm_description', { name: project.name }),
    remove: removeProject,
    successMessage: t('projects.delete_success'),
    errorMessage: t('projects.delete_error'),
  })
  const { isSubmitting, handleSubmit: handleProjectSubmit } = useSubmitHandler({
    selected: selectedProject,
    add: addProject,
    edit: editProject,
    onSuccess: closeModal,
    createdMessage: t('projects.save_created'),
    updatedMessage: t('projects.save_updated'),
    errorMessage: t('projects.save_error'),
  })

  useEffect(() => {
    void Promise.all([
      ensureClientsLoaded(),
      ensureProjectsLoaded(),
      ensureProposalsLoaded(),
    ])
  }, [ensureClientsLoaded, ensureProjectsLoaded, ensureProposalsLoaded])

  useEffect(() => {
    const shouldOpenNewModal = searchParams.get('new') === '1'

    if (!shouldOpenNewModal || clients.length === 0) {
      return
    }

    selectProject(null)
    setIsModalOpen(true)

    const nextParams = new URLSearchParams(searchParams)
    nextParams.delete('new')
    setSearchParams(nextParams, { replace: true })
  }, [searchParams, setSearchParams, clients, selectProject])

  const projectsWithClient = getProjectsWithClient(projects, clients)
  const commercialSummary = getProjectsCommercialSummary(proposals)
  const filteredProjects = getFilteredProjects(projectsWithClient, {
    search,
    status: filtersModal.value.status,
    clientId: filtersModal.value.clientId,
  })

  function openCreateModal() {
    if (clients.length === 0) {
      alert(t('projects.needs_client_first'))
      return
    }

    selectProject(null)
    setIsModalOpen(true)
  }

  function openEditModal(project: ProjectWithClient) {
    selectProject(project)
    setIsModalOpen(true)
  }

  function closeModal() {
    selectProject(null)
    setIsModalOpen(false)
  }

  async function handleRetryLoad() {
    await Promise.all([retryClientsLoad(), retryProjectsLoad()])
  }

  async function handleRetryCommercialSummaryLoad() {
    await retryProposalsLoad()
  }

  function resetAllFilters() {
    setSearch('')
    filtersModal.clear()
  }

  function setStatusFilter(status: ProjectStatusFilter) {
    filtersModal.setValue((prev) => ({ ...prev, status }))
  }

  function setClientFilter(clientId: string) {
    filtersModal.setValue((prev) => ({ ...prev, clientId }))
  }

  function setStatusFilterDraft(status: ProjectStatusFilter) {
    filtersModal.setDraft((prev) => ({ ...prev, status }))
  }

  function setClientFilterDraft(clientId: string) {
    filtersModal.setDraft((prev) => ({ ...prev, clientId }))
  }

  return {
    clientFilter: filtersModal.value.clientId,
    clientFilterDraft: filtersModal.draft.clientId,
    clients,
    combinedError: clientError ?? projectError,
    commercialSummary,
    filteredProjects,
    hasActiveSelectionFilters:
      filtersModal.value.status !== 'all' || filtersModal.value.clientId !== 'all',
    hasCommercialSummaryLoadError: hasResourceLoadError(proposalsLoadStatus),
    hasLoadError:
      hasResourceLoadError(clientsLoadStatus) ||
      hasResourceLoadError(projectsLoadStatus),
    isFilterModalOpen: filtersModal.isOpen,
    isLoading:
      isResourcePending(clientsLoadStatus) ||
      isResourcePending(projectsLoadStatus),
    isModalOpen,
    isSubmitting,
    proposalError,
    search,
    selectedProject,
    showCommercialSummary:
      proposalsLoadStatus === 'ready' && commercialSummary.openCount > 0,
    statusFilter: filtersModal.value.status,
    statusFilterDraft: filtersModal.draft.status,
    applyFilterModal: filtersModal.apply,
    clearFilterModal: filtersModal.clear,
    closeModal,
    handleProjectRemoval,
    handleProjectSubmit,
    handleRetryCommercialSummaryLoad,
    handleRetryLoad,
    openCreateModal,
    openEditModal,
    openFilterModal: filtersModal.open,
    resetAllFilters,
    setClientFilter,
    setClientFilterDraft,
    setIsFilterModalOpen: filtersModal.setIsOpen,
    setSearch,
    setStatusFilter,
    setStatusFilterDraft,
  }
}
