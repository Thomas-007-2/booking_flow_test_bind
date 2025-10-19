import React from 'react'
import { useBooking } from '../context/BookingContext'
import { downloadICS, buildICS } from '../lib/calendar'
import { formatEuro } from '../lib/money'

export default function Confirmation() {
  const { state, setStep, location, formatDateTime, totals, duration } = useBooking()

  function addToCalendar() {
    const ics = buildICS({
      title: 'Bike Rental Pickup',
      description: `Booking ${state.bookingRef} at ${location.name}.`,
      location: location.name,
      start: state.startDateTime,
      end: state.endDateTime
    })
    downloadICS(`booking-${state.bookingRef}.ics`, ics)
  }

  return (
    <div className="space-y-4 card p-6">
      <div className="text-green-600 font-semibold text-xl">Booking Confirmed</div>
      <div className="text-slate-700">Reference: <span className="font-mono">{state.bookingRef || 'PENDING'}</span></div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <Info label="Location" value={location.name} />
        <Info label="Duration" value={duration.label} />
        <Info label="Start" value={formatDateTime(state.startDateTime)} />
        <Info label="End" value={formatDateTime(state.endDateTime)} />
        <Info label="Email" value={state.customer.email} />
        <Info label="Phone" value={state.customer.phone} />
        <Info label="Total Paid" value={formatEuro(totals.total)} />
      </div>
      <div className="flex gap-2">
        <button className="btn btn-outline" onClick={addToCalendar}>Add to Calendar</button>
        <button className="btn btn-primary" onClick={() => window.location.reload()}>Make another booking</button>
      </div>
    </div>
  )
}

function Info({ label, value }) {
  return (
    <div>
      <div className="text-xs text-slate-500">{label}</div>
      <div className="font-medium">{value}</div>
    </div>
  )
}