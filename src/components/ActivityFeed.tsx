import { activities } from '../data/mockData';

export function ActivityFeed() {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-100">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">Atividade recente</p>
          <h3 className="mt-1 text-xl font-semibold tracking-tight text-slate-950">Tudo que aconteceu hoje</h3>
        </div>
        <button className="text-sm font-semibold text-[#635bff]">Ver tudo</button>
      </div>

      <div className="space-y-4">
        {activities.map((activity) => (
          <article key={activity.id} className="rounded-2xl border border-slate-200 p-4 transition hover:border-slate-300 hover:bg-slate-50">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h4 className="text-sm font-semibold text-slate-900">{activity.title}</h4>
                <p className="mt-1 text-sm leading-6 text-slate-600">{activity.description}</p>
              </div>
              <span className="whitespace-nowrap text-xs font-medium text-slate-400">{activity.time}</span>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
