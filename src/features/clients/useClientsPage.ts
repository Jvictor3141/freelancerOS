import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useRemovalHandler } from '../../lib/useRemovalHandler'
import { useSubmitHandler } from '../../lib/useSubmitHandler'
import { useClientStore } from '../../stores/useClientStore'
import {
  hasResourceLoadError,
  isResourcePending,
} from '../../stores/resourceLoadState'
import type { Client } from '../../types/client'
import { getFilteredClients } from '../../utils/clientsPage'

export function useClientsPage() {
  const { t } = useTranslation()
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
  const handleClientRemoval = useRemovalHandler<Client>({
    confirmLabel: t('clients.delete_confirm_label'),
    description: (client) => t('clients.delete_confirm_description', { name: client.name }),
    remove: removeClient,
    successMessage: t('clients.delete_success'),
    errorMessage: t('clients.delete_error'),
  })
  const { isSubmitting, handleSubmit: handleClientSubmit } = useSubmitHandler({
    selected: selectedClient,
    add: addClient,
    edit: editClient,
    onSuccess: closeModal,
    createdMessage: t('clients.save_created'),
    updatedMessage: t('clients.save_updated'),
    errorMessage: t('clients.save_error'),
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
        ? t('clients.loading_sync')
        : t('clients.loading_init'),
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
