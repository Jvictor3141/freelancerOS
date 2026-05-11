import { create } from 'zustand'
import { getErrorMessage } from '../lib/supabase'
import {
  createPayment as createPaymentService,
  deletePayment as deletePaymentService,
  getPayments,
  markPaymentAsPaid as markPaymentAsPaidService,
  updatePayment as updatePaymentService,
} from '../services/paymentService'
import {
  isResourceReady,
  type ResourceLoadStatus,
} from './resourceLoadState'
import type { PaymentInput } from '../types/inputs'
import type { Payment } from '../types/payment'
import {
  clearSelectedRecord,
  findRecordById,
  removeRecordById,
  replaceRecordById,
  syncSelectedRecord,
  upsertRecordByCreatedAtDesc,
} from './resourceStoreUtils'
import { invalidateOperationalSnapshots } from './useRealtimeInvalidationStore'

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

function getPaymentStoreError(error: unknown, fallback: string): string {
  return getErrorMessage(error, fallback)
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
            'Não foi possível carregar os pagamentos.',
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
        payments: upsertRecordByCreatedAtDesc(state.payments, newPayment),
      }))
      invalidateOperationalSnapshots()

      return newPayment
    } catch (error) {
      const message = getPaymentStoreError(
        error,
        'Não foi possível salvar o pagamento.',
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
      invalidateOperationalSnapshots()

      return updatedPayment
    } catch (error) {
      const message = getPaymentStoreError(
        error,
        'Não foi possível atualizar o pagamento.',
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
      invalidateOperationalSnapshots()
    } catch (error) {
      const message = getPaymentStoreError(
        error,
        'Não foi possível excluir o pagamento.',
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
      const updatedPayment = await markPaymentAsPaidService(id)

      set((state) => ({
        payments: replaceRecordById(state.payments, updatedPayment),
        selectedPayment: syncSelectedRecord(
          state.selectedPayment,
          updatedPayment,
        ),
      }))
      invalidateOperationalSnapshots()

      return updatedPayment
    } catch (error) {
      const message = getPaymentStoreError(
        error,
        'Não foi possível marcar o pagamento como pago.',
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
