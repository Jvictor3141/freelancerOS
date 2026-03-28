import { supabase, getSupabaseErrorMessage } from '../lib/supabase'
import {
  mapPaymentRecord,
  toPaymentPayload,
  type PaymentRecord,
} from '../lib/database'
import type { PaymentInput } from '../types/inputs'
import type { Payment } from '../types/payment'
import { ensureDatabaseBootstrap } from './bootstrapService'

const PAYMENT_READ_MODEL = 'payments_read_model'
const PAYMENT_READ_MODEL_MIGRATION = '20260328_payment_read_model.sql'

function isMissingPaymentReadModel(error: { message?: string } | null) {
  if (!error?.message) {
    return false
  }

  return (
    error.message.includes(PAYMENT_READ_MODEL) &&
    (error.message.includes('does not exist') ||
      error.message.includes('schema cache'))
  )
}

function getPaymentReadMessage(
  error: { message?: string } | null,
  fallback: string,
) {
  if (isMissingPaymentReadModel(error)) {
    return `A leitura de pagamentos no Supabase ainda nao foi atualizada. Rode a migration ${PAYMENT_READ_MODEL_MIGRATION}.`
  }

  return getSupabaseErrorMessage(error, fallback)
}

async function getPaymentById(id: string, userId: string): Promise<Payment> {
  const { data, error } = await supabase
    .from(PAYMENT_READ_MODEL)
    .select('*')
    .eq('id', id)
    .eq('user_id', userId)
    .single()

  if (error || !data) {
    throw new Error(
      getPaymentReadMessage(
        error,
        'Nao foi possivel carregar o pagamento atualizado.',
      ),
    )
  }

  return mapPaymentRecord(data as PaymentRecord)
}

// O service de pagamentos segue o mesmo owner model do banco usando user_id
// em todas as operacoes.
export async function getPayments(): Promise<Payment[]> {
  const userId = await ensureDatabaseBootstrap()

  const { data, error } = await supabase
    .from(PAYMENT_READ_MODEL)
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(
      getPaymentReadMessage(
        error,
        'Nao foi possivel carregar os pagamentos no banco.',
      ),
    )
  }

  return (data as PaymentRecord[] | null)?.map(mapPaymentRecord) ?? []
}

export async function createPayment(data: PaymentInput): Promise<Payment> {
  const userId = await ensureDatabaseBootstrap()

  const { data: createdPayment, error } = await supabase
    .from('payments')
    .insert(toPaymentPayload(data, { userId }))
    .select('id')
    .single()

  if (error || !createdPayment) {
    throw new Error(
      getSupabaseErrorMessage(
        error,
        'Nao foi possivel criar o pagamento no banco.',
      ),
    )
  }

  return getPaymentById(createdPayment.id, userId)
}

export async function updatePayment(
  id: string,
  data: PaymentInput,
): Promise<Payment> {
  const userId = await ensureDatabaseBootstrap()

  const { data: updatedPayment, error } = await supabase
    .from('payments')
    .update(toPaymentPayload(data, { userId }))
    .eq('id', id)
    .eq('user_id', userId)
    .select('id')
    .single()

  if (error || !updatedPayment) {
    throw new Error(
      getSupabaseErrorMessage(
        error,
        'Nao foi possivel atualizar o pagamento no banco.',
      ),
    )
  }

  return getPaymentById(updatedPayment.id, userId)
}

export async function deletePayment(id: string) {
  const userId = await ensureDatabaseBootstrap()

  const { error } = await supabase
    .from('payments')
    .delete()
    .eq('id', id)
    .eq('user_id', userId)

  if (error) {
    throw new Error(
      getSupabaseErrorMessage(
        error,
        'Nao foi possivel excluir o pagamento no banco.',
      ),
    )
  }
}
