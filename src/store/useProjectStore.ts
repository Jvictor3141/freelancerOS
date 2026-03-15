import { create } from 'zustand';
import type { ProjectInput } from '../lib/database';
import { getErrorMessage } from '../lib/supabase';
import {
  createProject as createProjectService,
  deleteProject as deleteProjectService,
  getProjects,
  updateProject as updateProjectService,
} from '../services/projectService';
import type { Project } from '../types/project';
import { usePaymentStore } from './usePaymentStore';

type ProjectStore = {
  projects: Project[];
  selectedProject: Project | null;
  loading: boolean;
  error: string | null;
  initialized: boolean;
  loadProjects: () => Promise<void>;
  selectProject: (project: Project | null) => void;
  addProject: (data: ProjectInput) => Promise<Project>;
  editProject: (id: string, data: ProjectInput) => Promise<Project>;
  removeProject: (id: string) => Promise<void>;
  resetStore: () => void;
};

function getProjectStoreError(error: unknown, fallback: string) {
  return getErrorMessage(error, fallback);
}

export const useProjectStore = create<ProjectStore>((set) => ({
  projects: [],
  selectedProject: null,
  loading: false,
  error: null,
  initialized: false,

  // Este carregamento busca os projetos no banco e marca quando a primeira sincronizacao terminou.
  loadProjects: async () => {
    set({ loading: true, error: null });

    try {
      const projects = await getProjects();
      set({
        projects,
        loading: false,
        error: null,
        initialized: true,
      });
    } catch (error) {
      set({
        loading: false,
        error: getProjectStoreError(
          error,
          'Nao foi possivel carregar os projetos.',
        ),
        initialized: true,
      });
    }
  },

  selectProject: (project) => {
    set({ selectedProject: project });
  },

  addProject: async (data) => {
    set({ error: null });

    try {
      const newProject = await createProjectService(data);

      set((state) => ({
        projects: [newProject, ...state.projects],
      }));

      return newProject;
    } catch (error) {
      const message = getProjectStoreError(
        error,
        'Nao foi possivel salvar o projeto.',
      );

      set({ error: message });
      throw new Error(message);
    }
  },

  editProject: async (id, data) => {
    set({ error: null });

    try {
      const updatedProject = await updateProjectService(id, data);

      set((state) => ({
        projects: state.projects.map((project) =>
          project.id === id ? updatedProject : project,
        ),
        selectedProject:
          state.selectedProject?.id === id
            ? updatedProject
            : state.selectedProject,
      }));

      return updatedProject;
    } catch (error) {
      const message = getProjectStoreError(
        error,
        'Nao foi possivel atualizar o projeto.',
      );

      set({ error: message });
      throw new Error(message);
    }
  },

  // A recarga de pagamentos mantem o estado consistente quando um projeto removido leva cobrancas junto.
  removeProject: async (id) => {
    set({ error: null });

    try {
      await deleteProjectService(id);

      set((state) => ({
        projects: state.projects.filter((project) => project.id !== id),
        selectedProject:
          state.selectedProject?.id === id ? null : state.selectedProject,
      }));

      await usePaymentStore.getState().loadPayments();
    } catch (error) {
      const message = getProjectStoreError(
        error,
        'Nao foi possivel excluir o projeto.',
      );

      set({ error: message });
      throw new Error(message);
    }
  },

  // O reset evita reaproveitar dados do usuario anterior quando a autenticacao muda.
  resetStore: () => {
    set({
      projects: [],
      selectedProject: null,
      loading: false,
      error: null,
      initialized: false,
    });
  },
}));
