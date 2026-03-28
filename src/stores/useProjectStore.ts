import { create } from 'zustand'
import type { ProjectInput } from '../types/inputs'
import { getErrorMessage } from '../lib/supabase'
import {
  createProject as createProjectService,
  deleteProject as deleteProjectService,
  getProjects,
  updateProject as updateProjectService,
} from '../services/projectService'
import type { Project } from '../types/project'
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

type ProjectStoreState = {
  projects: Project[]
  selectedProject: Project | null
  loadStatus: ResourceLoadStatus
  error: string | null
}

type ProjectStoreActions = {
  loadProjects: (options?: { force?: boolean }) => Promise<void>
  ensureProjectsLoaded: () => Promise<void>
  retryLoad: () => Promise<void>
  selectProject: (project: Project | null) => void
  addProject: (data: ProjectInput) => Promise<Project>
  editProject: (id: string, data: ProjectInput) => Promise<Project>
  removeProject: (id: string) => Promise<void>
  resetStore: () => void
}

export type ProjectStore = ProjectStoreState & ProjectStoreActions

const projectStoreInitialState: ProjectStoreState = {
  projects: [],
  selectedProject: null,
  loadStatus: 'idle',
  error: null,
}

let loadProjectsPromise: Promise<void> | null = null

function getProjectStoreError(error: unknown, fallback: string) {
  return getErrorMessage(error, fallback)
}

export const projectStoreSelectors = {
  projects: (state: ProjectStoreState) => state.projects,
  selectedProject: (state: ProjectStoreState) => state.selectedProject,
  loadStatus: (state: ProjectStoreState) => state.loadStatus,
  error: (state: ProjectStoreState) => state.error,
  getById: (state: ProjectStoreState, id: string) =>
    findRecordById(state.projects, id),
}

export const useProjectStore = create<ProjectStore>((set, get) => ({
  ...projectStoreInitialState,

  loadProjects: async (options) => {
    if (loadProjectsPromise) {
      return loadProjectsPromise
    }

    if (!options?.force && isResourceReady(get().loadStatus)) {
      return
    }

    loadProjectsPromise = (async () => {
      set({ loadStatus: 'loading', error: null })

      try {
        const projects = await getProjects()
        set({
          projects,
          loadStatus: 'ready',
          error: null,
        })
      } catch (error) {
        set({
          loadStatus: 'error',
          error: getProjectStoreError(error, 'NÃ£o foi possÃ­vel carregar os projetos.'),
        })
      } finally {
        loadProjectsPromise = null
      }
    })()

    return loadProjectsPromise
  },

  ensureProjectsLoaded: async () => {
    if (isResourceReady(get().loadStatus)) {
      return
    }

    await get().loadProjects()
  },

  retryLoad: async () => {
    await get().loadProjects({ force: true })
  },

  selectProject: (project) => {
    set({ selectedProject: project })
  },

  addProject: async (data) => {
    set({ error: null })

    try {
      const newProject = await createProjectService(data)

      set((state) => ({
        projects: prependRecord(state.projects, newProject),
      }))

      return newProject
    } catch (error) {
      const message = getProjectStoreError(error, 'NÃ£o foi possÃ­vel salvar o projeto.')

      set({ error: message })
      throw new Error(message)
    }
  },

  editProject: async (id, data) => {
    set({ error: null })

    try {
      const updatedProject = await updateProjectService(id, data)

      set((state) => ({
        projects: replaceRecordById(state.projects, updatedProject),
        selectedProject: syncSelectedRecord(
          state.selectedProject,
          updatedProject,
        ),
      }))

      return updatedProject
    } catch (error) {
      const message = getProjectStoreError(
        error,
        'NÃ£o foi possÃ­vel atualizar o projeto.',
      )

      set({ error: message })
      throw new Error(message)
    }
  },

  removeProject: async (id) => {
    set({ error: null })

    try {
      await deleteProjectService(id)

      set((state) => ({
        projects: removeRecordById(state.projects, id),
        selectedProject: clearSelectedRecord(state.selectedProject, id),
      }))

      await usePaymentStore.getState().loadPayments({ force: true })
    } catch (error) {
      const message = getProjectStoreError(error, 'NÃ£o foi possÃ­vel excluir o projeto.')

      set({ error: message })
      throw new Error(message)
    }
  },

  resetStore: () => {
    loadProjectsPromise = null
    set(projectStoreInitialState)
  },
}))
