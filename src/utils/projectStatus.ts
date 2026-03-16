import type { ProjectStatus } from '../types/project';

export const projectStatusLabel: Record<ProjectStatus, string> = {
  proposal: 'Proposta',
  in_progress: 'Em andamento',
  review: 'Em revisão',
  completed: 'Concluído',
};

export const projectStatusClassName: Record<ProjectStatus, string> = {
  proposal: 'bg-slate-100 text-slate-700',
  in_progress: 'bg-blue-100 text-blue-700',
  review: 'bg-amber-100 text-amber-700',
  completed: 'bg-emerald-100 text-emerald-700',
};
