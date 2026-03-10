type StatusProps = {
  status: string;
};

const statusClasses: Record<string, string> = {
  Ativo: 'bg-emerald-50 text-emerald-700',
  Atenção: 'bg-amber-50 text-amber-700',
  Proposta: 'bg-sky-50 text-sky-700',
  'Em andamento': 'bg-indigo-50 text-indigo-700',
  Revisão: 'bg-violet-50 text-violet-700',
  Finalizado: 'bg-emerald-50 text-emerald-700',
  Pago: 'bg-emerald-50 text-emerald-700',
  Pendente: 'bg-amber-50 text-amber-700',
  Atrasado: 'bg-rose-50 text-rose-700',
};

export function StatusBadge({ status }: StatusProps) {
  return (
    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${statusClasses[status] ?? 'bg-slate-100 text-slate-700'}`}>
      {status}
    </span>
  );
}
