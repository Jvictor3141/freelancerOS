import { useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Clock3, FolderKanban, Wallet } from 'lucide-react';
import { useClientStore } from '../store/useClientStore';
import { useProjectStore } from '../store/useProjectStore';
import { usePaymentStore } from '../store/usePaymentStore';
import {
  getClientFinancialSummary,
  getClientPayments,
  getClientProjects,
} from '../utils/clientDetails';
import { projectStatusClassName, projectStatusLabel } from '../utils/projectStatus';
import { paymentStatusClassName, paymentStatusLabel } from '../utils/paymentStatus';

function formatCurrency(value: number) {
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

export function ClientDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { clients, loadClients } = useClientStore();
  const { projects, loadProjects } = useProjectStore();
  const { payments, loadPayments } = usePaymentStore();

  useEffect(() => {
    loadClients();
    loadProjects();
    loadPayments();
  }, [loadClients, loadProjects, loadPayments]);

  const client = useMemo(
    () => clients.find((item) => item.id === id) ?? null,
    [clients, id]
  );

  const clientProjects = useMemo(() => {
    if (!id) return [];
    return getClientProjects(projects, id);
  }, [projects, id]);

  const clientPayments = useMemo(
    () => getClientPayments(payments, clientProjects),
    [payments, clientProjects]
  );

  const summary = useMemo(
    () => getClientFinancialSummary(clientProjects, clientPayments),
    [clientProjects, clientPayments]
  );

  if (!client) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm shadow-slate-100">
        <h2 className="text-2xl font-semibold tracking-tight text-slate-950">
          Cliente não encontrado
        </h2>
        <p className="mt-2 text-sm text-slate-500">
          Esse cliente não existe ou foi removido.
        </p>
        <button
          onClick={() => navigate('/clientes')}
          className="mt-6 rounded-2xl bg-[#635bff] px-4 py-3 text-sm font-semibold text-white"
        >
          Voltar para clientes
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm shadow-slate-100">
        <button
          onClick={() => navigate('/clientes')}
          className="mb-5 inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
        >
          <ArrowLeft size={16} />
          Voltar
        </button>

        <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">Cliente</p>
            <h1 className="mt-1 text-3xl font-semibold tracking-tight text-slate-950">
              {client.name}
            </h1>
            <div className="mt-3 space-y-1 text-sm text-slate-500">
              <p>{client.company || 'Sem empresa informada'}</p>
              <p>{client.email}</p>
              <p>{client.phone || 'Sem telefone informado'}</p>
            </div>
          </div>

          <div className="max-w-xl rounded-3xl bg-slate-50 p-4 text-sm text-slate-600">
            <p className="font-medium text-slate-800">Notas</p>
            <p className="mt-2 leading-6">
              {client.notes || 'Nenhuma observação cadastrada para este cliente.'}
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm shadow-slate-100">
          <div className="mb-4 inline-flex rounded-2xl bg-blue-100 p-3 text-blue-700">
            <FolderKanban size={18} />
          </div>
          <p className="text-sm font-medium text-slate-500">Projetos</p>
          <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
            {clientProjects.length}
          </p>
        </div>

        <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm shadow-slate-100">
          <div className="mb-4 inline-flex rounded-2xl bg-emerald-100 p-3 text-emerald-700">
            <Wallet size={18} />
          </div>
          <p className="text-sm font-medium text-slate-500">Recebido</p>
          <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
            {formatCurrency(summary.totalReceived)}
          </p>
        </div>

        <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm shadow-slate-100">
          <div className="mb-4 inline-flex rounded-2xl bg-amber-100 p-3 text-amber-700">
            <Clock3 size={18} />
          </div>
          <p className="text-sm font-medium text-slate-500">Pendente</p>
          <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
            {formatCurrency(summary.totalPending + summary.totalOverdue)}
          </p>
        </div>

        <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm shadow-slate-100">
          <div className="mb-4 inline-flex rounded-2xl bg-violet-100 p-3 text-violet-700">
            <CheckCircle2 size={18} />
          </div>
          <p className="text-sm font-medium text-slate-500">Concluídos</p>
          <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
            {summary.completedProjects}
          </p>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <div className="rounded-[28px] border border-slate-200 bg-white shadow-sm shadow-slate-100">
          <div className="border-b border-slate-200 px-6 py-5">
            <p className="text-sm font-medium text-slate-500">Projetos</p>
            <h2 className="mt-1 text-xl font-semibold tracking-tight text-slate-950">
              Projetos desse cliente
            </h2>
          </div>

          <div className="divide-y divide-slate-100">
            {clientProjects.length > 0 ? (
              clientProjects.map((project) => (
                <div key={project.id} className="px-6 py-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-slate-900">{project.name}</p>
                      <p className="mt-1 text-sm text-slate-500">
                        {project.description || 'Sem descrição'}
                      </p>
                    </div>

                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${projectStatusClassName[project.status]}`}
                    >
                      {projectStatusLabel[project.status]}
                    </span>
                  </div>

                  <div className="mt-3 flex items-center justify-between text-sm text-slate-500">
                    <span>
                      Prazo:{' '}
                      {project.deadline
                        ? new Date(project.deadline).toLocaleDateString('pt-BR')
                        : '—'}
                    </span>
                    <span className="font-semibold text-slate-900">
                      {formatCurrency(project.value)}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="px-6 py-8 text-sm text-slate-500">
                Nenhum projeto encontrado para este cliente.
              </div>
            )}
          </div>
        </div>

        <div className="rounded-[28px] border border-slate-200 bg-white shadow-sm shadow-slate-100">
          <div className="border-b border-slate-200 px-6 py-5">
            <p className="text-sm font-medium text-slate-500">Pagamentos</p>
            <h2 className="mt-1 text-xl font-semibold tracking-tight text-slate-950">
              Histórico financeiro
            </h2>
          </div>

          <div className="divide-y divide-slate-100">
            {clientPayments.length > 0 ? (
              clientPayments.map((payment) => (
                <div key={payment.id} className="px-6 py-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-slate-900">
                        {formatCurrency(payment.amount)}
                      </p>
                      <p className="mt-1 text-sm text-slate-500">
                        Vencimento:{' '}
                        {new Date(payment.dueDate).toLocaleDateString('pt-BR')}
                      </p>
                    </div>

                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${paymentStatusClassName[payment.status]}`}
                    >
                      {paymentStatusLabel[payment.status]}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="px-6 py-8 text-sm text-slate-500">
                Nenhum pagamento encontrado para este cliente.
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}