import { proposalStatuses, type ProposalStatus } from '../types/proposal'
import { isOneOf } from './typeGuards'

export const proposalStatusOptions = ['all', ...proposalStatuses] as const

export type ProposalStatusFilter = (typeof proposalStatusOptions)[number]

export function isProposalStatus(value: string): value is ProposalStatus {
  return isOneOf(proposalStatuses, value)
}

export function isProposalStatusFilter(value: string): value is ProposalStatusFilter {
  return isOneOf(proposalStatusOptions, value)
}

export function parseProposalStatusFilter(value: string): ProposalStatusFilter {
  return isProposalStatusFilter(value) ? value : 'all'
}

export const proposalStatusLabel: Record<ProposalStatus, string> = {
  draft: 'Rascunho',
  sent: 'Enviada',
  accepted: 'Aceita',
  rejected: 'Recusada',
}

export const proposalStatusClassName: Record<ProposalStatus, string> = {
  draft: 'bg-slate-100 text-slate-700',
  sent: 'bg-blue-100 text-blue-700',
  accepted: 'bg-emerald-100 text-emerald-700',
  rejected: 'bg-rose-100 text-rose-700',
}
