import React from 'react'
    import classNames from 'classnames'
    import { useBooking } from '../context/BookingContext'
    import { formatEuro } from '../lib/money'
    import { getProductPrice } from '../lib/pricing'
    import { Star, Zap } from 'lucide-react'

    export default function ProductCard({ product, isSelected, onSelect, locationId, durationId }) {
      const { priceIndex } = useBooking()
      const unitPrice = getProductPrice(product, durationId, priceIndex, locationId)
      const img = product.image_url
      const isEbike = product.title.toLowerCase().includes('e-bike') || product.title.toLowerCase().includes('electric')

      return (
        <button
          onClick={() => onSelect?.(product)}
          className={classNames(
            'w-full p-4 rounded-2xl transition-all duration-300 text-left bg-white border-2 hover:shadow-2xl group',
            'hover:-translate-y-1 active:scale-[0.98]',
            isSelected 
              ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-indigo-50 shadow-xl ring-2 ring-blue-500 ring-offset-2' 
              : 'border-slate-200 hover:border-blue-300'
          )}
          title={product.title}
        >
          <div className="aspect-square w-full mb-4 rounded-xl overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100 relative group-hover:scale-105 transition-transform duration-300">
            {img ? (
              <img 
                src={img} 
                alt={product.title} 
                className="w-full h-full object-contain" 
                loading="lazy" 
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-400">
                <Bike size={32} />
              </div>
            )}
            {isEbike && (
              <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                <Zap size={12} />
                E-Bike
              </div>
            )}
          </div>
          
          <div className="space-y-2">
            <h3 className={classNames(
              'font-bold text-base leading-tight line-clamp-2 group-hover:text-blue-600 transition-colors',
              isSelected ? 'text-blue-700' : 'text-slate-900'
            )}>
              {product.title}
            </h3>
            
            {product.description && (
              <p className="text-xs text-slate-600 line-clamp-2">{product.description}</p>
            )}
            
            <div className="flex items-center justify-between">
              {typeof unitPrice === 'number' && unitPrice >= 0 ? (
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-blue-600">{formatEuro(unitPrice)}</span>
                  <span className="text-xs text-slate-500">/ day</span>
                </div>
              ) : (
                <p className="text-slate-500 text-sm font-medium">Price on select</p>
              )}
              
              <div className="flex items-center gap-1 text-amber-500">
                <Star size={14} fill="currentColor" />
                <Star size={14} fill="currentColor" />
                <Star size={14} fill="currentColor" />
                <Star size={14} fill="currentColor" />
                <Star size={14} />
                <span className="text-xs text-slate-500 ml-1">(4.8)</span>
              </div>
            </div>
          </div>
          
          {isSelected && (
            <div className="mt-4 pt-3 border-t border-blue-200">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-blue-700">Selected</span>
                <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
              </div>
            </div>
          )}
        </button>
      )
    }

    function Bike({ size }) {
      return (
        <svg 
          className="w-full h-full" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24" 
          aria-hidden="true"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={1.5} 
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" 
          />
        </svg>
      )
    }