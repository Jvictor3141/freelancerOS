import { create } from 'zustand'
import type { ProposalInput } from '../types/inputs'
import { getErrorMessage } from '../lib/supabase'
import {
  acceptProposal as acceptProposalService,
  createProposal as createProposalService,
  createProposalSecureShareLink as createProposalSecureShareLinkService,
  deleteProposal as deleteProposalService,
  getProposals,
  rejectProposal as rejectProposalService,
  reopenProposal as reopenProposalService,
  sendProposal as sendProposalService,
  updateProposal as updateProposalService,
} from '../services/proposalService'
import type { Proposal } from '../types/proposal'
import type { ProposalSecureShareLink } from '../types/sharedProposal'
import {
  clearSelectedRecord,
  findRecordById,
  prependRecord,
  removeRecordById,
  replaceRecordById,
  syncSelectedRecord,
} from './resourceStoreUtils'
import { useProjectStore } from './useProjectStore'

type ProposalStoreState = {
  proposals: Proposal[]
  selectedProposal: Proposal | null
  loading: boolean
  error: string | null
  initialized: boolean
}

type ProposalStoreActions = {
  loadProposals: () => Promise<void>
  ensureProposalsLoaded: () => Promise<void>
  selectProposal: (proposal: Proposal | null) => void
  addProposal: (data: ProposalInput) => Promise<Proposal>
  editProposal: (id: string, data: ProposalInput) => Promise<Proposal>
  removeProposal: (id: string) => Promise<void>
  sendProposalToClient: (id: string) => Promise<Proposal>
  generateSecureShareLink: (
    id: string,
    expiresInDays: number,
  ) => Promise<ProposalSecureShareLink>
  acceptProposalAndGenerateProject: (id: string) => Promise<void>
  rejectProposalById: (id: string) => Promise<Proposal>
  reopenProposalById: (id: string) => Promise<Proposal>
  resetStore: () => void
}

export type ProposalStore = ProposalStoreState & ProposalStoreActions

const proposalStoreInitialState: ProposalStoreState = {
  proposals: [],
  selectedProposal: null,
  loading: false,
  error: null,
  initialized: false,
}

let loadProposalsPromise: Promise<void> | null = null

function getProposalStoreError(error: unknown, fallback: string) {
  return getErrorMessage(error, fallback)
}

export const proposalStoreSelectors = {
  proposals: (state: ProposalStoreState) => state.proposals,
  selectedProposal: (state: ProposalStoreState) => state.selectedProposal,
  loading: (state: ProposalStoreState) => state.loading,
  error: (state: ProposalStoreState) => state.error,
  initialized: (state: ProposalStoreState) => state.initialized,
  getById: (state: ProposalStoreState, id: string) =>
    findRecordById(state.proposals, id),
}

export const useProposalStore = create<ProposalStore>((set, get) => ({
  ...proposalStoreInitialState,

  loadProposals: async () => {
    if (loadProposalsPromise) {
      return loadProposalsPromise
    }

    loadProposalsPromise = (async () => {
      set({ loading: true, error: null })

      try {
        const proposals = await getProposals()
        set({
          proposals,
          loading: false,
          error: null,
          initialized: true,
        })
      } catch (error) {
        set({
          loading: false,
          error: getProposalStoreError(error, 'Não foi possível carregar as propostas.'),
          initialized: true,
        })
      } finally {
        loadProposalsPromise = null
      }
    })()

    return loadProposalsPromise
  },

  ensureProposalsLoaded: async () => {
    if (get().initialized) {
      return
    }

    await get().loadProposals()
  },

  selectProposal: (proposal) => {
    set({ selectedProposal: proposal })
  },

  addProposal: async (data) => {
    set({ error: null })

    try {
      const newProposal = await createProposalService(data)

      set((state) => ({
        proposals: prependRecord(state.proposals, newProposal),
      }))

      return newProposal
    } catch (error) {
      const message = getProposalStoreError(error, 'Não foi possível salvar a proposta.')

      set({ error: message })
      throw new Error(message)
    }
  },

  editProposal: async (id, data) => {
    set({ error: null })

    try {
      const updatedProposal = await updateProposalService(id, data)

      set((state) => ({
        proposals: replaceRecordById(state.proposals, updatedProposal),
        selectedProposal: syncSelectedRecord(
          state.selectedProposal,
          updatedProposal,
        ),
      }))

      return updatedProposal
    } catch (error) {
      const message = getProposalStoreError(
        error,
        'Não foi possível atualizar a proposta.',
      )

      set({ error: message })
      throw new Error(message)
    }
  },

  removeProposal: async (id) => {
    set({ error: null })

    try {
      await deleteProposalService(id)

      set((state) => ({
        proposals: removeRecordById(state.proposals, id),
        selectedProposal: clearSelectedRecord(state.selectedProposal, id),
      }))
    } catch (error) {
      const message = getProposalStoreError(error, 'Não foi possível excluir a proposta.')

      set({ error: message })
      throw new Error(message)
    }
  },

  sendProposalToClient: async (id) => {
    set({ error: null })

    try {
      const updatedProposal = await sendProposalService(id)

      set((state) => ({
        proposals: replaceRecordById(state.proposals, updatedProposal),
        selectedProposal: syncSelectedRecord(
          state.selectedProposal,
          updatedProposal,
        ),
      }))

      return updatedProposal
    } catch (error) {
      const message = getProposalStoreError(error, 'Não foi possível enviar a proposta.')

      set({ error: message })
      throw new Error(message)
    }
  },

  generateSecureShareLink: async (id, expiresInDays) => {
    set({ error: null })

    try {
      const shareLink = await createProposalSecureShareLinkService(
        id,
        expiresInDays,
      )

      await get().loadProposals()

      return shareLink
    } catch (error) {
      const message = getProposalStoreError(
        error,
        'Não foi possível gerar o link seguro da proposta.',
      )

      set({ error: message })
      throw new Error(message)
    }
  },

  acceptProposalAndGenerateProject: async (id) => {
    set({ error: null })

    try {
      const { proposal } = await acceptProposalService(id)

      set((state) => ({
        proposals: replaceRecordById(state.proposals, proposal),
        selectedProposal: syncSelectedRecord(state.selectedProposal, proposal),
      }))

      await useProjectStore.getState().loadProjects()
    } catch (error) {
      const message = getProposalStoreError(error, 'Não foi possível aceitar a proposta.')

      set({ error: message })
      throw new Error(message)
    }
  },

  rejectProposalById: async (id) => {
    set({ error: null })

    try {
      const updatedProposal = await rejectProposalService(id)

      set((state) => ({
        proposals: replaceRecordById(state.proposals, updatedProposal),
        selectedProposal: syncSelectedRecord(
          state.selectedProposal,
          updatedProposal,
        ),
      }))

      return updatedProposal
    } catch (error) {
      const message = getProposalStoreError(
        error,
        'Não foi possível recusar a proposta.',
      )

      set({ error: message })
      throw new Error(message)
    }
  },

  reopenProposalById: async (id) => {
    set({ error: null })

    try {
      const updatedProposal = await reopenProposalService(id)

      set((state) => ({
        proposals: replaceRecordById(state.proposals, updatedProposal),
        selectedProposal: syncSelectedRecord(
          state.selectedProposal,
          updatedProposal,
        ),
      }))

      return updatedProposal
    } catch (error) {
      const message = getProposalStoreError(error, 'Não foi possível reabrir a proposta.')

      set({ error: message })
      throw new Error(message)
    }
  },

  resetStore: () => {
    loadProposalsPromise = null
    set(proposalStoreInitialState)
  },
}))
