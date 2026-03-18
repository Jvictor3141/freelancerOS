import { create } from 'zustand'
import type { PaymentInput } from '../types/inputs'
import { getErrorMessage } from '../lib/supabase'
import {
  createPayment as createPaymentService,
  deletePayment as deletePaymentService,
  getPayments,
  updatePayment as updatePaymentService,
} from '../services/paymentService'
import type { Payment } from '../types/payment'
import { getPaymentsNeedingOverdueStatus } from '../utils/paymentRules'
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
  loading: boolean
  error: string | null
  initialized: boolean
}

type PaymentStoreActions = {
  loadPayments: () => Promise<void>
  ensurePaymentsLoaded: () => Promise<void>
  selectPayment: (payment: Payment | null) => void
  addPayment: (data: PaymentInput) => Promise<Payment>
  editPayment: (id: string, data: PaymentInput) => Promise<Payment>
  removePayment: (id: string) => Promise<void>
  markAsPaid: (id: string) => Promise<Payment | null>
  markAsOverdueIfNeeded: () => Promise<void>
  resetStore: () => void
}

export type PaymentStore = PaymentStoreState & PaymentStoreActions

const paymentStoreInitialState: PaymentStoreState = {
  payments: [],
  selectedPayment: null,
  loading: false,
  error: null,
  initialized: false,
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
    status: payment.status,
    method: payment.method,
    notes: payment.notes,
  }
}

export const paymentStoreSelectors = {
  payments: (state: PaymentStoreState) => state.payments,
  selectedPayment: (state: PaymentStoreState) => state.selectedPayment,
  loading: (state: PaymentStoreState) => state.loading,
  error: (state: PaymentStoreState) => state.error,
  initialized: (state: PaymentStoreState) => state.initialized,
  getById: (state: PaymentStoreState, id: string) =>
    findRecordById(state.payments, id),
  overdueCandidates: (state: PaymentStoreState) =>
    getPaymentsNeedingOverdueStatus(state.payments, new Date()),
}

export const usePaymentStore = create<PaymentStore>((set, get) => ({
  ...paymentStoreInitialState,

  loadPayments: async () => {
    if (loadPaymentsPromise) {
      return loadPaymentsPromise
    }

    loadPaymentsPromise = (async () => {
      set({ loading: true, error: null })

      try {
        const payments = await getPayments()
        set({
          payments,
          loading: false,
          error: null,
          initialized: true,
        })
        void get().markAsOverdueIfNeeded()
      } catch (error) {
        set({
          loading: false,
          error: getPaymentStoreError(error, 'Não foi possível carregar os pagamentos.'),
          initialized: true,
        })
      } finally {
        loadPaymentsPromise = null
      }
    })()

    return loadPaymentsPromise
  },

  ensurePaymentsLoaded: async () => {
    if (get().initialized) {
      return
    }

    await get().loadPayments()
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
      const message = getPaymentStoreError(error, 'Não foi possível salvar o pagamento.')

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
    } catch (error) {
      const message = getPaymentStoreError(error, 'Não foi possível excluir o pagamento.')

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
        paidAt: new Date().toISOString().slice(0, 10),
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
        'Não foi possível marcar o pagamento como pago.',
      )

      set({ error: message })
      throw new Error(message)
    }
  },

  markAsOverdueIfNeeded: async () => {
    set({ error: null })

    const overduePayments = getPaymentsNeedingOverdueStatus(
      get().payments,
      new Date(),
    )

    if (overduePayments.length === 0) {
      return
    }

    try {
      const updatedPayments = await Promise.all(
        overduePayments.map((payment) =>
          updatePaymentService(payment.id, {
            ...toPaymentInput(payment),
            status: 'overdue',
          }),
        ),
      )

      const updatedPaymentsMap = new Map(
        updatedPayments.map((payment) => [payment.id, payment]),
      )

      set((state) => ({
        payments: state.payments.map(
          (payment) => updatedPaymentsMap.get(payment.id) ?? payment,
        ),
        selectedPayment: state.selectedPayment
          ? updatedPaymentsMap.get(state.selectedPayment.id) ??
            state.selectedPayment
          : null,
      }))
    } catch (error) {
      set({
        error: getPaymentStoreError(
          error,
          'Não foi possível atualizar os pagamentos vencidos.',
        ),
      })
    }
  },

  resetStore: () => {
    loadPaymentsPromise = null
    set(paymentStoreInitialState)
  },
}))
