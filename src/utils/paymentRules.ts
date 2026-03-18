import type { Payment, PaymentStatus } from '../types/payment'

export type PaymentAttentionStatus = Extract<PaymentStatus, 'pending' | 'overdue'>

function getComparableDueDate(value: string) {
  const timestamp = new Date(value).getTime()
  return Number.isNaN(timestamp) ? Number.POSITIVE_INFINITY : timestamp
}

export function isPaymentPaid(payment: Pick<Payment, 'status'>): boolean {
  return payment.status === 'paid'
}

export function canMarkPaymentAsPaid(payment: Pick<Payment, 'status'>): boolean {
  return !isPaymentPaid(payment)
}

export function isPaymentAttentionStatus(
  status: PaymentStatus,
): status is PaymentAttentionStatus {
  return status === 'pending' || status === 'overdue'
}

export function requiresPaymentAttention<
  TPayment extends Pick<Payment, 'status'>,
>(
  payment: TPayment,
): payment is TPayment & { status: PaymentAttentionStatus } {
  return isPaymentAttentionStatus(payment.status)
}

export function shouldPaymentBeMarkedAsOverdue(
  payment: Pick<Payment, 'status' | 'dueDate'>,
  now = new Date(),
): boolean {
  if (payment.status === 'paid' || payment.status === 'overdue') {
    return false
  }

  return getComparableDueDate(payment.dueDate) < now.getTime()
}

export function getPaymentsNeedingOverdueStatus<
  TPayment extends Pick<Payment, 'status' | 'dueDate'>,
>(payments: TPayment[], now = new Date()): TPayment[] {
  return payments.filter((payment) => shouldPaymentBeMarkedAsOverdue(payment, now))
}

export function getPaymentsRequiringAttention<
  TPayment extends Pick<Payment, 'status'>,
>(payments: TPayment[]): Array<TPayment & { status: PaymentAttentionStatus }> {
  return payments.filter(requiresPaymentAttention)
}

export function sortPaymentsByDueDate<TPayment extends Pick<Payment, 'dueDate'>>(
  payments: TPayment[],
): TPayment[] {
  return payments
    .slice()
    .sort(
      (firstPayment, secondPayment) =>
        getComparableDueDate(firstPayment.dueDate) -
        getComparableDueDate(secondPayment.dueDate),
    )
}
