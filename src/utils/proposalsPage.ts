import type { Client } from '../types/client'
import type { Proposal } from '../types/proposal'
import type { ProposalMetrics, ProposalWithClient } from '../types/viewModels'
import type { ProposalStatusFilter } from './proposalStatus'
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

export function getProposalActionButtonClassName(
  tone: 'neutral' | 'info' | 'success' | 'danger',
) {
  if (tone === 'info') {
    return 'border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100'
  }

  if (tone === 'success') {
    return 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
  }

  if (tone === 'danger') {
    return 'border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100'
  }

  return 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
}

export function buildClientResponseNotificationId(
  proposal: Pick<Proposal, 'id' | 'clientRespondedAt'>,
) {
  return `${proposal.id}:${proposal.clientRespondedAt ?? 'pending'}`
}

function getDismissedClientResponseNotificationsStorageKey(
  userId: string | null,
) {
  return `${dismissedProposalResponseNotificationsStoragePrefix}:${userId ?? 'anonymous'}`
}

export function readDismissedClientResponseNotificationIds(userId: string | null) {
  if (typeof window === 'undefined') {
    return []
  }

  try {
    const rawValue = window.localStorage.getItem(
      getDismissedClientResponseNotificationsStorageKey(userId),
    )

    if (!rawValue) {
      return []
    }

    const parsedValue = JSON.parse(rawValue)

    if (!Array.isArray(parsedValue)) {
      return []
    }

    return parsedValue.filter(
      (value): value is string => typeof value === 'string',
    )
  } catch {
    return []
  }
}

export function writeDismissedClientResponseNotificationIds(
  userId: string | null,
  notificationIds: string[],
) {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.setItem(
    getDismissedClientResponseNotificationsStorageKey(userId),
    JSON.stringify(notificationIds),
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
  limit = 4,
) {
  return sortProposalsByClientResponseDesc(
    getClientRespondedProposals(proposals),
  )
    .slice(0, limit)
}

export function getVisibleClientResponseNotifications(
  notifications: ProposalWithClient[],
  dismissedNotificationIds: string[],
) {
  const dismissedIds = new Set(dismissedNotificationIds)

  return notifications.filter((proposal) => {
    return !dismissedIds.has(buildClientResponseNotificationId(proposal))
  })
}

export function getProposalMetrics(proposals: Proposal[]): ProposalMetrics {
  return {
    draftCount: countProposalsByStatus(proposals, 'draft'),
    sentCount: countProposalsByStatus(proposals, 'sent'),
    acceptedCount: countProposalsByStatus(proposals, 'accepted'),
    openPipelineValue: getOpenProposalValue(proposals),
  }
}
