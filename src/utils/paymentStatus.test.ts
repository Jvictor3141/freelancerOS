import { describe, expect, it } from 'vitest'
import { toPersistedPaymentStatus } from './paymentStatus'

describe('payment status utilities', () => {
  it('normalizes read-model statuses before writes', () => {
    expect(toPersistedPaymentStatus('pending')).toBe('pending')
    expect(toPersistedPaymentStatus('overdue')).toBe('pending')
    expect(toPersistedPaymentStatus('paid')).toBe('paid')
  })
})
