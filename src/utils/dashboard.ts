import type { Client } from '../types/client';
import type { Project } from '../types/project';

// Funções para calcular métricas e dados para o dashboard do sistema de gestão de projetos. Essas funções processam os dados de clientes e projetos para gerar insights como total de clientes, projetos em andamento, receita mensal, entre outros. São utilizadas para alimentar os gráficos e indicadores do dashboard, ajudando os usuários a monitorar o desempenho do negócio de forma visual e intuitiva.
type DashboardMetric = {
  totalClients: number;
  totalProjects: number;
  projectsInProgress: number;
  completedProjects: number;
  totalContractedValue: number;
  averageTicket: number;
};

// Estrutura para representar um ponto de receita mensal, contendo o mês formatado e o valor total de receita gerada naquele mês. Essa estrutura é utilizada para alimentar gráficos de linha ou barras que mostram a evolução da receita ao longo do tempo, permitindo aos usuários identificar tendências e padrões sazonais.
type RevenuePoint = {
  month: string;
  revenue: number;
};

// Formatação de data para exibir o mês e ano de forma abreviada, como "Jan 23". Utiliza a API Intl.DateTimeFormat para garantir que a formatação seja adequada para o idioma português do Brasil. Essa formatação é utilizada principalmente nos gráficos de receita mensal, facilitando a leitura e compreensão dos dados apresentados.
const MONTH_FORMATTER = new Intl.DateTimeFormat('pt-BR', {
  month: 'short',
  year: '2-digit',
});

// Função para calcular as métricas do dashboard com base nos dados de clientes e projetos. Ela retorna um objeto contendo o total de clientes, total de projetos, número de projetos em andamento, número de projetos concluídos, valor total contratado e ticket médio. Essas métricas são essenciais para fornecer uma visão geral do desempenho do negócio e ajudar os usuários a tomar decisões informadas.
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
    totalProjects,
    projectsInProgress,
    completedProjects,
    totalContractedValue,
    averageTicket,
  };
}

// Função para calcular a receita mensal a partir dos projetos, agrupando os valores por mês de criação. Ela retorna um array de objetos contendo o mês formatado e a receita total gerada naquele mês. A função considera apenas os últimos meses especificados (padrão é 6 meses) e ignora projetos com datas inválidas ou sem valor definido. Essa função é fundamental para gerar gráficos de receita mensal no dashboard, permitindo aos usuários acompanhar a evolução financeira do negócio ao longo do tempo.
export function getMonthlyRevenueFromProjects(
  projects: Project[],
  monthsBack = 6
): RevenuePoint[] {
  const now = new Date();

  const buckets = Array.from({ length: monthsBack }, (_, index) => {
    const date = new Date(now.getFullYear(), now.getMonth() - (monthsBack - 1 - index), 1);

    return {
      key: `${date.getFullYear()}-${date.getMonth()}`,
      month: MONTH_FORMATTER.format(date),
      revenue: 0,
    };
  });

  const bucketMap = new Map(
    buckets.map((bucket) => [bucket.key, bucket])
  );

  for (const project of projects) {
    const createdAt = new Date(project.createdAt);

    if (Number.isNaN(createdAt.getTime())) continue;

    const key = `${createdAt.getFullYear()}-${createdAt.getMonth()}`;
    const bucket = bucketMap.get(key);

    if (!bucket) continue;

    bucket.revenue += Number(project.value || 0);
  }

  return buckets.map(({ month, revenue }) => ({ month, revenue }));
}

// Função para obter as atividades recentes dos projetos, ordenando-os por data de criação e limitando o número de resultados. Ela retorna um array de objetos contendo o ID do projeto, título, nome do cliente, status, data de criação e valor. A função utiliza um mapa para associar os IDs dos clientes aos seus nomes, garantindo que a informação do cliente seja facilmente acessível ao exibir as atividades recentes no dashboard.
export function getRecentProjectActivities(
  projects: Project[],
  clients: Client[],
  limit = 5
) {
  const clientMap = new Map(clients.map((client) => [client.id, client]));

  return [...projects]
    .sort(
      (a,b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    .slice(0, limit)
    .map((project) => ({
      id: project.id,
      title: project.name,
      clientName: clientMap.get(project.clientId)?.name ?? 'Cliente Desconhecido',
      status: project.status,
      createdAt: project.createdAt,
      value: project.value,
    }));
}
