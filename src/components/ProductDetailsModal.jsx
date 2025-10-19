import React, { useEffect, useRef } from 'react'
import { X } from 'lucide-react'
import ProductDetails from './ProductDetails'

export default function ProductDetailsModal({
  isOpen,
  product,
  locationId,
  durationId,
  availMap = {},
  basket = {},
  onQtyChange,
  onClose,
  onContinueCheckout,
  canContinue = false
}) {
  const dialogRef = useRef(null)
  const closeBtnRef = useRef(null)
  const lastActiveRef = useRef(null)

  useEffect(() => {
    if (!isOpen) return

    lastActiveRef.current = document.activeElement

    // Lock background scroll
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    // Focus management
    const focusFirst = () => {
      if (closeBtnRef.current) {
        closeBtnRef.current.focus()
      } else if (dialogRef.current) {
        const focusables = dialogRef.current.querySelectorAll(
          'button,[href],input,select,textarea,[tabindex]:not([tabindex="-1"])'
        )
        if (focusables.length > 0) focusables[0].focus()
      }
    }
    focusFirst()

    const onKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        onClose?.()
      }
      if (e.key === 'Tab' && dialogRef.current) {
        const focusables = dialogRef.current.querySelectorAll(
          'button,[href],input,select,textarea,[tabindex]:not([tabindex="-1"])'
        )
        if (focusables.length === 0) return
        const first = focusables[0]
        const last = focusables[focusables.length - 1]
        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault()
            last.focus()
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault()
            first.focus()
          }
        }
      }
    }

    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = prevOverflow
      if (lastActiveRef.current && typeof lastActiveRef.current.focus === 'function') {
        lastActiveRef.current.focus()
      }
    }
  }, [isOpen, onClose])

  if (!isOpen || !product) return null

  return (
    <div
      className="fixed inset-0 z-50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="product-details-title"
    >
      <div
        className="absolute inset-0 bg-black/60"
        onClick={onClose}
      />
      <div className="absolute inset-0 flex flex-col">
        <div
          ref={dialogRef}
          className="bg-white h-full w-full flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          <header className="p-4 border-b border-slate-200 flex items-center justify-between">
            <h2 id="product-details-title" className="text-lg font-semibold">
              {product.title}
            </h2>
            <button
              ref={closeBtnRef}
              onClick={onClose}
              className="p-2 rounded-full hover:bg-slate-100"
              aria-label="Close"
              title="Close"
            >
              <X size={20} />
            </button>
          </header>

          <main className="flex-1 overflow-y-auto p-4">
            <ProductDetails
              product={product}
              locationId={locationId}
              durationId={durationId}
              availMap={availMap}
              basket={basket}
              onQtyChange={onQtyChange}
              compactMedia={true}
            />
          </main>

          <footer className="p-4 border-t border-slate-200">
            <div className="flex gap-3">
              <button className="btn btn-outline w-1/2" onClick={onClose}>
                Continue shopping
              </button>
              <button
                className="btn btn-primary w-1/2"
                onClick={onContinueCheckout}
                disabled={!canContinue}
                title={canContinue ? undefined : 'Please add at least one item to continue'}
              >
                Continue to checkout
              </button>
            </div>
          </footer>
        </div>
      </div>
    </div>
  )
}