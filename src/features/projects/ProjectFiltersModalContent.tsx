import { SelectField } from '../../components/SelectField'
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
        <SelectField
          value={statusFilterDraft}
          onChange={(nextValue) =>
            onStatusChange(parseProjectStatusFilter(nextValue))
          }
          options={projectStatusFilterOptions.map((status) => ({
            value: status,
            label:
              status === 'all' ? 'Todos os status' : projectStatusLabel[status],
          }))}
        />
      </label>

      <label className="block">
        <span className="mb-2 block text-sm font-medium text-slate-700">
          Cliente
        </span>
        <SelectField
          value={clientFilterDraft}
          onChange={onClientChange}
          options={[
            { value: 'all', label: 'Todos os clientes' },
            ...clients.map((client) => ({
              value: client.id,
              label: client.name,
            })),
          ]}
        />
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
