export const projectStatuses = [
  'in_progress',
  'review',
  'completed',
] as const;

export type ProjectStatus = (typeof projectStatuses)[number];

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
