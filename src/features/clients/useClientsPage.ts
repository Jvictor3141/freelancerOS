import { useEffect, useState } from 'react'
import { useAlert } from '../../lib/useAlert'
import { useRemovalHandler } from '../../lib/useRemovalHandler'
import { useSubmitHandler } from '../../lib/useSubmitHandler'
import { useClientStore } from '../../stores/useClientStore'
import {
  hasResourceLoadError,
  isResourcePending,
} from '../../stores/resourceLoadState'
import type { Client } from '../../types/client'
import type { ClientInput } from '../../types/inputs'
import { getFilteredClients } from '../../utils/clientsPage'

export function useClientsPage() {
  const clients = useClientStore((state) => state.clients)
  const selectedClient = useClientStore((state) => state.selectedClient)
  const loadStatus = useClientStore((state) => state.loadStatus)
  const error = useClientStore((state) => state.error)
  const ensureClientsLoaded = useClientStore(
    (state) => state.ensureClientsLoaded,
  )
  const retryLoad = useClientStore((state) => state.retryLoad)
  const selectClient = useClientStore((state) => state.selectClient)
  const addClient = useClientStore((state) => state.addClient)
  const editClient = useClientStore((state) => state.editClient)
  const removeClient = useClientStore((state) => state.removeClient)

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [search, setSearch] = useState('')
  const { alert } = useAlert()
  const handleClientRemoval = useRemovalHandler<Client>({
    confirmLabel: 'Excluir cliente',
    description: (client) => `Deseja excluir o cliente "${client.name}"?`,
    remove: removeClient,
    successMessage: 'Cliente excluido com sucesso.',
    errorMessage: 'Não foi possível excluir o cliente.',
  })
  const { isSubmitting, handleSubmit: handleClientSubmit } = useSubmitHandler<ClientInput, Client>({
    selected: selectedClient,
    add: addClient,
    edit: editClient,
    onSuccess: closeModal,
    createdMessage: 'Cliente criado com sucesso.',
    updatedMessage: 'Cliente atualizado com sucesso.',
    errorMessage: 'Não foi possível salvar o cliente.',
  })

  useEffect(() => {
    void ensureClientsLoaded()
  }, [ensureClientsLoaded])

  function openCreateModal() {
    selectClient(null)
    setIsModalOpen(true)
  }

  function openEditModal(client: Client) {
    selectClient(client)
    setIsModalOpen(true)
  }

  function closeModal() {
    selectClient(null)
    setIsModalOpen(false)
  }

  async function handleRetryLoad() {
    await retryLoad()
  }

  return {
    error,
    filteredClients: getFilteredClients(clients, search),
    hasLoadError: hasResourceLoadError(loadStatus),
    isLoading: isResourcePending(loadStatus),
    isModalOpen,
    isSubmitting,
    loadingDescription:
      loadStatus === 'loading'
        ? 'Buscando a base de clientes no Supabase.'
        : 'Preparando a sincronização inicial.',
    search,
    selectedClient,
    setSearch,
    closeModal,
    handleClientRemoval,
    handleClientSubmit,
    handleRetryLoad,
    openCreateModal,
    openEditModal,
  }
}
