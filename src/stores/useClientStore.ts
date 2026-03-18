import { create } from 'zustand'
import type { ClientInput } from '../types/inputs'
import { getErrorMessage } from '../lib/supabase'
import {
  createClient as createClientService,
  deleteClient as deleteClientService,
  getClients,
  updateClient as updateClientService,
} from '../services/clientService'
import type { Client } from '../types/client'
import {
  clearSelectedRecord,
  findRecordById,
  prependRecord,
  removeRecordById,
  replaceRecordById,
  syncSelectedRecord,
} from './resourceStoreUtils'
import { usePaymentStore } from './usePaymentStore'
import { useProjectStore } from './useProjectStore'

type ClientStoreState = {
  clients: Client[]
  selectedClient: Client | null
  loading: boolean
  error: string | null
  initialized: boolean
}

type ClientStoreActions = {
  loadClients: () => Promise<void>
  ensureClientsLoaded: () => Promise<void>
  selectClient: (client: Client | null) => void
  addClient: (data: ClientInput) => Promise<Client>
  editClient: (id: string, data: ClientInput) => Promise<Client>
  removeClient: (id: string) => Promise<void>
  resetStore: () => void
}

export type ClientStore = ClientStoreState & ClientStoreActions

const clientStoreInitialState: ClientStoreState = {
  clients: [],
  selectedClient: null,
  loading: false,
  error: null,
  initialized: false,
}

let loadClientsPromise: Promise<void> | null = null

function getClientStoreError(error: unknown, fallback: string) {
  return getErrorMessage(error, fallback)
}

export const clientStoreSelectors = {
  clients: (state: ClientStoreState) => state.clients,
  selectedClient: (state: ClientStoreState) => state.selectedClient,
  loading: (state: ClientStoreState) => state.loading,
  error: (state: ClientStoreState) => state.error,
  initialized: (state: ClientStoreState) => state.initialized,
  getById: (state: ClientStoreState, id: string) =>
    findRecordById(state.clients, id),
}

export const useClientStore = create<ClientStore>((set, get) => ({
  ...clientStoreInitialState,

  loadClients: async () => {
    if (loadClientsPromise) {
      return loadClientsPromise
    }

    loadClientsPromise = (async () => {
      set({ loading: true, error: null })

      try {
        const clients = await getClients()
        set({
          clients,
          loading: false,
          error: null,
          initialized: true,
        })
      } catch (error) {
        set({
          loading: false,
          error: getClientStoreError(error, 'Não foi possível carregar os clientes.'),
          initialized: true,
        })
      } finally {
        loadClientsPromise = null
      }
    })()

    return loadClientsPromise
  },

  ensureClientsLoaded: async () => {
    if (get().initialized) {
      return
    }

    await get().loadClients()
  },

  selectClient: (client) => {
    set({ selectedClient: client })
  },

  addClient: async (data) => {
    set({ error: null })

    try {
      const newClient = await createClientService(data)

      set((state) => ({
        clients: prependRecord(state.clients, newClient),
      }))

      return newClient
    } catch (error) {
      const message = getClientStoreError(error, 'Não foi possível salvar o cliente.')

      set({ error: message })
      throw new Error(message)
    }
  },

  editClient: async (id, data) => {
    set({ error: null })

    try {
      const updatedClient = await updateClientService(id, data)

      set((state) => ({
        clients: replaceRecordById(state.clients, updatedClient),
        selectedClient: syncSelectedRecord(state.selectedClient, updatedClient),
      }))

      return updatedClient
    } catch (error) {
      const message = getClientStoreError(
        error,
        'Não foi possível atualizar o cliente.',
      )

      set({ error: message })
      throw new Error(message)
    }
  },

  removeClient: async (id) => {
    set({ error: null })

    try {
      await deleteClientService(id)

      set((state) => ({
        clients: removeRecordById(state.clients, id),
        selectedClient: clearSelectedRecord(state.selectedClient, id),
      }))

      await Promise.all([
        useProjectStore.getState().loadProjects(),
        usePaymentStore.getState().loadPayments(),
      ])
    } catch (error) {
      const message = getClientStoreError(error, 'Não foi possível excluir o cliente.')

      set({ error: message })
      throw new Error(message)
    }
  },

  resetStore: () => {
    loadClientsPromise = null
    set(clientStoreInitialState)
  },
}))
