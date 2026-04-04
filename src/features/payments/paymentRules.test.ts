import { describe, expect, it } from 'vitest'
import {
  getPaymentsRequiringAttention,
  isPaymentAttentionStatus,
  isPaymentPaid,
  requiresPaymentAttention,
  sortPaymentsByDueDate,
} from './paymentRules'

describe('payment rules', () => {
  it('identifies paid payments correctly', () => {
    expect(isPaymentPaid({ status: 'paid' })).toBe(true)
    expect(isPaymentPaid({ status: 'pending' })).toBe(false)
    expect(isPaymentPaid({ status: 'overdue' })).toBe(false)
  })

  it('identifies statuses that require attention', () => {
    expect(isPaymentAttentionStatus('pending')).toBe(true)
    expect(isPaymentAttentionStatus('overdue')).toBe(true)
    expect(isPaymentAttentionStatus('paid')).toBe(false)
  })

  it('narrows payments that require attention', () => {
    const payment = { status: 'pending' } as const

    expect(requiresPaymentAttention(payment)).toBe(true)
    expect(getPaymentsRequiringAttention([{ status: 'pending' }, { status: 'paid' }])).toEqual([
      { status: 'pending' },
    ])
  })

  it('sorts payments by due date using calendar semantics', () => {
    const payments = [
      { id: 'second', dueDate: '2026-03-27' },
      { id: 'first', dueDate: '2026-03-25' },
      { id: 'third', dueDate: '2026-03-28T00:00:00.000Z' },
    ]

    expect(sortPaymentsByDueDate(payments).map((payment) => payment.id)).toEqual([
      'first',
      'second',
      'third',
    ])
  })
})
