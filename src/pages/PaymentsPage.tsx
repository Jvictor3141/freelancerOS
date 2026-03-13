import { useEffect, useMemo, useState } from 'react';
import { Modal } from '../components/Modal';
import { PaymentForm } from '../components/PaymentForm';
import { useProjectStore } from '../store/useProjectStore';
import { useClientStore } from '../store/useClientStore';
import { usePaymentStore } from '../store/usePaymentStore';
import {
  paymentStatusClassName,
  paymentStatusLabel,
} from '../utils/paymentStatus';

function formatCurrency(value: number) {
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

export function PaymentsPage() {
  const { projects, loadProjects } = useProjectStore();
  const { clients, loadClients } = useClientStore();
  const {
    payments,
    selectedPayment,
    loadPayments,
    selectPayment,
    addPayment,
    editPayment,
    removePayment,
    markAsPaid,
    markAsOverdueIfNeeded,
  } = usePaymentStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    loadClients();
    loadProjects();
    loadPayments();
  }, [loadClients, loadProjects, loadPayments]);

  useEffect(() => {
    markAsOverdueIfNeeded();
  }, [markAsOverdueIfNeeded]);

  const paymentsWithRelations = useMemo(() => {
    return payments.map((payment) => {
      const project = projects.find((item) => item.id === payment.projectId);
      const client = clients.find((item) => item.id === project?.clientId);

      return {
        ...payment,
        projectName: project?.name ?? 'Projeto não encontrado',
        clientName: client?.name ?? 'Cliente não encontrado',
      };
    });
  }, [payments, projects, clients]);

  const filteredPayments = useMemo(() => {
    if (statusFilter === 'all') return paymentsWithRelations;
    return paymentsWithRelations.filter((payment) => payment.status === statusFilter);
  }, [paymentsWithRelations, statusFilter]);

  function openCreateModal() {
    if (projects.length === 0) {
      alert('Cadastre pelo menos um projeto antes de criar um pagamento.');
      return;
    }

    selectPayment(null);
    setIsModalOpen(true);
  }

  function closeModal() {
    selectPayment(null);
    setIsModalOpen(false);
  }

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-100">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-slate-500">Financeiro</p>
            <h2 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">
              Controle de pagamentos
            </h2>
            <p className="mt-2 max-w-2xl text-sm text-slate-600">
              Aqui o sistema começa a resolver a dor mais séria do freelancer:
              saber quem pagou, quem não pagou e o que venceu.
            </p>
          </div>

          <button
            onClick={openCreateModal}
            className="rounded-2xl bg-[#635bff] px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-200 transition hover:-translate-y-0.5 hover:brightness-105"
          >
            Novo pagamento
          </button>
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-100">
        <div className="flex gap-3">
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[#635bff]"
          >
            <option value="all">Todos os status</option>
            <option value="pending">Pendentes</option>
            <option value="paid">Pagos</option>
            <option value="overdue">Atrasados</option>
          </select>
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white shadow-sm shadow-slate-100">
        <div className="border-b border-slate-200 px-6 py-5">
          <p className="text-sm font-medium text-slate-500">
            {filteredPayments.length} pagamento(s) encontrado(s)
          </p>
          <h3 className="mt-1 text-xl font-semibold tracking-tight text-slate-950">
            Lista de pagamentos
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80">
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Cliente
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Projeto
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Valor
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Vencimento
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
              {filteredPayments.map((payment) => (
                <tr key={payment.id} className="border-b border-slate-100 transition hover:bg-slate-50/70">
                  <td className="px-6 py-4 text-sm text-slate-700">
                    {payment.clientName}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-700">
                    {payment.projectName}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-700">
                    {formatCurrency(payment.amount)}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-700">
                    {new Date(payment.dueDate).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${paymentStatusClassName[payment.status]}`}>
                      {paymentStatusLabel[payment.status]}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      {payment.status !== 'paid' ? (
                        <button
                          onClick={() => markAsPaid(payment.id)}
                          className="rounded-xl border border-emerald-200 px-3 py-2 text-sm font-medium text-emerald-700 transition hover:bg-emerald-50"
                        >
                          Marcar como pago
                        </button>
                      ) : null}

                      <button
                        onClick={() => {
                          selectPayment(payment);
                          setIsModalOpen(true);
                        }}
                        className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                      >
                        Editar
                      </button>

                      <button
                        onClick={() => {
                          const confirmed = window.confirm('Deseja excluir este pagamento?');
                          if (!confirmed) return;
                          removePayment(payment.id);
                        }}
                        className="rounded-xl border border-rose-200 px-3 py-2 text-sm font-medium text-rose-700 transition hover:bg-rose-50"
                      >
                        Excluir
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-sm text-slate-500">
                    Nenhum pagamento encontrado.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>

      <Modal
        title={selectedPayment ? 'Editar pagamento' : 'Novo pagamento'}
        description="Preencha os dados para registrar o pagamento."
        isOpen={isModalOpen}
        onClose={closeModal}
      >
        <PaymentForm
          projects={projects}
          initialValues={selectedPayment}
          onCancel={closeModal}
          onSubmit={(values) => {
            if (selectedPayment) {
              editPayment(selectedPayment.id, values);
            } else {
              addPayment(values);
            }

            closeModal();
          }}
        />
      </Modal>
    </div>
  );
}