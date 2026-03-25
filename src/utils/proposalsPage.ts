import type { Client } from '../types/client'
import type { Proposal } from '../types/proposal'
import type { ProposalMetrics, ProposalWithClient } from '../types/viewModels'
import type { ProposalStatusFilter } from './proposalStatus'
import {
  buildScopedStorageKey,
  excludeItemsById,
  readStoredStringList,
  writeStoredStringList,
} from './persistedStringList'
import {
  countProposalsByStatus,
  getClientRespondedProposals,
  getOpenProposalValue,
  sortProposalsByClientResponseDesc,
} from './proposalRules'

export const shareExpirationOptions = [
  { value: 1, label: '1 dia' },
  { value: 3, label: '3 dias' },
  { value: 7, label: '7 dias' },
  { value: 14, label: '14 dias' },
  { value: 30, label: '30 dias' },
]

const dismissedProposalResponseNotificationsStoragePrefix =
  'dismissed-proposal-response-notifications'

export function buildClientResponseNotificationId(
  proposal: Pick<Proposal, 'id' | 'clientRespondedAt'>,
) {
  return `${proposal.id}:${proposal.clientRespondedAt ?? 'pending'}`
}

function getDismissedClientResponseNotificationsStorageKey(
  userId: string | null,
) {
  return buildScopedStorageKey(
    dismissedProposalResponseNotificationsStoragePrefix,
    userId,
  )
}

export function readDismissedClientResponseNotificationIds(userId: string | null) {
  return readStoredStringList(
    getDismissedClientResponseNotificationsStorageKey(userId),
  )
}

export function writeDismissedClientResponseNotificationIds(
  userId: string | null,
  notificationIds: string[],
) {
  writeStoredStringList(
    getDismissedClientResponseNotificationsStorageKey(userId),
    notificationIds,
  )
}

export function getProposalsWithClient(
  proposals: Proposal[],
  clients: Client[],
): ProposalWithClient[] {
  const clientMap = new Map(clients.map((client) => [client.id, client]))

  return proposals.map((proposal) => {
    const client = clientMap.get(proposal.clientId)

    return {
      ...proposal,
      clientName: client?.name ?? 'Cliente não encontrado',
      clientCompany: client?.company ?? '',
    }
  })
}

export function getFilteredProposals(
  proposals: ProposalWithClient[],
  search: string,
  statusFilter: ProposalStatusFilter,
) {
  const term = search.trim().toLowerCase()

  return proposals.filter((proposal) => {
    const matchesSearch =
      !term ||
      proposal.title.toLowerCase().includes(term) ||
      proposal.description.toLowerCase().includes(term) ||
      proposal.clientName.toLowerCase().includes(term) ||
      proposal.recipientEmail.toLowerCase().includes(term)

    const matchesStatus =
      statusFilter === 'all' || proposal.status === statusFilter

    return matchesSearch && matchesStatus
  })
}

export function getClientResponseNotifications(
  proposals: ProposalWithClient[],
) {
  return sortProposalsByClientResponseDesc(
    getClientRespondedProposals(proposals),
  )
}

export function getVisibleClientResponseNotifications(
  notifications: ProposalWithClient[],
  dismissedNotificationIds: string[],
) {
  return excludeItemsById(
    notifications,
    dismissedNotificationIds,
    buildClientResponseNotificationId,
  )
}

export function getProposalMetrics(proposals: Proposal[]): ProposalMetrics {
  return {
    draftCount: countProposalsByStatus(proposals, 'draft'),
    sentCount: countProposalsByStatus(proposals, 'sent'),
    acceptedCount: countProposalsByStatus(proposals, 'accepted'),
    openPipelineValue: getOpenProposalValue(proposals),
  }
}
