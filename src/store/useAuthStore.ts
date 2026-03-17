import { create } from 'zustand';
import type { AuthChangeEvent, Session, User } from '@supabase/supabase-js';
import { supabase, getErrorMessage } from '../lib/supabase';
import {
  getSession,
  signIn as signInService,
  signOut as signOutService,
  signUp as signUpService,
} from '../services/authService';

type AuthFlow = 'recovery' | null;

type AuthStore = {
  user: User | null;
  initialized: boolean;
  authFlow: AuthFlow;
  loading: boolean;
  error: string | null;
  notice: string | null;
  initialize: () => Promise<() => void>;
  clearFeedback: () => void;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

function getAuthStoreError(error: unknown, fallback: string) {
  return getErrorMessage(error, fallback);
}

function applySession(
  set: (partial: Partial<AuthStore>) => void,
  currentSession: Session | null,
  authFlow: AuthFlow,
) {
  set({
    user: currentSession?.user ?? null,
    initialized: true,
    loading: false,
    authFlow,
  });
}

function isExistingAccountSignUpResult(
  user: User | null,
  email: string,
  hasSession: boolean,
) {
  if (hasSession || !user?.email) {
    return false;
  }

  const normalizedEmail = email.trim().toLowerCase();
  const identities = Array.isArray(user.identities) ? user.identities : [];

  return (
    user.email.toLowerCase() === normalizedEmail && identities.length === 0
  );
}

function resolveInitialAuthFlow(session: Session | null): AuthFlow {
  if (!session?.user || typeof window === 'undefined') {
    return null;
  }

  const currentUrl = new URL(window.location.href);

  return currentUrl.pathname === '/redefinir-senha' &&
    currentUrl.searchParams.get('flow') === 'recovery'
    ? 'recovery'
    : null;
}

function resolveAuthFlow(
  event: AuthChangeEvent,
  session: Session | null,
  currentFlow: AuthFlow,
): AuthFlow {
  if (!session?.user || event === 'SIGNED_OUT') {
    return null;
  }

  if (event === 'PASSWORD_RECOVERY') {
    return 'recovery';
  }

  return currentFlow;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  initialized: false,
  authFlow: null,
  loading: false,
  error: null,
  notice: null,

  initialize: async () => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      set((current) => ({
        user: session?.user ?? null,
        initialized: true,
        loading: false,
        authFlow: resolveAuthFlow(event, session, current.authFlow),
      }));
    });

    const { data, error } = await getSession();

    if (error) {
      set({
        user: null,
        initialized: true,
        authFlow: null,
        loading: false,
        error: getAuthStoreError(
          error,
          'Nao foi possivel carregar a sessao atual.',
        ),
      });
    } else {
      applySession(set, data.session, resolveInitialAuthFlow(data.session));
    }

    return () => subscription.unsubscribe();
  },

  clearFeedback: () => {
    set({ error: null, notice: null });
  },

  signIn: async (email, password) => {
    set({ loading: true, error: null, notice: null });

    const { data, error } = await signInService(email, password);

    if (error) {
      const message = getAuthStoreError(
        error,
        'Nao foi possivel entrar com essa conta.',
      );

      set({ loading: false, error: message });
      throw new Error(message);
    }

    applySession(set, data.session, null);
  },

  signUp: async (email, password) => {
    set({ loading: true, error: null, notice: null });

    const normalizedEmail = email.trim().toLowerCase();
    const { data, error } = await signUpService(normalizedEmail, password);

    if (error) {
      const message = getAuthStoreError(
        error,
        'Nao foi possivel criar a conta.',
      );

      set({ loading: false, error: message });
      throw new Error(message);
    }

    if (
      isExistingAccountSignUpResult(
        data.user ?? null,
        normalizedEmail,
        Boolean(data.session),
      )
    ) {
      const message =
        'Ja existe uma conta ativa com esse e-mail. Entre no app ou use a recuperacao de senha.';

      set({ loading: false, error: message });
      throw new Error(message);
    }

    applySession(set, data.session ?? null, null);

    set({
      notice: data.session
        ? 'Conta criada e sessao iniciada com sucesso.'
        : 'Conta criada. Confirme seu email para entrar no app.',
    });
  },

  logout: async () => {
    set({ loading: true, error: null, notice: null });

    const { error } = await signOutService();

    if (error) {
      const message = getAuthStoreError(
        error,
        'Nao foi possivel encerrar a sessao.',
      );

      set({ loading: false, error: message });
      throw new Error(message);
    }

    applySession(set, null, null);
  },
}));
