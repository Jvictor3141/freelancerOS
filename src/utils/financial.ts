import type { Payment } from '../types/payment'
import type { Project } from '../types/project'

export type PaymentAmountSummary = {
  receivedAmount: number
  pendingAmount: number
  overdueAmount: number
  outstandingAmount: number
}

export function sumProjectValues(
  projects: Array<Pick<Project, 'value'>>,
): number {
  return projects.reduce((total, project) => total + Number(project.value || 0), 0)
}

export function getAverageTicket(totalAmount: number, itemCount: number): number {
  return itemCount > 0 ? totalAmount / itemCount : 0
}

export function getPaymentAmountSummary(
  payments: Array<Pick<Payment, 'amount' | 'status'>>,
): PaymentAmountSummary {
  const totals = payments.reduce<PaymentAmountSummary>(
    (currentTotals, payment) => {
      if (payment.status === 'paid') {
        currentTotals.receivedAmount += payment.amount
      } else if (payment.status === 'pending') {
        currentTotals.pendingAmount += payment.amount
      } else if (payment.status === 'overdue') {
        currentTotals.overdueAmount += payment.amount
      }

      return currentTotals
    },
    {
      receivedAmount: 0,
      pendingAmount: 0,
      overdueAmount: 0,
      outstandingAmount: 0,
    },
  )

  return {
    ...totals,
    outstandingAmount: totals.pendingAmount + totals.overdueAmount,
  }
}
