//aqui definimos os tipos relacionados aos projetos, como o status do projeto e a estrutura do objeto de projeto. Esses tipos serão usados em todo o aplicativo para garantir consistência e facilitar a manutenção do código.
export type ProjectStatus =
  | 'proposal'
  | 'in_progress'
  | 'review'
  | 'completed';

// essa parte define o tipo Project, que descreve a estrutura de um objeto de projeto. Cada projeto tem um ID único, um ID de cliente associado, um nome, uma descrição, um valor monetário, um prazo (deadline), um status (que é do tipo ProjectStatus) e uma data de criação (createdAt). Esses campos são usados para armazenar e manipular as informações dos projetos no aplicativo.
export type Project = {
  id: string;
  clientId: string;
  name: string;
  description: string;
  value: number;
  deadline: string;
  status: ProjectStatus;
  createdAt: string;
};