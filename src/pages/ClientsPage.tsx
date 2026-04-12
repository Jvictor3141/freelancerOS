import { useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ClientForm } from '../components/ClientForm'
import { ClientsListSection } from '../features/clients/ClientsListSection'
import { useClientsPage } from '../features/clients/useClientsPage'
import { Modal } from '../components/Modal'
import { PageBanner } from '../components/page/PageBanner'
import { PageLoadingState } from '../components/page/PageLoadingState'
import { isSupportedLanguage } from '../i18n/config'

export function ClientsPage() {
  const { t, i18n } = useTranslation()
  const { lang } = useParams<{ lang?: string }>()
  const currentLang = lang && isSupportedLanguage(lang) ? lang : (i18n.resolvedLanguage ?? 'pt')
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
        label={t('clients.loading_label')}
        description={loadingDescription}
      />
    )
  }

  return (
    <div className="page-stack space-y-6">
      {error ? (
        <PageBanner
          actionLabel={hasLoadError ? t('common.retry') : undefined}
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
        onOpenDetails={(client) => navigate(`/${currentLang}/clients/${client.id}`)}
        onRemove={(client) => {
          void handleClientRemoval(client)
        }}
      />

      <Modal
        title={selectedClient ? t('clients.modal_edit_title') : t('clients.modal_new_title')}
        description={
          selectedClient
            ? t('clients.modal_edit_description')
            : t('clients.modal_new_description')
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
