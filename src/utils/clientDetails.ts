import type { Payment } from '../types/payment'
import type { Project } from '../types/project'
import { getPaymentAmountSummary, sumProjectValues } from './financial'
import { countCompletedProjects } from './projectRules'

export function getClientProjects(projects: Project[], clientId: string) {
  return projects.filter((project) => project.clientId === clientId)
}

export function getClientPayments(
  payments: Payment[],
  clientProjects: Project[]
) {
  const projectIds = new Set(clientProjects.map((project) => project.id))

  return payments.filter((payment) => projectIds.has(payment.projectId))
}

export function getClientFinancialSummary(
  clientProjects: Project[],
  clientPayments: Payment[]
) {
  const paymentSummary = getPaymentAmountSummary(clientPayments)

  return {
    totalContracted: sumProjectValues(clientProjects),
    totalReceived: paymentSummary.receivedAmount,
    totalPending: paymentSummary.pendingAmount,
    totalOverdue: paymentSummary.overdueAmount,
    totalOutstanding: paymentSummary.outstandingAmount,
    completedProjects: countCompletedProjects(clientProjects),
  }
}
