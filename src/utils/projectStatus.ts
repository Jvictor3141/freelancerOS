import type { ProjectStatus } from '../types/project';

//nessa parte definimos os rótulos (labels) para cada status do projeto, usando as mesmas chaves do tipo ProjectStatus. Esses rótulos serão usados para exibir o status dos projetos de forma mais amigável e compreensível para os usuários do aplicativo.
export const projectStatusLabel: Record<ProjectStatus, string> = {
  proposal: 'Proposta',
  in_progress: 'Em Andamento',
  review: 'Em Revisão',
  completed: 'Concluído',
};

// aqui definimos as classes CSS para cada status do projeto, usando as mesmas chaves do tipo ProjectStatus. Essas classes serão usadas para estilizar os elementos de status dos projetos no aplicativo, proporcionando uma aparência visual consistente e fácil de identificar para cada status.
export const projectStatusClassName: Record<ProjectStatus, string> = {
  proposal: 'bg-slate-100 text-slate-700',
  in_progress: 'bg-blue-100 text-blue-700',
  review: 'bg-amber-100 text-amber-700',
  completed: 'bg-emerald-100 text-emerald-700',
};