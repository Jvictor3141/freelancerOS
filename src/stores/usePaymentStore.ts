import { create } from 'zustand'
import { getErrorMessage } from '../lib/supabase'
import {
  createPayment as createPaymentService,
  deletePayment as deletePaymentService,
  getPayments,
  updatePayment as updatePaymentService,
} from '../services/paymentService'
import {
  isResourceReady,
  type ResourceLoadStatus,
} from './resourceLoadState'
import type { PaymentInput } from '../types/inputs'
import type { Payment } from '../types/payment'
import { formatDateInputValue } from '../utils/dateOnly'
import { toPersistedPaymentStatus } from '../utils/paymentStatus'
import {
  clearSelectedRecord,
  findRecordById,
  prependRecord,
  removeRecordById,
  replaceRecordById,
  syncSelectedRecord,
} from './resourceStoreUtils'

type PaymentStoreState = {
  payments: Payment[]
  selectedPayment: Payment | null
  loadStatus: ResourceLoadStatus
  error: string | null
}

type PaymentStoreActions = {
  loadPayments: (options?: { force?: boolean }) => Promise<void>
  ensurePaymentsLoaded: () => Promise<void>
  retryLoad: () => Promise<void>
  selectPayment: (payment: Payment | null) => void
  addPayment: (data: PaymentInput) => Promise<Payment>
  editPayment: (id: string, data: PaymentInput) => Promise<Payment>
  removePayment: (id: string) => Promise<void>
  markAsPaid: (id: string) => Promise<Payment | null>
  resetStore: () => void
}

export type PaymentStore = PaymentStoreState & PaymentStoreActions

const paymentStoreInitialState: PaymentStoreState = {
  payments: [],
  selectedPayment: null,
  loadStatus: 'idle',
  error: null,
}

let loadPaymentsPromise: Promise<void> | null = null

function getPaymentStoreError(error: unknown, fallback: string) {
  return getErrorMessage(error, fallback)
}

function toPaymentInput(payment: Payment): PaymentInput {
  return {
    projectId: payment.projectId,
    amount: payment.amount,
    dueDate: payment.dueDate,
    paidAt: payment.paidAt,
    status: toPersistedPaymentStatus(payment.status),
    method: payment.method,
    notes: payment.notes,
  }
}

export const paymentStoreSelectors = {
  payments: (state: PaymentStoreState) => state.payments,
  selectedPayment: (state: PaymentStoreState) => state.selectedPayment,
  loadStatus: (state: PaymentStoreState) => state.loadStatus,
  error: (state: PaymentStoreState) => state.error,
  getById: (state: PaymentStoreState, id: string) =>
    findRecordById(state.payments, id),
}

export const usePaymentStore = create<PaymentStore>((set, get) => ({
  ...paymentStoreInitialState,

  loadPayments: async (options) => {
    if (loadPaymentsPromise) {
      return loadPaymentsPromise
    }

    if (!options?.force && isResourceReady(get().loadStatus)) {
      return
    }

    loadPaymentsPromise = (async () => {
      set({ loadStatus: 'loading', error: null })

      try {
        const payments = await getPayments()
        set({
          payments,
          loadStatus: 'ready',
          error: null,
        })
      } catch (error) {
        set({
          loadStatus: 'error',
          error: getPaymentStoreError(
            error,
            'Nao foi possivel carregar os pagamentos.',
          ),
        })
      } finally {
        loadPaymentsPromise = null
      }
    })()

    return loadPaymentsPromise
  },

  ensurePaymentsLoaded: async () => {
    if (isResourceReady(get().loadStatus)) {
      return
    }

    await get().loadPayments()
  },

  retryLoad: async () => {
    await get().loadPayments({ force: true })
  },

  selectPayment: (payment) => {
    set({ selectedPayment: payment })
  },

  addPayment: async (data) => {
    set({ error: null })

    try {
      const newPayment = await createPaymentService(data)

      set((state) => ({
        payments: prependRecord(state.payments, newPayment),
      }))

      return newPayment
    } catch (error) {
      const message = getPaymentStoreError(
        error,
        'Nao foi possivel salvar o pagamento.',
      )

      set({ error: message })
      throw new Error(message)
    }
  },

  editPayment: async (id, data) => {
    set({ error: null })

    try {
      const updatedPayment = await updatePaymentService(id, data)

      set((state) => ({
        payments: replaceRecordById(state.payments, updatedPayment),
        selectedPayment: syncSelectedRecord(
          state.selectedPayment,
          updatedPayment,
        ),
      }))

      return updatedPayment
    } catch (error) {
      const message = getPaymentStoreError(
        error,
        'Nao foi possivel atualizar o pagamento.',
      )

      set({ error: message })
      throw new Error(message)
    }
  },

  removePayment: async (id) => {
    set({ error: null })

    try {
      await deletePaymentService(id)

      set((state) => ({
        payments: removeRecordById(state.payments, id),
        selectedPayment: clearSelectedRecord(state.selectedPayment, id),
      }))
    } catch (error) {
      const message = getPaymentStoreError(
        error,
        'Nao foi possivel excluir o pagamento.',
      )

      set({ error: message })
      throw new Error(message)
    }
  },

  markAsPaid: async (id) => {
    set({ error: null })

    const payment = findRecordById(get().payments, id)

    if (!payment) {
      return null
    }

    try {
      const updatedPayment = await updatePaymentService(id, {
        ...toPaymentInput(payment),
        status: 'paid',
        paidAt: formatDateInputValue(),
      })

      set((state) => ({
        payments: replaceRecordById(state.payments, updatedPayment),
        selectedPayment: syncSelectedRecord(
          state.selectedPayment,
          updatedPayment,
        ),
      }))

      return updatedPayment
    } catch (error) {
      const message = getPaymentStoreError(
        error,
        'Nao foi possivel marcar o pagamento como pago.',
      )

      set({ error: message })
      throw new Error(message)
    }
  },

  resetStore: () => {
    loadPaymentsPromise = null
    set(paymentStoreInitialState)
  },
}))
