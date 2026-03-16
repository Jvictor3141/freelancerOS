export type ProposalStatus = 'draft' | 'sent' | 'accepted' | 'rejected';
export type ProposalResponseChannel = 'shared_link';

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
