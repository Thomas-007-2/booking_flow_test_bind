const DURATIONS = [
  { id: '4h', label: '4 hours', hours: 4 },
  { id: '6h', label: '6 hours', hours: 6 },
  { id: '1d', label: '1 day', days: 1 },
  { id: '2d', label: '2 days', days: 2 },
  { id: '3d', label: '3 days', days: 3 },
  { id: '4d', label: '4 days', days: 4 },
  { id: '5d', label: '5 days', days: 5 },
  { id: '6d', label: '6 days', days: 6 },
  { id: '1w', label: '1 week', days: 7 },
  { id: '8d', label: '8 days', days: 8 },
  { id: '9d', label: '9 days', days: 9 },
  { id: '10d', label: '10 days', days: 10 },
  { id: '2w', label: '2 weeks', days: 14 }
]

export default DURATIONS

export function toHours(durationId) {
  const d = DURATIONS.find(x => x.id === durationId)
  if (!d) return 0
  if (d.hours) return d.hours
  if (d.days) return d.days * 24
  return 0
}