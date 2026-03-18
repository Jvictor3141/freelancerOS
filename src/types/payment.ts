export const paymentStatuses = ['pending', 'paid', 'overdue'] as const;
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
