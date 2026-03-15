import type { Client } from '../types/client';
import type { Project } from '../types/project';
import type { Payment } from '../types/payment';

type DashboardMetric = {
  totalClients: number;
  projectsInProgress: number;
  completedProjects: number;
  averageTicket: number;
};

type RevenuePoint = {
  month: string;
  revenue: number;
};

type PaymentAlert = {
  id: string;
  clientName: string;
  projectName: string;
  amount: number;
  dueDate: string;
  status: 'pending' | 'overdue';
};

type RecentActivity = {
  id: string;
  title: string;
  clientName: string;
  status: Project['status'];
  createdAt: string;
  value: number;
};

const MONTH_FORMATTER = new Intl.DateTimeFormat('pt-BR', {
  month: 'short',
  year: '2-digit',
});

export function getDashboardMetrics(
  clients: Client[],
  projects: Project[]
): DashboardMetric {
  const totalClients = clients.length;
  const totalProjects = projects.length;

  const projectsInProgress = projects.filter(
    (project) => project.status === 'in_progress' || project.status === 'review'
  ).length;

  const completedProjects = projects.filter(
    (project) => project.status === 'completed'
  ).length;

  const totalContractedValue = projects.reduce(
    (sum, project) => sum + Number(project.value || 0),
    0
  );

  const averageTicket =
    totalProjects > 0 ? totalContractedValue / totalProjects : 0;

  return {
    totalClients,
    projectsInProgress,
    completedProjects,
    averageTicket,
  };
}

export function getPaymentMetrics(payments: Payment[]) {
  const receivedAmount = payments
    .filter((payment) => payment.status === 'paid')
    .reduce((sum, payment) => sum + payment.amount, 0);

  const pendingAmount = payments
    .filter((payment) => payment.status === 'pending')
    .reduce((sum, payment) => sum + payment.amount, 0);

  const overdueAmount = payments
    .filter((payment) => payment.status === 'overdue')
    .reduce((sum, payment) => sum + payment.amount, 0);

  return {
    receivedAmount,
    pendingAmount,
    overdueAmount,
  };
}

export function getMonthlyReceivedRevenue(
  payments: Payment[],
  monthsBack = 6
): RevenuePoint[] {
  const now = new Date();

  const buckets = Array.from({ length: monthsBack }, (_, index) => {
    const date = new Date(
      now.getFullYear(),
      now.getMonth() - (monthsBack - 1 - index),
      1
    );

    return {
      key: `${date.getFullYear()}-${date.getMonth()}`,
      month: MONTH_FORMATTER.format(date),
      revenue: 0,
    };
  });

  const bucketMap = new Map(buckets.map((bucket) => [bucket.key, bucket]));

  for (const payment of payments) {
    if (payment.status !== 'paid' || !payment.paidAt) continue;

    const paidAt = new Date(payment.paidAt);

    if (Number.isNaN(paidAt.getTime())) continue;

    const key = `${paidAt.getFullYear()}-${paidAt.getMonth()}`;
    const bucket = bucketMap.get(key);

    if (!bucket) continue;

    bucket.revenue += Number(payment.amount || 0);
  }

  return buckets.map(({ month, revenue }) => ({
    month,
    revenue,
  }));
}

export function getRecentProjectActivities(
  projects: Project[],
  clients: Client[],
  limit = 4
): RecentActivity[] {
  const clientMap = new Map(clients.map((client) => [client.id, client]));

  return [...projects]
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    .slice(0, limit)
    .map((project) => ({
      id: project.id,
      title: project.name,
      clientName: clientMap.get(project.clientId)?.name ?? 'Cliente desconhecido',
      status: project.status,
      createdAt: project.createdAt,
      value: project.value,
    }));
}

export function getPaymentAlerts(
  payments: Payment[],
  projects: Project[],
  clients: Client[],
  limit = 4
): PaymentAlert[] {
  const projectMap = new Map(projects.map((project) => [project.id, project]));
  const clientMap = new Map(clients.map((client) => [client.id, client]));

  return payments
    .filter(
      (
        payment
      ): payment is Payment & { status: 'pending' | 'overdue' } =>
        payment.status === 'pending' || payment.status === 'overdue'
    )
    .sort((a, b) => {
      const aTime = new Date(a.dueDate).getTime();
      const bTime = new Date(b.dueDate).getTime();
      return aTime - bTime;
    })
    .slice(0, limit)
    .map((payment) => {
      const project = projectMap.get(payment.projectId);
      const client = project ? clientMap.get(project.clientId) : null;

      return {
        id: payment.id,
        clientName: client?.name ?? 'Cliente desconhecido',
        projectName: project?.name ?? 'Projeto desconhecido',
        amount: payment.amount,
        dueDate: payment.dueDate,
        status: payment.status,
      };
    });
}
