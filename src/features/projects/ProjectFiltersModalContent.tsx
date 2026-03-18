import type { Client } from '../../types/client'
import {
  type ProjectStatusFilter,
  parseProjectStatusFilter,
  projectStatusFilterOptions,
  projectStatusLabel,
} from '../../utils/projectStatus'

type ProjectFiltersModalContentProps = {
  clients: Client[]
  statusFilterDraft: ProjectStatusFilter
  clientFilterDraft: string
  onStatusChange: (value: ProjectStatusFilter) => void
  onClientChange: (value: string) => void
  onClear: () => void
  onApply: () => void
}

export function ProjectFiltersModalContent({
  clients,
  statusFilterDraft,
  clientFilterDraft,
  onStatusChange,
  onClientChange,
  onClear,
  onApply,
}: ProjectFiltersModalContentProps) {
  return (
    <div className="space-y-4">
      <label className="block">
        <span className="mb-2 block text-sm font-medium text-slate-700">
          Status
        </span>
        <select
          value={statusFilterDraft}
          onChange={(event) =>
            onStatusChange(parseProjectStatusFilter(event.target.value))
          }
          className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[#635bff]"
        >
          {projectStatusFilterOptions.map((status) => (
            <option key={status} value={status}>
              {status === 'all' ? 'Todos os status' : projectStatusLabel[status]}
            </option>
          ))}
        </select>
      </label>

      <label className="block">
        <span className="mb-2 block text-sm font-medium text-slate-700">
          Cliente
        </span>
        <select
          value={clientFilterDraft}
          onChange={(event) => onClientChange(event.target.value)}
          className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[#635bff]"
        >
          <option value="all">Todos os clientes</option>
          {clients.map((client) => (
            <option key={client.id} value={client.id}>
              {client.name}
            </option>
          ))}
        </select>
      </label>

      <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={onClear}
          className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          Limpar filtros
        </button>

        <button
          type="button"
          onClick={onApply}
          className="rounded-2xl bg-[#635bff] px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-200 transition hover:-translate-y-0.5 hover:brightness-105"
        >
          Aplicar filtros
        </button>
      </div>
    </div>
  )
}
