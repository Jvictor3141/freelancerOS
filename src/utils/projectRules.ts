import type { Project, ProjectStatus } from '../types/project'

export function isActiveProjectStatus(
  status: ProjectStatus,
): status is 'in_progress' | 'review' {
  return status === 'in_progress' || status === 'review'
}

export function isActiveProject(project: Pick<Project, 'status'>): boolean {
  return isActiveProjectStatus(project.status)
}

export function countActiveProjects(
  projects: Array<Pick<Project, 'status'>>,
): number {
  return projects.filter(isActiveProject).length
}

export function countCompletedProjects(
  projects: Array<Pick<Project, 'status'>>,
): number {
  return projects.filter((project) => project.status === 'completed').length
}

export function sortProjectsByCreatedAtDesc<
  TProject extends Pick<Project, 'createdAt'>,
>(projects: TProject[]): TProject[] {
  return projects
    .slice()
    .sort(
      (firstProject, secondProject) =>
        new Date(secondProject.createdAt).getTime() -
        new Date(firstProject.createdAt).getTime(),
    )
}
