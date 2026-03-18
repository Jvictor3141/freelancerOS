import { describe, expect, it } from 'vitest'
import {
  canAcceptProposal,
  canOpenProposalProject,
  getClientRespondedProposals,
  getOpenProposalValue,
  getProposalSendMode,
} from './proposalRules'

describe('proposal rules', () => {
  it('returns the right send mode for each proposal status', () => {
    expect(getProposalSendMode({ status: 'draft' })).toBe('send')
    expect(getProposalSendMode({ status: 'rejected' })).toBe('send')
    expect(getProposalSendMode({ status: 'sent' })).toBe('resend')
    expect(getProposalSendMode({ status: 'accepted' })).toBeNull()
  })

  it('keeps proposal actions aligned with commercial status', () => {
    expect(canAcceptProposal({ status: 'draft' })).toBe(true)
    expect(canAcceptProposal({ status: 'accepted' })).toBe(false)
    expect(canOpenProposalProject({ status: 'accepted' })).toBe(true)
    expect(canOpenProposalProject({ status: 'sent' })).toBe(false)
  })

  it('filters only shared-link client responses', () => {
    const proposals = [
      {
        id: '1',
        status: 'accepted' as const,
        clientRespondedAt: '2026-03-15T10:00:00.000Z',
        clientResponseChannel: 'shared_link' as const,
      },
      {
        id: '2',
        status: 'rejected' as const,
        clientRespondedAt: '2026-03-16T10:00:00.000Z',
        clientResponseChannel: 'shared_link' as const,
      },
      {
        id: '3',
        status: 'sent' as const,
        clientRespondedAt: '2026-03-16T10:00:00.000Z',
        clientResponseChannel: 'shared_link' as const,
      },
      {
        id: '4',
        status: 'accepted' as const,
        clientRespondedAt: '2026-03-16T10:00:00.000Z',
        clientResponseChannel: null,
      },
    ]

    expect(getClientRespondedProposals(proposals).map((proposal) => proposal.id)).toEqual([
      '1',
      '2',
    ])
  })

  it('sums only draft and sent proposals as open value', () => {
    const total = getOpenProposalValue([
      { status: 'draft', amount: 1000 },
      { status: 'sent', amount: 500 },
      { status: 'accepted', amount: 1200 },
      { status: 'rejected', amount: 100 },
    ])

    expect(total).toBe(1500)
  })
})
