import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Proposal } from '../types/proposal'

const { getProposalsMock } = vi.hoisted(() => ({
  getProposalsMock: vi.fn(),
}))

vi.mock('../services/proposalService', () => ({
  acceptProposal: vi.fn(),
  createProposal: vi.fn(),
  createProposalSecureShareLink: vi.fn(),
  deleteProposal: vi.fn(),
  getProposals: getProposalsMock,
  rejectProposal: vi.fn(),
  reopenProposal: vi.fn(),
  sendProposal: vi.fn(),
  updateProposal: vi.fn(),
}))

import { useProposalStore } from './useProposalStore'

function createProposal(overrides: Partial<Proposal> = {}): Proposal {
  return {
    id: 'proposal-1',
    clientId: 'client-1',
    projectId: null,
    title: 'Site institucional',
    description: 'Escopo comercial',
    amount: 2500,
    deliveryDays: 10,
    recipientEmail: 'contato@acme.com',
    status: 'sent',
    sentAt: '2026-03-25T09:00:00.000Z',
    acceptedAt: null,
    rejectedAt: null,
    clientRespondedAt: null,
    clientResponseChannel: null,
    notes: '',
    createdAt: '2026-03-20T10:00:00.000Z',
    ...overrides,
  }
}

function createDeferred<T>() {
  let resolve!: (value: T | PromiseLike<T>) => void
  let reject!: (reason?: unknown) => void

  const promise = new Promise<T>((innerResolve, innerReject) => {
    resolve = innerResolve
    reject = innerReject
  })

  return { promise, resolve, reject }
}

describe('proposal store', () => {
  beforeEach(() => {
    getProposalsMock.mockReset()
    useProposalStore.getState().resetStore()
  })

  it('re-runs a queued reconciliation after an in-flight proposal load', async () => {
    const staleProposal = createProposal()
    const acceptedProposal = createProposal({
      status: 'accepted',
      projectId: 'project-1',
      acceptedAt: '2026-03-25T10:30:00.000Z',
      clientRespondedAt: '2026-03-25T10:30:00.000Z',
      clientResponseChannel: 'shared_link',
    })

    const firstLoad = createDeferred<Proposal[]>()

    getProposalsMock
      .mockReturnValueOnce(firstLoad.promise)
      .mockResolvedValueOnce([acceptedProposal])

    const initialLoadPromise = useProposalStore.getState().loadProposals()

    useProposalStore.setState((state) => ({
      ...state,
      proposals: [acceptedProposal],
    }))

    const queuedReloadPromise = useProposalStore.getState().loadProposals()

    firstLoad.resolve([staleProposal])

    await Promise.all([initialLoadPromise, queuedReloadPromise])

    expect(getProposalsMock).toHaveBeenCalledTimes(2)
    expect(useProposalStore.getState().proposals).toEqual([acceptedProposal])
  })
})
