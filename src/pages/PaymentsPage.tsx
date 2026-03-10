import { DataTable } from '../components/DataTable';
import { StatusBadge } from '../components/StatusBadge';
import { payments } from '../data/mockData';

export function PaymentsPage() {
  return (
    <div className="space-y-6">
      <article className="rounded-3xl border border-rose-200 bg-rose-50 p-5 text-rose-900 shadow-sm shadow-rose-100">
        <p className="text-sm font-semibold uppercase tracking-[0.18em]">Atenção</p>
        <h3 className="mt-2 text-xl font-semibold">Você tem 1 pagamento atrasado</h3>
        <p className="mt-2 text-sm leading-6 text-rose-800">
          Se você não resolver isso cedo, sua previsão de caixa fica bonita no layout e mentirosa na prática.
        </p>
      </article>

      <DataTable
        title="Pagamentos"
        description="Controle financeiro por cliente e projeto"
        data={payments}
        columns={[
          { header: 'Cliente', render: (payment) => payment.client },
          { header: 'Projeto', render: (payment) => payment.project },
          { header: 'Valor', render: (payment) => payment.amount },
          { header: 'Data', render: (payment) => payment.date },
          { header: 'Status', render: (payment) => <StatusBadge status={payment.status} /> },
        ]}
      />
    </div>
  );
}
