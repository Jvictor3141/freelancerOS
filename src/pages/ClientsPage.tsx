import { useNavigate } from 'react-router-dom'
import { ClientForm } from '../components/ClientForm'
import { ClientsListSection } from '../features/clients/ClientsListSection'
import { useClientsPage } from '../features/clients/useClientsPage'
import { Modal } from '../components/Modal'
import { PageBanner } from '../components/page/PageBanner'
import { PageLoadingState } from '../components/page/PageLoadingState'

export function ClientsPage() {
  const navigate = useNavigate()
  const {
    error,
    filteredClients,
    hasLoadError,
    isLoading,
    isModalOpen,
    isSubmitting,
    loadingDescription,
    search,
    selectedClient,
    setSearch,
    closeModal,
    handleClientRemoval,
    handleClientSubmit,
    handleRetryLoad,
    openCreateModal,
    openEditModal,
  } = useClientsPage()

  if (isLoading) {
    return (
      <PageLoadingState
        label="Clientes"
        description={loadingDescription}
      />
    )
  }

  return (
    <div className="page-stack space-y-6">
      {error ? (
        <PageBanner
          actionLabel={hasLoadError ? 'Tentar novamente' : undefined}
          onAction={
            hasLoadError
              ? () => {
                  void handleRetryLoad()
                }
              : undefined
          }
        >
          {error}
        </PageBanner>
      ) : null}

      <ClientsListSection
        clients={filteredClients}
        search={search}
        onSearchChange={setSearch}
        onCreate={openCreateModal}
        onEdit={openEditModal}
        onOpenDetails={(client) => navigate(`/clients/${client.id}`)}
        onRemove={(client) => {
          void handleClientRemoval(client)
        }}
      />

      <Modal
        title={selectedClient ? 'Editar cliente' : 'Novo cliente'}
        description={
          selectedClient
            ? 'Atualize as informações do cliente.'
            : 'Preencha os dados para cadastrar um novo cliente.'
        }
        isOpen={isModalOpen}
        onClose={closeModal}
      >
        <ClientForm
          initialValues={selectedClient}
          onCancel={closeModal}
          onSubmit={handleClientSubmit}
          isSubmitting={isSubmitting}
        />
      </Modal>
    </div>
  )
}
