import { useEffect, useMemo } from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useClientStore } from '../store/useClientStore';
import { useProjectStore } from '../store/useProjectStore';
import {
  getDashboardMetrics,
  getMonthlyRevenueFromProjects,
  getRecentProjectActivities,
} from '../utils/dashboard';
import { projectStatusClassName, projectStatusLabel } from '../utils/projectStatus';

function formatCurrency(value: number) {
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString('pt-BR');
}

export function DashboardPage() {
  const { clients, loadClients } = useClientStore();
  const { projects, loadProjects } = useProjectStore();

  useEffect(() => {
    loadClients();
    loadProjects();
  }, [loadClients, loadProjects]);

  const metrics = useMemo(
    () => getDashboardMetrics(clients, projects),
    [clients, projects]
  );

  const revenue = useMemo(
    () => getMonthlyRevenueFromProjects(projects, 6),
    [projects]
  );

  const recentActivities = useMemo(
    () => getRecentProjectActivities(projects, clients, 5),
    [projects, clients]
  );

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-100">
        <p className="text-sm font-medium text-slate-500">Visão geral</p>
        <h2 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">
          Dashboard real do FreelancerOS
        </h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
          Agora o painel usa os dados que você já cadastrou no sistema. Enquanto
          pagamentos ainda não existem, o gráfico abaixo representa valor
          contratado por mês com base nos projetos criados.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-100">
          <p className="text-sm font-medium text-slate-500">Clientes ativos</p>
          <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
            {metrics.totalClients}
          </p>
          <p className="mt-2 text-sm text-slate-500">
            Total de clientes cadastrados
          </p>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-100">
          <p className="text-sm font-medium text-slate-500">Projetos ativos</p>
          <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
            {metrics.projectsInProgress}
          </p>
          <p className="mt-2 text-sm text-slate-500">
            Em andamento ou revisão
          </p>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-100">
          <p className="text-sm font-medium text-slate-500">Projetos concluídos</p>
          <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
            {metrics.completedProjects}
          </p>
          <p className="mt-2 text-sm text-slate-500">
            Total com status concluído
          </p>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-100">
          <p className="text-sm font-medium text-slate-500">Ticket médio</p>
          <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
            {formatCurrency(metrics.averageTicket)}
          </p>
          <p className="mt-2 text-sm text-slate-500">
            Valor médio por projeto
          </p>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-12">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-100 xl:col-span-8">
          <div className="mb-6 flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-slate-500">
                Valor contratado
              </p>
              <h3 className="mt-1 text-xl font-semibold tracking-tight text-slate-950">
                Últimos 6 meses
              </h3>
            </div>

            <div className="rounded-2xl bg-slate-50 px-4 py-3">
              <p className="text-xs font-medium uppercase tracking-[0.16em] text-slate-400">
                Total acumulado
              </p>
              <p className="mt-1 text-lg font-semibold text-slate-950">
                {formatCurrency(metrics.totalContractedValue)}
              </p>
            </div>
          </div>

          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={revenue}
                margin={{ top: 10, right: 20, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#635bff" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#635bff" stopOpacity={0} />
                  </linearGradient>
                </defs>

                <CartesianGrid
                  stroke="#e2e8f0"
                  strokeDasharray="4 4"
                  vertical={false}
                />

                <XAxis
                  dataKey="month"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: '#64748b', fontSize: 12 }}
                />

                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: '#64748b', fontSize: 12 }}
                  tickFormatter={(value) => `R$ ${Number(value) / 1000}k`}
                />

                <Tooltip
                  formatter={(value) => [
                    formatCurrency(Number(value)),
                    'Valor contratado',
                  ]}
                  contentStyle={{
                    borderRadius: 16,
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 15px 35px rgba(15, 23, 42, 0.08)',
                  }}
                />

                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#635bff"
                  strokeWidth={3}
                  fill="url(#colorRevenue)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-100 xl:col-span-4">
          <div className="mb-6">
            <p className="text-sm font-medium text-slate-500">Atividade recente</p>
            <h3 className="mt-1 text-xl font-semibold tracking-tight text-slate-950">
              Últimos projetos criados
            </h3>
          </div>

          <div className="space-y-4">
            {recentActivities.length > 0 ? (
              recentActivities.map((activity) => (
                <div
                  key={activity.id}
                  className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-slate-900">
                        {activity.title}
                      </p>
                      <p className="mt-1 text-sm text-slate-500">
                        {activity.clientName}
                      </p>
                    </div>

                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${projectStatusClassName[activity.status]}`}
                    >
                      {projectStatusLabel[activity.status]}
                    </span>
                  </div>

                  <div className="mt-3 flex items-center justify-between text-sm text-slate-500">
                    <span>{formatDate(activity.createdAt)}</span>
                    <span>{formatCurrency(activity.value)}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-sm text-slate-500">
                Nenhuma atividade ainda. Crie clientes e projetos para alimentar
                o dashboard.
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-100">
          <p className="text-sm font-medium text-slate-500">Base operacional</p>
          <h3 className="mt-1 text-xl font-semibold tracking-tight text-slate-950">
            Total de projetos
          </h3>
          <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
            {metrics.totalProjects}
          </p>
          <p className="mt-2 text-sm text-slate-500">
            Esse número serve de base para pagamentos, propostas convertidas e
            previsões futuras.
          </p>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-100">
          <p className="text-sm font-medium text-slate-500">Valor contratado</p>
          <h3 className="mt-1 text-xl font-semibold tracking-tight text-slate-950">
            Soma dos projetos cadastrados
          </h3>
          <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
            {formatCurrency(metrics.totalContractedValue)}
          </p>
          <p className="mt-2 text-sm text-slate-500">
            Quando o módulo de pagamentos entrar, essa métrica deve ser separada
            de valor recebido.
          </p>
        </div>
      </section>
    </div>
  );
}