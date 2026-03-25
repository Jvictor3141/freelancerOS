const MAX_EMAIL_LENGTH = 254

// O mailto abaixo aceita um destinatario simples; por isso bloqueamos separadores
// de query, fragmento e lista para impedir que o campo vire uma URI composta.
const SAFE_SINGLE_EMAIL_REGEX =
  /^[A-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[A-Z0-9-]+(?:\.[A-Z0-9-]+)+$/i

export function normalizeEmailAddress(value: string) {
  return value.trim()
}

function hasControlCharacters(value: string) {
  return Array.from(value).some((character) => {
    const charCode = character.charCodeAt(0)
    return charCode < 32 || charCode === 127
  })
}

export function isValidEmailAddress(value: string) {
  const normalizedValue = normalizeEmailAddress(value)

  if (!normalizedValue || normalizedValue.length > MAX_EMAIL_LENGTH) {
    return false
  }

  if (hasControlCharacters(normalizedValue)) {
    return false
  }

  if (
    normalizedValue.includes('?') ||
    normalizedValue.includes('#') ||
    normalizedValue.includes(',')
  ) {
    return false
  }

  return SAFE_SINGLE_EMAIL_REGEX.test(normalizedValue)
}

export function assertValidEmailAddress(
  value: string,
  errorMessage = 'Informe um e-mail valido.',
) {
  const normalizedValue = normalizeEmailAddress(value)

  if (!isValidEmailAddress(normalizedValue)) {
    throw new Error(errorMessage)
  }

  return normalizedValue
}
