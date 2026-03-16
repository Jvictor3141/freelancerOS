import type { FreelancerProfile } from './freelancerProfile';
import type { ProposalResponseChannel, ProposalStatus } from './proposal';

export type ProposalSecureShareLink = {
  shareId: string;
  url: string;
  expiresAt: string;
};

export type SharedProposal = {
  shareId: string;
  title: string;
  description: string;
  amount: number;
  deliveryDays: number;
  status: ProposalStatus;
  sentAt: string | null;
  acceptedAt: string | null;
  rejectedAt: string | null;
  clientRespondedAt: string | null;
  clientResponseChannel: ProposalResponseChannel | null;
  createdAt: string;
  expiresAt: string;
  lastViewedAt: string | null;
  canRespond: boolean;
  clientName: string;
  clientCompany: string;
  freelancerProfile: FreelancerProfile;
};
