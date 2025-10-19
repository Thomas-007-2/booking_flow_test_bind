import { addDays, addHours, format, isAfter, isBefore, isSameDay, setHours, setMinutes, startOfDay } from 'date-fns'

export const MIN_SLOT_MINUTES = 30

export function parseHHMM(str) {
  if (!str) return { h: 0, m: 0 }
  const [h, m] = str.split(':').map(n => parseInt(n, 10))
  return { h, m }
}

export function combineDateAndTime(date, timeHHmm, timing) {
  const base = date ? new Date(date) : new Date()
  const d = startOfDay(base)
  const { h, m } = parseHHMM(timeHHmm || format(new Date(), 'HH:mm'))
  return setMinutes(setHours(d, h), m)
}

export function addDuration(start, duration) {
  if (!duration) return start
  let hours = 0
  if (duration.hours) hours += duration.hours
  if (duration.days) hours += duration.days * 24
  return addHours(start, hours)
}

export function withinHours(location, dt) {
  if (!location) return false
  const { h: oh, m: om } = parseHHMM(location.open_time)
  const { h: ch, m: cm } = parseHHMM(location.close_time)
  const open = setMinutes(setHours(startOfDay(dt), oh), om)
  const close = setMinutes(setHours(startOfDay(dt), ch), cm)
  return !isBefore(dt, open) && !isAfter(dt, close)
}

export function canEndWithinHours(location, start, end) {
  if (!withinHours(location, start)) return false
  if (!withinHours(location, end)) return false
  const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24))
  for (let i = 1; i < days; i++) {
    const mid = addDays(start, i)
    if (!withinHours(location, setMinutes(setHours(mid, start.getHours()), start.getMinutes()))) {
      return false
    }
  }
  return true
}

// Compute the last minute from midnight for which a rental can start on 'date' and still end within hours.
function lastValidStartMinuteForDate(date, location, duration) {
  if (!location || !duration) return 0
  let hours = 0
  if (duration.hours) hours += duration.hours
  if (duration.days) hours += duration.days * 24

  const { h: ch, m: cm } = parseHHMM(location.close_time)
  const dayClose = setMinutes(setHours(startOfDay(date), ch), cm)
  const latestStart = new Date(dayClose.getTime() - hours * 60 * 60 * 1000)
  return latestStart.getHours() * 60 + latestStart.getMinutes()
}

// Generate all possible start ticks within opening hours for a day.
// If minStartDateTime is provided and matches the same day, the list begins at the rounded-up minStart.
export function generateStartGrid(date, location, stepMinutes = MIN_SLOT_MINUTES, minStartDateTime = null) {
  if (!location) return []
  const { h: oh, m: om } = parseHHMM(location.open_time)
  const { h: ch, m: cm } = parseHHMM(location.close_time)
  const open = setMinutes(setHours(startOfDay(date), oh), om)
  const close = setMinutes(setHours(startOfDay(date), ch), cm)

  let t = new Date(open)
  if (minStartDateTime && isSameDay(minStartDateTime, date)) {
    const from = roundUpToStep(minStartDateTime, stepMinutes)
    t = isBefore(from, open) ? open : from
  }

  const slots = []
  const endOfDayMinutes = ch * 60 + cm

  while (true) {
    const minutes = t.getHours() * 60 + t.getMinutes()
    if (minutes > endOfDayMinutes || isAfter(t, close)) break
    slots.push(new Date(t))
    t = new Date(t.getTime() + stepMinutes * 60000)
  }
  return slots
}

// Generate only valid slots (start+end fit within hours) with optional minStart cut-off.
export function generateSlotsForDate(date, location, duration, stepMinutes = MIN_SLOT_MINUTES, minStartDateTime = null) {
  if (!location || !duration) return []
  const { h: oh, m: om } = parseHHMM(location.open_time)
  const { h: ch, m: cm } = parseHHMM(location.close_time)
  const open = setMinutes(setHours(startOfDay(date), oh), om)
  const close = setMinutes(setHours(startOfDay(date), ch), cm)

  const lastStartMin = lastValidStartMinuteForDate(date, location, duration)

  let t = new Date(open)
  if (minStartDateTime && isSameDay(minStartDateTime, date)) {
    const from = roundUpToStep(minStartDateTime, stepMinutes)
    t = isBefore(from, open) ? open : from
  }

  const slots = []
  const endOfDayMinutes = ch * 60 + cm

  while (true) {
    const minutesFromMidnight = t.getHours() * 60 + t.getMinutes()
    if (minutesFromMidnight > lastStartMin) break
    const start = new Date(t)
    const end = addDuration(start, duration)
    if (canEndWithinHours(location, start, end)) {
      slots.push({
        label: format(start, 'HH:mm'),
        start,
        end
      })
    }
    t = new Date(t.getTime() + stepMinutes * 60000)
    const minutes = t.getHours() * 60 + t.getMinutes()
    if (minutes > endOfDayMinutes || isAfter(t, close)) break
  }
  return slots
}

function roundUpToStep(dt, stepMinutes) {
  const t = new Date(dt)
  t.setSeconds(0, 0)
  const minutes = t.getMinutes()
  const remainder = minutes % stepMinutes
  if (remainder !== 0) {
    t.setMinutes(minutes + (stepMinutes - remainder))
  }
  return t
}

export function formatDate(dt) {
  if (!dt) return ''
  return format(dt, 'EEE, MMM d')
}
export function formatTime(dt) {
  if (!dt) return ''
  return format(dt, 'HH:mm')
}
export function formatDateTime(dt) {
  if (!dt) return ''
  return format(dt, 'EEE, MMM d, HH:mm')
}

// Converts 'HH:mm:ss' or 'HH:mm' to 'HH:mm'
export function formatTimeOfDayStr(s) {
  if (!s) return ''
  const parts = String(s).split(':')
  const hh = parts[0] ?? '00'
  const mm = parts[1] ?? '00'
  return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`
}