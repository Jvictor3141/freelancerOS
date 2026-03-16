import { create } from 'zustand';
import type { User } from '@supabase/supabase-js';
import { supabase, getErrorMessage } from '../lib/supabase';
import {
  getSession,
  signIn as signInService,
  signOut as signOutService,
  signUp as signUpService,
} from '../services/authService';

type AuthStore = {
  user: User | null;
  initialized: boolean;
  isRecoveryMode: boolean;
  loading: boolean;
  error: string | null;
  notice: string | null;
  initialize: () => Promise<() => void>;
  clearFeedback: () => void;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  completePasswordRecovery: () => Promise<void>;
  cancelPasswordRecovery: () => Promise<void>;
  logout: () => Promise<void>;
};

const passwordRecoveryStorageKey = 'freelanceros-password-recovery';

function getAuthStoreError(error: unknown, fallback: string) {
  return getErrorMessage(error, fallback);
}

function persistRecoveryMode(isActive: boolean) {
  if (typeof window === 'undefined') {
    return;
  }

  if (isActive) {
    window.sessionStorage.setItem(passwordRecoveryStorageKey, '1');
    return;
  }

  window.sessionStorage.removeItem(passwordRecoveryStorageKey);
}

function getPersistedRecoveryMode() {
  if (typeof window === 'undefined') {
    return false;
  }

  return window.sessionStorage.getItem(passwordRecoveryStorageKey) === '1';
}

function isRecoveryUrl() {
  if (typeof window === 'undefined') {
    return false;
  }

  const search = window.location.search;
  const hash = window.location.hash;
  const markers = [
    'type=recovery',
    'token_hash=',
    'access_token=',
    'refresh_token=',
    'code=',
  ];

  return markers.some((marker) => search.includes(marker) || hash.includes(marker));
}

function clearRecoveryLocation() {
  if (typeof window === 'undefined') {
    return;
  }

  const nextUrl = new URL(window.location.href);
  nextUrl.pathname = '/login';
  nextUrl.search = 'mode=sign_in';
  nextUrl.hash = '';
  window.history.replaceState({}, document.title, nextUrl.toString());
}

function applySession(
  set: (partial: Partial<AuthStore>) => void,
  currentSession: { user: User } | null,
  options?: { isRecoveryMode?: boolean },
) {
  set({
    user: currentSession?.user ?? null,
    initialized: true,
    loading: false,
    isRecoveryMode: options?.isRecoveryMode ?? false,
  });
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  initialized: false,
  isRecoveryMode: false,
  loading: false,
  error: null,
  notice: null,

  // A inicializacao observa a sessao do Supabase para o app reagir a login, logout e refresh de token.
  initialize: async () => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      const shouldEnterRecoveryMode =
        event === 'PASSWORD_RECOVERY' ||
        (getPersistedRecoveryMode() && Boolean(session?.user));

      persistRecoveryMode(shouldEnterRecoveryMode);
      applySession(set, session, { isRecoveryMode: shouldEnterRecoveryMode });
    });

    const { data, error } = await getSession();
    const shouldEnterRecoveryMode =
      Boolean(data.session?.user) &&
      (getPersistedRecoveryMode() || isRecoveryUrl());

    persistRecoveryMode(shouldEnterRecoveryMode);

    if (error) {
      set({
        initialized: true,
        loading: false,
        error: getAuthStoreError(
          error,
          'Nao foi possivel carregar a sessao atual.',
        ),
      });
    } else {
      applySession(set, data.session, { isRecoveryMode: shouldEnterRecoveryMode });
    }

    return () => subscription.unsubscribe();
  },

  clearFeedback: () => {
    set({ error: null, notice: null });
  },

  signIn: async (email, password) => {
    persistRecoveryMode(false);
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

    applySession(set, data.session, { isRecoveryMode: false });
  },

  signUp: async (email, password) => {
    persistRecoveryMode(false);
    set({ loading: true, error: null, notice: null });

    const { data, error } = await signUpService(email, password);

    if (error) {
      const message = getAuthStoreError(
        error,
        'Nao foi possivel criar a conta.',
      );

      set({ loading: false, error: message });
      throw new Error(message);
    }

    applySession(set, data.session ?? null, { isRecoveryMode: false });

    set({
      notice: data.session
        ? 'Conta criada e sessao iniciada com sucesso.'
        : 'Conta criada. Confirme seu email para entrar no app.',
    });
  },

  completePasswordRecovery: async () => {
    set({ loading: true, error: null, notice: null });

    const { error } = await signOutService();

    if (error) {
      const message = getAuthStoreError(
        error,
        'Nao foi possivel encerrar a sessao de recuperacao.',
      );

      set({ loading: false, error: message });
      throw new Error(message);
    }

    persistRecoveryMode(false);
    clearRecoveryLocation();
    applySession(set, null, { isRecoveryMode: false });
    set({
      notice: 'Senha redefinida com sucesso. Entre com a nova senha para continuar.',
    });
  },

  cancelPasswordRecovery: async () => {
    set({ loading: true, error: null, notice: null });

    const { error } = await signOutService();

    if (error) {
      const message = getAuthStoreError(
        error,
        'Nao foi possivel sair do fluxo de recuperacao.',
      );

      set({ loading: false, error: message });
      throw new Error(message);
    }

    persistRecoveryMode(false);
    clearRecoveryLocation();
    applySession(set, null, { isRecoveryMode: false });
  },

  logout: async () => {
    persistRecoveryMode(false);
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

    applySession(set, null, { isRecoveryMode: false });
  },
}));
