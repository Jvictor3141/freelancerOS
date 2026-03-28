import type { Payment, PaymentStatus } from '../types/payment'
import { parseCalendarDate } from './dateOnly'

export type PaymentAttentionStatus = Extract<PaymentStatus, 'pending' | 'overdue'>

function getComparableDueDate(value: string) {
  return parseCalendarDate(value)?.getTime() ?? Number.POSITIVE_INFINITY
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
