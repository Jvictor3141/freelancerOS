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
import { reconcileProposalSnapshot } from '../utils/proposalRules'
import {
  clearSelectedRecord,
  findRecordById,
  prependRecord,
  removeRecordById,
  replaceRecordById,
  syncSelectedRecord,
  upsertRecordByCreatedAtDesc,
} from './resourceStoreUtils'
import {
  isResourceReady,
  type ResourceLoadStatus,
} from './resourceLoadState'
import { useProjectStore } from './useProjectStore'

type ProposalStoreState = {
  proposals: Proposal[]
  selectedProposal: Proposal | null
  loadStatus: ResourceLoadStatus
  error: string | null
}

type ProposalStoreActions = {
  loadProposals: (options?: { force?: boolean }) => Promise<void>
  ensureProposalsLoaded: () => Promise<void>
  retryLoad: () => Promise<void>
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
  loadStatus: 'idle',
  error: null,
}

let loadProposalsPromise: Promise<void> | null = null
let shouldReloadProposalsAfterCurrentLoad = false

function getProposalStoreError(error: unknown, fallback: string) {
  return getErrorMessage(error, fallback)
}

export const proposalStoreSelectors = {
  proposals: (state: ProposalStoreState) => state.proposals,
  selectedProposal: (state: ProposalStoreState) => state.selectedProposal,
  loadStatus: (state: ProposalStoreState) => state.loadStatus,
  error: (state: ProposalStoreState) => state.error,
  getById: (state: ProposalStoreState, id: string) =>
    findRecordById(state.proposals, id),
}

export const useProposalStore = create<ProposalStore>((set, get) => ({
  ...proposalStoreInitialState,

  loadProposals: async (options) => {
    if (!options?.force && isResourceReady(get().loadStatus)) {
      return
    }

    if (loadProposalsPromise) {
      if (options?.force) {
        shouldReloadProposalsAfterCurrentLoad = true
      }

      return loadProposalsPromise
    }

    loadProposalsPromise = (async () => {
      try {
        do {
          shouldReloadProposalsAfterCurrentLoad = false
          set({ loadStatus: 'loading', error: null })

          try {
            const proposals = await getProposals()
            set((state) => ({
              proposals: proposals.map((proposal) =>
                reconcileProposalSnapshot(
                  findRecordById(state.proposals, proposal.id),
                  proposal,
                ),
              ),
              loadStatus: 'ready',
              error: null,
            }))
          } catch (error) {
            set({
              loadStatus: 'error',
              error: getProposalStoreError(
                error,
                'NÃ£o foi possÃ­vel carregar as propostas.',
              ),
            })
          }
        } while (shouldReloadProposalsAfterCurrentLoad)
      } finally {
        loadProposalsPromise = null
      }
    })()

    return loadProposalsPromise
  },

  ensureProposalsLoaded: async () => {
    if (isResourceReady(get().loadStatus)) {
      return
    }

    await get().loadProposals()
  },

  retryLoad: async () => {
    await get().loadProposals({ force: true })
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
      const message = getProposalStoreError(
        error,
        'NÃ£o foi possÃ­vel salvar a proposta.',
      )

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
        'NÃ£o foi possÃ­vel atualizar a proposta.',
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
      const message = getProposalStoreError(
        error,
        'NÃ£o foi possÃ­vel excluir a proposta.',
      )

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
      const message = getProposalStoreError(
        error,
        'NÃ£o foi possÃ­vel enviar a proposta.',
      )

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

      await get().loadProposals({ force: true })

      return shareLink
    } catch (error) {
      const message = getProposalStoreError(
        error,
        'NÃ£o foi possÃ­vel gerar o link seguro da proposta.',
      )

      set({ error: message })
      throw new Error(message)
    }
  },

  acceptProposalAndGenerateProject: async (id) => {
    set({ error: null })

    try {
      const { proposal, project } = await acceptProposalService(id)

      set((state) => ({
        proposals: replaceRecordById(state.proposals, proposal),
        selectedProposal: syncSelectedRecord(state.selectedProposal, proposal),
      }))

      useProjectStore.setState((state) => ({
        projects: upsertRecordByCreatedAtDesc(state.projects, project),
        selectedProject: syncSelectedRecord(state.selectedProject, project),
      }))
    } catch (error) {
      const message = getProposalStoreError(
        error,
        'NÃ£o foi possÃ­vel aceitar a proposta.',
      )

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
        'NÃ£o foi possÃ­vel recusar a proposta.',
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
      const message = getProposalStoreError(
        error,
        'NÃ£o foi possÃ­vel reabrir a proposta.',
      )

      set({ error: message })
      throw new Error(message)
    }
  },

  resetStore: () => {
    loadProposalsPromise = null
    shouldReloadProposalsAfterCurrentLoad = false
    set(proposalStoreInitialState)
  },
}))
