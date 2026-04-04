import { describe, expect, it } from 'vitest'
import type { Proposal } from '../../types/proposal'
import {
  countProposalsByStatus,
  getClientRespondedProposals,
  getOpenProposalValue,
  isProposalOpen,
  reconcileProposalSnapshot,
  sortProposalsByClientResponseDesc,
} from './proposalRules'

describe('proposal rules', () => {
  it('identifies open proposals from draft and sent statuses', () => {
    expect(isProposalOpen({ status: 'draft' })).toBe(true)
    expect(isProposalOpen({ status: 'sent' })).toBe(true)
    expect(isProposalOpen({ status: 'accepted' })).toBe(false)
    expect(isProposalOpen({ status: 'rejected' })).toBe(false)
  })

  it('reconciles accepted proposal snapshots without regressing project linkage', () => {
    const acceptedProposal: Pick<
      Proposal,
      | 'id'
      | 'status'
      | 'projectId'
      | 'acceptedAt'
      | 'rejectedAt'
      | 'clientRespondedAt'
    > = {
      id: 'proposal-1',
      status: 'accepted',
      projectId: 'project-1',
      acceptedAt: '2026-03-25T10:30:00.000Z',
      rejectedAt: null,
      clientRespondedAt: '2026-03-25T10:30:00.000Z',
    }

    const staleProposal: Pick<
      Proposal,
      | 'id'
      | 'status'
      | 'projectId'
      | 'acceptedAt'
      | 'rejectedAt'
      | 'clientRespondedAt'
    > = {
      id: 'proposal-1',
      status: 'sent',
      projectId: null,
      acceptedAt: null,
      rejectedAt: null,
      clientRespondedAt: null,
    }

    expect(reconcileProposalSnapshot(acceptedProposal, staleProposal)).toBe(
      acceptedProposal,
    )
  })

  it('returns only accepted or rejected proposals with shared link response', () => {
    const proposals: Array<
      Pick<Proposal, 'status' | 'clientRespondedAt' | 'clientResponseChannel'>
    > = [
      {
        status: 'accepted',
        clientRespondedAt: '2026-03-25T10:00:00.000Z',
        clientResponseChannel: 'shared_link',
      },
      {
        status: 'rejected',
        clientRespondedAt: '2026-03-24T08:00:00.000Z',
        clientResponseChannel: 'shared_link',
      },
      {
        status: 'draft',
        clientRespondedAt: '2026-03-23T08:00:00.000Z',
        clientResponseChannel: 'shared_link',
      },
    ]

    expect(getClientRespondedProposals(proposals)).toEqual([
      proposals[0],
      proposals[1],
    ])
  })

  it('sorts client responses by most recent timestamp', () => {
    const proposals = [
      { id: 'older', clientRespondedAt: '2026-03-24T10:00:00.000Z' },
      { id: 'newer', clientRespondedAt: '2026-03-25T10:00:00.000Z' },
      { id: 'missing', clientRespondedAt: null },
    ]

    expect(sortProposalsByClientResponseDesc(proposals).map((proposal) => proposal.id)).toEqual([
      'newer',
      'older',
      'missing',
    ])
  })

  it('counts proposals by status and sums open pipeline value', () => {
    const proposals: Array<Pick<Proposal, 'status' | 'amount'>> = [
      { status: 'draft', amount: 1000 },
      { status: 'sent', amount: 2000 },
      { status: 'accepted', amount: 3000 },
      { status: 'rejected', amount: 4000 },
    ]

    expect(countProposalsByStatus(proposals, 'draft')).toBe(1)
    expect(countProposalsByStatus(proposals, 'accepted')).toBe(1)
    expect(getOpenProposalValue(proposals)).toBe(3000)
  })
})
