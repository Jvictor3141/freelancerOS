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
import {
  AlertTriangle,
  ArrowUpRight,
  CheckCircle2,
  Clock3,
  FolderKanban,
  Users,
} from 'lucide-react';
import { useClientStore } from '../store/useClientStore';
import { usePaymentStore } from '../store/usePaymentStore';
import { useProjectStore } from '../store/useProjectStore';
import {
  getDashboardMetrics,
  getMonthlyReceivedRevenue,
  getPaymentAlerts,
  getPaymentMetrics,
  getRecentProjectActivities,
} from '../utils/dashboard';
import {
  projectStatusClassName,
  projectStatusLabel,
} from '../utils/projectStatus';

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
  const {
    clients,
    error: clientError,
    initialized: clientsInitialized,
    loadClients,
  } = useClientStore();
  const {
    projects,
    error: projectError,
    initialized: projectsInitialized,
    loadProjects,
  } = useProjectStore();
  const {
    payments,
    error: paymentError,
    initialized: paymentsInitialized,
    loadPayments,
    markAsOverdueIfNeeded,
  } = usePaymentStore();

  const combinedError = paymentError ?? projectError ?? clientError;

  useEffect(() => {
    void loadClients();
    void loadProjects();
    void loadPayments();
  }, [loadClients, loadProjects, loadPayments]);

  useEffect(() => {
    if (!paymentsInitialized) {
      return;
    }

    void markAsOverdueIfNeeded();
  }, [paymentsInitialized, markAsOverdueIfNeeded]);

  const metrics = useMemo(
    () => getDashboardMetrics(clients, projects),
    [clients, projects],
  );

  const paymentMetrics = useMemo(
    () => getPaymentMetrics(payments),
    [payments],
  );

  const revenue = useMemo(
    () => getMonthlyReceivedRevenue(payments, 6),
    [payments],
  );

  const recentActivities = useMemo(
    () => getRecentProjectActivities(projects, clients, 4),
    [projects, clients],
  );

  const paymentAlerts = useMemo(
    () => getPaymentAlerts(payments, projects, clients, 4),
    [payments, projects, clients],
  );

  if (!clientsInitialized || !projectsInitialized || !paymentsInitialized) {
    return (
      <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm shadow-slate-100">
        <p className="text-sm font-medium text-slate-500">Dashboard</p>
        <h2 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">
          Carregando dados do banco...
        </h2>
        <p className="mt-2 text-sm text-slate-500">
          Consolidando clientes, projetos e pagamentos no Supabase.
        </p>
      </section>
    );
  }

  return (
    <div className="space-y-6">
      {combinedError ? (
        <section className="rounded-3xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-700">
          {combinedError}
        </section>
      ) : null}

      <section className="grid gap-4 xl:grid-cols-12">
        <div className="rounded-[28px] bg-[#635bff] p-6 text-white shadow-[0_24px_60px_rgba(99,91,255,0.28)] xl:col-span-8">
          <div className="flex h-full flex-col justify-between gap-6">
            <div className="space-y-2">
              <p className="text-sm font-medium text-indigo-100">
                Visao financeira
              </p>
              <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                Entradas de dinheiro e saude do negocio
              </h2>
              <p className="max-w-2xl text-sm leading-6 text-indigo-100/90">
                Um painel direto para entender o que entrou, o que ainda esta
                pendente e onde estao os gargalos financeiros.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-3xl bg-white/12 p-4 backdrop-blur-sm">
                <div className="mb-3 inline-flex rounded-2xl bg-white/12 p-2">
                  <ArrowUpRight size={18} />
                </div>
                <p className="text-sm text-indigo-100">Recebido</p>
                <p className="mt-2 text-2xl font-semibold">
                  {formatCurrency(paymentMetrics.receivedAmount)}
                </p>
              </div>

              <div className="rounded-3xl bg-white/12 p-4 backdrop-blur-sm">
                <div className="mb-3 inline-flex rounded-2xl bg-white/12 p-2">
                  <Clock3 size={18} />
                </div>
                <p className="text-sm text-indigo-100">Pendente</p>
                <p className="mt-2 text-2xl font-semibold">
                  {formatCurrency(paymentMetrics.pendingAmount)}
                </p>
              </div>

              <div className="rounded-3xl bg-white/12 p-4 backdrop-blur-sm">
                <div className="mb-3 inline-flex rounded-2xl bg-white/12 p-2">
                  <AlertTriangle size={18} />
                </div>
                <p className="text-sm text-indigo-100">Atrasado</p>
                <p className="mt-2 text-2xl font-semibold">
                  {formatCurrency(paymentMetrics.overdueAmount)}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm shadow-slate-100 xl:col-span-4">
          <div className="mb-5">
            <p className="text-sm font-medium text-slate-500">Alertas</p>
            <h3 className="mt-1 text-xl font-semibold tracking-tight text-slate-950">
              Clientes que precisam de atencao
            </h3>
          </div>

          <div className="space-y-3">
            {paymentAlerts.length > 0 ? (
              paymentAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-slate-900">
                        {alert.clientName}
                      </p>
                      <p className="mt-1 text-sm text-slate-500">
                        {alert.projectName}
                      </p>
                    </div>

                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                        alert.status === 'overdue'
                          ? 'bg-rose-100 text-rose-700'
                          : 'bg-amber-100 text-amber-700'
                      }`}
                    >
                      {alert.status === 'overdue' ? 'Atrasado' : 'Pendente'}
                    </span>
                  </div>

                  <div className="mt-3 flex flex-col gap-2 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
                    <span>Vence em {formatDate(alert.dueDate)}</span>
                    <span className="font-semibold text-slate-900">
                      {formatCurrency(alert.amount)}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-sm text-slate-500">
                Nenhum cliente com cobranca pendente ou atrasada.
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm shadow-slate-100">
          <div className="mb-4 inline-flex rounded-2xl bg-slate-100 p-3 text-slate-700">
            <Users size={18} />
          </div>
          <p className="text-sm font-medium text-slate-500">Clientes</p>
          <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
            {metrics.totalClients}
          </p>
          <p className="mt-2 text-sm text-slate-500">
            Base ativa cadastrada
          </p>
        </div>

        <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm shadow-slate-100">
          <div className="mb-4 inline-flex rounded-2xl bg-blue-100 p-3 text-blue-700">
            <FolderKanban size={18} />
          </div>
          <p className="text-sm font-medium text-slate-500">Projetos ativos</p>
          <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
            {metrics.projectsInProgress}
          </p>
          <p className="mt-2 text-sm text-slate-500">
            Em andamento ou revisao
          </p>
        </div>

        <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm shadow-slate-100">
          <div className="mb-4 inline-flex rounded-2xl bg-emerald-100 p-3 text-emerald-700">
            <CheckCircle2 size={18} />
          </div>
          <p className="text-sm font-medium text-slate-500">Concluidos</p>
          <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
            {metrics.completedProjects}
          </p>
          <p className="mt-2 text-sm text-slate-500">
            Projetos finalizados
          </p>
        </div>

        <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm shadow-slate-100">
          <div className="mb-4 inline-flex rounded-2xl bg-violet-100 p-3 text-violet-700">
            <ArrowUpRight size={18} />
          </div>
          <p className="text-sm font-medium text-slate-500">Ticket medio</p>
          <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
            {formatCurrency(metrics.averageTicket)}
          </p>
          <p className="mt-2 text-sm text-slate-500">
            Valor medio por projeto
          </p>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-12">
        <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm shadow-slate-100 xl:col-span-8">
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">
                Entradas de dinheiro
              </p>
              <h3 className="mt-1 text-xl font-semibold tracking-tight text-slate-950">
                Recebimentos dos ultimos 6 meses
              </h3>
            </div>

            <div className="rounded-2xl bg-slate-50 px-4 py-3">
              <p className="text-xs font-medium uppercase tracking-[0.16em] text-slate-400">
                Total recebido
              </p>
              <p className="mt-1 text-lg font-semibold text-slate-950">
                {formatCurrency(paymentMetrics.receivedAmount)}
              </p>
            </div>
          </div>

          <div className="h-64 sm:h-80">
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
                    'Recebido',
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

        <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm shadow-slate-100 xl:col-span-4">
          <div className="mb-6">
            <p className="text-sm font-medium text-slate-500">
              Atividade recente
            </p>
            <h3 className="mt-1 text-xl font-semibold tracking-tight text-slate-950">
              Ultimos projetos criados
            </h3>
          </div>

          <div className="space-y-3">
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

                  <div className="mt-3 flex flex-col gap-2 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
                    <span>{formatDate(activity.createdAt)}</span>
                    <span>{formatCurrency(activity.value)}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-sm text-slate-500">
                Nenhuma atividade recente encontrada.
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
