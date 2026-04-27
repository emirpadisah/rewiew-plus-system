export const ISTANBUL_TIME_ZONE = 'Europe/Istanbul'

function getTimeZoneParts(date: Date, timeZone: string) {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })

  const parts = formatter.formatToParts(date)

  return {
    year: Number(parts.find((part) => part.type === 'year')?.value),
    month: Number(parts.find((part) => part.type === 'month')?.value),
    day: Number(parts.find((part) => part.type === 'day')?.value),
  }
}

function getTimeZoneOffsetMinutes(date: Date, timeZone: string) {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone,
    timeZoneName: 'shortOffset',
  })
  const offsetText = formatter
    .formatToParts(date)
    .find((part) => part.type === 'timeZoneName')
    ?.value

  if (!offsetText || offsetText === 'GMT') {
    return 0
  }

  const match = offsetText.match(/^GMT([+-])(\d{1,2})(?::?(\d{2}))?$/)
  if (!match) {
    return 0
  }

  const sign = match[1] === '-' ? -1 : 1
  const hours = Number(match[2])
  const minutes = Number(match[3] || '0')

  return sign * (hours * 60 + minutes)
}

function getTimeZoneMidnightUtc(year: number, month: number, day: number, timeZone: string) {
  const approximateUtcMidnight = new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0))
  const offsetMinutes = getTimeZoneOffsetMinutes(approximateUtcMidnight, timeZone)

  return new Date(approximateUtcMidnight.getTime() - offsetMinutes * 60 * 1000)
}

export function getTimeZoneDateKey(
  date: Date,
  timeZone: string = ISTANBUL_TIME_ZONE
) {
  const { year, month, day } = getTimeZoneParts(date, timeZone)

  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

export function getTimeZoneDayRange(
  date: Date = new Date(),
  timeZone: string = ISTANBUL_TIME_ZONE
) {
  const { year, month, day } = getTimeZoneParts(date, timeZone)
  const start = getTimeZoneMidnightUtc(year, month, day, timeZone)

  const nextDay = new Date(Date.UTC(year, month - 1, day + 1, 0, 0, 0, 0))
  const endExclusive = getTimeZoneMidnightUtc(
    nextDay.getUTCFullYear(),
    nextDay.getUTCMonth() + 1,
    nextDay.getUTCDate(),
    timeZone
  )

  return {
    dateKey: `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
    start: start.toISOString(),
    endExclusive: endExclusive.toISOString(),
  }
}
