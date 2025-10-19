import React from 'react'
    import { X } from 'lucide-react'
    import { useBooking } from '../context/BookingContext'
    import AddonCard from './AddonCard'
    import { formatEuro } from '../lib/money'
    import { getTaxLabel, isTaxIncluded } from '../lib/tax'

    export default function AddonModal({ isOpen, onClose, onContinue, addonProducts, availMap }) {
      const { state, dispatch, duration, totals, location, merchant } = useBooking()

      function setQty(variantId, qty) {
        dispatch({ type: 'SET_VARIANT_QTY', payload: { variantId, qty } })
      }

      const hasOver = React.useMemo(() => {
        return addonProducts.some(p => {
          const variant = p.product_variants.find(v => v.location_id === location?.id)
          if (!variant) return false
          const max = availMap[variant.id] ?? 0
          const qty = state.basket[variant.id] || 0
          return qty > max
        })
      }, [addonProducts, availMap, state.basket, location])

      const taxIncluded = isTaxIncluded(merchant)
      const taxLabel = getTaxLabel(merchant)

      if (!isOpen) return null

      return (
        <div 
          className="fixed inset-0 bg-black bg-opacity-60 z-40 flex items-center justify-center p-4"
          onClick={onClose}
          aria-modal="true"
          role="dialog"
        >
          <div 
            className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <header className="p-4 border-b border-slate-200 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Recommended Add-ons</h2>
              <button onClick={onClose} className="p-1 rounded-full hover:bg-slate-100">
                <X size={20} />
              </button>
            </header>
            
            <main className="p-4 overflow-y-auto space-y-3">
              {addonProducts.length > 0 ? (
                addonProducts.map(p => {
                  const variant = p.product_variants.find(v => v.location_id === location?.id)
                  if (!variant) return null
                  return (
                    <AddonCard
                      key={p.id}
                      addon={p}
                      durationId={duration?.id}
                      available={availMap[variant.id] ?? 0}
                      qty={state.basket[variant.id] || 0}
                      onQtyChange={(q) => setQty(variant.id, q)}
                    />
                  )
                })
              ) : (
                <p className="text-slate-500 text-center py-4">No add-ons recommended for your selection.</p>
              )}
              {hasOver && (
                <div className="mt-2 p-2 rounded-md border border-amber-300 bg-amber-50 text-amber-800 text-xs" role="alert">
                  Availability changed. Some add-on quantities were adjusted to the maximum available.
                </div>
              )}
            </main>

            <footer className="p-4 border-t border-slate-200 mt-auto">
              <div className="flex justify-between items-center mb-3">
                <span className="text-lg font-semibold">Total</span>
                <span className="text-lg font-semibold">{formatEuro(totals.total)}</span>
              </div>
              {taxIncluded && (
                <div className="flex justify-between text-xs text-slate-500 mb-3">
                  <span>incl. {taxLabel}</span>
                  <span>{formatEuro(totals.tax)}</span>
                </div>
              )}
              <button 
                onClick={onContinue} 
                className="btn btn-primary w-full"
                disabled={hasOver}
                title={hasOver ? 'Please review adjusted quantities' : undefined}
              >
                Continue to Checkout
              </button>
            </footer>
          </div>
        </div>
      )
    }