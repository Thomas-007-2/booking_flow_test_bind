import React, { useMemo, useState, useEffect, useRef, useCallback } from 'react'
import { useBooking } from '../context/BookingContext'
import ProductCard from '../components/ProductCard'
import ProductDetails from '../components/ProductDetails'
import ProductDetailsModal from '../components/ProductDetailsModal'
import Filters from '../components/Filters'
import SizeFilter from '../components/SizeFilter'
import ModelFilter from '../components/ModelFilter'
import OrderSummaryPanel from '../components/OrderSummaryPanel'
import MobileContinueBar from '../components/MobileContinueBar'
import AddonModal from '../components/AddonModal'
import { supabase } from '../lib/supabaseClient'
import { ChevronDown, ChevronUp } from 'lucide-react'

function totalBasketQty(basket) {
  return Object.values(basket).reduce((sum, qty) => sum + qty, 0)
}

function ProductSkeleton() {
  return (
    <div className="card overflow-hidden">
      <div className="w-full h-32 sm:h-36 bg-slate-200 animate-pulse" />
      <div className="p-3 space-y-2">
        <div className="h-4 w-3/4 bg-slate-200 rounded animate-pulse" />
        <div className="h-3 w-1/2 bg-slate-200 rounded animate-pulse" />
      </div>
    </div>
  )
}

