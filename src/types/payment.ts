export type PaymentStatus = 'pending' | 'paid' | 'overdue';

export type Payment = {
  id: string;
  projectId: string;
  amount: number;
  dueDate: string;
  paidAt: string | null;
  status: PaymentStatus;
  method: 'pix' | 'card' | 'bank_transfer' | 'cash';
  notes: string;
  createdAt: string;
};