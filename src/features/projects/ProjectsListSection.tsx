import type { ProjectWithClient } from '../../types/viewModels'
import { formatCurrency, formatDate } from '../../utils/formatting'
import {
  projectStatusClassName,
  projectStatusLabel,
} from '../../utils/projectStatus'

type ProjectsListSectionProps = {
  projects: ProjectWithClient[]
  onEdit: (project: ProjectWithClient) => void
  onRemove: (project: ProjectWithClient) => void
}

export function ProjectsListSection({
  projects,
  onEdit,
  onRemove,
}: ProjectsListSectionProps) {
  return (
    <section className="rounded-[28px] border border-slate-200 bg-white shadow-sm shadow-slate-100">
      <div className="border-b border-slate-200 px-5 py-5 sm:px-6">
        <h3 className="mt-1 text-xl font-semibold tracking-tight text-slate-950">
          Lista de projetos
        </h3>
        <p className="text-sm font-medium text-slate-500">
          {projects.length} projeto(s) encontrado(s)
        </p>
      </div>

      <div className="divide-y divide-slate-100 lg:hidden">
        {projects.length > 0 ? (
          projects.map((project) => (
            <article key={project.id} className="space-y-4 px-5 py-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-lg font-semibold text-slate-900">
                    {project.name}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    {project.description || 'Sem descrição'}
                  </p>
                </div>

                <span
                  className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${projectStatusClassName[project.status]}`}
                >
                  {projectStatusLabel[project.status]}
                </span>
              </div>

              <div className="grid gap-2 text-sm text-slate-600 sm:grid-cols-2">
                <p>
                  <span className="font-medium text-slate-900">Cliente:</span>{' '}
                  {project.clientName}
                </p>
                <p>
                  <span className="font-medium text-slate-900">Empresa:</span>{' '}
                  {project.clientCompany || '-'}
                </p>
                <p>
                  <span className="font-medium text-slate-900">Valor:</span>{' '}
                  {formatCurrency(project.value)}
                </p>
                <p>
                  <span className="font-medium text-slate-900">Prazo:</span>{' '}
                  {formatDate(project.deadline)}
                </p>
              </div>

              <div className="flex flex-col gap-2 sm:flex-row">
                <button
                  type="button"
                  onClick={() => onEdit(project)}
                  className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                >
                  Editar
                </button>

                <button
                  type="button"
                  onClick={() => onRemove(project)}
                  className="rounded-xl border border-rose-200 px-3 py-2 text-sm font-medium text-rose-700 transition hover:bg-rose-50"
                >
                  Excluir
                </button>
              </div>
            </article>
          ))
        ) : (
          <div className="px-5 py-10 text-center text-sm text-slate-500">
            Nenhum projeto encontrado.
          </div>
        )}
      </div>

      <div className="hidden overflow-x-auto lg:block">
        <table className="min-w-full border-collapse">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/80">
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                Projeto
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                Cliente
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                Valor
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                Prazo
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                Status
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                Ações
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
                    <p className="text-xs text-slate-500">
                      {project.description || 'Sem descrição'}
                    </p>
                  </div>
                </td>

                <td className="px-6 py-4 text-sm text-slate-700">
                  <div>
                    <p>{project.clientName}</p>
                    <p className="text-xs text-slate-500">
                      {project.clientCompany || '-'}
                    </p>
                  </div>
                </td>

                <td className="px-6 py-4 text-sm text-slate-700">
                  {formatCurrency(project.value)}
                </td>

                <td className="px-6 py-4 text-sm text-slate-700">
                  {formatDate(project.deadline)}
                </td>

                <td className="px-6 py-4">
                  <span
                    className={`inline-flex w-fit rounded-full px-3 py-1 text-xs font-semibold ${projectStatusClassName[project.status]}`}
                  >
                    {projectStatusLabel[project.status]}
                  </span>
                </td>

                <td className="px-6 py-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onEdit(project)}
                      className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                    >
                      Editar
                    </button>

                    <button
                      type="button"
                      onClick={() => onRemove(project)}
                      className="rounded-xl border border-rose-200 px-3 py-2 text-sm font-medium text-rose-700 transition hover:bg-rose-50"
                    >
                      Excluir
                    </button>
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
                  Nenhum projeto encontrado.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </section>
  )
}
