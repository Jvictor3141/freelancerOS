export type ProjectStatus =
  | 'proposal'
  | 'in_progress'
  | 'review'
  | 'completed';

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
