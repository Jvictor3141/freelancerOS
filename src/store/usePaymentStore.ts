import { create } from 'zustand';
import type { PaymentInput } from '../lib/database';
import { getErrorMessage } from '../lib/supabase';
import {
  createPayment as createPaymentService,
  deletePayment as deletePaymentService,
  getPayments,
  updatePayment as updatePaymentService,
} from '../services/paymentService';
import type { Payment } from '../types/payment';

type PaymentStore = {
  payments: Payment[];
  selectedPayment: Payment | null;
  loading: boolean;
  error: string | null;
  initialized: boolean;
  loadPayments: () => Promise<void>;
  selectPayment: (payment: Payment | null) => void;
  addPayment: (data: PaymentInput) => Promise<Payment>;
  editPayment: (id: string, data: PaymentInput) => Promise<Payment>;
  removePayment: (id: string) => Promise<void>;
  markAsPaid: (id: string) => Promise<Payment | null>;
  markAsOverdueIfNeeded: () => Promise<void>;
  resetStore: () => void;
};

function getPaymentStoreError(error: unknown, fallback: string) {
  return getErrorMessage(error, fallback);
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
  };
}

export const usePaymentStore = create<PaymentStore>((set, get) => ({
  payments: [],
  selectedPayment: null,
  loading: false,
  error: null,
  initialized: false,

  // O carregamento inicial agora busca os pagamentos remotos e informa a UI quando a sincronização acabou.
  loadPayments: async () => {
    set({ loading: true, error: null });

    try {
      const payments = await getPayments();
      set({
        payments,
        loading: false,
        error: null,
        initialized: true,
      });
    } catch (error) {
      set({
        loading: false,
        error: getPaymentStoreError(
          error,
          'Não foi possível carregar os pagamentos.',
        ),
        initialized: true,
      });
    }
  },

  selectPayment: (payment) => {
    set({ selectedPayment: payment });
  },

  addPayment: async (data) => {
    set({ error: null });

    try {
      const newPayment = await createPaymentService(data);

      set((state) => ({
        payments: [newPayment, ...state.payments],
      }));

      return newPayment;
    } catch (error) {
      const message = getPaymentStoreError(
        error,
        'Não foi possível salvar o pagamento.',
      );

      set({ error: message });
      throw new Error(message);
    }
  },

  editPayment: async (id, data) => {
    set({ error: null });

    try {
      const updatedPayment = await updatePaymentService(id, data);

      set((state) => ({
        payments: state.payments.map((payment) =>
          payment.id === id ? updatedPayment : payment,
        ),
        selectedPayment:
          state.selectedPayment?.id === id
            ? updatedPayment
            : state.selectedPayment,
      }));

      return updatedPayment;
    } catch (error) {
      const message = getPaymentStoreError(
        error,
        'Não foi possível atualizar o pagamento.',
      );

      set({ error: message });
      throw new Error(message);
    }
  },

  removePayment: async (id) => {
    set({ error: null });

    try {
      await deletePaymentService(id);

      set((state) => ({
        payments: state.payments.filter((payment) => payment.id !== id),
        selectedPayment:
          state.selectedPayment?.id === id ? null : state.selectedPayment,
      }));
    } catch (error) {
      const message = getPaymentStoreError(
        error,
        'Não foi possível excluir o pagamento.',
      );

      set({ error: message });
      throw new Error(message);
    }
  },

  // A marcação manual reaproveita o mesmo update remoto para manter banco e UI alinhados.
  markAsPaid: async (id) => {
    set({ error: null });

    const payment = get().payments.find((item) => item.id === id);

    if (!payment) {
      return null;
    }

    try {
      const updatedPayment = await updatePaymentService(id, {
        ...toPaymentInput(payment),
        status: 'paid',
        paidAt: new Date().toISOString().slice(0, 10),
      });

      set((state) => ({
        payments: state.payments.map((item) =>
          item.id === id ? updatedPayment : item,
        ),
        selectedPayment:
          state.selectedPayment?.id === id
            ? updatedPayment
            : state.selectedPayment,
      }));

      return updatedPayment;
    } catch (error) {
      const message = getPaymentStoreError(
        error,
        'Não foi possível marcar o pagamento como pago.',
      );

      set({ error: message });
      throw new Error(message);
    }
  },

  // Esta rotina corrige status vencidos no banco logo após o carregamento para o dashboard usar dados consistentes.
  markAsOverdueIfNeeded: async () => {
    set({ error: null });

    const now = new Date();
    const overduePayments = get().payments.filter((payment) => {
      if (payment.status === 'paid') {
        return false;
      }

      return new Date(payment.dueDate) < now && payment.status !== 'overdue';
    });

    if (overduePayments.length === 0) {
      return;
    }

    try {
      const updatedPayments = await Promise.all(
        overduePayments.map((payment) =>
          updatePaymentService(payment.id, {
            ...toPaymentInput(payment),
            status: 'overdue',
          }),
        ),
      );

      const updatedPaymentsMap = new Map(
        updatedPayments.map((payment) => [payment.id, payment]),
      );

      set((state) => ({
        payments: state.payments.map(
          (payment) => updatedPaymentsMap.get(payment.id) ?? payment,
        ),
        selectedPayment: state.selectedPayment
          ? updatedPaymentsMap.get(state.selectedPayment.id) ??
            state.selectedPayment
          : null,
      }));
    } catch (error) {
      const message = getPaymentStoreError(
        error,
        'Não foi possível atualizar os pagamentos vencidos.',
      );

      set({ error: message });
      throw new Error(message);
    }
  },

  // O reset limpa pagamentos e seleções quando a sessão troca para evitar flash de dados antigos.
  resetStore: () => {
    set({
      payments: [],
      selectedPayment: null,
      loading: false,
      error: null,
      initialized: false,
    });
  },
}));
