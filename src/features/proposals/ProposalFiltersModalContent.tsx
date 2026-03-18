import {
  type ProposalStatusFilter,
  parseProposalStatusFilter,
  proposalStatusLabel,
  proposalStatusOptions,
} from '../../utils/proposalStatus'

type ProposalFiltersModalContentProps = {
  statusFilterDraft: ProposalStatusFilter
  onStatusChange: (value: ProposalStatusFilter) => void
  onClear: () => void
  onApply: () => void
}

export function ProposalFiltersModalContent({
  statusFilterDraft,
  onStatusChange,
  onClear,
  onApply,
}: ProposalFiltersModalContentProps) {
  return (
    <div className="space-y-4">
      <label className="block">
        <span className="mb-2 block text-sm font-medium text-slate-700">
          Status
        </span>
        <select
          value={statusFilterDraft}
          onChange={(event) =>
            onStatusChange(parseProposalStatusFilter(event.target.value))
          }
          className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[#635bff]"
        >
          {proposalStatusOptions.map((status) => (
            <option key={status} value={status}>
              {status === 'all'
                ? 'Todos os status'
                : proposalStatusLabel[status]}
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
