import { describe, expect, it } from 'vitest'
import {
  getAverageTicket,
  getPaymentAmountSummary,
  sumProjectValues,
} from './financial'

describe('financial utilities', () => {
  it('sums project values safely', () => {
    const total = sumProjectValues([
      { value: 1500 },
      { value: 0 },
      { value: 349.5 },
    ])

    expect(total).toBe(1849.5)
  })

  it('calculates the average ticket and handles empty collections', () => {
    expect(getAverageTicket(1200, 4)).toBe(300)
    expect(getAverageTicket(1200, 0)).toBe(0)
  })

  it('aggregates payment amounts by status', () => {
    const summary = getPaymentAmountSummary([
      { amount: 500, status: 'paid' },
      { amount: 300, status: 'pending' },
      { amount: 200, status: 'overdue' },
      { amount: 50, status: 'paid' },
    ])

    expect(summary).toEqual({
      receivedAmount: 550,
      pendingAmount: 300,
      overdueAmount: 200,
      outstandingAmount: 500,
    })
  })
})
