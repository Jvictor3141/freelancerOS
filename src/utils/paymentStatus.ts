import {
  paymentMethods,
  persistedPaymentStatuses,
  paymentStatuses,
  type PaymentMethod,
  type PersistedPaymentStatus,
  type PaymentStatus,
} from '../types/payment'
import { isOneOf } from './typeGuards'

export const paymentStatusFilterOptions = [
  'all',
  ...paymentStatuses,
] as const

export type PaymentStatusFilter = (typeof paymentStatusFilterOptions)[number]

export function isPaymentStatus(value: string): value is PaymentStatus {
  return isOneOf(paymentStatuses, value)
}

export function isPersistedPaymentStatus(
  value: string,
): value is PersistedPaymentStatus {
  return isOneOf(persistedPaymentStatuses, value)
}

export function isPaymentMethod(value: string): value is PaymentMethod {
  return isOneOf(paymentMethods, value)
}

export function isPaymentStatusFilter(value: string): value is PaymentStatusFilter {
  return isOneOf(paymentStatusFilterOptions, value)
}

export function parsePaymentStatusFilter(value: string): PaymentStatusFilter {
  return isPaymentStatusFilter(value) ? value : 'all'
}

export function toPersistedPaymentStatus(
  status: PaymentStatus,
): PersistedPaymentStatus {
  return status === 'paid' ? 'paid' : 'pending'
}

export const paymentStatusLabel: Record<PaymentStatus, string> = {
  pending: 'Pendente',
  paid: 'Pago',
  overdue: 'Atrasado',
}

export const paymentStatusClassName: Record<PaymentStatus, string> = {
  pending: 'bg-amber-100 text-amber-700',
  paid: 'bg-emerald-100 text-emerald-700',
  overdue: 'bg-rose-100 text-rose-700',
}
