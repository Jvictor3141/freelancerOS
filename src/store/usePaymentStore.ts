import { create } from 'zustand';
import type { Payment, PaymentStatus } from '../types/payment';
import {
  createPayment as createPaymentService,
  deletePayment as deletePaymentService,
  getPayments,
  updatePayment as updatePaymentService,
} from '../services/paymentService';

type PaymentInput = Omit<Payment, 'id' | 'createdAt'>;

type PaymentStore = {
  payments: Payment[];
  selectedPayment: Payment | null;
  loadPayments: () => void;
  selectPayment: (payment: Payment | null) => void;
  addPayment: (data: PaymentInput) => void;
  editPayment: (id: string, data: PaymentInput) => void;
  removePayment: (id: string) => void;
  markAsPaid: (id: string) => void;
  markAsOverdueIfNeeded: () => void;
};

export const usePaymentStore = create<PaymentStore>((set, get) => ({
  payments: [],
  selectedPayment: null,

  loadPayments: () => {
    const payments = getPayments();
    set({ payments });
  },

  selectPayment: (payment) => set({ selectedPayment: payment }),

  addPayment: (data) => {
    const newPayment = createPaymentService(data);
    set((state) => ({ payments: [newPayment, ...state.payments] }));
  },

  editPayment: (id, data) => {
    const updatedPayment = updatePaymentService(id, data);
    if (!updatedPayment) return;

    set((state) => ({
      payments: state.payments.map((payment) =>
        payment.id === id ? updatedPayment : payment),
      selectedPayment:
        state.selectedPayment?.id === id
          ? updatedPayment
          : state.selectedPayment,
    }));
  },

  removePayment: (id) => {
    deletePaymentService(id);
    set((state) => ({
      payments: state.payments.filter((payment) => payment.id !== id),
      selectedPayment:
        state.selectedPayment?.id === id ? null : state.selectedPayment,
    }));
  },

  markAsPaid: (id) => {
    const payment = get().payments.find((item) => item.id === id);
    if (!payment) return;

    const updatedPayment = updatePaymentService(id, {
      ...payment,
      status: 'paid',
      paidAt: new Date().toISOString(),
    });

    if (!updatedPayment) return;

    set((state) => ({
      payments: state.payments.map((item) =>
        item.id === id ? updatedPayment : item),

      selectedPayment:
        state.selectedPayment?.id === id
          ? updatedPayment
          : state.selectedPayment,
    }));
  },

  markAsOverdueIfNeeded: () => {
    const now = new Date();

    const updatedPayments = get().payments.map((payment) => {
      if (payment.status === 'paid') return payment;

      const dueDate = new Date(payment.dueDate);
      const shouldBeOverdue = dueDate < now;

      if (!shouldBeOverdue) return payment;

      return {
        ...payment,
        status: 'overdue' as PaymentStatus
      };
    });

    set({ payments: updatedPayments });
    updatedPayments.forEach((payment) => {
      const current = getPayments().find((item) => item.id === payment.id);
      if (!current) return;
      updatePaymentService(payment.id, {
        projectId: payment.projectId,
        amount: payment.amount,
        dueDate: payment.dueDate,
        paidAt: payment.paidAt,
        status: payment.status,
        method: payment.method,
        notes: payment.notes,
      });
    });
  },
}));