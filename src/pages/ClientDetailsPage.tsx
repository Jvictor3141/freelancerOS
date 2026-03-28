import { useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  CheckCircle2,
  Clock3,
  FolderKanban,
  Wallet,
} from 'lucide-react'
import { useClientDetailsData } from '../features/clients/useClientDetailsData'
import { formatDate } from '../utils/formatting'
import {
  paymentStatusClassName,
  paymentStatusLabel,
} from '../utils/paymentStatus'
import {
  projectStatusClassName,
  projectStatusLabel,
} from '../utils/projectStatus'

function formatCurrency(value: number) {
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  })
}

export function ClientDetailsPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { snapshot, combinedError, hasLoadError, isLoading, retryLoad } =
    useClientDetailsData(id)

  const client = snapshot?.client ?? null
  const clientProjects = snapshot?.projects ?? []
  const clientPayments = snapshot?.payments ?? []
  const summary = snapshot?.summary ?? {
    totalContracted: 0,
    totalReceived: 0,
    totalPending: 0,
    totalOverdue: 0,
    totalOutstanding: 0,
    completedProjects: 0,
  }

  if (isLoading) {
    return (
      <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm shadow-slate-100">
        <p className="text-sm font-medium text-slate-500">Cliente</p>
        <h2 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">
          Carregando dados do banco...
        </h2>
        <p className="mt-2 text-sm text-slate-500">
          Buscando detalhes, projetos e pagamentos relacionados.
        </p>
      </section>
    )
  }

  if (!client) {
    return (
      <div className="page-stack space-y-6">
        {combinedError ? (
          <section className="rounded-3xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-700">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>{combinedError}</div>
              {hasLoadError ? (
                <button
                  type="button"
                  onClick={() => {
                    void retryLoad()
                  }}
                  className="inline-flex w-fit items-center justify-center rounded-2xl border border-rose-300 bg-white/80 px-4 py-2 text-sm font-semibold text-rose-700 transition hover:bg-white"
                >
                  Tentar novamente
                </button>
              ) : null}
            </div>
          </section>
        ) : null}

        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm shadow-slate-100">
          <h2 className="text-2xl font-semibold tracking-tight text-slate-950">
            Cliente nao encontrado
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            Esse cliente nao existe ou foi removido.
          </p>
          <button
            type="button"
            onClick={() => navigate('/clientes')}
            className="mt-6 rounded-2xl bg-[#635bff] px-4 py-3 text-sm font-semibold text-white"
          >
            Voltar para clientes
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="page-stack space-y-6">
      {combinedError ? (
        <section className="rounded-3xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-700">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>{combinedError}</div>
            {hasLoadError ? (
              <button
                type="button"
                onClick={() => {
                  void retryLoad()
                }}
                className="inline-flex w-fit items-center justify-center rounded-2xl border border-rose-300 bg-white/80 px-4 py-2 text-sm font-semibold text-rose-700 transition hover:bg-white"
              >
                Tentar novamente
              </button>
            ) : null}
          </div>
        </section>
      ) : null}

      <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm shadow-slate-100">
        <button
          type="button"
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
              <p className="break-all">{client.email}</p>
              <p>{client.phone || 'Sem telefone informado'}</p>
            </div>
          </div>

          <div className="max-w-xl rounded-3xl bg-slate-50 p-4 text-sm text-slate-600">
            <p className="font-medium text-slate-800">Notas</p>
            <p className="mt-2 leading-6">
              {client.notes || 'Nenhuma observacao cadastrada para este cliente.'}
            </p>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm shadow-slate-100">
          <div className="flex items-center">
            <div className="mr-2 inline-flex rounded-2xl bg-blue-100 p-3 text-blue-700">
              <FolderKanban size={16} />
            </div>
            <p className="text-sm font-medium text-slate-500">Projetos</p>
          </div>
          <p className="mt-2 flex items-end justify-end text-lg font-semibold tracking-tight text-slate-950 sm:text-xl md:text-2xl lg:text-3xl">
            {clientProjects.length}
          </p>
        </div>

        <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm shadow-slate-100">
          <div className="flex items-center">
            <div className="mr-2 inline-flex rounded-2xl bg-emerald-100 p-3 text-emerald-700">
              <Wallet size={16} />
            </div>
            <p className="text-sm font-medium text-slate-500">Recebido</p>
          </div>
          <p className="mt-2 flex items-end justify-end text-lg font-semibold tracking-tight text-slate-950 sm:text-xl md:text-2xl lg:text-3xl">
            {formatCurrency(summary.totalReceived)}
          </p>
        </div>

        <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm shadow-slate-100">
          <div className="flex items-center">
            <div className="mr-2 inline-flex rounded-2xl bg-amber-100 p-3 text-amber-700">
              <Clock3 size={16} />
            </div>
            <p className="text-sm font-medium text-slate-500">Pendente</p>
          </div>
          <p className="mt-2 flex items-end justify-end text-lg font-semibold tracking-tight text-slate-950 sm:text-xl md:text-2xl lg:text-3xl">
            {formatCurrency(summary.totalOutstanding)}
          </p>
        </div>

        <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm shadow-slate-100">
          <div className="flex items-center">
            <div className="mr-2 inline-flex rounded-2xl bg-violet-100 p-3 text-violet-700">
              <CheckCircle2 size={16} />
            </div>
            <p className="text-sm font-medium text-slate-500">Concluidos</p>
          </div>
          <p className="mt-2 flex items-end justify-end text-lg font-semibold tracking-tight text-slate-950 sm:text-xl md:text-2xl lg:text-3xl">
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
                  <div className="flex flex-col-2 justify-between gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="font-semibold text-slate-900">
                        {project.name}
                      </p>
                      <p className="mt-1 text-sm text-slate-500">
                        {project.description || 'Sem descricao'}
                      </p>
                    </div>

                    <span
                      className={`inline-flex h-6.5 rounded-full px-3 py-1 text-xs font-semibold ${projectStatusClassName[project.status]}`}
                    >
                      {projectStatusLabel[project.status]}
                    </span>
                  </div>

                  <div className="mt-3 flex flex-col gap-2 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
                    <span>Prazo: {formatDate(project.deadline)}</span>
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
              Historico financeiro
            </h2>
          </div>

          <div className="divide-y divide-slate-100">
            {clientPayments.length > 0 ? (
              clientPayments.map((payment) => (
                <div key={payment.id} className="px-6 py-4">
                  <div className="flex flex-col-2 justify-between gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="font-semibold text-slate-900">
                        {formatCurrency(payment.amount)}
                      </p>
                      <p className="mt-1 text-sm text-slate-500">
                        Vencimento: {formatDate(payment.dueDate)}
                      </p>
                    </div>

                    <span
                      className={`inline-flex h-6.5 rounded-full px-3 py-1 text-xs font-semibold ${paymentStatusClassName[payment.status]}`}
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
  )
}
