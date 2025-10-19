import React from 'react'
import { addMonths, eachDayOfInterval, endOfMonth, format, getDay, isBefore, isSameDay, startOfMonth, startOfToday } from 'date-fns'

export default function Calendar({
  value,
  onChange,
  minDate = startOfToday(),
  view,
  onViewChange,
  statusByDate = {}
}) {
  const isControlled = typeof view !== 'undefined'
  const [internalView, setInternalView] = React.useState(startOfMonth(value || minDate))
  const currentView = isControlled ? startOfMonth(view) : internalView

  const days = daysInMonth(currentView)

  function prev() {
    const nextView = addMonths(currentView, -1)
    if (onViewChange) onViewChange(nextView)
    if (!isControlled) setInternalView(nextView)
  }
  function next() {
    const nextView = addMonths(currentView, 1)
    if (onViewChange) onViewChange(nextView)
    if (!isControlled) setInternalView(nextView)
  }

  return (
    <div className="card p-3 md:p-5">
      <div className="flex items-center justify-between mb-2 md:mb-4">
        <button className="btn btn-outline px-2 py-1 text-xs md:px-3 md:py-1 md:text-sm" onClick={prev}>&larr;</button>
        <div className="font-semibold text-sm md:text-base">{format(currentView, 'MMMM yyyy')}</div>
        <button className="btn btn-outline px-2 py-1 text-xs md:px-3 md:py-1 md:text-sm" onClick={next}>&rarr;</button>
      </div>
      <div className="grid grid-cols-7 gap-1 md:gap-2 lg:gap-3 text-[11px] md:text-sm text-slate-500 mb-1 md:mb-3">
        {['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map(d => <div key={d} className="text-center py-0.5 md:py-2">{d}</div>)}
      </div>
      <div className="grid grid-cols-7 gap-1 md:gap-2 lg:gap-3">
        {padLeadingBlanks(currentView).map((_, idx) => <div key={'b'+idx} />)}
        {days.map(d => {
          const disabled = isBefore(d, startOfToday())
          const selected = value && isSameDay(value, d)
          const key = format(d, 'yyyy-MM-dd')
          const status = statusByDate[key] // 'avail' | 'none' | undefined

          let cls = 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
          if (disabled) {
            cls = 'bg-slate-100 text-slate-400 border-slate-200'
          } else if (selected) {
            cls = 'bg-brand text-white border-brand'
          } else if (status === 'avail') {
            cls = 'bg-green-50 border-green-300 text-green-700 hover:bg-green-100'
          } else if (status === 'none') {
            cls = 'bg-red-50 border-red-300 text-red-700 hover:bg-red-100'
          }

          return (
            <button
              key={d.toISOString()}
              disabled={disabled}
              onClick={() => onChange(d)}
              className={['flex items-center justify-center h-8 md:h-12 lg:h-14 rounded-md border text-xs md:text-base lg:text-lg transition-colors', cls].join(' ')}
            >
              {format(d, 'd')}
            </button>
          )
        })}
      </div>
    </div>
  )
}

function daysInMonth(date) {
  return eachDayOfInterval({ start: startOfMonth(date), end: endOfMonth(date) })
}

function padLeadingBlanks(date) {
  // Monday-first grid
  const weekday = (getDay(startOfMonth(date)) + 6) % 7 // 0..6, Mon=0
  return new Array(weekday).fill(null)
}