import type { User } from '@supabase/supabase-js';
import { supabase, getSupabaseErrorMessage } from '../lib/supabase';
import type { FreelancerProfile } from '../types/freelancerProfile';

const autoAnonymousAuth =
  import.meta.env.VITE_SUPABASE_AUTO_ANON_AUTH === 'true';
let sessionPromise: Promise<User> | null = null;

export async function signUp(email: string, password: string) {
  return supabase.auth.signUp({
    email,
    password,
  });
}

export async function signIn(email: string, password: string) {
  return supabase.auth.signInWithPassword({
    email,
    password,
  });
}

export async function signOut() {
  return supabase.auth.signOut();
}

export async function getSession() {
  return supabase.auth.getSession();
}

function getMetadataObject(metadata: unknown) {
  if (!metadata || typeof metadata !== 'object' || Array.isArray(metadata)) {
    return {};
  }

  return metadata as Record<string, unknown>;
}

export async function requestPasswordReset(email: string) {
  const redirectTo =
    typeof window === 'undefined'
      ? undefined
      : `${window.location.origin}/redefinir-senha`;

  if (!redirectTo) {
    return supabase.auth.resetPasswordForEmail(email);
  }

  return supabase.auth.resetPasswordForEmail(email, { redirectTo });
}

export async function updatePassword(password: string) {
  return supabase.auth.updateUser({ password });
}

export async function updateFreelancerProfile(
  profile: FreelancerProfile,
  currentMetadata: unknown,
) {
  return supabase.auth.updateUser({
    data: {
      ...getMetadataObject(currentMetadata),
      freelancer_profile: profile,
    },
  });
}

// Esta rotina garante uma sessao autenticada para que as policies com auth.uid() funcionem.
export async function ensureAuthenticatedSession(): Promise<User> {
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();

  if (sessionError) {
    throw new Error(
      getSupabaseErrorMessage(
        sessionError,
        'Nao foi possivel verificar a sessao atual do Supabase.',
      ),
    );
  }

  if (session?.user) {
    return session.user;
  }

  if (!autoAnonymousAuth) {
    throw new Error(
      'Nao existe sessao autenticada. Faça login antes de acessar os dados ou habilite VITE_SUPABASE_AUTO_ANON_AUTH.',
    );
  }

  // O lock abaixo impede varias tentativas paralelas de criar uma sessao anonima na primeira carga.
  if (!sessionPromise) {
    sessionPromise = (async () => {
      const { data, error } = await supabase.auth.signInAnonymously();

      if (error || !data.user) {
        throw new Error(
          getSupabaseErrorMessage(
            error,
            'Nao foi possivel iniciar uma sessao autenticada no Supabase.',
          ),
        );
      }

      return data.user;
    })();
  }

  try {
    return await sessionPromise;
  } finally {
    sessionPromise = null;
  }
}

// O app usa esse helper para popular user_id sem expor detalhes de autenticacao aos services.
export async function getCurrentUserId() {
  const user = await ensureAuthenticatedSession();
  return user.id;
}
