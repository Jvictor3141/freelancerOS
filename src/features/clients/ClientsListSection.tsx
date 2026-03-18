import { Eye, PencilLine, Trash2 } from 'lucide-react'
import type { Client } from '../../types/client'
import { formatDate } from '../../utils/formatting'
import { getClientActionButtonClassName } from '../../utils/clientsPage'

type ClientsListSectionProps = {
  clients: Client[]
  search: string
  onSearchChange: (value: string) => void
  onCreate: () => void
  onEdit: (client: Client) => void
  onOpenDetails: (client: Client) => void
  onRemove: (client: Client) => void
}

export function ClientsListSection({
  clients,
  search,
  onSearchChange,
  onCreate,
  onEdit,
  onOpenDetails,
  onRemove,
}: ClientsListSectionProps) {
  return (
    <section className="rounded-[28px] border border-slate-200 bg-white shadow-sm shadow-slate-100">
      <div className="border-b border-slate-200 px-5 py-5 sm:px-6">
        <div className="flex flex-col gap-4 min-[425px]:flex-row min-[425px]:items-start min-[425px]:justify-between lg:items-center">
          <div className="min-w-0 flex-1">
            <h3 className="text-xl font-semibold tracking-tight text-slate-950">
              Lista de clientes
            </h3>
            <p className="mt-1 text-sm font-medium text-slate-500">
              {clients.length} cliente(s) encontrado(s)
            </p>
          </div>

          <div className="flex min-w-0 items-center gap-3 min-[425px]:shrink-0">
            <input
              value={search}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder="Buscar por nome, empresa ou email"
              className="min-w-0 flex-1 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[#635bff] min-[425px]:w-52 min-[425px]:flex-none sm:w-60 md:w-72 lg:w-80"
            />

            <button
              type="button"
              onClick={onCreate}
              aria-label="Novo cliente"
              title="Novo cliente"
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#635bff] text-2xl font-semibold leading-none text-white shadow-lg shadow-indigo-200 transition hover:-translate-y-0.5 hover:brightness-105"
            >
              +
            </button>
          </div>
        </div>
      </div>

      <div className="divide-y divide-slate-100 lg:hidden">
        {clients.length > 0 ? (
          clients.map((client) => (
            <article key={client.id} className="space-y-4 px-5 py-5">
              <div className="flex flex-col gap-1">
                <p className="text-lg font-semibold text-slate-900">
                  {client.name}
                </p>
                <p className="text-sm text-slate-500">
                  {client.company || 'Sem empresa informada'}
                </p>
                <p className="break-all text-sm text-slate-600">
                  {client.email}
                </p>
                <p className="text-sm text-slate-600">
                  {client.phone || 'Sem telefone informado'}
                </p>
              </div>

              <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-400">
                Criado em {formatDate(client.createdAt)}
              </p>

              <div className="inline-flex max-w-full flex-nowrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => onEdit(client)}
                  aria-label={`Editar cliente ${client.name}`}
                  title="Editar cliente"
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border transition sm:h-10 sm:w-10 ${getClientActionButtonClassName('neutral')}`}
                >
                  <PencilLine size={15} />
                </button>

                <button
                  type="button"
                  onClick={() => onOpenDetails(client)}
                  aria-label={`Ver detalhes do cliente ${client.name}`}
                  title="Ver detalhes"
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border transition sm:h-10 sm:w-10 ${getClientActionButtonClassName('neutral')}`}
                >
                  <Eye size={15} />
                </button>

                <button
                  type="button"
                  onClick={() => onRemove(client)}
                  aria-label={`Excluir cliente ${client.name}`}
                  title="Excluir cliente"
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border transition sm:h-10 sm:w-10 ${getClientActionButtonClassName('danger')}`}
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </article>
          ))
        ) : (
          <div className="px-5 py-10 text-center text-sm text-slate-500">
            Nenhum cliente encontrado.
          </div>
        )}
      </div>

      <div className="hidden overflow-x-auto lg:block">
        <table className="min-w-full border-collapse">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/80">
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                Cliente
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                Empresa
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                Email
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                Telefone
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                Ações
              </th>
            </tr>
          </thead>

          <tbody>
            {clients.map((client) => (
              <tr
                key={client.id}
                className="border-b border-slate-100 transition hover:bg-slate-50/70"
              >
                <td className="px-6 py-4">
                  <div>
                    <p className="font-semibold text-slate-900">
                      {client.name}
                    </p>
                    <p className="text-xs text-slate-500">
                      Criado em {formatDate(client.createdAt)}
                    </p>
                  </div>
                </td>

                <td className="px-6 py-4 text-sm text-slate-700">
                  {client.company || '-'}
                </td>

                <td className="px-6 py-4 text-sm text-slate-700">
                  {client.email}
                </td>

                <td className="px-6 py-4 text-sm text-slate-700">
                  {client.phone || '-'}
                </td>

                <td className="px-6 py-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onEdit(client)}
                      aria-label={`Editar cliente ${client.name}`}
                      title="Editar cliente"
                      className={`flex h-11 w-11 items-center justify-center rounded-xl border transition ${getClientActionButtonClassName('neutral')}`}
                    >
                      <PencilLine size={17} />
                    </button>

                    <button
                      type="button"
                      onClick={() => onOpenDetails(client)}
                      aria-label={`Ver detalhes do cliente ${client.name}`}
                      title="Ver detalhes"
                      className={`flex h-11 w-11 items-center justify-center rounded-xl border transition ${getClientActionButtonClassName('neutral')}`}
                    >
                      <Eye size={17} />
                    </button>

                    <button
                      type="button"
                      onClick={() => onRemove(client)}
                      aria-label={`Excluir cliente ${client.name}`}
                      title="Excluir cliente"
                      className={`flex h-11 w-11 items-center justify-center rounded-xl border transition ${getClientActionButtonClassName('danger')}`}
                    >
                      <Trash2 size={17} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {clients.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-6 py-10 text-center text-sm text-slate-500"
                >
                  Nenhum cliente encontrado.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </section>
  )
}
