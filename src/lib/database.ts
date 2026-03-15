import type { Client } from '../types/client';
import type { Payment } from '../types/payment';
import type { Project } from '../types/project';

type NumericValue = number | string;

export type ClientInput = Omit<Client, 'id' | 'createdAt'>;
export type ProjectInput = Omit<Project, 'id' | 'createdAt'>;
export type PaymentInput = Omit<Payment, 'id' | 'createdAt'>;

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

type ClientPayloadOptions = {
  id?: string;
  createdAt?: string;
  userId?: string;
};

type ProjectPayloadOptions = {
  id?: string;
  createdAt?: string;
  userId?: string;
};

type PaymentPayloadOptions = {
  id?: string;
  createdAt?: string;
  userId?: string;
};

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

// Os payloads abaixo garantem que inserts e updates enviem ao banco apenas os campos esperados.
export function toClientPayload(
  data: ClientInput,
  options?: ClientPayloadOptions,
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
  options?: ProjectPayloadOptions,
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
  options?: PaymentPayloadOptions,
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
