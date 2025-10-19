import React, { useMemo } from 'react'
import { useBooking } from '../context/BookingContext'
import { getLineItemPrice } from '../lib/pricing'
import { formatDateTime, formatTimeOfDayStr } from '../lib/time'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { formatEuro } from '../lib/money'
import { getTaxLabel, isTaxIncluded } from '../lib/tax'

export default function SummarySidebar() {
  const { state, totals, setStep, duration, location, products, priceIndex } = useBooking()

  const items = useMemo(() => {
    const out = []
    for (const [variantId, qty] of Object.entries(state.basket)) {
      if (qty > 0) {
        const product = products.find(p => p.product_variants.some(v => v.id === variantId))
        if (!product) continue
        const variant = product.product_variants.find(v => v.id === variantId)
        out.push({ variantId, title: product.title, size: variant.size, qty })
      }
    }
    return out
  }, [state.basket, products])

  const [isOpen, setIsOpen] = React.useState(false)
  const [isDesktop, setIsDesktop] = React.useState(false)

  React.useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)')
    const handler = (e) => setIsDesktop(e.matches)
    mq.addEventListener('change', handler)
    setIsDesktop(mq.matches)
    return () => mq.removeEventListener('change', handler)
  }, [])

  React.useEffect(() => {
    if (isDesktop) setIsOpen(true)
  }, [isDesktop])

  const taxIncluded = isTaxIncluded()
  const taxLabel = getTaxLabel()

  return (
    <aside className="card p-4 sticky top-4">
      <h3 className="text-lg font-semibold mb-3 hidden lg:block">Booking Summary</h3>
      <button
        className="lg:hidden w-full -mx-4 -mt-4 px-4 py-3 flex items-center justify-between hover:bg-slate-50 rounded-lg"
        onClick={() => setIsOpen(o => !o)}
        aria-expanded={isOpen}
        aria-controls="booking-summary-content"
      >
        <span className="text-base font-semibold">Booking Summary</span>
        <span className="flex items-center gap-2 text-sm text-slate-700">
          <span className="font-semibold">{formatEuro(totals.total)}</span>
          {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </span>
      </button>

      <div id="booking-summary-content" className={`${isDesktop || isOpen ? 'block' : 'hidden'} mt-3`}>
        <div className="space-y-3 text-sm">
          <Row label="Location" onEdit={() => setStep(0)}>
            {location ? location.name : <span className="text-slate-400">Select</span>}
          </Row>
          <Row label="Timing" onEdit={() => setStep(1)}>
            {state.timing ? (state.timing === 'immediate' ? 'Immediate Start' : 'Advance Reservation') : <span className="text-slate-400">Select</span>}
          </Row>
          <Row label="Duration" onEdit={() => setStep(2)}>
            {duration ? duration.label : <span className="text-slate-400">Select</span>}
          </Row>
          <Row label="Start" onEdit={() => setStep(state.timing === 'reservation' ? 4 : 2)}>
            {state.startDateTime ? formatDateTime(state.startDateTime) : <span className="text-slate-400">Pick time</span>}
          </Row>
          <Row label="End" onEdit={() => setStep(state.timing === 'reservation' ? 4 : 2)}>
            {state.endDateTime ? formatDateTime(state.endDateTime) : <span className="text-slate-400">—</span>}
          </Row>
          <div className="pt-2 border-t border-slate-200">
            <p className="font-medium">Items</p>
            {items.length === 0 ? (
              <p className="text-slate-400">No products selected</p>
            ) : (
              <ul className="divide-y divide-slate-200">
                {items.map(it => (
                  <li key={it.variantId} className="py-2 flex items-center justify-between">
                    <span className="text-slate-700">
                      {it.title} ({it.size}) × {it.qty}
                    </span>
                    <span className="font-medium">{formatEuro(lineTotal(it, duration?.id, products, priceIndex, location?.id))}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="pt-2 border-t border-slate-200 space-y-1">
            {taxIncluded ? (
              <>
                <div className="flex justify-between text-lg">
                  <span className="font-semibold">Total (incl. {taxLabel})</span>
                  <span className="font-semibold">{formatEuro(totals.total)}</span>
                </div>
                <div className="flex justify-between text-xs text-slate-500">
                  <span>of which {taxLabel}</span>
                  <span>{formatEuro(totals.tax)}</span>
                </div>
              </>
            ) : (
              <>
                <div className="flex justify-between">
                  <span className="text-slate-600">Subtotal</span>
                  <span className="font-medium">{formatEuro(totals.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">{taxLabel}</span>
                  <span className="font-medium">{formatEuro(totals.tax)}</span>
                </div>
                <div className="flex justify-between text-lg">
                  <span className="font-semibold">Total</span>
                  <span className="font-semibold">{formatEuro(totals.total)}</span>
                </div>
              </>
            )}
          </div>
          {location && <div className="pt-3 border-t border-slate-200 text-xs text-slate-500">
            Opening hours: {formatTimeOfDayStr(location.open_time)}–{formatTimeOfDayStr(location.close_time)}
          </div>}
        </div>
      </div>
    </aside>
  )
}

function Row({ label, children, onEdit }) {
  return (
    <div className="flex items-start justify-between gap-2">
      <div>
        <p className="text-slate-500">{label}</p>
        <p className="font-medium">{children}</p>
      </div>
      <button className="text-brand hover:underline text-xs" onClick={onEdit}>Change</button>
    </div>
  )
}

function lineTotal(it, durationId, products, priceIndex, locationId) {
  const unit = getLineItemPrice(it.variantId, products, durationId, priceIndex, locationId)
  return unit * it.qty
}