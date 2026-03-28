import { describe, expect, it } from 'vitest'
import {
  getPaymentsRequiringAttention,
  sortPaymentsByDueDate,
} from './paymentRules'

describe('payment rules', () => {
  it('returns only pending and overdue payments as attention items', () => {
    const payments = [
      { id: '1', status: 'pending' as const },
      { id: '2', status: 'overdue' as const },
      { id: '3', status: 'paid' as const },
    ]

    expect(getPaymentsRequiringAttention(payments)).toEqual([
      payments[0],
      payments[1],
    ])
  })

  it('sorts by due date and keeps invalid dates at the end', () => {
    const payments = [
      { id: 'late', dueDate: '2026-03-20' },
      { id: 'invalid', dueDate: 'invalid-date' },
      { id: 'soon', dueDate: '2026-03-18' },
    ]

    expect(sortPaymentsByDueDate(payments).map((payment) => payment.id)).toEqual([
      'soon',
      'late',
      'invalid',
    ])
  })
})
