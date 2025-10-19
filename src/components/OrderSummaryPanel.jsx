import React from 'react'
    import { useBooking } from '../context/BookingContext'
    import AddonCard from './AddonCard'
    import { getLineItemPrice } from '../lib/pricing'
    import { formatEuro } from '../lib/money'
    import { getTaxLabel, isTaxIncluded } from '../lib/tax'

    function BasketItem({ item, durationId, onRemove }) {
      const { products, priceIndex, location } = useBooking()
      const unitPrice = getLineItemPrice(item.variantId, products, durationId, priceIndex, location?.id)
      return (
        <div className="flex items-start justify-between gap-2 py-2">
          <div>
            <p className="font-medium">{item.title} ({item.size})</p>
            <p className="text-sm text-slate-600">{formatEuro(unitPrice)} × {item.qty}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-semibold">{formatEuro(unitPrice * item.qty)}</span>
            <button onClick={onRemove} className="text-xs text-red-600 hover:underline" title="Remove item">&times;</button>
          </div>
        </div>
      )
    }

    export default function OrderSummaryPanel({ addonProducts, availMap, onContinue, onBack }) {
      const { state, dispatch, duration, totals, products, location, merchant } = useBooking()

      const basketItems = React.useMemo(() => {
        const items = []
        for (const [variantId, qty] of Object.entries(state.basket)) {
          const product = products.find(p => p.product_variants.some(v => v.id === variantId))
          if (!product) continue
          const variant = product.product_variants.find(v => v.id === variantId)
          const category = state.categories.find(c => c.id === product.category_id)
          if (category?.is_hidden) continue
          if (qty > 0) {
            items.push({ variantId, title: product.title, size: variant.size, qty })
          }
        }
        return items
      }, [state.basket, products, state.categories])

      function setQty(variantId, qty) {
        dispatch({ type: 'SET_VARIANT_QTY', payload: { variantId, qty } })
      }

      const hasBikes = basketItems.length > 0

      const hasOver = React.useMemo(() => {
        return basketItems.some(item => {
          const max = availMap[item.variantId] ?? 0
          return item.qty > max
        })
      }, [basketItems, availMap])

      const taxIncluded = isTaxIncluded(merchant)
      const taxLabel = getTaxLabel(merchant)

      return (
        <aside className="sticky top-4 space-y-4">
          <div className="card p-4">
            <h3 className="text-lg font-semibold mb-2">Your Order</h3>
            
            {!hasBikes ? (
              <p className="text-sm text-slate-500">Select a bike to get started.</p>
            ) : (
              <>
                <div className="divide-y divide-slate-200 text-sm">
                  {basketItems.map(item => (
                    <BasketItem 
                      key={item.variantId} 
                      item={item} 
                      durationId={duration?.id}
                      onRemove={() => setQty(item.variantId, 0)}
                    />
                  ))}
                </div>

                {hasOver && (
                  <div className="mt-2 p-2 rounded-md border border-amber-300 bg-amber-50 text-amber-800 text-xs" role="alert">
                    Availability changed. Some item quantities were adjusted to the maximum available.
                  </div>
                )}

                <div className="mt-3 pt-3 border-t border-slate-200 space-y-1">
                  {taxIncluded ? (
                    <>
                      <div className="flex justify-between text-slate-600">
                        <span>Total (incl. {taxLabel})</span>
                        <span>{formatEuro(totals.total)}</span>
                      </div>
                      <div className="flex justify-between text-xs text-slate-500">
                        <span>of which {taxLabel}</span>
                        <span>{formatEuro(totals.tax)}</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex justify-between text-slate-600">
                        <span>Subtotal</span>
                        <span>{formatEuro(totals.subtotal)}</span>
                      </div>
                      <div className="flex justify-between text-slate-600">
                        <span>{taxLabel}</span>
                        <span>{formatEuro(totals.tax)}</span>
                      </div>
                      <div className="flex justify-between font-semibold text-lg">
                        <span>Total</span>
                        <span>{formatEuro(totals.total)}</span>
                      </div>
                    </>
                  )}
                </div>
              </>
            )}
          </div>

          {addonProducts.length > 0 && (
            <div className="card p-4">
              <h3 className="text-lg font-semibold mb-2">Recommended Add-ons</h3>
              <div className="space-y-3 mt-3">
                {addonProducts.map(p => {
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
                })}
              </div>
            </div>
          )}

          <div className="hidden lg:flex justify-between">
            <button className="btn btn-outline" onClick={onBack}>Back</button>
            <button className="btn btn-primary" disabled={!hasBikes || hasOver} onClick={onContinue}>Continue</button>
          </div>
        </aside>
      )
    }