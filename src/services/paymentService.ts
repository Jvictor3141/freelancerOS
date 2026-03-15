import { supabase, getSupabaseErrorMessage } from '../lib/supabase';
import {
  mapPaymentRecord,
  toPaymentPayload,
  type PaymentInput,
  type PaymentRecord,
} from '../lib/database';
import { ensureDatabaseBootstrap } from './bootstrapService';
import type { Payment } from '../types/payment';

// O service de pagamentos segue o mesmo owner model do banco usando user_id em todas as operacoes.
export async function getPayments(): Promise<Payment[]> {
  const userId = await ensureDatabaseBootstrap();

  const { data, error } = await supabase
    .from('payments')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(
      getSupabaseErrorMessage(
        error,
        'Nao foi possivel carregar os pagamentos no banco.',
      ),
    );
  }

  return (data as PaymentRecord[] | null)?.map(mapPaymentRecord) ?? [];
}

export async function createPayment(data: PaymentInput): Promise<Payment> {
  const userId = await ensureDatabaseBootstrap();

  const { data: createdPayment, error } = await supabase
    .from('payments')
    .insert(toPaymentPayload(data, { userId }))
    .select()
    .single();

  if (error || !createdPayment) {
    throw new Error(
      getSupabaseErrorMessage(
        error,
        'Nao foi possivel criar o pagamento no banco.',
      ),
    );
  }

  return mapPaymentRecord(createdPayment as PaymentRecord);
}

export async function updatePayment(
  id: string,
  data: PaymentInput,
): Promise<Payment> {
  const userId = await ensureDatabaseBootstrap();

  const { data: updatedPayment, error } = await supabase
    .from('payments')
    .update(toPaymentPayload(data, { userId }))
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single();

  if (error || !updatedPayment) {
    throw new Error(
      getSupabaseErrorMessage(
        error,
        'Nao foi possivel atualizar o pagamento no banco.',
      ),
    );
  }

  return mapPaymentRecord(updatedPayment as PaymentRecord);
}

export async function deletePayment(id: string) {
  const userId = await ensureDatabaseBootstrap();

  const { error } = await supabase
    .from('payments')
    .delete()
    .eq('id', id)
    .eq('user_id', userId);

  if (error) {
    throw new Error(
      getSupabaseErrorMessage(
        error,
        'Nao foi possivel excluir o pagamento no banco.',
      ),
    );
  }
}

export async function getPaymentsByProjectId(projectId: string): Promise<Payment[]> {
  const userId = await ensureDatabaseBootstrap();

  const { data, error } = await supabase
    .from('payments')
    .select('*')
    .eq('user_id', userId)
    .eq('project_id', projectId)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(
      getSupabaseErrorMessage(
        error,
        'Nao foi possivel carregar os pagamentos desse projeto.',
      ),
    );
  }

  return (data as PaymentRecord[] | null)?.map(mapPaymentRecord) ?? [];
}
