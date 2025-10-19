function pad(n) {
  return String(n).padStart(2, '0')
}

function toICSDate(dt) {
  const z = new Date(dt)
  const yyyy = z.getUTCFullYear()
  const mm = pad(z.getUTCMonth() + 1)
  const dd = pad(z.getUTCDate())
  const hh = pad(z.getUTCHours())
  const mi = pad(z.getUTCMinutes())
  const ss = pad(z.getUTCSeconds())
  return `${yyyy}${mm}${dd}T${hh}${mi}${ss}Z`
}

export function buildICS({ title, description, location, start, end }) {
  const uid = `uid-${Date.now()}@bike-rental`
  const dtstamp = toICSDate(new Date())
  const dtstart = toICSDate(start)
  const dtend = toICSDate(end)
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Bike Rental//EN',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${dtstamp}`,
    `DTSTART:${dtstart}`,
    `DTEND:${dtend}`,
    `SUMMARY:${escapeICS(title)}`,
    `DESCRIPTION:${escapeICS(description)}`,
    `LOCATION:${escapeICS(location)}`,
    'END:VEVENT',
    'END:VCALENDAR'
  ]
  return lines.join('\r\n')
}

function escapeICS(s) {
  return String(s).replace(/\\n/g, '\\n').replace(/,/g, '\\,').replace(/;/g, '\\;')
}

export function downloadICS(filename, icsContent) {
  const blob = new Blob([icsContent], { type: 'text/calendar' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  URL.revokeObjectURL(url)
  document.body.removeChild(a)
}