import { create } from 'zustand';
import type { Project, ProjectStatus } from '../types/project';
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
  updateProjectStatus: (id: string, status: ProjectStatus) => void;
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

  updateProjectStatus: (id, status) => {
    const project = getProjects().find((item) => item.id === id);

    if (!project) return;

    const updatedProject = updateProjectService(id, {
      clientId: project.clientId,
      name: project.name,
      description: project.description,
      value: project.value,
      deadline: project.deadline,
      status,
    });

    if (!updatedProject) return;

    set((state) => ({
      projects: state.projects.map((item) =>
        item.id === id ? updatedProject : item
      ),
      selectedProject:
        state.selectedProject?.id === id
          ? updatedProject
          : state.selectedProject,
    }));
  },
}));