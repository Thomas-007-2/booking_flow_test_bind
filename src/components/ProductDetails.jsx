import React, { useMemo } from 'react'
import QuantitySelector from './QuantitySelector'
import { useBooking } from '../context/BookingContext'
import { getLineItemPrice } from '../lib/pricing'
import { formatEuro } from '../lib/money'

export default function ProductDetails({
  product,
  locationId,
  durationId,
  availMap = {},
  basket = {},
  onQtyChange,
  compactMedia = false
}) {
  const { products, priceIndex } = useBooking()

  const variants = useMemo(() => {
    return (product.product_variants || []).filter(v => v.location_id === locationId)
  }, [product.product_variants, locationId])

  const details = Array.isArray(product.details) ? product.details : []

  const unitPrice = useMemo(() => {
    if (!variants.length) return 0
    // Pricing is identical across sizes; compute once from any variant
    return getLineItemPrice(variants[0].id, products, durationId, priceIndex, locationId)
  }, [variants, products, durationId, priceIndex, locationId])

  if (!variants.length) {
    return (
      <div className="p-6 text-center text-slate-500 card">
        This product is not available at the selected location.
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
      {product.image_url && (
        <div className="w-full bg-white">
          <img
            src={product.image_url}
            alt={product.title}
            className={compactMedia ? 'w-full h-40 md:h-64 object-contain object-center' : 'w-full h-64 md:h-80 object-contain object-center'}
            loading="lazy"
          />
        </div>
      )}

      <div className="p-4 md:p-6">
        {/* Header */}
        <div className="mb-4">
          <div className="flex items-start justify-between gap-3">
            <h2 className="text-xl font-semibold text-slate-900">{product.title}</h2>
            {typeof unitPrice === 'number' && unitPrice >= 0 && (
              <div className="shrink-0 rounded-md bg-brand/10 text-brand font-semibold px-3 py-1">
                {formatEuro(unitPrice)}
              </div>
            )}
          </div>

          {product.description && (
            <p className="text-slate-600 text-sm leading-relaxed mt-1">{product.description}</p>
          )}

          {details.length > 0 && (
            <ul className="list-disc list-inside text-sm text-slate-700 mt-2 grid grid-cols-1 sm:grid-cols-2 gap-1">
              {details.map((d, i) => <li key={i}>{d}</li>)}
            </ul>
          )}
        </div>

        {/* Variants */}
        <div className="space-y-3">
          <h3 className="text-lg font-medium text-slate-900">Available options</h3>

          {variants.map(variant => {
            const max = Math.max(0, Number(availMap[variant.id] ?? 0))
            const qty = Math.max(0, Number(basket[variant.id] || 0))

            return (
              <div
                key={variant.id}
                className="flex items-center justify-between gap-3 p-3 border border-slate-200 rounded-lg"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                      Size {variant.size || 'std'}
                    </span>
                    <span className="text-xs text-slate-500">
                      {max > 0 ? `${max} available` : 'Out of stock'}
                    </span>
                  </div>
                </div>

                <div className="shrink-0">
                  <QuantitySelector
                    value={qty}
                    onChange={(q) => onQtyChange?.(variant.id, q)}
                    max={max}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}