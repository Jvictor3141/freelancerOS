import { ListFilter, RotateCcw } from 'lucide-react'
import type { ProposalStatus } from '../../types/proposal'
import { proposalStatusLabel } from '../../utils/proposalStatus'
import { proposalStatusOptions } from '../../utils/proposalsPage'

type ProposalsFiltersSectionProps = {
  search: string
  statusFilter: ProposalStatus | 'all'
  hasActiveFilters: boolean
  onSearchChange: (value: string) => void
  onStatusFilterChange: (value: ProposalStatus | 'all') => void
  onResetAllFilters: () => void
  onOpenFilterModal: () => void
}

export function ProposalsFiltersSection({
  search,
  statusFilter,
  hasActiveFilters,
  onSearchChange,
  onStatusFilterChange,
  onResetAllFilters,
  onOpenFilterModal,
}: ProposalsFiltersSectionProps) {
  const hasActiveStatusFilter = statusFilter !== 'all'

  return (
    <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm shadow-slate-100">
      <div className="hidden gap-4 lg:grid lg:grid-cols-[minmax(0,1.35fr)_minmax(0,0.9fr)_minmax(0,0.75fr)]">
        <input
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Buscar por título, cliente ou e-mail"
          className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[#635bff]"
        />

        <select
          value={statusFilter}
          onChange={(event) =>
            onStatusFilterChange(event.target.value as ProposalStatus | 'all')
          }
          className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[#635bff]"
        >
          {proposalStatusOptions.map((status) => (
            <option key={status} value={status}>
              {status === 'all'
                ? 'Todos os status'
                : proposalStatusLabel[status]}
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
      </div>

      <div className="flex items-center gap-3 lg:hidden">
        <input
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Buscar por título, cliente ou e-mail"
          className="min-w-0 flex-1 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[#635bff]"
        />

        <button
          type="button"
          onClick={onOpenFilterModal}
          aria-label="Abrir filtros"
          title="Abrir filtros"
          className={`relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border bg-white text-slate-700 transition hover:bg-slate-50 ${
            hasActiveStatusFilter
              ? 'border-[#635bff] text-[#635bff]'
              : 'border-slate-200'
          }`}
        >
          <ListFilter size={18} />
          {hasActiveStatusFilter ? (
            <span className="absolute right-3 top-3 h-2.5 w-2.5 rounded-full bg-[#635bff]" />
          ) : null}
        </button>

        <button
          type="button"
          onClick={onResetAllFilters}
          aria-label="Limpar filtros"
          title="Limpar filtros"
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border transition ${
            hasActiveFilters
              ? 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
              : 'border-slate-200 bg-slate-100 text-slate-400'
          }`}
        >
          <RotateCcw size={18} />
        </button>
      </div>
    </section>
  )
}
