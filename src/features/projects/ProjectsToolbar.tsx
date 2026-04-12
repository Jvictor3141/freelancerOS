import { ListFilter } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { SelectField } from '../../components/SelectField'
import type { Client } from '../../types/client'
import {
  type ProjectStatusFilter,
  parseProjectStatusFilter,
  projectStatusFilterOptions,
  projectStatusLabel,
} from '../../utils/projectStatus'

type ProjectsToolbarProps = {
  clients: Client[]
  search: string
  statusFilter: ProjectStatusFilter
  clientFilter: string
  hasActiveSelectionFilters: boolean
  onSearchChange: (value: string) => void
  onStatusFilterChange: (value: ProjectStatusFilter) => void
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
  const { t } = useTranslation()

  return (
    <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm shadow-slate-100">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center">
        <div className="flex items-center gap-3 xl:min-w-0 xl:basis-1/2 xl:max-w-[50%]">
          <input
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder={t('projects.search_placeholder')}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[#635bff]"
          />

          <button
            type="button"
            onClick={onOpenFilterModal}
            aria-label={t('projects.filter_open_aria')}
            title={t('projects.filter_open_title')}
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
          <SelectField
            value={statusFilter}
            ariaLabel={t('projects.filter_status_aria')}
            onChange={(nextValue) =>
              onStatusFilterChange(parseProjectStatusFilter(nextValue))
            }
            options={projectStatusFilterOptions.map((status) => ({
              value: status,
              label:
                status === 'all'
                  ? t('projects.filter_all_statuses')
                  : t(projectStatusLabel[status]),
            }))}
          />

          <SelectField
            value={clientFilter}
            ariaLabel={t('projects.filter_client_aria')}
            onChange={onClientFilterChange}
            options={[
              { value: 'all', label: t('projects.filter_all_clients') },
              ...clients.map((client) => ({
                value: client.id,
                label: client.name,
              })),
            ]}
          />

          <button
            type="button"
            onClick={onResetAllFilters}
            className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            {t('projects.filter_clear')}
          </button>

          <button
            type="button"
            onClick={onOpenCreateModal}
            aria-label={t('projects.new_project_title')}
            title={t('projects.new_project_title')}
            className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#635bff] text-2xl font-semibold leading-none text-white shadow-lg shadow-indigo-200 transition hover:-translate-y-0.5 hover:brightness-105"
          >
            +
          </button>
        </div>
      </div>
    </section>
  )
}
