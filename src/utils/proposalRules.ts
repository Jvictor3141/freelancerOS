import type { Proposal, ProposalStatus } from '../types/proposal'

export type ProposalSendMode = 'send' | 'resend'

export function isAcceptedProposal(
  proposal: Pick<Proposal, 'status'>,
): boolean {
  return proposal.status === 'accepted'
}

export function isRejectedProposal(
  proposal: Pick<Proposal, 'status'>,
): boolean {
  return proposal.status === 'rejected'
}

export function isProposalOpenStatus(
  status: ProposalStatus,
): status is 'draft' | 'sent' {
  return status === 'draft' || status === 'sent'
}

export function isProposalOpen(proposal: Pick<Proposal, 'status'>): boolean {
  return isProposalOpenStatus(proposal.status)
}

export function canEditProposal(proposal: Pick<Proposal, 'status'>): boolean {
  return !isAcceptedProposal(proposal)
}

export function canGenerateProposalShareLink(
  proposal: Pick<Proposal, 'status'>,
): boolean {
  return !isAcceptedProposal(proposal)
}

export function getProposalSendMode(
  proposal: Pick<Proposal, 'status'>,
): ProposalSendMode | null {
  if (proposal.status === 'draft' || proposal.status === 'rejected') {
    return 'send'
  }

  if (proposal.status === 'sent') {
    return 'resend'
  }

  return null
}

export function canAcceptProposal(proposal: Pick<Proposal, 'status'>): boolean {
  return isProposalOpen(proposal)
}

export function canRejectProposal(proposal: Pick<Proposal, 'status'>): boolean {
  return isProposalOpen(proposal)
}

export function canReopenProposal(proposal: Pick<Proposal, 'status'>): boolean {
  return isRejectedProposal(proposal)
}

export function canOpenProposalProject(
  proposal: Pick<Proposal, 'status'>,
): boolean {
  return isAcceptedProposal(proposal)
}

export function hasSharedLinkClientResponse(
  proposal: Pick<Proposal, 'clientRespondedAt' | 'clientResponseChannel'>,
): boolean {
  return Boolean(proposal.clientRespondedAt) && proposal.clientResponseChannel === 'shared_link'
}

export function getClientRespondedProposals<
  TProposal extends Pick<
    Proposal,
    'status' | 'clientRespondedAt' | 'clientResponseChannel'
  >,
>(proposals: TProposal[]): TProposal[] {
  return proposals.filter(
    (proposal) =>
      hasSharedLinkClientResponse(proposal) &&
      (isAcceptedProposal(proposal) || isRejectedProposal(proposal)),
  )
}

export function sortProposalsByClientResponseDesc<
  TProposal extends Pick<Proposal, 'clientRespondedAt'>,
>(proposals: TProposal[]): TProposal[] {
  return proposals
    .slice()
    .sort(
      (firstProposal, secondProposal) =>
        new Date(secondProposal.clientRespondedAt ?? 0).getTime() -
        new Date(firstProposal.clientRespondedAt ?? 0).getTime(),
    )
}

function getComparableProposalResponseTime(
  proposal: Pick<
    Proposal,
    'acceptedAt' | 'rejectedAt' | 'clientRespondedAt'
  >,
) {
  return Math.max(
    new Date(proposal.acceptedAt ?? 0).getTime(),
    new Date(proposal.rejectedAt ?? 0).getTime(),
    new Date(proposal.clientRespondedAt ?? 0).getTime(),
  )
}

export function reconcileProposalSnapshot<
  TProposal extends Pick<
    Proposal,
    | 'id'
    | 'status'
    | 'projectId'
    | 'acceptedAt'
    | 'rejectedAt'
    | 'clientRespondedAt'
  >,
>(currentProposal: TProposal | null, nextProposal: TProposal) {
  if (!currentProposal || currentProposal.id !== nextProposal.id) {
    return nextProposal
  }

  const currentResponseTime = getComparableProposalResponseTime(currentProposal)
  const nextResponseTime = getComparableProposalResponseTime(nextProposal)

  if (currentResponseTime > nextResponseTime) {
    return currentProposal
  }

  if (nextResponseTime > currentResponseTime) {
    return nextProposal
  }

  if (!isProposalOpen(currentProposal) && isProposalOpen(nextProposal)) {
    return currentProposal
  }

  if (
    currentProposal.status === 'accepted' &&
    currentProposal.projectId &&
    !nextProposal.projectId
  ) {
    return currentProposal
  }

  return nextProposal
}

export function countProposalsByStatus(
  proposals: Array<Pick<Proposal, 'status'>>,
  status: ProposalStatus,
): number {
  return proposals.filter((proposal) => proposal.status === status).length
}

export function getOpenProposalValue(
  proposals: Array<Pick<Proposal, 'status' | 'amount'>>,
): number {
  return proposals.reduce((total, proposal) => {
    return isProposalOpenStatus(proposal.status)
      ? total + proposal.amount
      : total
  }, 0)
}
