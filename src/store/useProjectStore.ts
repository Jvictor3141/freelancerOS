import { create } from 'zustand';
import type { Project } from '../types/project';
import {
  createProject as createProjectService,
  deleteProject as deleteProjectService,
  getProjects,
  updateProject as updateProjectService,
} from '../services/projectService';

type ProjectInput = Omit<Project, 'id' | 'createdAt'>;

type ProjectStore = {
  projects: Project[];
  selectedProject: Project | null;
  loadProjects: () => void;
  selectProject: (project: Project | null) => void;
  addProject: (data: ProjectInput) => void;
  editProject: (id: string, data: ProjectInput) => void;
  removeProject: (id: string) => void;
};

export const useProjectStore = create<ProjectStore>((set) => ({
  projects: [],
  selectedProject: null,

  loadProjects: () => {
    const projects = getProjects();
    set({ projects });
  },

  selectProject: (project) => {
    set({ selectedProject: project });
  },

  addProject: (data) => {
    const newProject = createProjectService(data);

    set((state) => ({
      projects: [newProject, ...state.projects],
    }));
  },

  editProject: (id, data) => {
    const updatedProject = updateProjectService(id, data);

    if (!updatedProject) return;

    set((state) => ({
      projects: state.projects.map((project) =>
      project.id === id ? updatedProject : project
      ),
      selectedProject:
      state.selectedProject?.id === id
      ? updatedProject
      : state.selectedProject,
    }));
  },

  removeProject: (id) => {
    deleteProjectService(id);

    set((state) => ({
      projects: state.projects.filter((project) => project.id !== id),
      selectedProject:
        state.selectedProject?.id === id ? null : state.selectedProject,
    }));
  },
}));