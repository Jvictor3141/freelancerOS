import { describe, expect, it } from 'vitest'
import {
  assertValidEmailAddress,
  isValidEmailAddress,
  normalizeEmailAddress,
} from './email'
import { buildMailtoLink } from './proposalEmail'

describe('email utilities', () => {
  it('normalizes and validates a simple mailbox', () => {
    expect(normalizeEmailAddress('  cliente@empresa.com  ')).toBe(
      'cliente@empresa.com',
    )
    expect(isValidEmailAddress('cliente@empresa.com')).toBe(true)
  })

  it('blocks separators and control chars that can turn the field into a URI payload', () => {
    expect(isValidEmailAddress('cliente@empresa.com?bcc=evil@attacker.com')).toBe(
      false,
    )
    expect(isValidEmailAddress('cliente@empresa.com#fragment')).toBe(false)
    expect(isValidEmailAddress('cliente@empresa.com,\nsegundo@empresa.com')).toBe(
      false,
    )
  })

  it('rejects an unsafe recipient when generating a mailto link', () => {
    expect(() =>
      buildMailtoLink(
        'cliente@empresa.com?bcc=evil@attacker.com',
        'Assunto',
        'Corpo',
      ),
    ).toThrow('Defina um e-mail de destinatario valido antes de enviar a proposta.')
  })

  it('encodes subject and body without leaking raw line breaks into the URI', () => {
    expect(
      buildMailtoLink('cliente@empresa.com', 'Assunto & proposta', 'Linha 1\nLinha 2'),
    ).toBe(
      'mailto:cliente@empresa.com?subject=Assunto%20%26%20proposta&body=Linha%201%0D%0ALinha%202',
    )
  })

  it('throws with the default message when the mailbox is invalid', () => {
    expect(() => assertValidEmailAddress('invalido')).toThrow(
      'Informe um e-mail valido.',
    )
  })
})
