import type { Client } from './client'
import type { Payment } from './payment'
import type { Proposal } from './proposal'
import type { Project } from './project'

type PersistedEntity = {
  id: string
  createdAt: string
}

type EntityInput<T extends PersistedEntity> = Omit<T, 'id' | 'createdAt'>

export type ClientInput = EntityInput<Client>
export type ProjectInput = EntityInput<Project>
export type PaymentInput = EntityInput<Payment>
export type ProposalInput = Omit<
  Proposal,
  | 'id'
  | 'projectId'
  | 'sentAt'
  | 'acceptedAt'
  | 'rejectedAt'
  | 'clientRespondedAt'
  | 'clientResponseChannel'
  | 'createdAt'
>
