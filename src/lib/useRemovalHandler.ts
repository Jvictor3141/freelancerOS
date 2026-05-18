import { useTranslation } from 'react-i18next'
import { useFeedback } from '../components/FeedbackProvider'
import { getErrorMessage } from './errors'
import { useAlert } from './useAlert'

type RemovalConfig<T extends { id: string }> = {
  confirmLabel: string
  description: (item: T) => string
  remove: (id: string) => Promise<void>
  successMessage: string
  errorMessage: string
}

export function useRemovalHandler<T extends { id: string }>(
  config: RemovalConfig<T>,
): (item: T) => Promise<void> {
  const { t } = useTranslation()
  const { confirm } = useFeedback()
  const { alert } = useAlert()

  return async function (item: T): Promise<void> {
    const confirmed = await confirm({
      title: `${config.confirmLabel}?`,
      description: config.description(item),
      confirmLabel: config.confirmLabel,
      cancelLabel: t('common.cancel'),
      tone: 'danger',
    })

    if (!confirmed) return

    try {
      await config.remove(item.id)
      alert(config.successMessage)
    } catch (error) {
      alert(getErrorMessage(error, config.errorMessage))
    }
  }
}
