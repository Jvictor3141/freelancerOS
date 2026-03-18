import type { Client } from '../types/client'
import type { Proposal } from '../types/proposal'
import type { Project, ProjectStatus } from '../types/project'

export const projectStatusFilterOptions: Array<ProjectStatus | 'all'> = [
  'all',
  'in_progress',
  'review',
  'completed',
]

export type ProjectWithClient = Project & {
  clientName: string
  clientCompany: string
}

export type ProjectListFilters = {
  search: string
  status: ProjectStatus | 'all'
  clientId: string
}

export type ProjectsCommercialSummary = {
  openCount: number
  sentCount: number
  draftCount: number
  openPipelineValue: number
}

export function getProjectsWithClient(
  projects: Project[],
  clients: Client[],
): ProjectWithClient[] {
  const clientMap = new Map(clients.map((client) => [client.id, client]))

  return projects.map((project) => {
    const client = clientMap.get(project.clientId)

    return {
      ...project,
      clientName: client?.name ?? 'Cliente não encontrado',
      clientCompany: client?.company ?? '',
    }
  })
}

export function getProjectsCommercialSummary(
  proposals: Proposal[],
): ProjectsCommercialSummary {
  const openProposals = proposals.filter(
    (proposal) => proposal.status === 'draft' || proposal.status === 'sent',
  )
  const sentCount = openProposals.filter(
    (proposal) => proposal.status === 'sent',
  ).length
  const draftCount = openProposals.length - sentCount
  const openPipelineValue = openProposals.reduce(
    (total, proposal) => total + proposal.amount,
    0,
  )

  return {
    openCount: openProposals.length,
    sentCount,
    draftCount,
    openPipelineValue,
  }
}

export function getFilteredProjects(
  projects: ProjectWithClient[],
  filters: ProjectListFilters,
) {
  const term = filters.search.trim().toLowerCase()

  return projects
    .filter((project) => project.status !== 'proposal')
    .filter((project) => {
      const matchesSearch =
        !term ||
        project.name.toLowerCase().includes(term) ||
        project.description.toLowerCase().includes(term) ||
        project.clientName.toLowerCase().includes(term)

      const matchesStatus =
        filters.status === 'all' || project.status === filters.status

      const matchesClient =
        filters.clientId === 'all' || project.clientId === filters.clientId

      return matchesSearch && matchesStatus && matchesClient
    })
}
