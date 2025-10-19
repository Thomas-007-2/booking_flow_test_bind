import React, { useMemo } from 'react'
    import { useBooking } from '../context/BookingContext'
    import { getLineItemPrice } from '../lib/pricing'
    import { formatDateTime, formatTimeOfDayStr } from '../lib/time'
    import { ChevronDown, ChevronUp, MapPin, Clock, Calendar, Bike } from 'lucide-react'
    import { formatEuro } from '../lib/money'
    import { getTaxLabel, isTaxIncluded } from '../lib/tax'

    export default function SummarySidebar() {
      const { state, totals, setStep, duration, location, products, priceIndex, merchant } = useBooking()
      
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

      const taxIncluded = isTaxIncluded(merchant)
      const taxLabel = getTaxLabel(merchant)

      return (
        <aside className="space-y-4">
          <div className="card p-6 glass sticky top-24">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <Bike size={16} className="text-blue-600" />
              </div>
              Booking Summary
            </h3>
            
            <div className={`${isDesktop || isOpen ? 'block' : 'hidden'} space-y-4`}>
              <button 
                className="lg:hidden w-full -mx-6 -mt-6 px-6 py-4 flex items-center justify-between hover:bg-slate-50 rounded-t-2xl transition-colors" 
                onClick={() => setIsOpen(o => !o)} 
                aria-expanded={isOpen} 
                aria-controls="booking-summary-content"
              >
                <span className="text-base font-semibold">Booking Summary</span>
                <span className="flex items-center gap-2 text-sm text-slate-700">
                  <span className="font-bold text-lg">{formatEuro(totals.total)}</span>
                  {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </span>
              </button>

              <div id="booking-summary-content" className="space-y-4">
                {/* Booking Details */}
                <div className="space-y-3">
                  <DetailRow 
                    icon={<MapPin size={16} />}
                    label="Location" 
                    value={location ? location.name : <span className="text-slate-400">Select</span>}
                    onEdit={() => setStep(0)}
                  />
                  <DetailRow 
                    icon={<Clock size={16} />}
                    label="Timing" 
                    value={state.timing ? (state.timing === 'immediate' ? 'Immediate Start' : 'Advance Reservation') : <span className="text-slate-400">Select</span>}
                    onEdit={() => setStep(1)}
                  />
                  <DetailRow 
                    icon={<Calendar size={16} />}
                    label="Duration" 
                    value={duration ? duration.label : <span className="text-slate-400">Select</span>}
                    onEdit={() => setStep(2)}
                  />
                  <DetailRow 
                    icon={<Clock size={16} />}
                    label="Start" 
                    value={state.startDateTime ? formatDateTime(state.startDateTime) : <span className="text-slate-400">Pick time</span>}
                    onEdit={() => setStep(state.timing === 'reservation' ? 4 : 2)}
                  />
                  <DetailRow 
                    icon={<Clock size={16} />}
                    label="End" 
                    value={state.endDateTime ? formatDateTime(state.endDateTime) : <span className="text-slate-400">—</span>}
                    onEdit={() => setStep(state.timing === 'reservation' ? 4 : 2)}
                  />
                </div>

                {/* Items */}
                <div className="pt-4 border-t border-slate-200">
                  <p className="font-semibold text-sm text-slate-700 mb-3">Items</p>
                  {items.length === 0 ? (
                    <p className="text-slate-400 text-sm">No products selected</p>
                  ) : (
                    <ul className="space-y-2">
                      {items.map(it => (
                        <li key={it.variantId} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                          <div className="flex items-center gap-3">
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            <span className="text-sm text-slate-700">
                              {it.title} ({it.size}) × {it.qty}
                            </span>
                          </div>
                          <span className="font-semibold text-sm">{formatEuro(lineTotal(it, duration?.id, products, priceIndex, location?.id))}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* Total */}
                <div className="pt-4 border-t border-slate-200 space-y-2 bg-gradient-to-r from-blue-50 to-indigo-50 -mx-6 px-6 py-4 rounded-2xl">
                  {taxIncluded ? (
                    <>
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-bold text-slate-900">Total (incl. {taxLabel})</span>
                        <span className="text-2xl font-bold text-blue-600">{formatEuro(totals.total)}</span>
                      </div>
                      <div className="flex justify-between text-xs text-slate-600">
                        <span>of which {taxLabel}</span>
                        <span>{formatEuro(totals.tax)}</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-600">Subtotal</span>
                        <span className="font-medium">{formatEuro(totals.subtotal)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-600">{taxLabel}</span>
                        <span className="font-medium">{formatEuro(totals.tax)}</span>
                      </div>
                      <div className="flex justify-between items-center pt-2 border-t border-slate-200">
                        <span className="text-lg font-bold text-slate-900">Total</span>
                        <span className="text-2xl font-bold text-blue-600">{formatEuro(totals.total)}</span>
                      </div>
                    </>
                  )}
                </div>

                {location && (
                  <div className="pt-3 border-t border-slate-200 text-xs text-slate-500 bg-slate-50 -mx-6 px-6 py-3 rounded-b-2xl">
                    <div className="flex items-center gap-2">
                      <Clock size={12} />
                      <span>Opening hours: {formatTimeOfDayStr(location.open_time)}–{formatTimeOfDayStr(location.close_time)}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </aside>
      )
    }

    function DetailRow({ icon, label, children, onEdit }) {
      return (
        <div className="flex items-start justify-between gap-2 group">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-slate-100 rounded-lg flex items-center justify-center text-slate-600">
              {icon}
            </div>
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wide">{label}</p>
              <p className="font-medium text-sm">{children}</p>
            </div>
          </div>
          <button 
            className="text-blue-600 hover:text-blue-700 text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity" 
            onClick={onEdit}
          >
            Change
          </button>
        </div>
      )
    }

    function lineTotal(it, durationId, products, priceIndex, locationId) {
      const unit = getLineItemPrice(it.variantId, products, durationId, priceIndex, locationId)
      return unit * it.qty
    }