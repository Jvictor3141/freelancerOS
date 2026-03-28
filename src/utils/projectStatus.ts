import { projectStatuses, type ProjectStatus } from '../types/project'
import { isOneOf } from './typeGuards'

export const projectStatusFilterOptions = [
  'all',
  'in_progress',
  'review',
  'completed',
] as const

export type ProjectStatusFilter = (typeof projectStatusFilterOptions)[number]

export const projectEditableStatusOptions = [
  'in_progress',
  'review',
  'completed',
] as const satisfies readonly ProjectStatus[]

export function isProjectStatus(value: string): value is ProjectStatus {
  return isOneOf(projectStatuses, value)
}

export function normalizeProjectStatus(
  value: string | null | undefined,
  fallback: ProjectStatus = 'in_progress',
): ProjectStatus {
  return value && isProjectStatus(value) ? value : fallback
}

export function isProjectStatusFilter(value: string): value is ProjectStatusFilter {
  return isOneOf(projectStatusFilterOptions, value)
}

export function parseProjectStatusFilter(value: string): ProjectStatusFilter {
  return isProjectStatusFilter(value) ? value : 'all'
}

export const projectStatusLabel: Record<ProjectStatus, string> = {
  in_progress: 'Em andamento',
  review: 'Em revisao',
  completed: 'Concluido',
}

export const projectStatusClassName: Record<ProjectStatus, string> = {
  in_progress: 'bg-blue-100 text-blue-700',
  review: 'bg-amber-100 text-amber-700',
  completed: 'bg-emerald-100 text-emerald-700',
}
