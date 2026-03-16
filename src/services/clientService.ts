import { supabase, getSupabaseErrorMessage } from '../lib/supabase';
import {
  mapClientRecord,
  toClientPayload,
  type ClientInput,
  type ClientRecord,
} from '../lib/database';
import { ensureDatabaseBootstrap } from './bootstrapService';
import type { Client } from '../types/client';

// Este service agora trabalha com tabelas protegidas por user_id e auth.uid().
export async function getClients(): Promise<Client[]> {
  const userId = await ensureDatabaseBootstrap();

  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(
      getSupabaseErrorMessage(
        error,
        'Não foi possível carregar os clientes no banco.',
      ),
    );
  }

  return (data as ClientRecord[] | null)?.map(mapClientRecord) ?? [];
}

export async function createClient(data: ClientInput): Promise<Client> {
  const userId = await ensureDatabaseBootstrap();

  const { data: createdClient, error } = await supabase
    .from('clients')
    .insert(toClientPayload(data, { userId }))
    .select()
    .single();

  if (error || !createdClient) {
    throw new Error(
      getSupabaseErrorMessage(
        error,
        'Não foi possível criar o cliente no banco.',
      ),
    );
  }

  return mapClientRecord(createdClient as ClientRecord);
}

export async function updateClient(
  id: string,
  data: ClientInput,
): Promise<Client> {
  const userId = await ensureDatabaseBootstrap();

  const { data: updatedClient, error } = await supabase
    .from('clients')
    .update(toClientPayload(data, { userId }))
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single();

  if (error || !updatedClient) {
    throw new Error(
      getSupabaseErrorMessage(
        error,
        'Não foi possível atualizar o cliente no banco.',
      ),
    );
  }

  return mapClientRecord(updatedClient as ClientRecord);
}

export async function deleteClient(id: string) {
  const userId = await ensureDatabaseBootstrap();

  const { error } = await supabase
    .from('clients')
    .delete()
    .eq('id', id)
    .eq('user_id', userId);

  if (error) {
    throw new Error(
      getSupabaseErrorMessage(
        error,
        'Não foi possível excluir o cliente no banco.',
      ),
    );
  }
}
