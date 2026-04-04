import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Payment } from '../types/payment'

const { createPaymentMock } = vi.hoisted(() => ({
  createPaymentMock: vi.fn(),
}))

vi.mock('../services/paymentService', () => ({
  createPayment: createPaymentMock,
  deletePayment: vi.fn(),
  getPayments: vi.fn(),
  markPaymentAsPaid: vi.fn(),
  updatePayment: vi.fn(),
}))

import { usePaymentStore } from './usePaymentStore'

function createPayment(overrides: Partial<Payment> = {}): Payment {
  return {
    id: 'payment-1',
    projectId: 'project-1',
    amount: 1500,
    dueDate: '2026-04-04',
    paidAt: null,
    status: 'pending',
    method: 'pix',
    notes: '',
    createdAt: '2026-04-04T12:00:00.000Z',
    ...overrides,
  }
}

describe('payment store', () => {
  beforeEach(() => {
    createPaymentMock.mockReset()
    usePaymentStore.getState().resetStore()
  })

  it('does not duplicate a payment if realtime sync inserted it before the local add completes', async () => {
    const payment = createPayment()

    createPaymentMock.mockResolvedValue(payment)

    usePaymentStore.setState((state) => ({
      ...state,
      payments: [payment],
    }))

    await usePaymentStore.getState().addPayment({
      projectId: payment.projectId,
      amount: payment.amount,
      dueDate: payment.dueDate,
      paidAt: payment.paidAt,
      status: 'pending',
      method: payment.method,
      notes: payment.notes,
    })

    expect(usePaymentStore.getState().payments).toEqual([payment])
  })
})
