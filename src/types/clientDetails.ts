import type { Client } from './client'
import type { Payment } from './payment'
import type { Project } from './project'

export type ClientFinancialSummary = {
  totalContracted: number
  totalReceived: number
  totalPending: number
  totalOverdue: number
  totalOutstanding: number
  completedProjects: number
}

export type ClientDetailsSnapshot = {
  client: Client
  projects: Project[]
  payments: Payment[]
  summary: ClientFinancialSummary
}
