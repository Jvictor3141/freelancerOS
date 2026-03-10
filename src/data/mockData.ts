export type Metric = {
  label: string;
  value: string;
  change: string;
  positive?: boolean;
};

export type RevenuePoint = {
  month: string;
  revenue: number;
};

export type Client = {
  id: number;
  name: string;
  company: string;
  activeProjects: number;
  totalBilled: string;
  lastPayment: string;
  status: 'Ativo' | 'Atenção';
};

export type Project = {
  id: number;
  name: string;
  client: string;
  value: string;
  deadline: string;
  status: 'Proposta' | 'Em andamento' | 'Revisão' | 'Finalizado';
};

export type Payment = {
  id: number;
  client: string;
  project: string;
  amount: string;
  date: string;
  status: 'Pago' | 'Pendente' | 'Atrasado';
};

export type Activity = {
  id: number;
  title: string;
  description: string;
  time: string;
};

export const metrics: Metric[] = [
  { label: 'Faturamento do mês', value: 'R$ 12.480', change: '+18,2%', positive: true },
  { label: 'Pagamentos pendentes', value: 'R$ 3.240', change: '2 cobranças em aberto' },
  { label: 'Projetos ativos', value: '11', change: '+3 esta semana', positive: true },
  { label: 'Clientes ativos', value: '8', change: '1 precisa de follow-up' },
];

export const revenue: RevenuePoint[] = [
  { month: 'Out', revenue: 6800 },
  { month: 'Nov', revenue: 9200 },
  { month: 'Dez', revenue: 8700 },
  { month: 'Jan', revenue: 11800 },
  { month: 'Fev', revenue: 10200 },
  { month: 'Mar', revenue: 12480 },
];

export const activities: Activity[] = [
  {
    id: 1,
    title: 'Pagamento recebido de Studio Bloom',
    description: 'Projeto Landing Page Premium quitado no valor de R$ 2.200.',
    time: 'há 12 min',
  },
  {
    id: 2,
    title: 'Nova proposta enviada para Nexa Consultoria',
    description: 'Escopo de redesign institucional com prazo de 15 dias.',
    time: 'há 1h',
  },
  {
    id: 3,
    title: 'Projeto em revisão',
    description: 'Portal do Cliente da Aurora Labs foi movido para revisão.',
    time: 'há 3h',
  },
  {
    id: 4,
    title: 'Cobrança pendente detectada',
    description: 'MediaForge está com pagamento atrasado há 5 dias.',
    time: 'há 5h',
  },
];

export const clients: Client[] = [
  {
    id: 1,
    name: 'Ana Ribeiro',
    company: 'Studio Bloom',
    activeProjects: 2,
    totalBilled: 'R$ 8.400',
    lastPayment: '05/03/2026',
    status: 'Ativo',
  },
  {
    id: 2,
    name: 'Lucas Santos',
    company: 'Nexa Consultoria',
    activeProjects: 1,
    totalBilled: 'R$ 4.600',
    lastPayment: '28/02/2026',
    status: 'Ativo',
  },
  {
    id: 3,
    name: 'Marina Costa',
    company: 'MediaForge',
    activeProjects: 3,
    totalBilled: 'R$ 12.100',
    lastPayment: '20/02/2026',
    status: 'Atenção',
  },
  {
    id: 4,
    name: 'Eduardo Lima',
    company: 'Aurora Labs',
    activeProjects: 1,
    totalBilled: 'R$ 6.300',
    lastPayment: '02/03/2026',
    status: 'Ativo',
  },
];

export const projects: Project[] = [
  {
    id: 1,
    name: 'Landing Page Premium',
    client: 'Studio Bloom',
    value: 'R$ 2.200',
    deadline: '12/03/2026',
    status: 'Em andamento',
  },
  {
    id: 2,
    name: 'Portal do Cliente',
    client: 'Aurora Labs',
    value: 'R$ 4.100',
    deadline: '15/03/2026',
    status: 'Revisão',
  },
  {
    id: 3,
    name: 'Redesign Institucional',
    client: 'Nexa Consultoria',
    value: 'R$ 3.800',
    deadline: '20/03/2026',
    status: 'Proposta',
  },
  {
    id: 4,
    name: 'Painel de Métricas',
    client: 'MediaForge',
    value: 'R$ 5.900',
    deadline: '25/03/2026',
    status: 'Finalizado',
  },
];

export const payments: Payment[] = [
  {
    id: 1,
    client: 'Studio Bloom',
    project: 'Landing Page Premium',
    amount: 'R$ 2.200',
    date: '05/03/2026',
    status: 'Pago',
  },
  {
    id: 2,
    client: 'MediaForge',
    project: 'Painel de Métricas',
    amount: 'R$ 1.900',
    date: '01/03/2026',
    status: 'Atrasado',
  },
  {
    id: 3,
    client: 'Nexa Consultoria',
    project: 'Redesign Institucional',
    amount: 'R$ 1.200',
    date: '10/03/2026',
    status: 'Pendente',
  },
  {
    id: 4,
    client: 'Aurora Labs',
    project: 'Portal do Cliente',
    amount: 'R$ 4.100',
    date: '15/03/2026',
    status: 'Pendente',
  },
];
