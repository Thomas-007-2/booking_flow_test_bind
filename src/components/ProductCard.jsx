import React from 'react'
import classNames from 'classnames'
import { useBooking } from '../context/BookingContext'
import { formatEuro } from '../lib/money'

function derivedPriceFromDaily(dp = 0, durationId) {
  switch (durationId) {
    case '4h': return Math.round(dp * 0.6)
    case '6h': return Math.round(dp * 0.75)
    case '1d': return dp
    case '2d': return Math.round(dp * 2 * 0.95)
    case '3d': return Math.round(dp * 3 * 0.92)
    case '4d': return Math.round(dp * 4 * 0.90)
    case '5d': return Math.round(dp * 5 * 0.88)
    case '6d': return Math.round(dp * 6 * 0.86)
    case '1w': return Math.round(dp * 7 * 0.80)
    case '8d': return Math.round(dp * 8 * 0.80)
    case '9d': return Math.round(dp * 9 * 0.80)
    case '10d': return Math.round(dp * 10 * 0.80)
    case '2w': return Math.round(dp * 14 * 0.75)
    default: return dp
  }
}

function effectiveProductPrice(product, durationId, priceIndex, locationId) {
  if (!product || !durationId) return null
  const baseKey = `${product.id}:${durationId}`
  const locKey = locationId ? `${locationId}:${baseKey}` : null

  const fromIndex = (priceIndex?.loc && locKey && Object.prototype.hasOwnProperty.call(priceIndex.loc, locKey))
    ? priceIndex.loc[locKey]
    : (priceIndex?.any && Object.prototype.hasOwnProperty.call(priceIndex.any, baseKey))
      ? priceIndex.any[baseKey]
      : null

  if (typeof fromIndex === 'number') return fromIndex
  return derivedPriceFromDaily(product.daily_price || 0, durationId)
}

export default function ProductCard({ product, isSelected, onSelect, locationId, durationId }) {
  const { priceIndex } = useBooking()
  const unitPrice = effectiveProductPrice(product, durationId, priceIndex, locationId)
  const img = product.image_url

  return (
    <button
      onClick={() => onSelect?.(product)}
      className={classNames(
        'w-full p-2 rounded-lg border-2 transition-all duration-200 text-left bg-white',
        'hover:shadow-md active:scale-[0.98]',
        isSelected ? 'border-brand bg-brand/5 shadow-lg' : 'border-slate-200 hover:border-slate-300'
      )}
      title={product.title}
    >
      <div className="aspect-square w-full mb-2 rounded-md overflow-hidden bg-white">
        {img ? (
          <img
            src={img}
            alt={product.title}
            className="w-full h-full object-contain"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-400">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
      </div>

      <div className="space-y-1">
        <h3 className={classNames('font-medium text-sm leading-tight line-clamp-2', isSelected ? 'text-brand' : 'text-slate-900')}>
          {product.title}
        </h3>
        {typeof unitPrice === 'number' && unitPrice >= 0 ? (
          <p className="text-brand font-semibold text-sm">{formatEuro(unitPrice)}</p>
        ) : (
          <p className="text-slate-500 text-sm">Pricing on select</p>
        )}
      </div>

      {isSelected && (
        <div className="mt-2 pt-2 border-t border-brand/20">
          <div className="text-xs text-brand font-medium">Selected</div>
        </div>
      )}
    </button>
  )
}