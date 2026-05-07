import type { Project, ProjectStatus } from '../../types/project'

function isActiveProjectStatus(
  status: ProjectStatus,
): status is 'in_progress' | 'review' {
  return status === 'in_progress' || status === 'review'
}

export function isActiveProject(project: Pick<Project, 'status'>): boolean {
  return isActiveProjectStatus(project.status)
}
