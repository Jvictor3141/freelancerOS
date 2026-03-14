import type { Payment } from '../types/payment';
import type { Project } from '../types/project';

export function getClientProjects(projects: Project[], clientId: string) {
  return projects.filter((project) => project.clientId === clientId);
}

export function getClientPayments(
  payments: Payment[],
  clientProjects: Project[]
) {
  const projectIds = new Set(clientProjects.map((project) => project.id));

  return payments.filter((payment) => projectIds.has(payment.projectId));
}

export function getClientFinancialSummary(
  clientProjects: Project[],
  clientPayments: Payment[]
) {
  const totalContracted = clientProjects.reduce(
    (sum, project) => sum + Number(project.value || 0),
    0
  );

  const totalReceived = clientPayments
    .filter((payment) => payment.status === 'paid')
    .reduce((sum, payment) => sum + payment.amount, 0);
  
  const totalPending = clientPayments
    .filter((payment) => payment.status === 'pending')
    .reduce((sum, payment) => sum + payment.amount, 0);
  
  const totalOverdue = clientPayments
    .filter((payment) => payment.status === 'overdue')
    .reduce((sum, payment) => sum + payment.amount, 0);

  const completedProjects = clientProjects.filter(
    (project) => project.status === 'completed'
  ).length;

  return {
    totalContracted,
    totalReceived,
    totalPending,
    totalOverdue,
    completedProjects,
  };
}