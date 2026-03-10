import { DataTable } from "../components/DataTable";
import { StatusBadge } from "../components/StatusBadge";
import { projects } from "../data/mockData";

export function ProjectsPage() {
    return (
        <div className="space-y-6">
            <DataTable
                title="Projetos"
                description="Projetos em andamento e pipeline de trabalho"
                data={projects}
                columns={[
                    {
                        header: "Projeto",
                        render: (project) => (
                            <div>
                                <p className="font-semibold text-slate-900">
                                    {project.name}
                                </p>
                                <p className="text-xs text-slate-500">
                                    {project.client}
                                </p>
                            </div>
                        ),
                    },
                    { header: "Valor", render: (project) => project.value },
                    { header: "Prazo", render: (project) => project.deadline },
                    {
                        header: "Status",
                        render: (project) => (
                            <StatusBadge status={project.status} />
                        ),
                    },
                ]}
            />

            <section className="grid gap-4 xl:grid-cols-4">
                {(
                    [
                        "Proposta",
                        "Em andamento",
                        "Revisão",
                        "Finalizado",
                    ] as const
                ).map((status) => (
                    <article
                        key={status}
                        className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-100"
                    >
                        <div className="mb-4 flex items-center justify-between">
                            <h3 className="text-sm font-semibold text-slate-900">
                                {status}
                            </h3>
                            <StatusBadge status={status} />
                        </div>
                        <div className="space-y-3">
                            {projects
                                .filter((project) => project.status === status)
                                .map((project) => (
                                    <div
                                        key={project.id}
                                        className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                                    >
                                        <p className="font-semibold text-slate-900">
                                            {project.name}
                                        </p>
                                        <p className="mt-1 text-sm text-slate-500">
                                            {project.client}
                                        </p>
                                        <p className="mt-3 text-xs font-medium uppercase tracking-[0.15em] text-slate-400">
                                            Prazo {project.deadline}
                                        </p>
                                    </div>
                                ))}
                        </div>
                    </article>
                ))}
            </section>
        </div>
    );
}
