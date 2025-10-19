import React from 'react'
import { useBooking } from '../context/BookingContext'
import { MapPin } from 'lucide-react'
import { formatTimeOfDayStr } from '../lib/time'

export default function LocationStep() {
  const { state, dispatch, next, locations } = useBooking()
  function select(id) {
    dispatch({ type: 'SET_LOCATION', payload: id })
  }
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Choose your rental location</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {locations.map(loc => (
          <button
            key={loc.id}
            onClick={() => select(loc.id)}
            className={[
              'card p-4 text-left border-2 transition-colors',
              state.locationId === loc.id ? 'border-brand' : 'border-transparent hover:border-slate-300'
            ].join(' ')}
          >
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-slate-100">
                <MapPin size={18} />
              </div>
              <div>
                <h3 className="font-semibold">{loc.name}</h3>
                <p className="text-sm text-slate-600">{loc.address}</p>
                <p className="text-xs text-slate-500 mt-1">
                  Open {formatTimeOfDayStr(loc.open_time)}–{formatTimeOfDayStr(loc.close_time)}
                </p>
              </div>
            </div>
          </button>
        ))}
      </div>
      <div className="flex justify-end">
        <button className="btn btn-primary" disabled={!state.locationId} onClick={next}>Continue</button>
      </div>
    </div>
  )
}