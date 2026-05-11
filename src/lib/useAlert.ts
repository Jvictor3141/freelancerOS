import { useFeedback } from '../components/FeedbackProvider'
import { getToastToneForMessage } from './feedback'

export function useAlert(): { alert: (message: string) => void } {
  const { notify } = useFeedback()

  function alert(message: string): void {
    notify({
      tone: getToastToneForMessage(message),
      title: message,
    })
  }

  return { alert }
}
