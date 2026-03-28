export const persistedPaymentStatuses = ['pending', 'paid'] as const;
export type PersistedPaymentStatus = (typeof persistedPaymentStatuses)[number];

export const paymentStatuses = [...persistedPaymentStatuses, 'overdue'] as const;
export type PaymentStatus = (typeof paymentStatuses)[number];

export const paymentMethods = ['pix', 'card', 'bank_transfer', 'cash'] as const;
export type PaymentMethod = (typeof paymentMethods)[number];

export type Payment = {
  id: string;
  projectId: string;
  amount: number;
  dueDate: string;
  paidAt: string | null;
  status: PaymentStatus;
  method: PaymentMethod;
  notes: string;
  createdAt: string;
};
