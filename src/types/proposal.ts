export const proposalStatuses = [
  'draft',
  'sent',
  'accepted',
  'rejected',
] as const;
export type ProposalStatus = (typeof proposalStatuses)[number];

export const proposalResponseChannels = ['shared_link'] as const;
export type ProposalResponseChannel = (typeof proposalResponseChannels)[number];

export type Proposal = {
  id: string;
  clientId: string;
  projectId: string | null;
  title: string;
  description: string;
  amount: number;
  deliveryDays: number;
  recipientEmail: string;
  status: ProposalStatus;
  sentAt: string | null;
  acceptedAt: string | null;
  rejectedAt: string | null;
  clientRespondedAt: string | null;
  clientResponseChannel: ProposalResponseChannel | null;
  notes: string;
  createdAt: string;
};
