import type { FreelancerProfile } from './freelancerProfile'
import type { Proposal } from './proposal'

export type ProposalSecureShareLink = {
  shareId: string;
  url: string;
  expiresAt: string;
};

export type SharedProposal = Pick<
  Proposal,
  | 'title'
  | 'description'
  | 'amount'
  | 'deliveryDays'
  | 'status'
  | 'sentAt'
  | 'acceptedAt'
  | 'rejectedAt'
  | 'clientRespondedAt'
  | 'clientResponseChannel'
  | 'createdAt'
> & {
  shareId: string
  expiresAt: string
  lastViewedAt: string | null
  canRespond: boolean
  clientName: string
  clientCompany: string
  freelancerProfile: FreelancerProfile
}

export type SharedProposalDecision = 'accept' | 'reject'

export type ProposalShareAction =
  | 'create_share_link'
  | 'get_shared_proposal'
  | 'respond_to_shared_proposal'

export type CreateProposalShareLinkRequest = {
  action: 'create_share_link'
  proposalId: string
  expiresInDays: number
}

export type GetSharedProposalRequest = {
  action: 'get_shared_proposal'
  shareId: string
  token: string
}

export type RespondToSharedProposalRequest = {
  action: 'respond_to_shared_proposal'
  shareId: string
  token: string
  decision: SharedProposalDecision
}

export type ProposalShareRequest =
  | CreateProposalShareLinkRequest
  | GetSharedProposalRequest
  | RespondToSharedProposalRequest

export type CreateShareLinkResponse = {
  shareLink: ProposalSecureShareLink
}

export type SharedProposalResponse = {
  proposal: SharedProposal
}

export type ProposalShareResponse =
  | CreateShareLinkResponse
  | SharedProposalResponse
