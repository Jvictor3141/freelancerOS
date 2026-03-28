import { describe, expect, it } from 'vitest'
import {
  addDaysToDateInputValue,
  formatDateInputValue,
  parseCalendarDate,
} from './dateOnly'

describe('date-only utilities', () => {
  it('formats local dates without UTC drift', () => {
    expect(formatDateInputValue(new Date(2026, 2, 25, 23, 45, 0))).toBe(
      '2026-03-25',
    )
  })

  it('adds days using calendar semantics', () => {
    expect(addDaysToDateInputValue(1, new Date(2026, 2, 31, 18, 0, 0))).toBe(
      '2026-04-01',
    )
  })

  it('parses date-only strings as local calendar dates', () => {
    const parsedDate = parseCalendarDate('2026-03-25')

    expect(parsedDate).not.toBeNull()
    expect(parsedDate?.getFullYear()).toBe(2026)
    expect(parsedDate?.getMonth()).toBe(2)
    expect(parsedDate?.getDate()).toBe(25)
  })
})
