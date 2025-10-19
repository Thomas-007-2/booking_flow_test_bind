import React, { useState, useMemo } from 'react'
import { useBooking } from '../context/BookingContext'
import ProductCard from '../components/ProductCard'
import ProductDetails from '../components/ProductDetails'
import Filters from '../components/Filters'
import SizeFilter from '../components/SizeFilter'
import { ShoppingCart } from 'lucide-react'

export default function ProductStep() {
  const { state, dispatch, prev, next, location, categories, products } = useBooking()
  const [selectedProductId, setSelectedProductId] = useState(null)

  // Get available products for this location
  const availableProducts = useMemo(() => {
    if (!location) return []
    
    return products.filter(product => {
      // Must have variants at this location
      const hasVariants = product.product_variants?.some(v => v.location_id === location.id)
      if (!hasVariants) return false
      
      // Apply category filter
      if (state.productFilter !== 'all' && product.category_id !== state.productFilter) {
        return false
      }
      
      // Apply size filter
      if (state.sizeFilter !== 'all') {
        const hasMatchingSize = product.product_variants?.some(v => 
          v.location_id === location.id && v.size === state.sizeFilter
        )
        if (!hasMatchingSize) return false
      }
      
      return true
    })
  }, [products, location, state.productFilter, state.sizeFilter])

  const visibleCategories = useMemo(() => categories.filter(c => !c.is_hidden), [categories])
  const ALL_SIZES = ['S', 'M', 'L', 'std']

  // Get available sizes for current filter
  const availableSizes = useMemo(() => {
    if (!location) return []
    
    const sizeSet = new Set()
    availableProducts.forEach(product => {
      product.product_variants?.forEach(variant => {
        if (variant.location_id === location.id && variant.size) {
          sizeSet.add(variant.size)
        }
      })
    })
    
    return ALL_SIZES.filter(size => sizeSet.has(size))
  }, [availableProducts, location])

  // Calculate total items in cart
  const cartTotal = useMemo(() => 
    state.cartItems.reduce((sum, item) => sum + item.quantity, 0),
    [state.cartItems]
  )

  function handleProductSelect(product) {
    setSelectedProductId(selectedProductId === product.id ? null : product.id)
  }

  const selectedProduct = selectedProductId 
    ? availableProducts.find(p => p.id === selectedProductId)
    : null

  if (!location) {
    return <div className="text-center text-slate-500">Please select a location first.</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Choose your bikes</h2>
          <p className="text-slate-600">Available at {location.name}</p>
        </div>
        
        {cartTotal > 0 && (
          <div className="flex items-center gap-2 bg-brand text-white px-3 py-2 rounded-lg">
            <ShoppingCart size={18} />
            <span className="font-medium">{cartTotal} item{cartTotal > 1 ? 's' : ''}</span>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-center p-4 bg-slate-50 rounded-lg">
        <Filters
          categories={visibleCategories}
          value={state.productFilter}
          onChange={(v) => dispatch({ type: 'SET_PRODUCT_FILTER', payload: v })}
          label="Category"
        />
        <SizeFilter
          sizes={availableSizes}
          value={state.sizeFilter}
          onChange={(v) => dispatch({ type: 'SET_SIZE_FILTER', payload: v })}
          label="Size"
        />
        
        {(state.productFilter !== 'all' || state.sizeFilter !== 'all') && (
          <button
            onClick={() => {
              dispatch({ type: 'SET_PRODUCT_FILTER', payload: 'all' })
              dispatch({ type: 'SET_SIZE_FILTER', payload: 'all' })
            }}
            className="text-sm text-slate-600 hover:text-slate-800 underline"
          >
            Clear filters
          </button>
        )}
      </div>

      {availableProducts.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-slate-400 mb-4">
            <ShoppingCart size={48} className="mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-slate-600 mb-2">No bikes available</h3>
          <p className="text-slate-500">
            Try adjusting your filters or check back later.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Product Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {availableProducts.map(product => (
              <ProductCard
                key={product.id}
                product={product}
                isSelected={selectedProductId === product.id}
                onSelect={handleProductSelect}
                locationId={location.id}
              />
            ))}
          </div>

          {/* Selected Product Details */}
          {selectedProduct && (
            <div className="animate-in slide-in-from-top-4 duration-300">
              <h3 className="text-lg font-medium mb-4 text-slate-700">
                Product Details
              </h3>
              <ProductDetails
                product={selectedProduct}
                locationId={location.id}
              />
            </div>
          )}
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between pt-6 border-t">
        <button className="btn btn-outline" onClick={prev}>
          Back
        </button>
        <button 
          className="btn btn-primary" 
          disabled={cartTotal === 0}
          onClick={next}
        >
          Continue {cartTotal > 0 && `(${cartTotal} item${cartTotal > 1 ? 's' : ''})`}
        </button>
      </div>
    </div>
  )
}