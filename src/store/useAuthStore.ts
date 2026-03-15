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
  currentSession: { user: User } | null,
) {
  set({
    user: currentSession?.user ?? null,
    initialized: true,
    loading: false,
  });
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  initialized: false,
  loading: false,
  error: null,
  notice: null,

  // A inicializacao observa a sessao do Supabase para o app reagir a login, logout e refresh de token.
  initialize: async () => {
    const { data, error } = await getSession();

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
      applySession(set, data.session);
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      applySession(set, session);
    });

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

    applySession(set, data.session);
  },

  signUp: async (email, password) => {
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

    applySession(set, data.session ?? null);

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

    applySession(set, null);
  },
}));