export default function ProductsStep() {
  const { state, dispatch, prev, next, duration, location, products, categories, productsLoading } = useBooking()
  const [availMap, setAvailMap] = useState({})
  const [isAddonModalOpen, setIsAddonModalOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [selectedProductId, setSelectedProductId] = useState(null)

  // Desktop detection (lg breakpoint)
  const [isDesktop, setIsDesktop] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)')
    const onChange = (e) => setIsDesktop(e.matches)
    setIsDesktop(mq.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  // Mobile details modal
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)

  // Track component liveness to avoid setting state after unmount
  const aliveRef = useRef(true)
  useEffect(() => {
    return () => {
      aliveRef.current = false
    }
  }, [])

  // Track whether availability has actually loaded (prevents wiping basket on mount/back)
  const availHasDataRef = useRef(false)

  // Dedup/ignore stale responses
  const reqSeq = useRef(0)

  const fetchAvailability = useCallback(async (reason = 'unknown') => {
    if (!state.startDateTime || !state.endDateTime || !location || products.length === 0) return

    const variantIdsForLocation = products
      .flatMap(p => p.product_variants)
      .filter(v => v.location_id === location.id)
      .map(v => v.id)

    if (variantIdsForLocation.length === 0) {
      if (aliveRef.current) {
        availHasDataRef.current = false
        setAvailMap({})
        setLoading(false)
      }
      return
    }

    const rpcParams = {
      variant_ids: variantIdsForLocation,
      start_time: state.startDateTime.toISOString(),
      end_time: state.endDateTime.toISOString()
    }

    const seq = ++reqSeq.current
    if (aliveRef.current) setLoading(true)

    console.log('--- Fetching Availability (ProductsStep) ---')
    console.log('Trigger:', reason)
    console.log('RPC Function:', 'get_available_stock')
    console.log('Parameters Sent:', JSON.stringify(rpcParams, null, 2))

    const { data, error } = await supabase.rpc('get_available_stock', rpcParams)

    // Ignore stale/outdated responses
    if (seq !== reqSeq.current) {
      console.log('[ProductsStep] Stale availability response ignored. Trigger:', reason)
      return
    }

    console.log('RPC Response Data:', data)
    console.log('RPC Response Error:', error)
    console.log('-------------------------------------------')

    if (error) {
      console.error('Failed to fetch stock availability:', error)
      if (aliveRef.current) setLoading(false)
      return
    }

    const newAvailMap = (data || []).reduce((acc, item) => {
      acc[item.variant_id] = Math.max(0, Number(item.available_stock) || 0)
      return acc
    }, {})

    if (aliveRef.current) {
      // Mark that we have actual availability data to act upon
      availHasDataRef.current = Object.keys(newAvailMap).length > 0
      setAvailMap(newAvailMap)
      setLoading(false)
    }
  }, [state.startDateTime, state.endDateTime, location, products])

  // Initial + on time/location/products change
  useEffect(() => {
    fetchAvailability('init/time-or-location-change')
  }, [fetchAvailability])

  // Refetch when filters change (category/size/model)
  useEffect(() => {
    fetchAvailability('filters-change')
  }, [state.productFilter, state.sizeFilter, state.modelFilter, fetchAvailability])

  // Refetch on window focus or when tab becomes visible
  useEffect(() => {
    const onFocus = () => fetchAvailability('window-focus')
    const onVisibility = () => {
      if (document.visibilityState === 'visible') {
        fetchAvailability('visibilitychange')
      }
    }
    window.addEventListener('focus', onFocus)
    document.addEventListener('visibilitychange', onVisibility)
    return () => {
      window.removeEventListener('focus', onFocus)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [fetchAvailability])

  // Auto-clamp basket items against latest availability
  useEffect(() => {
    // Do not clamp until availability data has actually loaded to avoid wiping basket
    if (!availHasDataRef.current) return
    if (!availMap || Object.keys(availMap).length === 0) return

    let adjusted = false
    const inResponse = new Set(Object.keys(availMap))

    for (const [variantId, qty] of Object.entries(state.basket)) {
      // Only clamp for variants that are present in the availability response
      if (!inResponse.has(variantId)) continue
      const max = availMap[variantId] ?? 0
      if (qty > max) {
        dispatch({ type: 'SET_VARIANT_QTY', payload: { variantId, qty: max } })
        adjusted = true
      }
    }
    if (adjusted) {
      console.info('[ProductsStep] Basket quantities adjusted to match availability.')
    }
  }, [availMap, state.basket, dispatch])

  const visibleCategories = useMemo(() => categories.filter(c => !c.is_hidden), [categories])
  const ALL_SIZES = ['S', 'M', 'L', 'std']
  const itemCount = totalBasketQty(state.basket)

  const modelOptions = useMemo(() => {
    if (!location) return []
    const inCat = (p) => state.productFilter === 'all' || p.category_id === state.productFilter
    const hasAtLocation = (p) => p.product_variants?.some(v => v.location_id === location.id)
    const matchesSizeIfAny = (p) => {
      if (state.sizeFilter === 'all') return true
      return p.product_variants?.some(v => v.location_id === location.id && v.size === state.sizeFilter)
    }
    return products
      .filter(p => inCat(p) && hasAtLocation(p) && matchesSizeIfAny(p))
      .map(p => ({ value: p.id, label: p.title }))
  }, [products, location, state.productFilter, state.sizeFilter])

  // Reset model filter if it's no longer valid under current selection
  useEffect(() => {
    if (state.modelFilter !== 'all') {
      const stillExists = modelOptions.some(o => o.value === state.modelFilter)
      if (!stillExists) {
        dispatch({ type: 'SET_MODEL_FILTER', payload: 'all' })
      }
    }
  }, [modelOptions, state.modelFilter, dispatch])

  const filteredProducts = useMemo(() => {
    if (!location) return []
    return products.filter(p => {
      const category = categories.find(c => c.id === p.category_id)
      if (category?.is_hidden) return false
      if (state.productFilter !== 'all' && p.category_id !== state.productFilter) return false
      if (state.modelFilter !== 'all' && p.id !== state.modelFilter) return false

      const hasVariantsAtLocation = p.product_variants.some(v => v.location_id === location.id)
      if (!hasVariantsAtLocation) return false

      if (state.sizeFilter !== 'all') {
        return p.product_variants.some(v => v.size === state.sizeFilter && v.location_id === location.id)
      }
      return true
    })
  }, [products, categories, state.productFilter, state.sizeFilter, state.modelFilter, location])

  const recommendedAddonIds = useMemo(() => {
    const variantIdsInBasket = Object.keys(state.basket)
    const productIdsInBasket = new Set()
    variantIdsInBasket.forEach(vid => {
      const p = products.find(prod => prod.product_variants.some(v => v.id === vid))
      if (p) productIdsInBasket.add(p.id)
    })

    const ids = new Set()
    products.forEach(p => {
      if (productIdsInBasket.has(p.id) && p.recommended_addons) {
        p.recommended_addons.forEach(id => ids.add(id))
      }
    })
    return Array.from(ids)
  }, [state.basket, products])

  const addonProducts = useMemo(() => {
    return products.filter(p => recommendedAddonIds.includes(p.id))
  }, [recommendedAddonIds, products])

  // Safety: auto-close the modal if add-ons disappear while open
  useEffect(() => {
    if (isAddonModalOpen && addonProducts.length === 0) {
      setIsAddonModalOpen(false)
    }
  }, [isAddonModalOpen, addonProducts.length])

  function setQty(variantId, qty) {
    const max = availMap[variantId] ?? 0
    const clamped = Math.max(0, Math.min(max, qty || 0))
    dispatch({ type: 'SET_VARIANT_QTY', payload: { variantId, qty: clamped } })
  }

  const handleMobileContinue = () => {
    if (addonProducts.length > 0) {
      setIsAddonModalOpen(true)
    } else {
      next()
    }
  }
  const handleModalContinue = () => {
    setIsAddonModalOpen(false)
    next()
  }

  // Collapsible filters state: open if any filter is active
  const isAnyFilterActive =
    state.productFilter !== 'all' || state.modelFilter !== 'all' || state.sizeFilter !== 'all'
  const [isFilterVisible, setIsFilterVisible] = useState(isAnyFilterActive)
  useEffect(() => {
    setIsFilterVisible(isAnyFilterActive)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.productFilter, state.modelFilter, state.sizeFilter])

  const selectedProduct = selectedProductId
    ? filteredProducts.find(p => p.id === selectedProductId)
    : null

  // Open modal on mobile when selecting a product; keep inline details on desktop
  const onSelectProduct = (prod) => {
    setSelectedProductId(prev => {
      const nextId = prev === prod.id ? null : prod.id
      if (nextId && !isDesktop) {
        setIsDetailsModalOpen(true)
      }
      return nextId
    })
  }

  // Close the details modal when switching to desktop or when selection disappears (e.g., filter change)
  useEffect(() => {
    if (isDesktop || !selectedProduct) {
      setIsDetailsModalOpen(false)
    }
  }, [isDesktop, selectedProduct])

  // Also close details modal on filter changes to avoid stale content
  useEffect(() => {
    setIsDetailsModalOpen(false)
  }, [state.productFilter, state.modelFilter, state.sizeFilter])

  const handleDetailsCheckout = () => {
    setIsDetailsModalOpen(false)
    // Mirror the mobile continue behavior
    if (addonProducts.length > 0) {
      setIsAddonModalOpen(true)
    } else {
      next()
    }
  }

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div>
            <h2 className="text-xl font-semibold">Choose your bikes</h2>

            <div className="mt-4">
              {!isFilterVisible ? (
                <button
                  onClick={() => setIsFilterVisible(true)}
                  className="text-sm text-brand hover:underline flex items-center gap-1"
                >
                  <ChevronDown size={16} />
                  <span>Optional: filter specific bike</span>
                </button>
              ) : (
                <div className="p-4 border border-slate-200 rounded-lg bg-slate-50 space-y-3">
                  <button
                    onClick={() => setIsFilterVisible(false)}
                    className="text-sm text-brand hover:underline flex items-center gap-1 mb-2"
                  >
                    <ChevronUp size={16} />
                    <span>Hide filters</span>
                  </button>
                  <div className="flex flex-wrap gap-4 items-center">
                    <Filters
                      categories={visibleCategories}
                      value={state.productFilter}
                      onChange={(v) => {
                        dispatch({ type: 'SET_PRODUCT_FILTER', payload: v })
                        setSelectedProductId(null)
                      }}
                      label="Category"
                    />
                    <ModelFilter
                      options={modelOptions}
                      value={state.modelFilter}
                      onChange={(v) => {
                        dispatch({ type: 'SET_MODEL_FILTER', payload: v })
                        setSelectedProductId(null)
                      }}
                      label="Model"
                    />
                    <SizeFilter
                      sizes={ALL_SIZES}
                      value={state.sizeFilter}
                      onChange={(v) => {
                        dispatch({ type: 'SET_SIZE_FILTER', payload: v })
                        setSelectedProductId(null)
                      }}
                      label="Size"
                    />
                  </div>
                </div>
              )}
            </div>

            {productsLoading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mt-4">
                {Array.from({ length: 6 }).map((_, i) => <ProductSkeleton key={i} />)}
              </div>
            ) : (
              <>
                {loading ? <div className="mt-4">Loading availability...</div> : null}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mt-4">
                  {filteredProducts.map(p => (
                    <ProductCard
                      key={p.id}
                      product={p}
                      isSelected={selectedProductId === p.id}
                      onSelect={onSelectProduct}
                      locationId={location.id}
                      durationId={duration?.id}
                    />
                  ))}
                </div>
                {filteredProducts.length === 0 && !loading && (
                  <div className="p-4 border border-amber-300 bg-amber-50 rounded-md text-amber-800 mt-4">
                    No products match your filter. Try another selection.
                  </div>
                )}

                {/* Inline details only on desktop */}
                {selectedProduct && isDesktop && (
                  <div className="mt-6">
                    <ProductDetails
                      product={selectedProduct}
                      locationId={location.id}
                      durationId={duration?.id}
                      availMap={availMap}
                      basket={state.basket}
                      onQtyChange={setQty}
                    />
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        <div className="hidden lg:block lg:col-span-1">
          <OrderSummaryPanel 
            addonProducts={addonProducts}
            availMap={availMap}
            onContinue={next}
            onBack={prev}
          />
        </div>

        <div className="lg:hidden">
          <MobileContinueBar 
            itemCount={itemCount}
            onContinue={handleMobileContinue}
            onBack={prev}
          />
        </div>
        <div className="lg:hidden h-24"></div>
      </div>

      {/* Mobile-only details modal */}
      {selectedProduct && !isDesktop && (
        <ProductDetailsModal
          isOpen={isDetailsModalOpen}
          product={selectedProduct}
          locationId={location.id}
          durationId={duration?.id}
          availMap={availMap}
          basket={state.basket}
          onQtyChange={setQty}
          onClose={() => setIsDetailsModalOpen(false)}
          onContinueCheckout={handleDetailsCheckout}
          canContinue={itemCount > 0}
        />
      )}

      {addonProducts.length > 0 && (
        <div className="lg:hidden">
          <AddonModal
            isOpen={isAddonModalOpen}
            onClose={() => setIsAddonModalOpen(false)}
            onContinue={handleModalContinue}
            addonProducts={addonProducts}
            availMap={availMap}
          />
        </div>
      )}
    </>
  )
}