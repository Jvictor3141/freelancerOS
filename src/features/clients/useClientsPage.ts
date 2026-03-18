import { useEffect, useState } from 'react'
import { useFeedback } from '../../components/FeedbackProvider'
import type { ClientInput } from '../../types/inputs'
import { getToastToneForMessage } from '../../lib/feedback'
import { getErrorMessage } from '../../lib/supabase'
import { useClientStore } from '../../stores/useClientStore'
import type { Client } from '../../types/client'
import { getFilteredClients } from '../../utils/clientsPage'

export function useClientsPage() {
  const clients = useClientStore((state) => state.clients)
  const selectedClient = useClientStore((state) => state.selectedClient)
  const loading = useClientStore((state) => state.loading)
  const error = useClientStore((state) => state.error)
  const initialized = useClientStore((state) => state.initialized)
  const ensureClientsLoaded = useClientStore(
    (state) => state.ensureClientsLoaded,
  )
  const selectClient = useClientStore((state) => state.selectClient)
  const addClient = useClientStore((state) => state.addClient)
  const editClient = useClientStore((state) => state.editClient)
  const removeClient = useClientStore((state) => state.removeClient)

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [search, setSearch] = useState('')
  const { confirm, notify } = useFeedback()

  function alert(message: string) {
    notify({
      tone: getToastToneForMessage(message),
      title: message,
    })
  }

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

  async function handleClientSubmit(values: ClientInput) {
    setIsSubmitting(true)

    try {
      const isEditing = Boolean(selectedClient)

      if (selectedClient) {
        await editClient(selectedClient.id, values)
      } else {
        await addClient(values)
      }

      closeModal()
      notify({
        tone: 'success',
        title: isEditing
          ? 'Cliente atualizado com sucesso.'
          : 'Cliente criado com sucesso.',
      })
    } catch (submitError) {
      alert(getErrorMessage(submitError, 'Não foi possível salvar o cliente.'))
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleClientRemoval(client: Client) {
    const confirmed = await confirm({
      title: 'Excluir cliente?',
      description: `Deseja excluir o cliente "${client.name}"?`,
      confirmLabel: 'Excluir cliente',
      cancelLabel: 'Cancelar',
      tone: 'danger',
    })

    if (!confirmed) {
      return
    }

    try {
      await removeClient(client.id)
      notify({
        tone: 'success',
        title: 'Cliente excluido com sucesso.',
      })
    } catch (removeError) {
      alert(getErrorMessage(removeError, 'Não foi possível excluir o cliente.'))
    }
  }

  return {
    error,
    filteredClients: getFilteredClients(clients, search),
    isLoading: !initialized,
    isModalOpen,
    isSubmitting,
    loadingDescription: loading
      ? 'Buscando a base de clientes no Supabase.'
      : 'Preparando a sincronização inicial.',
    search,
    selectedClient,
    setSearch,
    closeModal,
    handleClientRemoval,
    handleClientSubmit,
    openCreateModal,
    openEditModal,
  }
}



