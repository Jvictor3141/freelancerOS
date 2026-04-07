import { useFeedback } from '../components/FeedbackProvider'
import { getToastToneForMessage } from './feedback'

export function useAlert() {
  const { notify } = useFeedback()

  function alert(message: string) {
    notify({
      tone: getToastToneForMessage(message),
      title: message,
    })
  }

  return { alert }
}
