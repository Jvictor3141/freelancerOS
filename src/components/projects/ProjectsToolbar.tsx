import { ListFilter } from 'lucide-react'
import type { Client } from '../../types/client'
import type { ProjectStatus } from '../../types/project'
import { projectStatusLabel } from '../../utils/projectStatus'
import { projectStatusFilterOptions } from '../../utils/projectsPage'

type ProjectsToolbarProps = {
  clients: Client[]
  search: string
  statusFilter: ProjectStatus | 'all'
  clientFilter: string
  hasActiveSelectionFilters: boolean
  onSearchChange: (value: string) => void
  onStatusFilterChange: (value: ProjectStatus | 'all') => void
  onClientFilterChange: (value: string) => void
  onResetAllFilters: () => void
  onOpenCreateModal: () => void
  onOpenFilterModal: () => void
}

export function ProjectsToolbar({
  clients,
  search,
  statusFilter,
  clientFilter,
  hasActiveSelectionFilters,
  onSearchChange,
  onStatusFilterChange,
  onClientFilterChange,
  onResetAllFilters,
  onOpenCreateModal,
  onOpenFilterModal,
}: ProjectsToolbarProps) {
  return (
    <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm shadow-slate-100">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center">
        <div className="flex items-center gap-3 xl:min-w-0 xl:basis-1/2 xl:max-w-[50%]">
          <input
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Buscar projeto, descrição ou cliente"
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[#635bff]"
          />

          <button
            type="button"
            onClick={onOpenFilterModal}
            aria-label="Abrir filtros"
            title="Abrir filtros"
            className={`relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border bg-white text-slate-700 transition hover:bg-slate-50 xl:hidden ${
              hasActiveSelectionFilters
                ? 'border-[#635bff] text-[#635bff]'
                : 'border-slate-200'
            }`}
          >
            <ListFilter size={18} />
            {hasActiveSelectionFilters ? (
              <span className="absolute right-3 top-3 h-2.5 w-2.5 rounded-full bg-[#635bff]" />
            ) : null}
          </button>
        </div>

        <div className="hidden xl:grid xl:min-w-0 xl:flex-1 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_56px] xl:gap-4">
          <select
            value={statusFilter}
            onChange={(event) =>
              onStatusFilterChange(event.target.value as ProjectStatus | 'all')
            }
            className="min-w-0 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[#635bff]"
          >
            {projectStatusFilterOptions.map((status) => (
              <option key={status} value={status}>
                {status === 'all'
                  ? 'Todos os status'
                  : projectStatusLabel[status]}
              </option>
            ))}
          </select>

          <select
            value={clientFilter}
            onChange={(event) => onClientFilterChange(event.target.value)}
            className="min-w-0 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[#635bff]"
          >
            <option value="all">Todos os clientes</option>
            {clients.map((client) => (
              <option key={client.id} value={client.id}>
                {client.name}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={onResetAllFilters}
            className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Limpar filtros
          </button>

          <button
            type="button"
            onClick={onOpenCreateModal}
            aria-label="Novo projeto"
            title="Novo projeto"
            className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#635bff] text-2xl font-semibold leading-none text-white shadow-lg shadow-indigo-200 transition hover:-translate-y-0.5 hover:brightness-105"
          >
            +
          </button>
        </div>
      </div>
    </section>
  )
}
