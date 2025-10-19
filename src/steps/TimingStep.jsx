import React from 'react'
import { useBooking } from '../context/BookingContext'

export default function TimingStep() {
  const { state, dispatch, prev, next } = useBooking()
  function choose(val) {
    dispatch({ type: 'SET_TIMING', payload: val })
  }
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">When would you like to start?</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Option
          title="Immediate Start"
          description="Start as soon as possible today (subject to availability and hours)."
          selected={state.timing === 'immediate'}
          onClick={() => choose('immediate')}
        />
        <Option
          title="Advance Reservation"
          description="Choose a future start date and time."
          selected={state.timing === 'reservation'}
          onClick={() => choose('reservation')}
        />
      </div>
      <div className="flex justify-between">
        <button className="btn btn-outline" onClick={prev}>Back</button>
        <button className="btn btn-primary" disabled={!state.timing} onClick={next}>Continue</button>
      </div>
    </div>
  )
}

function Option({ title, description, selected, onClick }) {
  return (
    <button onClick={onClick} className={['card p-4 text-left border-2 transition-colors', selected ? 'border-brand' : 'border-transparent hover:border-slate-300'].join(' ')}>
      <h3 className="font-semibold">{title}</h3>
      <p className="text-sm text-slate-600">{description}</p>
    </button>
  )
}