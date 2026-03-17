export type FeedbackMessageTone = 'success' | 'error' | 'info' | 'warning';

export function getToastToneForMessage(message: string): FeedbackMessageTone {
  const normalizedMessage = message.trim().toLowerCase();

  if (
    normalizedMessage.includes('nao foi possivel') ||
    normalizedMessage.includes('não foi possível')
  ) {
    return 'error';
  }

  if (
    normalizedMessage.includes('com sucesso') ||
    normalizedMessage.startsWith('projeto gerado') ||
    normalizedMessage.includes('copiado') ||
    normalizedMessage.includes('marcado como') ||
    normalizedMessage.includes('marcada como') ||
    normalizedMessage.includes('reaberta')
  ) {
    return 'success';
  }

  if (
    normalizedMessage.startsWith('cadastre') ||
    normalizedMessage.startsWith('defina') ||
    normalizedMessage.startsWith('informe') ||
    normalizedMessage.startsWith('selecione')
  ) {
    return 'warning';
  }

  return 'info';
}
