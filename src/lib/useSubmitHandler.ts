import { useState } from 'react'
import { getErrorMessage } from './supabase'
import { useAlert } from './useAlert'

type SubmitConfig<TInput, TSelected extends { id: string }> = {
  selected: TSelected | null
  add: (values: TInput) => Promise<void>
  edit: (id: string, values: TInput) => Promise<void>
  onSuccess: () => void
  createdMessage: string
  updatedMessage: string
  errorMessage: string
}

export function useSubmitHandler<TInput, TSelected extends { id: string }>(
  config: SubmitConfig<TInput, TSelected>,
) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { alert } = useAlert()

  async function handleSubmit(values: TInput) {
    const isEditing = Boolean(config.selected)
    setIsSubmitting(true)
    try {
      if (config.selected) {
        await config.edit(config.selected.id, values)
      } else {
        await config.add(values)
      }
      config.onSuccess()
      alert(isEditing ? config.updatedMessage : config.createdMessage)
    } catch (error) {
      alert(getErrorMessage(error, config.errorMessage))
    } finally {
      setIsSubmitting(false)
    }
  }

  return { isSubmitting, handleSubmit }
}
