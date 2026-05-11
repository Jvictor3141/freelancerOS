import { PencilLine, Trash2 } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { ProjectWithClient } from '../../types/viewModels'
import { getActionButtonClassName } from '../../utils/actionButtonStyles'
import { formatCurrencyCode, formatDate } from '../../utils/formatting'
import {
  projectStatusClassName,
  projectStatusLabel,
} from '../../utils/projectStatus'
import { useLang } from '../../i18n/hooks/useLang'

type ProjectsListSectionProps = {
  projects: ProjectWithClient[]
  onEdit: (project: ProjectWithClient) => void
  onRemove: (project: ProjectWithClient) => void
}

type ProjectActionButtonProps = {
  tone: 'neutral' | 'danger'
  label: string
  title: string
  icon: LucideIcon
  onClick: () => void
}

function ProjectActionButton({
  tone,
  label,
  title,
  icon: Icon,
  onClick,
}: ProjectActionButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={title}
      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border transition sm:h-10 sm:w-10 lg:h-11 lg:w-11 lg:rounded-xl ${getActionButtonClassName(
        tone,
      )}`}
    >
      <Icon size={15} className="lg:h-4.25 lg:w-4.25" />
    </button>
  )
}

export function ProjectsListSection({
  projects,
  onEdit,
  onRemove,
}: ProjectsListSectionProps) {
  const { t } = useTranslation()
  const currentLang = useLang()

  return (
    <section className="rounded-[28px] border border-slate-200 bg-white shadow-sm shadow-slate-100">
      <div className="border-b border-slate-200 px-5 py-5 sm:px-6">
        <h3 className="mt-1 text-xl font-semibold tracking-tight text-slate-950">
          {t('projects.list_title')}
        </h3>
        <p className="text-sm font-medium text-slate-500">
          {t('projects.count', { count: projects.length })}
        </p>
      </div>

      <div className="divide-y divide-slate-100 lg:hidden">
        {projects.length > 0 ? (
          projects.map((project) => (
            <article key={project.id} className="space-y-4 px-5 py-5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="text-lg font-semibold text-slate-900">
                    {project.name}
                  </p>
                  <p
                    className="mt-1 truncate text-sm text-slate-500"
                    title={project.description || t('common.no_description')}
                  >
                    {project.description || t('common.no_description')}
                  </p>
                </div>

                <span
                  className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${projectStatusClassName[project.status]}`}
                >
                  {t(projectStatusLabel[project.status])}
                </span>
              </div>

              <div className="grid gap-2 text-sm text-slate-600 sm:grid-cols-2">
                <p>
                  <span className="font-medium text-slate-900">{t('projects.card_client')}</span>{' '}
                  {project.clientName}
                </p>
                <p>
                  <span className="font-medium text-slate-900">{t('projects.card_company')}</span>{' '}
                  {project.clientCompany || t('common.none')}
                </p>
                <p>
                  <span className="font-medium text-slate-900">{t('projects.card_value')}</span>{' '}
                  {formatCurrencyCode(project.value, project.currency)}
                </p>
                <p>
                  <span className="font-medium text-slate-900">{t('projects.card_deadline')}</span>{' '}
                  {formatDate(project.deadline, currentLang)}
                </p>
              </div>

              <div className="inline-flex max-w-full flex-nowrap items-center gap-2">
                <ProjectActionButton
                  tone="neutral"
                  label={t('projects.edit_aria', { name: project.name })}
                  title={t('projects.edit_title')}
                  icon={PencilLine}
                  onClick={() => onEdit(project)}
                />

                <ProjectActionButton
                  tone="danger"
                  label={t('projects.delete_aria', { name: project.name })}
                  title={t('projects.delete_title')}
                  icon={Trash2}
                  onClick={() => onRemove(project)}
                />
              </div>
            </article>
          ))
        ) : (
          <div className="px-5 py-10 text-center text-sm text-slate-500">
            {t('projects.no_results')}
          </div>
        )}
      </div>

      <div className="hidden overflow-x-auto lg:block">
        <table className="min-w-full border-collapse">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/80">
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                {t('projects.table_project')}
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                {t('projects.table_client')}
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                {t('projects.table_value')}
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                {t('projects.table_deadline')}
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                {t('projects.table_status')}
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                {t('projects.table_actions')}
              </th>
            </tr>
          </thead>

          <tbody>
            {projects.map((project) => (
              <tr
                key={project.id}
                className="border-b border-slate-100 transition hover:bg-slate-50/70"
              >
                <td className="px-6 py-4">
                  <div>
                    <p className="font-semibold text-slate-900">
                      {project.name}
                    </p>
                    <p
                      className="max-w-88 truncate text-xs text-slate-500"
                      title={project.description || t('common.no_description')}
                    >
                      {project.description || t('common.no_description')}
                    </p>
                  </div>
                </td>

                <td className="px-6 py-4 text-sm text-slate-700">
                  <div>
                    <p>{project.clientName}</p>
                    <p className="text-xs text-slate-500">
                      {project.clientCompany || t('common.none')}
                    </p>
                  </div>
                </td>

                <td className="px-6 py-4 text-sm text-slate-700">
                  {formatCurrencyCode(project.value, project.currency)}
                </td>

                <td className="px-6 py-4 text-sm text-slate-700">
                  {formatDate(project.deadline, currentLang)}
                </td>

                <td className="px-6 py-4">
                  <span
                    className={`inline-flex w-fit rounded-full px-3 py-1 text-xs font-semibold ${projectStatusClassName[project.status]}`}
                  >
                    {t(projectStatusLabel[project.status])}
                  </span>
                </td>

                <td className="px-6 py-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <ProjectActionButton
                      tone="neutral"
                      label={t('projects.edit_aria', { name: project.name })}
                      title={t('projects.edit_title')}
                      icon={PencilLine}
                      onClick={() => onEdit(project)}
                    />

                    <ProjectActionButton
                      tone="danger"
                      label={t('projects.delete_aria', { name: project.name })}
                      title={t('projects.delete_title')}
                      icon={Trash2}
                      onClick={() => onRemove(project)}
                    />
                  </div>
                </td>
              </tr>
            ))}

            {projects.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-6 py-10 text-center text-sm text-slate-500"
                >
                  {t('projects.no_results')}
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </section>
  )
}
