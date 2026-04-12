import type { CurrencyCode } from '../i18n/config';

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
  currency: CurrencyCode;
  deadline: string;
  status: ProjectStatus;
  createdAt: string;
};
