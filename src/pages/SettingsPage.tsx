export function SettingsPage() {
  return (
    <section className="grid gap-6 xl:grid-cols-2">
      <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-100">
        <p className="text-sm font-medium text-slate-500">Preferências visuais</p>
        <h3 className="mt-1 text-xl font-semibold tracking-tight text-slate-950">Ajustes rápidos</h3>
        <div className="mt-6 space-y-4">
          {['Tema claro', 'Compactar sidebar', 'Receber alertas de atraso', 'Resumo semanal por email'].map((item) => (
            <label key={item} className="flex items-center justify-between rounded-2xl border border-slate-200 px-4 py-4">
              <span className="text-sm font-medium text-slate-700">{item}</span>
              <span className="h-6 w-11 rounded-full bg-[#635bff] p-1">
                <span className="block h-4 w-4 translate-x-5 rounded-full bg-white" />
              </span>
            </label>
          ))}
        </div>
      </article>

      <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-100">
        <p className="text-sm font-medium text-slate-500">Próximos passos</p>
        <h3 className="mt-1 text-xl font-semibold tracking-tight text-slate-950">O que ainda falta neste MVP</h3>
        <ul className="mt-6 space-y-4 text-sm leading-6 text-slate-600">
          <li>• Estado global real para clientes, projetos e pagamentos.</li>
          <li>• Formulários funcionais em vez de mock estático.</li>
          <li>• Persistência com Supabase ou localStorage.</li>
          <li>• Autenticação, filtros e feedbacks de ação.</li>
          <li>• Melhor tratamento mobile, porque o layout ainda está muito mais forte no desktop.</li>
        </ul>
      </article>
    </section>
  );
}
