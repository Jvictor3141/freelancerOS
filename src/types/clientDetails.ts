import type { CurrencyCode } from '../i18n/config'
import type { Client } from './client'
import type { Payment } from './payment'
import type { Project } from './project'

export type ClientCurrencyAmount = {
  currency: CurrencyCode
  amount: number
}

export type ClientFinancialSummary = {
  contractedByCurrency: ClientCurrencyAmount[]
  receivedByCurrency: ClientCurrencyAmount[]
  pendingByCurrency: ClientCurrencyAmount[]
  overdueByCurrency: ClientCurrencyAmount[]
  outstandingByCurrency: ClientCurrencyAmount[]
  completedProjects: number
}

export type ClientDetailsSnapshot = {
  client: Client
  projects: Project[]
  payments: Payment[]
  summary: ClientFinancialSummary
}
