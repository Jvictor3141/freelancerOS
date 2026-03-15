import { create } from 'zustand';
import type { ProposalInput } from '../lib/database';
import { getErrorMessage } from '../lib/supabase';
import {
  acceptProposal as acceptProposalService,
  createProposal as createProposalService,
  deleteProposal as deleteProposalService,
  getProposals,
  rejectProposal as rejectProposalService,
  reopenProposal as reopenProposalService,
  sendProposal as sendProposalService,
  updateProposal as updateProposalService,
} from '../services/proposalService';
import type { Proposal } from '../types/proposal';
import { useProjectStore } from './useProjectStore';

type ProposalStore = {
  proposals: Proposal[];
  selectedProposal: Proposal | null;
  loading: boolean;
  error: string | null;
  initialized: boolean;
  loadProposals: () => Promise<void>;
  selectProposal: (proposal: Proposal | null) => void;
  addProposal: (data: ProposalInput) => Promise<Proposal>;
  editProposal: (id: string, data: ProposalInput) => Promise<Proposal>;
  removeProposal: (id: string) => Promise<void>;
  sendProposalToClient: (id: string) => Promise<Proposal>;
  acceptProposalAndGenerateProject: (id: string) => Promise<void>;
  rejectProposalById: (id: string) => Promise<Proposal>;
  reopenProposalById: (id: string) => Promise<Proposal>;
  resetStore: () => void;
};

function getProposalStoreError(error: unknown, fallback: string) {
  return getErrorMessage(error, fallback);
}

export const useProposalStore = create<ProposalStore>((set) => ({
  proposals: [],
  selectedProposal: null,
  loading: false,
  error: null,
  initialized: false,

  loadProposals: async () => {
    set({ loading: true, error: null });

    try {
      const proposals = await getProposals();
      set({
        proposals,
        loading: false,
        error: null,
        initialized: true,
      });
    } catch (error) {
      set({
        loading: false,
        error: getProposalStoreError(
          error,
          'Nao foi possivel carregar as propostas.',
        ),
        initialized: true,
      });
    }
  },

  selectProposal: (proposal) => {
    set({ selectedProposal: proposal });
  },

  addProposal: async (data) => {
    set({ error: null });

    try {
      const newProposal = await createProposalService(data);

      set((state) => ({
        proposals: [newProposal, ...state.proposals],
      }));

      return newProposal;
    } catch (error) {
      const message = getProposalStoreError(
        error,
        'Nao foi possivel salvar a proposta.',
      );

      set({ error: message });
      throw new Error(message);
    }
  },

  editProposal: async (id, data) => {
    set({ error: null });

    try {
      const updatedProposal = await updateProposalService(id, data);

      set((state) => ({
        proposals: state.proposals.map((proposal) =>
          proposal.id === id ? updatedProposal : proposal,
        ),
        selectedProposal:
          state.selectedProposal?.id === id
            ? updatedProposal
            : state.selectedProposal,
      }));

      return updatedProposal;
    } catch (error) {
      const message = getProposalStoreError(
        error,
        'Nao foi possivel atualizar a proposta.',
      );

      set({ error: message });
      throw new Error(message);
    }
  },

  removeProposal: async (id) => {
    set({ error: null });

    try {
      await deleteProposalService(id);

      set((state) => ({
        proposals: state.proposals.filter((proposal) => proposal.id !== id),
        selectedProposal:
          state.selectedProposal?.id === id ? null : state.selectedProposal,
      }));
    } catch (error) {
      const message = getProposalStoreError(
        error,
        'Nao foi possivel excluir a proposta.',
      );

      set({ error: message });
      throw new Error(message);
    }
  },

  sendProposalToClient: async (id) => {
    set({ error: null });

    try {
      const updatedProposal = await sendProposalService(id);

      set((state) => ({
        proposals: state.proposals.map((proposal) =>
          proposal.id === id ? updatedProposal : proposal,
        ),
        selectedProposal:
          state.selectedProposal?.id === id
            ? updatedProposal
            : state.selectedProposal,
      }));

      return updatedProposal;
    } catch (error) {
      const message = getProposalStoreError(
        error,
        'Nao foi possivel enviar a proposta.',
      );

      set({ error: message });
      throw new Error(message);
    }
  },

  acceptProposalAndGenerateProject: async (id) => {
    set({ error: null });

    try {
      const { proposal } = await acceptProposalService(id);

      set((state) => ({
        proposals: state.proposals.map((item) =>
          item.id === id ? proposal : item,
        ),
        selectedProposal:
          state.selectedProposal?.id === id ? proposal : state.selectedProposal,
      }));

      await useProjectStore.getState().loadProjects();
    } catch (error) {
      const message = getProposalStoreError(
        error,
        'Nao foi possivel aceitar a proposta.',
      );

      set({ error: message });
      throw new Error(message);
    }
  },

  rejectProposalById: async (id) => {
    set({ error: null });

    try {
      const updatedProposal = await rejectProposalService(id);

      set((state) => ({
        proposals: state.proposals.map((proposal) =>
          proposal.id === id ? updatedProposal : proposal,
        ),
        selectedProposal:
          state.selectedProposal?.id === id
            ? updatedProposal
            : state.selectedProposal,
      }));

      return updatedProposal;
    } catch (error) {
      const message = getProposalStoreError(
        error,
        'Nao foi possivel recusar a proposta.',
      );

      set({ error: message });
      throw new Error(message);
    }
  },

  reopenProposalById: async (id) => {
    set({ error: null });

    try {
      const updatedProposal = await reopenProposalService(id);

      set((state) => ({
        proposals: state.proposals.map((proposal) =>
          proposal.id === id ? updatedProposal : proposal,
        ),
        selectedProposal:
          state.selectedProposal?.id === id
            ? updatedProposal
            : state.selectedProposal,
      }));

      return updatedProposal;
    } catch (error) {
      const message = getProposalStoreError(
        error,
        'Nao foi possivel reabrir a proposta.',
      );

      set({ error: message });
      throw new Error(message);
    }
  },

  resetStore: () => {
    set({
      proposals: [],
      selectedProposal: null,
      loading: false,
      error: null,
      initialized: false,
    });
  },
}));
