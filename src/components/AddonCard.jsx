import React from 'react'
import QuantitySelector from './QuantitySelector'
import { getLineItemPrice } from '../lib/pricing'
import { useBooking } from '../context/BookingContext'
import { formatEuro } from '../lib/money'

export default function AddonCard({ addon, durationId, available, qty, onQtyChange }) {
  const { products, priceIndex, location } = useBooking()
  const variant = addon.product_variants[0]
  if (!variant) return null
  
  const unitPrice = getLineItemPrice(variant.id, products, durationId, priceIndex, location?.id)

  return (
    <div className="card p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-md overflow-hidden bg-white">
          <img src={addon.image_url} alt={addon.title} className="w-full h-full object-contain" />
        </div>
        <div>
          <h4 className="font-semibold">{addon.title}</h4>
          <p className="text-sm text-slate-600">{addon.description}</p>
          <p className="text-xs text-slate-500 mt-1">{available} available</p>
        </div>
      </div>
      <div className="text-right shrink-0">
        <div className="font-semibold text-lg">{formatEuro(unitPrice)}</div>
        <div className="mt-2">
          <QuantitySelector
            value={qty}
            onChange={onQtyChange}
            max={available}
          />
        </div>
      </div>
    </div>
  )
}