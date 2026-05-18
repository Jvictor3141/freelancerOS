type ErrorLike = {
  code?: string;
  message?: string;
};

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
    return 'As tabelas do Supabase ainda não existem. Aplique o schema inicial ou as migrations do projeto antes de usar o app.';
  }

  if (
    error.message.includes('function') &&
    error.message.includes('does not exist')
  ) {
    return 'A função esperada no Supabase ainda não existe. Aplique as migrations mais recentes do projeto.';
  }

  if (error.message.includes('schema cache')) {
    return 'A função esperada no Supabase ainda não está disponível no schema cache. Aplique a migration correspondente e tente novamente em alguns segundos.';
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
    return 'A sessão atual não tem permissão para acessar esses dados. Verifique a autenticação e o campo user_id das tabelas.';
  }

  if (error.message.includes('Anonymous sign-ins are disabled')) {
    return 'O projeto precisa de uma sessao autenticada. Ative Anonymous Sign-Ins no Supabase Auth ou implemente login antes de usar o app.';
  }

  return fallback;
}

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
