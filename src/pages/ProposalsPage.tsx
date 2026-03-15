import {
  ArrowRight,
  BriefcaseBusiness,
  CircleDollarSign,
  FileText,
} from 'lucide-react';
import { useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useClientStore } from '../store/useClientStore';
import { useProjectStore } from '../store/useProjectStore';
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

export function ProposalsPage() {
  const navigate = useNavigate();
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

  const combinedError = clientError ?? projectError;

  useEffect(() => {
    void loadClients();
    void loadProjects();
  }, [loadClients, loadProjects]);

  const proposals = useMemo(() => {
    return projects
      .filter((project) => project.status === 'proposal')
      .map((project) => {
        const client = clients.find((item) => item.id === project.clientId);

        return {
          ...project,
          clientName: client?.name ?? 'Cliente nao encontrado',
          clientCompany: client?.company ?? '',
        };
      })
      .sort(
        (left, right) =>
          new Date(right.createdAt).getTime() -
          new Date(left.createdAt).getTime(),
      );
  }, [projects, clients]);

  const proposalValue = useMemo(() => {
    return proposals.reduce((total, proposal) => total + proposal.value, 0);
  }, [proposals]);

  const averageProposalValue =
    proposals.length > 0 ? proposalValue / proposals.length : 0;

  if (!clientsInitialized || !projectsInitialized) {
    return (
      <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm shadow-slate-100">
        <p className="text-sm font-medium text-slate-500">Propostas</p>
        <h2 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">
          Carregando dados do banco...
        </h2>
        <p className="mt-2 text-sm text-slate-500">
          Consolidando clientes e projetos em fase de proposta.
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

      <section className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        <article className="rounded-[28px] bg-[#635bff] p-6 text-white shadow-[0_24px_60px_rgba(99,91,255,0.28)]">
          <p className="text-sm font-medium text-indigo-100">
            Pipeline comercial
          </p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight">
            Propostas ainda abertas no funil
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-indigo-100/90">
            Esta tela agora usa os projetos em status de proposta para mostrar
            volume, valor e prioridade comercial de forma objetiva.
          </p>

          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <div className="rounded-3xl bg-white/12 p-4 backdrop-blur-sm">
              <div className="mb-3 inline-flex rounded-2xl bg-white/12 p-2">
                <FileText size={18} />
              </div>
              <p className="text-sm text-indigo-100">Propostas abertas</p>
              <p className="mt-2 text-2xl font-semibold">{proposals.length}</p>
            </div>

            <div className="rounded-3xl bg-white/12 p-4 backdrop-blur-sm">
              <div className="mb-3 inline-flex rounded-2xl bg-white/12 p-2">
                <CircleDollarSign size={18} />
              </div>
              <p className="text-sm text-indigo-100">Valor no pipeline</p>
              <p className="mt-2 text-2xl font-semibold">
                {formatCurrency(proposalValue)}
              </p>
            </div>

            <div className="rounded-3xl bg-white/12 p-4 backdrop-blur-sm">
              <div className="mb-3 inline-flex rounded-2xl bg-white/12 p-2">
                <BriefcaseBusiness size={18} />
              </div>
              <p className="text-sm text-indigo-100">Ticket medio</p>
              <p className="mt-2 text-2xl font-semibold">
                {formatCurrency(averageProposalValue)}
              </p>
            </div>
          </div>
        </article>

        <article className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm shadow-slate-100">
          <p className="text-sm font-medium text-slate-500">Acao rapida</p>
          <h3 className="mt-1 text-xl font-semibold tracking-tight text-slate-950">
            Transforme oportunidade em execucao
          </h3>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            Crie novas propostas direto pela tela de projetos e mantenha o funil
            alinhado ao restante da operacao.
          </p>

          <button
            type="button"
            onClick={() => navigate('/projetos?new=1')}
            className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#635bff] px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-200 transition hover:-translate-y-0.5 hover:brightness-105"
          >
            Nova proposta
            <ArrowRight size={16} />
          </button>

          <div className="mt-6 rounded-3xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm font-semibold text-slate-900">
              O que entra aqui
            </p>
            <ul className="mt-3 space-y-3 text-sm leading-6 text-slate-600">
              <li>Projetos com status `Proposta`.</li>
              <li>Relacionamento com cliente ja resolvido.</li>
              <li>Valor total visivel para priorizar follow-up.</li>
            </ul>
          </div>
        </article>
      </section>

      <section className="rounded-[28px] border border-slate-200 bg-white shadow-sm shadow-slate-100">
        <div className="border-b border-slate-200 px-5 py-5 sm:px-6">
          <p className="text-sm font-medium text-slate-500">
            {proposals.length} proposta(s) aberta(s)
          </p>
          <h3 className="mt-1 text-xl font-semibold tracking-tight text-slate-950">
            Oportunidades em andamento
          </h3>
        </div>

        <div className="divide-y divide-slate-100">
          {proposals.length > 0 ? (
            proposals.map((proposal) => (
              <article key={proposal.id} className="space-y-4 px-5 py-5 sm:px-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-lg font-semibold text-slate-900">
                      {proposal.name}
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      {proposal.description || 'Sem descricao cadastrada.'}
                    </p>
                  </div>

                  <span
                    className={`inline-flex w-fit rounded-full px-3 py-1 text-xs font-semibold ${projectStatusClassName[proposal.status]}`}
                  >
                    {projectStatusLabel[proposal.status]}
                  </span>
                </div>

                <div className="grid gap-2 text-sm text-slate-600 md:grid-cols-2 xl:grid-cols-4">
                  <p>
                    <span className="font-medium text-slate-900">Cliente:</span>{' '}
                    {proposal.clientName}
                  </p>
                  <p>
                    <span className="font-medium text-slate-900">Empresa:</span>{' '}
                    {proposal.clientCompany || '-'}
                  </p>
                  <p>
                    <span className="font-medium text-slate-900">Valor:</span>{' '}
                    {formatCurrency(proposal.value)}
                  </p>
                  <p>
                    <span className="font-medium text-slate-900">
                      Criado em:
                    </span>{' '}
                    {formatDate(proposal.createdAt)}
                  </p>
                </div>
              </article>
            ))
          ) : (
            <div className="px-5 py-10 text-center text-sm text-slate-500 sm:px-6">
              Nenhuma proposta aberta. Crie um novo projeto em status de
              proposta para alimentar essa tela.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
