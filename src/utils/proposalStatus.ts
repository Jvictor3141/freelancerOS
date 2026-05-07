import { proposalStatuses, type ProposalStatus } from '../types/proposal';
import { isOneOf } from './typeGuards';

export const proposalStatusOptions = ['all', ...proposalStatuses] as const;

export type ProposalStatusFilter = (typeof proposalStatusOptions)[number];

export function isProposalStatusFilter(
  value: string,
): value is ProposalStatusFilter {
  return isOneOf(proposalStatusOptions, value);
}

export function parseProposalStatusFilter(value: string): ProposalStatusFilter {
  return isProposalStatusFilter(value) ? value : 'all';
}

/**
 * Maps each proposal status to its i18n translation key.
 * Usage: t(proposalStatusLabel[status])
 */
export const proposalStatusLabel: Record<ProposalStatus, string> = {
  draft: 'status.proposal.draft',
  sent: 'status.proposal.sent',
  accepted: 'status.proposal.accepted',
  rejected: 'status.proposal.rejected',
};

export const proposalStatusClassName: Record<ProposalStatus, string> = {
  draft: 'bg-slate-100 text-slate-700',
  sent: 'bg-blue-100 text-blue-700',
  accepted: 'bg-emerald-100 text-emerald-700',
  rejected: 'bg-rose-100 text-rose-700',
};
