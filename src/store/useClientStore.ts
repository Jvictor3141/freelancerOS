import { create } from 'zustand';
import type { ClientInput } from '../lib/database';
import { getErrorMessage } from '../lib/supabase';
import {
  createClient as createClientService,
  deleteClient as deleteClientService,
  getClients,
  updateClient as updateClientService,
} from '../services/clientService';
import type { Client } from '../types/client';
import { usePaymentStore } from './usePaymentStore';
import { useProjectStore } from './useProjectStore';

type ClientStore = {
  clients: Client[];
  selectedClient: Client | null;
  loading: boolean;
  error: string | null;
  initialized: boolean;
  loadClients: () => Promise<void>;
  selectClient: (client: Client | null) => void;
  addClient: (data: ClientInput) => Promise<Client>;
  editClient: (id: string, data: ClientInput) => Promise<Client>;
  removeClient: (id: string) => Promise<void>;
  resetStore: () => void;
};

function getClientStoreError(error: unknown, fallback: string) {
  return getErrorMessage(error, fallback);
}

export const useClientStore = create<ClientStore>((set) => ({
  clients: [],
  selectedClient: null,
  loading: false,
  error: null,
  initialized: false,

  // O carregamento inicial agora vem do banco e informa a UI quando terminou ou falhou.
  loadClients: async () => {
    set({ loading: true, error: null });

    try {
      const clients = await getClients();
      set({
        clients,
        loading: false,
        error: null,
        initialized: true,
      });
    } catch (error) {
      set({
        loading: false,
        error: getClientStoreError(
          error,
          'Nao foi possivel carregar os clientes.',
        ),
        initialized: true,
      });
    }
  },

  selectClient: (client) => {
    set({ selectedClient: client });
  },

  addClient: async (data) => {
    set({ error: null });

    try {
      const newClient = await createClientService(data);

      set((state) => ({
        clients: [newClient, ...state.clients],
      }));

      return newClient;
    } catch (error) {
      const message = getClientStoreError(
        error,
        'Nao foi possivel salvar o cliente.',
      );

      set({ error: message });
      throw new Error(message);
    }
  },

  editClient: async (id, data) => {
    set({ error: null });

    try {
      const updatedClient = await updateClientService(id, data);

      set((state) => ({
        clients: state.clients.map((client) =>
          client.id === id ? updatedClient : client,
        ),
        selectedClient:
          state.selectedClient?.id === id ? updatedClient : state.selectedClient,
      }));

      return updatedClient;
    } catch (error) {
      const message = getClientStoreError(
        error,
        'Nao foi possivel atualizar o cliente.',
      );

      set({ error: message });
      throw new Error(message);
    }
  },

  // A exclusao de cliente dispara recarga de projetos e pagamentos porque o banco apaga os relacionados em cascata.
  removeClient: async (id) => {
    set({ error: null });

    try {
      await deleteClientService(id);

      set((state) => ({
        clients: state.clients.filter((client) => client.id !== id),
        selectedClient:
          state.selectedClient?.id === id ? null : state.selectedClient,
      }));

      await Promise.all([
        useProjectStore.getState().loadProjects(),
        usePaymentStore.getState().loadPayments(),
      ]);
    } catch (error) {
      const message = getClientStoreError(
        error,
        'Nao foi possivel excluir o cliente.',
      );

      set({ error: message });
      throw new Error(message);
    }
  },

  // O reset limpa o estado em memoria quando a sessao muda ou o usuario sai do app.
  resetStore: () => {
    set({
      clients: [],
      selectedClient: null,
      loading: false,
      error: null,
      initialized: false,
    });
  },
}));
