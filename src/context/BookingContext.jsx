import React, { createContext, useContext, useReducer, useMemo, useCallback } from 'react'
    import { supabase } from '../lib/supabaseClient'
    import { formatDateTime, addDuration } from '../lib/time'
    import { calculateSubtotal, calculateTax, calculateTotal } from '../lib/tax'
    import { getLineItemPrice, buildPriceIndex } from '../lib/pricing'

    const BookingContext = createContext()

    const STEP_SEQUENCES = {
      default: [0, 1, 2, 3, 4, 5, 6, 7],
      immediate: [0, 1, 2, 5, 6, 7],
      reservation: [0, 1, 2, 3, 4, 5, 6, 7],
    }

    const initialState = {
      step: 0,
      loading: true,
      merchant: null,
      locationId: null,
      timing: null, // 'immediate' | 'reservation'
      durationId: null,
      startDateTime: null,
      endDateTime: null,
      date: null, // from DateStep
      time: null, // from TimeStep
      basket: {},
      customer: {
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        notes: '',
        terms: false
      },
      bookingRef: null,
      // Filters
      productFilter: 'all',
      sizeFilter: 'all',
      modelFilter: 'all',
      quantityFilter: 1,
      // Data from backend
      categories: [],
      products: [],
      locations: [],
      durations: [],
      priceIndex: { any: {}, loc: {} }
    }

    function bookingReducer(state, action) {
      switch (action.type) {
        case 'INITIALIZE_DATA':
          return {
            ...state,
            loading: false,
            merchant: action.payload.merchant,
            locations: action.payload.locations,
            durations: action.payload.durations,
            categories: action.payload.categories,
            products: action.payload.products,
            priceIndex: action.payload.priceIndex,
          };
        case 'SET_STEP':
          return { ...state, step: action.payload }
        case 'SET_LOCATION':
          return { ...state, locationId: action.payload, basket: {} }
        case 'SET_TIMING':
          return { ...state, timing: action.payload }
        case 'SET_DURATION':
          return { ...state, durationId: action.payload }
        case 'SET_DATE':
          return { ...state, date: action.payload, time: null, startDateTime: null, endDateTime: null }
        case 'SET_TIME':
          return {
            ...state,
            startDateTime: action.payload.start,
            endDateTime: action.payload.end,
            time: action.payload.label,
          }
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
        case 'SET_PRODUCT_FILTER':
          return { ...state, productFilter: action.payload, modelFilter: 'all' }
        case 'SET_SIZE_FILTER':
          return { ...state, sizeFilter: action.payload, modelFilter: 'all' }
        case 'SET_MODEL_FILTER':
          return { ...state, modelFilter: action.payload }
        case 'SET_QUANTITY_FILTER':
          return { ...state, quantityFilter: action.payload }
        default:
          return state
      }
    }

    export function BookingProvider({ children }) {
      const [state, dispatch] = useReducer(bookingReducer, initialState)

      const loadInitialData = useCallback(async (merchantId) => {
        const { data, error } = await supabase.rpc('get_bootstrap_data', {
          p_merchant_id: merchantId,
        });
        
        if (error) {
          console.error("Supabase bootstrap error:", error)
          throw new Error(error.message);
        }
        if (!data || !data.merchant) {
          throw new Error("No data returned for merchant.")
        }

        const priceIndex = buildPriceIndex(data.prices);

        dispatch({
          type: 'INITIALIZE_DATA',
          payload: { ...data, priceIndex },
        });
      }, []);

      const location = useMemo(() => 
        state.locations.find(l => l.id === state.locationId), 
        [state.locationId, state.locations]
      )

      const duration = useMemo(() => 
        state.durations.find(d => d.id === state.durationId), 
        [state.durationId, state.durations]
      )
      
      const totals = useMemo(() => {
        let totalAmount = 0
        
        for (const [variantId, qty] of Object.entries(state.basket)) {
          if (qty > 0) {
            const unitPrice = getLineItemPrice(
              variantId, 
              state.products, 
              state.durationId, 
              state.priceIndex, 
              state.locationId
            )
            totalAmount += unitPrice * qty
          }
        }

        const subtotal = calculateSubtotal(state.merchant, totalAmount)
        const tax = calculateTax(state.merchant, totalAmount)
        const total = calculateTotal(state.merchant, totalAmount)

        return { subtotal, tax, total }
      }, [state.basket, state.durationId, state.locationId, state.products, state.priceIndex, state.merchant])

      const stepSequence = useMemo(() => STEP_SEQUENCES[state.timing] || STEP_SEQUENCES.default, [state.timing])
      const currentStepIndex = useMemo(() => stepSequence.indexOf(state.step), [stepSequence, state.step])

      const setStep = useCallback((stepId) => {
        if (stepSequence.includes(stepId)) {
          dispatch({ type: 'SET_STEP', payload: stepId })
        }
      }, [stepSequence])

      const next = useCallback(() => {
        if (currentStepIndex < stepSequence.length - 1) {
          const nextStepId = stepSequence[currentStepIndex + 1]
          dispatch({ type: 'SET_STEP', payload: nextStepId })
        }
      }, [currentStepIndex, stepSequence])

      const prev = useCallback(() => {
        if (currentStepIndex > 0) {
          const prevStepId = stepSequence[currentStepIndex - 1]
          dispatch({ type: 'SET_STEP', payload: prevStepId })
        }
      }, [currentStepIndex, stepSequence])

      const value = {
        state,
        dispatch,
        loadInitialData,
        merchant: state.merchant,
        location,
        duration,
        totals,
        setStep,
        next,
        prev,
        formatDateTime,
        products: state.products,
        categories: state.categories,
        locations: state.locations,
        durations: state.durations,
        priceIndex: state.priceIndex
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