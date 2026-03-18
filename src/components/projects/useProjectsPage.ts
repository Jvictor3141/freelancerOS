import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useFeedback } from '../FeedbackProvider'
import type { ProjectInput } from '../../lib/database'
import { getToastToneForMessage } from '../../lib/feedback'
import { getErrorMessage } from '../../lib/supabase'
import { useClientStore } from '../../store/useClientStore'
import { useProjectStore } from '../../store/useProjectStore'
import { useProposalStore } from '../../store/useProposalStore'
import type { ProjectStatus } from '../../types/project'
import type { ProjectWithClient } from '../../utils/projectsPage'
import {
  getFilteredProjects,
  getProjectsCommercialSummary,
  getProjectsWithClient,
} from '../../utils/projectsPage'

export function useProjectsPage() {
  const [searchParams, setSearchParams] = useSearchParams()

  const clients = useClientStore((state) => state.clients)
  const clientError = useClientStore((state) => state.error)
  const clientsInitialized = useClientStore((state) => state.initialized)
  const loadClients = useClientStore((state) => state.loadClients)

  const projects = useProjectStore((state) => state.projects)
  const selectedProject = useProjectStore((state) => state.selectedProject)
  const projectError = useProjectStore((state) => state.error)
  const projectsInitialized = useProjectStore((state) => state.initialized)
  const loadProjects = useProjectStore((state) => state.loadProjects)
  const selectProject = useProjectStore((state) => state.selectProject)
  const addProject = useProjectStore((state) => state.addProject)
  const editProject = useProjectStore((state) => state.editProject)
  const removeProject = useProjectStore((state) => state.removeProject)

  const proposals = useProposalStore((state) => state.proposals)
  const proposalError = useProposalStore((state) => state.error)
  const proposalsInitialized = useProposalStore((state) => state.initialized)
  const loadProposals = useProposalStore((state) => state.loadProposals)

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | 'all'>('all')
  const [clientFilter, setClientFilter] = useState('all')
  const [statusFilterDraft, setStatusFilterDraft] =
    useState<ProjectStatus | 'all'>('all')
  const [clientFilterDraft, setClientFilterDraft] = useState('all')
  const { confirm, notify } = useFeedback()

  function alert(message: string) {
    notify({
      tone: getToastToneForMessage(message),
      title: message,
    })
  }

  useEffect(() => {
    void Promise.all([loadClients(), loadProjects(), loadProposals()])
  }, [loadClients, loadProjects, loadProposals])

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
    status: statusFilter,
    clientId: clientFilter,
  })

  function openCreateModal() {
    if (clients.length === 0) {
      alert('Cadastre pelo menos um cliente antes de criar um projeto.')
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

  function resetAllFilters() {
    setSearch('')
    setStatusFilter('all')
    setClientFilter('all')
    setStatusFilterDraft('all')
    setClientFilterDraft('all')
  }

  function openFilterModal() {
    setStatusFilterDraft(statusFilter)
    setClientFilterDraft(clientFilter)
    setIsFilterModalOpen(true)
  }

  function applyFilterModal() {
    setStatusFilter(statusFilterDraft)
    setClientFilter(clientFilterDraft)
    setIsFilterModalOpen(false)
  }

  function clearFilterModal() {
    setStatusFilterDraft('all')
    setClientFilterDraft('all')
    setStatusFilter('all')
    setClientFilter('all')
  }

  async function handleProjectSubmit(values: ProjectInput) {
    const isEditing = Boolean(selectedProject)
    setIsSubmitting(true)

    try {
      if (selectedProject) {
        await editProject(selectedProject.id, values)
      } else {
        await addProject(values)
      }

      closeModal()
      alert(
        isEditing
          ? 'Projeto atualizado com sucesso.'
          : 'Projeto criado com sucesso.',
      )
    } catch (submitError) {
      alert(getErrorMessage(submitError, 'Não foi possível salvar o projeto.'))
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleProjectRemoval(project: ProjectWithClient) {
    const confirmed = await confirm({
      title: 'Excluir projeto?',
      description: `Deseja excluir o projeto "${project.name}"?`,
      confirmLabel: 'Excluir projeto',
      cancelLabel: 'Cancelar',
      tone: 'danger',
    })

    if (!confirmed) {
      return
    }

    try {
      await removeProject(project.id)
      alert('Projeto excluido com sucesso.')
    } catch (removeError) {
      alert(getErrorMessage(removeError, 'Não foi possível excluir o projeto.'))
    }
  }

  return {
    clientFilter,
    clientFilterDraft,
    clients,
    combinedError: clientError ?? projectError,
    commercialSummary,
    filteredProjects,
    hasActiveSelectionFilters:
      statusFilter !== 'all' || clientFilter !== 'all',
    isFilterModalOpen,
    isLoading: !clientsInitialized || !projectsInitialized,
    isModalOpen,
    isSubmitting,
    proposalError,
    search,
    selectedProject,
    showCommercialSummary:
      proposalsInitialized && commercialSummary.openCount > 0,
    statusFilter,
    statusFilterDraft,
    applyFilterModal,
    clearFilterModal,
    closeModal,
    handleProjectRemoval,
    handleProjectSubmit,
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
  }
}
