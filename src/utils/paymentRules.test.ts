import { describe, expect, it } from 'vitest'
import {
  getPaymentsNeedingOverdueStatus,
  getPaymentsRequiringAttention,
  shouldPaymentBeMarkedAsOverdue,
  sortPaymentsByDueDate,
} from './paymentRules'

const now = new Date('2026-03-17T12:00:00.000Z')

describe('payment rules', () => {
  it('marks only unpaid past-due payments as overdue candidates', () => {
    expect(
      shouldPaymentBeMarkedAsOverdue(
        { status: 'pending', dueDate: '2026-03-16T10:00:00.000Z' },
        now,
      ),
    ).toBe(true)

    expect(
      shouldPaymentBeMarkedAsOverdue(
        { status: 'overdue', dueDate: '2026-03-16T10:00:00.000Z' },
        now,
      ),
    ).toBe(false)

    expect(
      shouldPaymentBeMarkedAsOverdue(
        { status: 'paid', dueDate: '2026-03-16T10:00:00.000Z' },
        now,
      ),
    ).toBe(false)

    expect(
      shouldPaymentBeMarkedAsOverdue(
        { status: 'pending', dueDate: '2026-03-18T10:00:00.000Z' },
        now,
      ),
    ).toBe(false)
  })

  it('filters only payments that need overdue reconciliation', () => {
    const payments = [
      { id: '1', status: 'pending' as const, dueDate: '2026-03-16T10:00:00.000Z' },
      { id: '2', status: 'pending' as const, dueDate: '2026-03-18T10:00:00.000Z' },
      { id: '3', status: 'paid' as const, dueDate: '2026-03-10T10:00:00.000Z' },
    ]

    expect(getPaymentsNeedingOverdueStatus(payments, now)).toEqual([payments[0]])
  })

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
      { id: 'late', dueDate: '2026-03-20T00:00:00.000Z' },
      { id: 'invalid', dueDate: 'invalid-date' },
      { id: 'soon', dueDate: '2026-03-18T00:00:00.000Z' },
    ]

    expect(sortPaymentsByDueDate(payments).map((payment) => payment.id)).toEqual([
      'soon',
      'late',
      'invalid',
    ])
  })
})
