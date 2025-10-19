import React from 'react'
import { useBooking } from '../context/BookingContext'
import { formatEuro } from '../lib/money'

export default function MobileContinueBar({ itemCount, onContinue, onBack }) {
  const { totals } = useBooking()
  const hasAny = itemCount > 0

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-3 flex items-center justify-between gap-4 z-10">
      <div>
        <div className="font-semibold">{itemCount} item{itemCount !== 1 ? 's' : ''} in basket</div>
        <div className="text-sm text-slate-600">Total: {formatEuro(totals.total)}</div>
      </div>
      <div className="flex gap-2">
        <button className="btn btn-outline" onClick={onBack}>Back</button>
        <button className="btn btn-primary" disabled={!hasAny} onClick={onContinue}>Continue</button>
      </div>
    </div>
  )
}