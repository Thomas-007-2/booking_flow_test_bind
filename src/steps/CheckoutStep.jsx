import React, { useMemo } from 'react'
import { useBooking } from '../context/BookingContext'
import { formatEuro } from '../lib/money'
import { getLineItemPrice } from '../lib/pricing'
import { getTaxLabel, isTaxIncluded } from '../lib/tax'

export default function CheckoutStep() {
  const { state, dispatch, prev, next, totals, formatDateTime, merchant, products, duration, priceIndex, location } = useBooking()

  const items = useMemo(() => {
    const out = []
    if (!products) return out
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

  const lineTotal = (item) => {
    if (!products || !duration || !location) return 0
    const unit = getLineItemPrice(item.variantId, products, duration.id, priceIndex, location.id)
    return unit * item.qty
  }

  const handleFieldChange = (field, value) => {
    dispatch({ type: 'SET_CUSTOMER_FIELD', payload: { field, value } })
  }

  const handleTermsChange = (checked) => {
    dispatch({ type: 'SET_TERMS', payload: checked })
  }

  const canContinue = () => {
    const c = state.customer
    return (
      c.firstName.trim() &&
      c.lastName.trim() &&
      validateEmail(c.email) &&
      validatePhone(c.phone) &&
      c.terms
    )
  }

  // Format cancellation policy
  const getCancellationPolicy = () => {
    const cancelHours = merchant?.cancel_hours || 24
    const refundPercent = merchant?.cancel_refund_percent || 100
    return `Cancel latest ${cancelHours}h prior to the start of the booking for a ${refundPercent}% refund`
  }

  const showNotesField = merchant?.notes_checkout !== false // Default to true if not specified
  const taxIncluded = isTaxIncluded()
  const taxLabel = getTaxLabel()

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Your details</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="label">First name *</label>
          <input
            type="text"
            className="field"
            value={state.customer.firstName}
            onChange={(e) => handleFieldChange('firstName', e.target.value)}
            placeholder="Enter first name"
          />
        </div>
        <div>
          <label className="label">Last name *</label>
          <input
            type="text"
            className="field"
            value={state.customer.lastName}
            onChange={(e) => handleFieldChange('lastName', e.target.value)}
            placeholder="Enter last name"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="label">Email *</label>
          <input
            type="email"
            className="field"
            value={state.customer.email}
            onChange={(e) => handleFieldChange('email', e.target.value)}
            placeholder="Enter email address"
          />
        </div>
        <div>
          <label className="label">Phone *</label>
          <input
            type="tel"
            className="field"
            value={state.customer.phone}
            onChange={(e) => handleFieldChange('phone', e.target.value)}
            placeholder="Enter phone number"
          />
        </div>
      </div>

      {showNotesField && (
        <div>
          <label className="label">Notes (optional)</label>
          <textarea
            className="field min-h-20"
            value={state.customer.notes}
            onChange={(e) => handleFieldChange('notes', e.target.value)}
            placeholder="Any special requests or notes"
            rows={3}
          />
        </div>
      )}

      <div className="border-t pt-4 space-y-4 lg:hidden">
        <h3 className="font-semibold">Booking summary</h3>
        <div className="space-y-2 text-sm">
          <div className="pb-2 mb-2 border-b">
            {items.length > 0 ? (
              <ul className="divide-y divide-slate-100">
                {items.map(it => (
                  <li key={it.variantId} className="py-1.5 flex items-center justify-between">
                    <span className="text-slate-700">
                      {it.title} ({it.size}) × {it.qty}
                    </span>
                    <span className="font-medium">{formatEuro(lineTotal(it))}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-slate-500">No items in basket.</p>
            )}
          </div>

          <div className="flex justify-between">
            <span>Start:</span>
            <span>{formatDateTime(state.startDateTime)}</span>
          </div>
          <div className="flex justify-between">
            <span>End:</span>
            <span>{formatDateTime(state.endDateTime)}</span>
          </div>
          <div className="space-y-1 pt-2 border-t">
            {taxIncluded ? (
              <>
                <div className="flex justify-between font-semibold text-lg">
                  <span>Total (incl. {taxLabel}):</span>
                  <span>{formatEuro(totals.total)}</span>
                </div>
                <div className="flex justify-between text-xs text-slate-500">
                  <span>of which {taxLabel}:</span>
                  <span>{formatEuro(totals.tax)}</span>
                </div>
              </>
            ) : (
              <>
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>{formatEuro(totals.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>{taxLabel}:</span>
                  <span>{formatEuro(totals.tax)}</span>
                </div>
                <div className="flex justify-between font-semibold text-lg">
                  <span>Total:</span>
                  <span>{formatEuro(totals.total)}</span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="border-t pt-4 space-y-3">
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-1">Cancellation Policy</h4>
          <p className="text-sm text-blue-800">
            {getCancellationPolicy()}
          </p>
        </div>

        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={state.customer.terms}
            onChange={(e) => handleTermsChange(e.target.checked)}
            className="mt-0.5 w-4 h-4 text-brand border border-slate-300 rounded focus:ring-brand focus:ring-2"
          />
          <span className="text-sm">
            I accept the{' '}
            {merchant?.terms_url ? (
              <a 
                href={merchant.terms_url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-brand hover:underline"
              >
                terms of service
              </a>
            ) : (
              <span className="text-brand">terms of service</span>
            )}{' '}
            and cancellation policy *
          </span>
        </label>
      </div>

      <div className="flex justify-between pt-4">
        <button className="btn btn-outline" onClick={prev}>
          Back
        </button>
        <button 
          className="btn btn-primary" 
          disabled={!canContinue()} 
          onClick={next}
        >
          Continue to payment
        </button>
      </div>
    </div>
  )
}

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

function validatePhone(phone) {
  return /^[+]?[\d\s().-]{7,}$/.test(phone)
}