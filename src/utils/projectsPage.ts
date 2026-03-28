import type { Client } from '../types/client'
import type { Proposal } from '../types/proposal'
import type { Project } from '../types/project'
import type {
  ProjectWithClient,
  ProjectsCommercialSummary,
} from '../types/viewModels'
import type { ProjectStatusFilter } from './projectStatus'
import {
  countProposalsByStatus,
  getOpenProposalValue,
  isProposalOpen,
} from './proposalRules'

export type ProjectListFilters = {
  search: string
  status: ProjectStatusFilter
  clientId: string
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
  const openProposals = proposals.filter(isProposalOpen)
  const sentCount = countProposalsByStatus(openProposals, 'sent')
  const draftCount = countProposalsByStatus(openProposals, 'draft')

  return {
    openCount: openProposals.length,
    sentCount,
    draftCount,
    openPipelineValue: getOpenProposalValue(openProposals),
  }
}

export function getFilteredProjects(
  projects: ProjectWithClient[],
  filters: ProjectListFilters,
) {
  const term = filters.search.trim().toLowerCase()

  return projects.filter((project) => {
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
