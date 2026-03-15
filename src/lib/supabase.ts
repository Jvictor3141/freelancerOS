import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ??
  import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    'Configure VITE_SUPABASE_URL e VITE_SUPABASE_PUBLISHABLE_KEY no arquivo .env.',
  );
}

// O cliente abaixo centraliza toda a comunicacao com o banco para que os services
// usem a mesma sessao e a mesma configuracao de autenticacao.
export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

type ErrorLike = {
  code?: string;
  message?: string;
};

// Esta funcao transforma erros tecnicos do Supabase em mensagens objetivas para a UI.
export function getSupabaseErrorMessage(
  error: ErrorLike | null,
  fallback: string,
) {
  if (!error?.message) {
    return fallback;
  }

  if (
    error.message.includes('relation') &&
    error.message.includes('does not exist')
  ) {
    return 'As tabelas do Supabase ainda nao existem. Execute o arquivo supabase/schema.sql antes de usar o app.';
  }

  if (
    error.message.includes('function') &&
    error.message.includes('does not exist')
  ) {
    return 'A funcao esperada no Supabase ainda nao existe. Atualize o banco com o arquivo supabase/schema.sql.';
  }

  if (error.message.includes('schema cache')) {
    return 'A funcao esperada no Supabase ainda nao esta disponivel no schema cache. Rode o SQL da funcao e tente novamente em alguns segundos.';
  }

  if (error.code === '23503') {
    return 'Existe um relacionamento pendente entre os registros. Revise os dados vinculados antes de continuar.';
  }

  if (error.code === '23505') {
    return 'Ja existe um registro com os mesmos dados unicos no banco.';
  }

  if (
    error.code === '42501' ||
    error.message.includes('row-level security')
  ) {
    return 'A sessao atual nao tem permissao para acessar esses dados. Verifique a autenticacao e o campo user_id das tabelas.';
  }

  if (error.message.includes('Anonymous sign-ins are disabled')) {
    return 'O projeto precisa de uma sessao autenticada. Ative Anonymous Sign-Ins no Supabase Auth ou implemente login antes de usar o app.';
  }

  return error.message;
}

// Esta funcao padroniza erros vindos de qualquer camada para simplificar o tratamento nas stores.
export function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  if (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof error.message === 'string'
  ) {
    return error.message;
  }

  return fallback;
}
