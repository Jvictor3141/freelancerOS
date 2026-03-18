import type { User } from '@supabase/supabase-js';
import { supabase, getSupabaseErrorMessage } from '../lib/supabase';
import type { FreelancerProfile } from '../types/freelancerProfile';
import { getRecord } from '../utils/typeGuards';

const autoAnonymousAuth =
  import.meta.env.VITE_SUPABASE_AUTO_ANON_AUTH === 'true';
let sessionPromise: Promise<User> | null = null;

function getSiteUrl() {
  if (import.meta.env.VITE_SITE_URL) {
    return import.meta.env.VITE_SITE_URL;
  }

  if (typeof window !== 'undefined') {
    return window.location.origin;
  }

  return undefined;
}

function buildAuthCallbackUrl(next: string) {
  const siteUrl = getSiteUrl();

  if (!siteUrl) {
    return undefined;
  }

  return `${siteUrl}/auth/callback?next=${encodeURIComponent(next)}`;
}

export async function signUp(email: string, password: string) {
  const emailRedirectTo = buildAuthCallbackUrl('/dashboard');

  return supabase.auth.signUp({
    email,
    password,
    options: emailRedirectTo ? { emailRedirectTo } : undefined,
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
  return getRecord(metadata) ?? {};
}

export async function requestPasswordReset(email: string) {
  const redirectTo = buildAuthCallbackUrl('/redefinir-senha');

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

// Esta rotina garante uma sessão autenticada para que as policies com auth.uid() funcionem.
export async function ensureAuthenticatedSession(): Promise<User> {
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();

  if (sessionError) {
    throw new Error(
      getSupabaseErrorMessage(
        sessionError,
        'Não foi possível verificar a sessão atual do Supabase.',
      ),
    );
  }

  if (session?.user) {
    return session.user;
  }

  if (!autoAnonymousAuth) {
    throw new Error(
      'Não existe sessão autenticada. Faça login antes de acessar os dados ou habilite VITE_SUPABASE_AUTO_ANON_AUTH.',
    );
  }

  // O lock abaixo impede várias tentativas paralelas de criar uma sessão anônima na primeira carga.
  if (!sessionPromise) {
    sessionPromise = (async () => {
      const { data, error } = await supabase.auth.signInAnonymously();

      if (error || !data.user) {
        throw new Error(
          getSupabaseErrorMessage(
            error,
            'Não foi possível iniciar uma sessão autenticada no Supabase.',
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

// O app usa esse helper para popular user_id sem expor detalhes de autenticação aos services.
export async function getCurrentUserId() {
  const user = await ensureAuthenticatedSession();
  return user.id;
}
