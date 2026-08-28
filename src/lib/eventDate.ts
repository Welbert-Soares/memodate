function sameDay(a: Date, b: Date): boolean {
  return (
    a.getUTCFullYear() === b.getUTCFullYear() &&
    a.getUTCMonth() === b.getUTCMonth() &&
    a.getUTCDate() === b.getUTCDate()
  )
}

export function isEventDateToday(
  event: { date: Date; recurring: boolean },
  today: Date,
): boolean {
  const d = new Date(event.date)
  const year = event.recurring ? today.getUTCFullYear() : d.getUTCFullYear()
  const occurrence = new Date(Date.UTC(year, d.getUTCMonth(), d.getUTCDate()))
  return sameDay(occurrence, today)
}
