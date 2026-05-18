import { createClient } from '@supabase/supabase-js';
import type { Session } from '@supabase/supabase-js';
export { getErrorMessage, getSupabaseErrorMessage } from './errors';

export const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
export const supabaseKey =
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

export function syncRealtimeAuth(session: Session | null) {
  const accessToken = session?.access_token;

  if (!accessToken) {
    return;
  }

  supabase.realtime.setAuth(accessToken);
}

