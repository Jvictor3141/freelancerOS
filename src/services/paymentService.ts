import { getStorageItem, setStorageItem } from '../lib/storage';
import type { Payment } from '../types/payment';

const PAYMENTS_KEY = 'freelanceros:payments';

export function getPayments(): Payment[] {
  return getStorageItem<Payment[]>(PAYMENTS_KEY, []);
}

export function savePayments(payments: Payment[]) {
  setStorageItem(PAYMENTS_KEY, payments);
}

export function createPayment(
  data: Omit<Payment, 'id' | 'createdAt'>
): Payment {
  const payments = getPayments();

  const newPayment: Payment = {
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    ...data,
  };

  const updatedPayments = [newPayment, ...payments];
  savePayments(updatedPayments);

  return newPayment;
}

export function updatePayment(
  id: string,
  data: Omit<Payment, 'id' | 'createdAt'>
): Payment | null {
  const payments = getPayments();

  let updatedPayment: Payment | null = null;

  const updatedPayments = payments.map((payment) => {
    if (payment.id !== id) return payment;

    updatedPayment = {
      ...payment,
      ...data,
    };

    return updatedPayment;
  });

  savePayments(updatedPayments);

  return updatedPayment
}

export function deletePayment(id: string) {
  const payments = getPayments();
  const updatedPayments = payments.filter((payment) => payment.id !== id);
  savePayments(updatedPayments);
}

export function getPaymentsByProjectId(projectId: string): Payment[] {
  return getPayments().filter((payment) => payment.projectId === projectId);
}