import { ActivityFeed } from "../components/ActivityFeed";
import { MetricCard } from "../components/MetricCard";
import { RevenueChart } from "../components/RevenueChart";
import { metrics } from "../data/mockData";

export function DashboardPage() {
    return (
        <div className="space-y-6">
            <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {metrics.map((metric) => (
                    <MetricCard key={metric.label} {...metric} />
                ))}
            </section>

            <section className="grid gap-6 xl:grid-cols-[1.55fr_1fr]">
                <RevenueChart />
                <ActivityFeed />
            </section>

            <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
                <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-100">
                    <p className="text-sm font-medium text-slate-500">
                        Quick actions
                    </p>
                    <h3 className="mt-1 text-xl font-semibold tracking-tight text-slate-950">
                        Ações mais usadas
                    </h3>
                    <div className="mt-6 grid gap-4 sm:grid-cols-2">
                        {[
                            "Novo cliente",
                            "Criar proposta",
                            "Registrar pagamento",
                            "Agendar follow-up",
                        ].map((label) => (
                            <button
                                key={label}
                                className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-5 text-left text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-white hover:shadow-sm"
                            >
                                {label}
                            </button>
                        ))}
                    </div>
                </article>

                <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-100">
                    <p className="text-sm font-medium text-slate-500">
                        Meta mensal
                    </p>
                    <h3 className="mt-1 text-xl font-semibold tracking-tight text-slate-950">
                        R$ 16.000
                    </h3>
                    <div className="mt-6 h-3 overflow-hidden rounded-full bg-slate-100">
                        <div className="h-full w-[78%] rounded-full bg-[#635bff]" />
                    </div>
                    <div className="mt-3 flex items-center justify-between text-sm text-slate-500">
                        <span>78% concluído</span>
                        <span>Faltam R$ 3.520</span>
                    </div>
                    <div className="mt-8 rounded-2xl bg-slate-50 p-4">
                        <p className="text-sm font-medium text-slate-700">
                            Risco principal
                        </p>
                        <p className="mt-2 text-sm leading-6 text-slate-600">
                            Você está bem em receita, mas ainda depende de
                            poucos clientes. Isso vira fragilidade se um atrasar
                            ou sair.
                        </p>
                    </div>
                </article>
            </section>
        </div>
    );
}
