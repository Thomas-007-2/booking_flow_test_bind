import React, { createContext, useContext, useReducer, useMemo } from 'react'
import { merchantConfig, locations, durations, categories, products, mockAvailability, mockPriceIndex } from '../data/config'
import { formatDateTime } from '../lib/time'
import { calculateSubtotal, calculateTax, calculateTotal } from '../lib/tax'
import { getLineItemPrice } from '../lib/pricing'

const BookingContext = createContext()

const initialState = {
  // Current step (0-based)
  step: 0,
  // Selected location
  locationId: null,
  // Booking timing preference
  timing: null, // 'immediate' | 'reservation'
  // Selected duration
  durationId: null,
  // Date and time selection
  startDateTime: null,
  endDateTime: null,
  // Shopping basket: { variantId: quantity }
  basket: {},
  // Customer information
  customer: {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    notes: '',
    terms: false
  },
  // Final booking reference
  bookingRef: null,
  // Data loaded from config
  categories: categories,
  products: products,
  locations: locations,
  durations: durations
}

function bookingReducer(state, action) {
  switch (action.type) {
    case 'SET_STEP':
      return { ...state, step: action.payload }
    case 'SET_LOCATION':
      return { ...state, locationId: action.payload, basket: {} }
    case 'SET_TIMING':
      return { ...state, timing: action.payload }
    case 'SET_DURATION':
      return { ...state, durationId: action.payload }
    case 'SET_START_TIME':
      return { ...state, startDateTime: action.payload }
    case 'SET_END_TIME':
      return { ...state, endDateTime: action.payload }
    case 'SET_VARIANT_QTY':
      const { variantId, qty } = action.payload
      const newBasket = { ...state.basket }
      if (qty <= 0) {
        delete newBasket[variantId]
      } else {
        newBasket[variantId] = qty
      }
      return { ...state, basket: newBasket }
    case 'SET_CUSTOMER_FIELD':
      return {
        ...state,
        customer: {
          ...state.customer,
          [action.payload.field]: action.payload.value
        }
      }
    case 'SET_TERMS':
      return {
        ...state,
        customer: {
          ...state.customer,
          terms: action.payload
        }
      }
    case 'SET_BOOKING_REF':
      return { ...state, bookingRef: action.payload }
    default:
      return state
  }
}

export function BookingProvider({ children }) {
  const [state, dispatch] = useReducer(bookingReducer, initialState)

  // Derived values
  const location = useMemo(() => 
    locations.find(l => l.id === state.locationId), 
    [state.locationId]
  )

  const duration = useMemo(() => 
    durations.find(d => d.id === state.durationId), 
    [state.durationId]
  )

  const merchant = merchantConfig

  // Calculate totals with configurable tax
  const totals = useMemo(() => {
    let totalAmount = 0
    
    for (const [variantId, qty] of Object.entries(state.basket)) {
      if (qty > 0) {
        const unitPrice = getLineItemPrice(
          variantId, 
          products, 
          state.durationId, 
          mockPriceIndex, 
          state.locationId
        )
        totalAmount += unitPrice * qty
      }
    }

    const subtotal = calculateSubtotal(totalAmount)
    const tax = calculateTax(totalAmount)
    const total = calculateTotal(totalAmount)

    return { subtotal, tax, total }
  }, [state.basket, state.durationId, state.locationId])

  // Navigation helpers
  const setStep = (step) => dispatch({ type: 'SET_STEP', payload: step })
  const next = () => dispatch({ type: 'SET_STEP', payload: state.step + 1 })
  const prev = () => dispatch({ type: 'SET_STEP', payload: Math.max(0, state.step - 1) })

  const value = {
    state,
    dispatch,
    location,
    duration,
    merchant,
    totals,
    setStep,
    next,
    prev,
    formatDateTime,
    // Mock data
    products,
    categories,
    locations,
    durations,
    availMap: mockAvailability,
    priceIndex: mockPriceIndex
  }

  return (
    <BookingContext.Provider value={value}>
      {children}
    </BookingContext.Provider>
  )
}

export function useBooking() {
  const context = useContext(BookingContext)
  if (!context) {
    throw new Error('useBooking must be used within a BookingProvider')
  }
  return context
}