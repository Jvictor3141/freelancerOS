import type { Client } from '../types/client';
import type {
  ClientInput,
  PaymentInput,
  ProjectInput,
  ProposalInput,
} from '../types/inputs'
import type { Payment } from '../types/payment';
import type { Proposal } from '../types/proposal';
import type { Project } from '../types/project';

type NumericValue = number | string;

export type ClientRecord = {
  id: string;
  user_id: string;
  name: string;
  company: string | null;
  email: string;
  phone: string | null;
  notes: string | null;
  created_at: string;
};

export type ProjectRecord = {
  id: string;
  user_id: string;
  client_id: string;
  name: string;
  description: string | null;
  value: NumericValue;
  deadline: string | null;
  status: Project['status'];
  created_at: string;
};

export type PaymentRecord = {
  id: string;
  user_id: string;
  project_id: string;
  amount: NumericValue;
  due_date: string;
  paid_at: string | null;
  status: Payment['status'];
  method: Payment['method'];
  notes: string | null;
  created_at: string;
};

export type ProposalRecord = {
  id: string;
  user_id: string;
  client_id: string;
  project_id: string | null;
  title: string;
  description: string | null;
  amount: NumericValue;
  delivery_days: number;
  recipient_email: string;
  status: Proposal['status'];
  sent_at: string | null;
  accepted_at: string | null;
  rejected_at: string | null;
  client_responded_at: string | null;
  client_response_channel: Proposal['clientResponseChannel'] | null;
  notes: string | null;
  created_at: string;
};

type BasePayloadOptions = {
  id?: string
  createdAt?: string
  userId?: string
}

type ProposalPayloadOptions = BasePayloadOptions & {
  projectId?: string | null
  sentAt?: string | null
  acceptedAt?: string | null
  rejectedAt?: string | null
}

// Os mapeamentos abaixo convertem o formato snake_case do banco no shape usado pela UI.
export function mapClientRecord(record: ClientRecord): Client {
  return {
    id: record.id,
    name: record.name,
    company: record.company ?? '',
    email: record.email,
    phone: record.phone ?? '',
    notes: record.notes ?? '',
    createdAt: record.created_at,
  };
}

export function mapProjectRecord(record: ProjectRecord): Project {
  return {
    id: record.id,
    clientId: record.client_id,
    name: record.name,
    description: record.description ?? '',
    value: Number(record.value),
    deadline: record.deadline ?? '',
    status: record.status,
    createdAt: record.created_at,
  };
}

export function mapPaymentRecord(record: PaymentRecord): Payment {
  return {
    id: record.id,
    projectId: record.project_id,
    amount: Number(record.amount),
    dueDate: record.due_date,
    paidAt: record.paid_at,
    status: record.status,
    method: record.method,
    notes: record.notes ?? '',
    createdAt: record.created_at,
  };
}

export function mapProposalRecord(record: ProposalRecord): Proposal {
  return {
    id: record.id,
    clientId: record.client_id,
    projectId: record.project_id,
    title: record.title,
    description: record.description ?? '',
    amount: Number(record.amount),
    deliveryDays: Number(record.delivery_days || 0),
    recipientEmail: record.recipient_email,
    status: record.status,
    sentAt: record.sent_at,
    acceptedAt: record.accepted_at,
    rejectedAt: record.rejected_at,
    clientRespondedAt: record.client_responded_at,
    clientResponseChannel: record.client_response_channel,
    notes: record.notes ?? '',
    createdAt: record.created_at,
  };
}

// Os payloads abaixo garantem que inserts e updates enviem ao banco apenas os campos esperados.
export function toClientPayload(
  data: ClientInput,
  options?: BasePayloadOptions,
) {
  return {
    ...(options?.id ? { id: options.id } : {}),
    ...(options?.createdAt ? { created_at: options.createdAt } : {}),
    ...(options?.userId ? { user_id: options.userId } : {}),
    name: data.name,
    company: data.company,
    email: data.email,
    phone: data.phone,
    notes: data.notes,
  };
}

export function toProjectPayload(
  data: ProjectInput,
  options?: BasePayloadOptions,
) {
  return {
    ...(options?.id ? { id: options.id } : {}),
    ...(options?.createdAt ? { created_at: options.createdAt } : {}),
    ...(options?.userId ? { user_id: options.userId } : {}),
    client_id: data.clientId,
    name: data.name,
    description: data.description,
    value: data.value,
    deadline: data.deadline || null,
    status: data.status,
  };
}

export function toPaymentPayload(
  data: PaymentInput,
  options?: BasePayloadOptions,
) {
  return {
    ...(options?.id ? { id: options.id } : {}),
    ...(options?.createdAt ? { created_at: options.createdAt } : {}),
    ...(options?.userId ? { user_id: options.userId } : {}),
    project_id: data.projectId,
    amount: data.amount,
    due_date: data.dueDate,
    paid_at: data.paidAt,
    status: data.status,
    method: data.method,
    notes: data.notes,
  };
}

export function toProposalPayload(
  data: ProposalInput,
  options?: ProposalPayloadOptions,
) {
  return {
    ...(options?.id ? { id: options.id } : {}),
    ...(options?.createdAt ? { created_at: options.createdAt } : {}),
    ...(options?.userId ? { user_id: options.userId } : {}),
    ...(options?.projectId !== undefined ? { project_id: options.projectId } : {}),
    ...(options?.sentAt !== undefined ? { sent_at: options.sentAt } : {}),
    ...(options?.acceptedAt !== undefined
      ? { accepted_at: options.acceptedAt }
      : {}),
    ...(options?.rejectedAt !== undefined
      ? { rejected_at: options.rejectedAt }
      : {}),
    client_id: data.clientId,
    title: data.title,
    description: data.description,
    amount: data.amount,
    delivery_days: data.deliveryDays,
    recipient_email: data.recipientEmail,
    status: data.status,
    notes: data.notes,
  };
}
