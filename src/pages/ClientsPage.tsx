import { useNavigate } from 'react-router-dom';
import { useEffect, useMemo, useState } from "react";
import { ClientForm } from "../components/ClientForm";
import { Modal } from "../components/Modal";
import { useClientStore } from "../store/useClientStore";

// essa função é o componente ClientsPage, que é a página principal para gerenciar os clientes. Ele utiliza a loja de clientes (useClientStore) para acessar os dados dos clientes e as funções para manipular esses dados. O componente também gerencia o estado local para controlar a abertura do modal de criação/edição de clientes e o termo de busca para filtrar a lista de clientes. O useEffect é usado para carregar os clientes quando o componente é montado, e o useMemo é usado para calcular a lista filtrada de clientes com base no termo de busca. O componente renderiza uma interface de usuário que inclui um campo de busca, um botão para criar um novo cliente, uma tabela com a lista de clientes filtrados e um modal para criar ou editar clientes.
export function ClientsPage() {
  const {
    clients,
    selectedClient,
    loadClients,
    selectClient,
    addClient,
    editClient,
    removeClient,
  } = useClientStore();

  const navigate = useNavigate();

  // esses estados locais são usados para controlar a abertura do modal de criação/edição de clientes (isModalOpen) e o termo de busca para filtrar a lista de clientes (search). O estado isModalOpen é um booleano que indica se o modal está aberto ou fechado, e o estado search é uma string que armazena o termo de busca digitado pelo usuário. O useState é usado para inicializar esses estados com valores padrão (false para isModalOpen e string vazia para search) e fornecer funções para atualizar esses estados conforme o usuário interage com a interface.
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    loadClients();
  }, [loadClients]);

  // essa parte usa o hook useMemo para calcular a lista filtrada de clientes com base no termo de busca. O useMemo é usado para otimizar o desempenho, evitando cálculos desnecessários da lista filtrada a cada renderização, e só recalculando a lista quando os clientes ou o termo de busca mudarem. A função de filtragem converte o termo de busca para minúsculas e remove espaços em branco extras, e então filtra a lista de clientes verificando se o nome, empresa ou email do cliente incluem o termo de busca. Se o termo de busca estiver vazio, a função retorna a lista completa de clientes.
  const filteredClients = useMemo(() => {
    const term = search.trim().toLowerCase();

    if (!term) return clients;

    // essa parte filtra a lista de clientes com base no termo de busca. Ela percorre a lista de clientes e verifica se o nome, empresa ou email do cliente incluem o termo de busca (convertido para minúsculas). Se algum desses campos incluir o termo de busca, o cliente é incluído na lista filtrada. O resultado é uma nova lista de clientes que correspondem ao critério de busca, que é usada para renderizar a tabela de clientes na interface do usuário.
    return clients.filter((client) => {
      return (
        client.name.toLowerCase().includes(term) ||
        client.company.toLowerCase().includes(term) ||
        client.email.toLowerCase().includes(term)
      );
    });
  }, [clients, search]);

  // essas funções são responsáveis por abrir o modal de criação de cliente (openCreateModal), abrir o modal de edição de cliente (openEditModal) e fechar o modal (closeModal). A função openCreateModal é chamada quando o usuário clica no botão "Novo cliente" e define o cliente selecionado como null para indicar que um novo cliente está sendo criado, e então abre o modal. A função openEditModal é chamada quando o usuário clica no botão "Editar" para um cliente específico, encontra o cliente correspondente na lista de clientes usando o ID fornecido, define esse cliente como o cliente selecionado e abre o modal para edição. A função closeModal é chamada para fechar o modal, definindo o cliente selecionado como null e definindo isModalOpen como false.
  function openCreateModal() {
    selectClient(null);
    setIsModalOpen(true);
  }

  function openEditModal(clientId: string) {
    const client = clients.find((item) => item.id === clientId) ?? null;
    selectClient(client);
    setIsModalOpen(true);
  }

  function closeModal() {
    selectClient(null);
    setIsModalOpen(false);
  }

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-100">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">
              Base de clientes
            </p>
            <h2 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">
              Gerencie seus clientes de verdade
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
              Aqui começa a parte séria do produto. Sem cliente
              real cadastrado, o resto do sistema vira teatro.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar por nome, empresa ou email"
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[#635bff] sm:w-80"
            />

            <button
              onClick={openCreateModal}
              className="rounded-2xl bg-[#635bff] px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-200 transition hover:-translate-y-0.5 hover:brightness-105"
            >
              Novo cliente
            </button>
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white shadow-sm shadow-slate-100">
        <div className="border-b border-slate-200 px-6 py-5">
          <p className="text-sm font-medium text-slate-500">
            {filteredClients.length} cliente(s) encontrado(s)
          </p>
          <h3 className="mt-1 text-xl font-semibold tracking-tight text-slate-950">
            Lista de clientes
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
                  Empresa
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Email
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Telefone
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Ações
                </th>
              </tr>
            </thead>

            <tbody>
              {filteredClients.map((client) => (
                <tr
                  key={client.id}
                  className="border-b border-slate-100 transition hover:bg-slate-50/70"
                >
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-semibold text-slate-900">
                        {client.name}
                      </p>
                      <p className="text-xs text-slate-500">
                        Criado em{" "}
                        {new Date(
                          client.createdAt,
                        ).toLocaleDateString("pt-BR")}
                      </p>
                    </div>
                  </td>

                  <td className="px-6 py-4 text-sm text-slate-700">
                    {client.company || "—"}
                  </td>

                  <td className="px-6 py-4 text-sm text-slate-700">
                    {client.email}
                  </td>

                  <td className="px-6 py-4 text-sm text-slate-700">
                    {client.phone || "—"}
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() =>
                          openEditModal(client.id)
                        }
                        className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                      >
                        Editar
                      </button>

                      <button
                        onClick={() => navigate(`/clients/${client.id}`)}
                        className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                      >
                        Ver detalhes
                      </button>

                      <button
                        onClick={() => {
                          const confirmed =
                            window.confirm(
                              `Deseja excluir o cliente "${client.name}"?`,
                            );

                          if (!confirmed) return;

                          removeClient(client.id);
                        }}
                        className="rounded-xl border border-rose-200 px-3 py-2 text-sm font-medium text-rose-700 transition hover:bg-rose-50"
                      >
                        Excluir
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredClients.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-10 text-center text-sm text-slate-500"
                  >
                    Nenhum cliente encontrado.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>

      <Modal
        title={selectedClient ? "Editar cliente" : "Novo cliente"}
        description={
          selectedClient
            ? "Atualize as informações do cliente."
            : "Preencha os dados para cadastrar um novo cliente."
        }
        isOpen={isModalOpen}
        onClose={closeModal}
      >
        <ClientForm
          initialValues={selectedClient}
          onCancel={closeModal}
          onSubmit={(values) => {
            if (selectedClient) {
              editClient(selectedClient.id, values);
            } else {
              addClient(values);
            }

            closeModal();
          }}
        />
      </Modal>
    </div>
  );
}
