import { describe, expect, it } from 'vitest'
import {
  isProjectStatus,
  normalizeProjectStatus,
  projectEditableStatusOptions,
} from './projectStatus'

describe('project status utilities', () => {
  it('keeps the editable workflow aligned with persisted project statuses', () => {
    expect(projectEditableStatusOptions).toEqual([
      'in_progress',
      'review',
      'completed',
    ])
  })

  it('rejects legacy proposal status and normalizes invalid values', () => {
    expect(isProjectStatus('proposal')).toBe(false)
    expect(normalizeProjectStatus('proposal')).toBe('in_progress')
    expect(normalizeProjectStatus('review')).toBe('review')
  })
})
