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
import {
  isResourceReady,
  type ResourceLoadStatus,
} from './resourceLoadState'
import { usePaymentStore } from './usePaymentStore'
import { useProjectStore } from './useProjectStore'

type ClientStoreState = {
  clients: Client[]
  selectedClient: Client | null
  loadStatus: ResourceLoadStatus
  error: string | null
}

type ClientStoreActions = {
  loadClients: (options?: { force?: boolean }) => Promise<void>
  ensureClientsLoaded: () => Promise<void>
  retryLoad: () => Promise<void>
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
  loadStatus: 'idle',
  error: null,
}

let loadClientsPromise: Promise<void> | null = null

function getClientStoreError(error: unknown, fallback: string) {
  return getErrorMessage(error, fallback)
}

export const clientStoreSelectors = {
  clients: (state: ClientStoreState) => state.clients,
  selectedClient: (state: ClientStoreState) => state.selectedClient,
  loadStatus: (state: ClientStoreState) => state.loadStatus,
  error: (state: ClientStoreState) => state.error,
  getById: (state: ClientStoreState, id: string) =>
    findRecordById(state.clients, id),
}

export const useClientStore = create<ClientStore>((set, get) => ({
  ...clientStoreInitialState,

  loadClients: async (options) => {
    if (loadClientsPromise) {
      return loadClientsPromise
    }

    if (!options?.force && isResourceReady(get().loadStatus)) {
      return
    }

    loadClientsPromise = (async () => {
      set({ loadStatus: 'loading', error: null })

      try {
        const clients = await getClients()
        set({
          clients,
          loadStatus: 'ready',
          error: null,
        })
      } catch (error) {
        set({
          loadStatus: 'error',
          error: getClientStoreError(error, 'NÃ£o foi possÃ­vel carregar os clientes.'),
        })
      } finally {
        loadClientsPromise = null
      }
    })()

    return loadClientsPromise
  },

  ensureClientsLoaded: async () => {
    if (isResourceReady(get().loadStatus)) {
      return
    }

    await get().loadClients()
  },

  retryLoad: async () => {
    await get().loadClients({ force: true })
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
      const message = getClientStoreError(error, 'NÃ£o foi possÃ­vel salvar o cliente.')

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
        'NÃ£o foi possÃ­vel atualizar o cliente.',
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
        useProjectStore.getState().loadProjects({ force: true }),
        usePaymentStore.getState().loadPayments({ force: true }),
      ])
    } catch (error) {
      const message = getClientStoreError(error, 'NÃ£o foi possÃ­vel excluir o cliente.')

      set({ error: message })
      throw new Error(message)
    }
  },

  resetStore: () => {
    loadClientsPromise = null
    set(clientStoreInitialState)
  },
}))
