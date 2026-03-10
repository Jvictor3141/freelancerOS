import { DataTable } from '../components/DataTable';
import { StatusBadge } from '../components/StatusBadge';
import { clients } from '../data/mockData';

export function ClientsPage() {
  return (
    <DataTable
      title="Clientes"
      description="Relação completa de clientes ativos"
      data={clients}
      columns={[
        {
          header: 'Cliente',
          render: (client) => (
            <div>
              <p className="font-semibold text-slate-900">{client.name}</p>
              <p className="text-xs text-slate-500">{client.company}</p>
            </div>
          ),
        },
        { header: 'Projetos ativos', render: (client) => client.activeProjects },
        { header: 'Total faturado', render: (client) => client.totalBilled },
        { header: 'Último pagamento', render: (client) => client.lastPayment },
        { header: 'Status', render: (client) => <StatusBadge status={client.status} /> },
      ]}
    />
  );
}
