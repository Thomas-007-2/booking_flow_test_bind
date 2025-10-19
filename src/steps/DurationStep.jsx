import React from 'react'
    import { useBooking } from '../context/BookingContext'
    import { withinHours, addDuration, canEndWithinHours, formatTime, formatTimeOfDayStr } from '../lib/time'

    export default function DurationStep() {
      const { state, dispatch, prev, next, durations, location } = useBooking()
      const now = React.useMemo(() => new Date(), [])

      function choose(id) {
        dispatch({ type: 'SET_DURATION', payload: id })
        if (state.timing === 'immediate') {
          const duration = durations.find(d => d.id === id)
          if (duration) {
            const start = now
            const end = addDuration(start, duration)
            dispatch({ type: 'SET_START_TIME', payload: start })
            dispatch({ type: 'SET_END_TIME', payload: end })
          }
        }
      }

      const closedNow = state.timing === 'immediate' && location && !withinHours(location, now)

      function isDisabledForImmediate(d) {
        if (state.timing !== 'immediate' || !location) return false
        const start = now
        const end = addDuration(start, d)
        return !(withinHours(location, start) && canEndWithinHours(location, start, end))
      }

      const canContinue = !!state.durationId

      return (
        <div className="space-y-3 md:space-y-4">
          <h2 className="text-lg md:text-xl font-semibold">Select rental duration</h2>

          {state.timing === 'immediate' && location && (
            <div
              className={closedNow
                ? 'p-3 rounded-md border border-red-300 bg-red-50 text-red-700'
                : 'p-3 rounded-md border border-slate-200 bg-slate-50 text-slate-700'}
              role={closedNow ? 'alert' : undefined}
            >
              {closedNow ? (
                <>
                  We’re currently closed. Opening hours: {formatTimeOfDayStr(location.open_time)}–{formatTimeOfDayStr(location.close_time)}. Please pick a reservation instead or come back during opening hours.
                </>
              ) : (
                <>
                  Start time: <span className="font-medium">{formatTime(now)}</span>. Durations that would end outside opening hours ({formatTimeOfDayStr(location.open_time)}–{formatTimeOfDayStr(location.close_time)}) are disabled.
                </>
              )}
            </div>
          )}

          <div className="grid grid-cols-3 md:grid-cols-4 gap-2 md:gap-3">
            {durations.map(d => {
              const disabled = isDisabledForImmediate(d)
              const isSelected = state.durationId === d.id
              return (
                <button
                  key={d.id}
                  onClick={() => !disabled && choose(d.id)}
                  disabled={disabled}
                  className={[
                    'card p-2 md:p-3 text-left border-2 transition-colors',
                    isSelected ? 'border-brand' : 'border-transparent hover:border-slate-300',
                    disabled ? 'opacity-50 cursor-not-allowed' : ''
                  ].join(' ')}
                  title={disabled ? "Return time must be within store opening hours." : d.label}
                >
                  <div className="font-medium text-xs md:text-base">{d.label}</div>
                </button>
              )
            })}
          </div>
          <div className="flex justify-between">
            <button className="btn btn-outline" onClick={prev}>Back</button>
            <button className="btn btn-primary" disabled={!canContinue} onClick={next}>Continue</button>
          </div>
        </div>
      )
    }