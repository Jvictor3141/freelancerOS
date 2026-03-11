export function ProposalsPage() {
  return (
    <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
      <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-100">
        <p className="text-sm font-medium text-slate-500">
          Gerador rápido
        </p>
        <h3 className="mt-1 text-xl font-semibold tracking-tight text-slate-950">
          Criar proposta
        </h3>

        <form className="mt-6 grid gap-4 sm:grid-cols-2">
          <label className="sm:col-span-2">
            <span className="mb-2 block text-sm font-medium text-slate-700">
              Cliente
            </span>
            <input
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-[#635bff]"
              placeholder="Ex.: Studio Bloom"
            />
          </label>

          <label>
            <span className="mb-2 block text-sm font-medium text-slate-700">
              Valor
            </span>
            <input
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-[#635bff]"
              placeholder="R$ 2.500"
            />
          </label>

          <label>
            <span className="mb-2 block text-sm font-medium text-slate-700">
              Prazo
            </span>
            <input
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-[#635bff]"
              placeholder="10 dias úteis"
            />
          </label>

          <label className="sm:col-span-2">
            <span className="mb-2 block text-sm font-medium text-slate-700">
              Escopo
            </span>
            <textarea
              className="min-h-36 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-[#635bff]"
              placeholder="Descreva o projeto, entregáveis e revisões..."
            />
          </label>

          <button
            type="button"
            className="sm:col-span-2 rounded-2xl bg-[#635bff] px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-200 transition hover:-translate-y-0.5 hover:brightness-105"
          >
            Gerar proposta
          </button>
        </form>
      </article>

      <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-100">
        <p className="text-sm font-medium text-slate-500">Preview</p>
        <h3 className="mt-1 text-xl font-semibold tracking-tight text-slate-950">
          Modelo gerado
        </h3>
        <div className="mt-6 rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-5">
          <p className="text-sm font-semibold text-slate-900">
            Proposta comercial
          </p>
          <p className="mt-4 text-sm leading-7 text-slate-600">
            Este documento apresenta o escopo do projeto,
            investimento, prazo estimado e condições de entrega. A
            ideia aqui é te poupar tempo e evitar aquele improviso
            feio no WhatsApp.
          </p>
          <ul className="mt-5 space-y-3 text-sm text-slate-600">
            <li>• Entrega 1: estrutura principal e wireframe</li>
            <li>• Entrega 2: interface final validada</li>
            <li>• Entrega 3: revisão e fechamento</li>
          </ul>
        </div>
      </article>
    </section>
  );
}
