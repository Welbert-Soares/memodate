import { describe, expect, test } from 'vitest'
import { isEventDateToday } from './eventDate'

describe('isEventDateToday', () => {
  test('a non-recurring event whose date is today is today', () => {
    const today = new Date(Date.UTC(2026, 7, 27))
    const event = { date: new Date(Date.UTC(2026, 7, 27)), recurring: false }
    expect(isEventDateToday(event, today)).toBe(true)
  })

  test('a non-recurring event whose date is not today is not today', () => {
    const today = new Date(Date.UTC(2026, 7, 27))
    const event = { date: new Date(Date.UTC(2026, 7, 28)), recurring: false }
    expect(isEventDateToday(event, today)).toBe(false)
  })

  test('a recurring event is today when month and day match, regardless of the stored year', () => {
    const today = new Date(Date.UTC(2026, 7, 27))
    const event = { date: new Date(Date.UTC(1990, 7, 27)), recurring: true }
    expect(isEventDateToday(event, today)).toBe(true)
  })

  test('a recurring event is not today when month or day differs', () => {
    const today = new Date(Date.UTC(2026, 7, 27))
    const event = { date: new Date(Date.UTC(1990, 7, 28)), recurring: true }
    expect(isEventDateToday(event, today)).toBe(false)
  })
})
