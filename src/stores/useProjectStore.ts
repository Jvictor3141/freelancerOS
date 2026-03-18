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
import { usePaymentStore } from './usePaymentStore'

type ProjectStoreState = {
  projects: Project[]
  selectedProject: Project | null
  loading: boolean
  error: string | null
  initialized: boolean
}

type ProjectStoreActions = {
  loadProjects: () => Promise<void>
  ensureProjectsLoaded: () => Promise<void>
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
  loading: false,
  error: null,
  initialized: false,
}

let loadProjectsPromise: Promise<void> | null = null

function getProjectStoreError(error: unknown, fallback: string) {
  return getErrorMessage(error, fallback)
}

export const projectStoreSelectors = {
  projects: (state: ProjectStoreState) => state.projects,
  selectedProject: (state: ProjectStoreState) => state.selectedProject,
  loading: (state: ProjectStoreState) => state.loading,
  error: (state: ProjectStoreState) => state.error,
  initialized: (state: ProjectStoreState) => state.initialized,
  getById: (state: ProjectStoreState, id: string) =>
    findRecordById(state.projects, id),
}

export const useProjectStore = create<ProjectStore>((set, get) => ({
  ...projectStoreInitialState,

  loadProjects: async () => {
    if (loadProjectsPromise) {
      return loadProjectsPromise
    }

    loadProjectsPromise = (async () => {
      set({ loading: true, error: null })

      try {
        const projects = await getProjects()
        set({
          projects,
          loading: false,
          error: null,
          initialized: true,
        })
      } catch (error) {
        set({
          loading: false,
          error: getProjectStoreError(error, 'Não foi possível carregar os projetos.'),
          initialized: true,
        })
      } finally {
        loadProjectsPromise = null
      }
    })()

    return loadProjectsPromise
  },

  ensureProjectsLoaded: async () => {
    if (get().initialized) {
      return
    }

    await get().loadProjects()
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
      const message = getProjectStoreError(error, 'Não foi possível salvar o projeto.')

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
        'Não foi possível atualizar o projeto.',
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

      await usePaymentStore.getState().loadPayments()
    } catch (error) {
      const message = getProjectStoreError(error, 'Não foi possível excluir o projeto.')

      set({ error: message })
      throw new Error(message)
    }
  },

  resetStore: () => {
    loadProjectsPromise = null
    set(projectStoreInitialState)
  },
}))
