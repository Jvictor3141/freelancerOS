import type { Payment } from './payment'
import type { Proposal } from './proposal'
import type { Project } from './project'

export type PaymentWithProjectAndClient = Payment & {
  projectName: string
  clientName: string
}

export type ProjectWithClient = Project & {
  clientName: string
  clientCompany: string
}

export type ProposalWithClient = Proposal & {
  clientName: string
  clientCompany: string
}

export type ProjectsCommercialSummary = {
  openCount: number
  sentCount: number
  draftCount: number
  openPipelineValue: number
}

export type ProposalMetrics = {
  draftCount: number
  sentCount: number
  acceptedCount: number
  openPipelineValue: number
}
