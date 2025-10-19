import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react'
    import { useBooking } from '../context/BookingContext'
    import { startOfToday } from 'date-fns'
    import Filters from '../components/Filters'
    import SizeFilter from '../components/SizeFilter'
    import ModelFilter from '../components/ModelFilter'
    import QuantityFilter from '../components/QuantityFilter'
    import TimeSlotPicker from '../components/TimeSlotPicker'
    import { formatDate, generateStartGrid, addDuration, canEndWithinHours, formatTime } from '../lib/time'
    import { ChevronDown, ChevronUp } from 'lucide-react'
    import { supabase } from '../lib/supabaseClient'

    const MAX_RETRIES = 3;
    const RETRY_DELAY_MS = 750;

    export default function TimeStep() {
      const { state, dispatch, prev, next, location, duration, categories, merchant, products } = useBooking()
      const date = state.timing === 'immediate' ? startOfToday() : state.date || startOfToday()
      const [slots, setSlots] = useState([])
      const [loading, setLoading] = useState(false)
      const [error, setError] = useState(null);

      // Ref to track component liveness to prevent state updates on unmounted components
      const aliveRef = useRef(true);
      useEffect(() => {
        aliveRef.current = true;
        return () => {
          aliveRef.current = false;
        };
      }, []);

      const isAnyFilterActive = state.productFilter !== 'all' || state.modelFilter !== 'all' || state.sizeFilter !== 'all' || (Number(state.quantityFilter) || 1) > 1
      const [isFilterVisible, setIsFilterVisible] = useState(isAnyFilterActive)
      useEffect(() => {
        setIsFilterVisible(isAnyFilterActive)
        // eslint-disable-next-line react-hooks/exhaustive-deps
      }, [state.productFilter, state.modelFilter, state.sizeFilter, state.quantityFilter])

      const visibleCategories = useMemo(() => categories.filter(c => !c.is_hidden), [categories])
      const ALL_SIZES = ['S', 'M', 'L', 'std']

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

      useEffect(() => {
        if (state.modelFilter !== 'all') {
          const stillExists = modelOptions.some(o => o.value === state.modelFilter)
          if (!stillExists) {
            dispatch({ type: 'SET_MODEL_FILTER', payload: 'all' })
          }
        }
      }, [modelOptions, state.modelFilter, dispatch])

      const fetchSlotsWithRetries = useCallback(async () => {
        if (!location || !duration || !merchant) return;
        if (aliveRef.current) { setLoading(true); setError(null); }

        try {
          const minStart = state.timing === 'immediate' ? new Date() : null;
          const starts = generateStartGrid(date, location, undefined, minStart);

          if (starts.length === 0) {
            if (aliveRef.current) { setSlots([]); }
            return;
          }

          const grid = starts.map(start => {
            const end = addDuration(start, duration);
            const valid = canEndWithinHours(location, start, end);
            return { label: formatTime(start), start, end, valid, available: 0 };
          });
          
          const payload = {
            p_merchant_id: merchant.id,
            p_location_id: location.id,
            p_start_time: grid[0].start.toISOString(),
            p_end_time: grid[grid.length - 1].end.toISOString(),
            p_category_id: state.productFilter === 'all' ? null : state.productFilter,
            p_size_filter: state.sizeFilter === 'all' ? null : state.sizeFilter
          };

          for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
            const { data, error: rpcError } = await supabase.rpc('get_location_availability_summary', payload);

            if (!rpcError) {
              const minQty = Math.max(1, Number(state.quantityFilter) || 1);
              let passes = false;
              if (state.modelFilter !== 'all') {
                const row = (data || []).find(r => r.product_id === state.modelFilter);
                passes = Number(row?.total_available ?? 0) >= minQty;
              } else {
                const total = (data || []).reduce((sum, r) => sum + Number(r.total_available || 0), 0);
                passes = total >= minQty;
              }
              if (aliveRef.current) {
                setSlots(grid.map(s => ({ ...s, available: s.valid && passes ? 1 : 0 })));
              }
              return; // Success, exit loop
            }

            console.warn(`[TimeStep] Availability fetch attempt ${attempt} failed:`, rpcError?.message || rpcError);
            if (attempt === MAX_RETRIES) {
              console.error("[TimeStep] All retry attempts failed.");
              if (aliveRef.current) {
                setError("Could not load available times. Please try again later.");
                setSlots(grid.map(s => ({ ...s, available: 0 }))); // Show all as unavailable
              }
              break; // Exit loop after final attempt
            }
            await new Promise(res => setTimeout(res, RETRY_DELAY_MS));
          }
        } catch (e) {
          console.error('[TimeStep] Unexpected error while loading slots:', e);
          if (aliveRef.current) {
            setError("Could not load available times. Please try again.");
            setSlots([]);
          }
        } finally {
          if (aliveRef.current) setLoading(false);
        }
      }, [date, location, duration, state.productFilter, state.sizeFilter, state.modelFilter, state.quantityFilter, state.timing, merchant, dispatch]);

      useEffect(() => {
        fetchSlotsWithRetries();
      }, [fetchSlotsWithRetries]);

      function onSelect(slot) {
        if (!slot.valid || (slot.available ?? 0) <= 0) return
        dispatch({
          type: 'SET_TIME',
          payload: {
            start: slot.start,
            end: slot.end,
            label: slot.label
          }
        })
      }

      return (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Select a start time</h2>
          <p className="text-slate-600">Date: <span className="font-medium">{formatDate(date)}</span></p>

          <div>
            {!isFilterVisible ? (
              <button onClick={() => setIsFilterVisible(true)} className="text-sm text-brand hover:underline flex items-center gap-1">
                <ChevronDown size={16} />
                <span>Optional: filter availability for a specific bike</span>
              </button>
            ) : (
              <div className="p-4 border border-slate-200 rounded-lg bg-slate-50 space-y-3">
                <button onClick={() => setIsFilterVisible(false)} className="text-sm text-brand hover:underline flex items-center gap-1 mb-2">
                  <ChevronUp size={16} />
                  <span>Hide filters</span>
                </button>
                <div className="flex flex-wrap gap-4 items-center">
                  <Filters categories={visibleCategories} value={state.productFilter} onChange={(v) => dispatch({ type: 'SET_PRODUCT_FILTER', payload: v })} label="Category" />
                  <ModelFilter options={modelOptions} value={state.modelFilter} onChange={(v) => dispatch({ type: 'SET_MODEL_FILTER', payload: v })} label="Model" />
                  <SizeFilter sizes={ALL_SIZES} value={state.sizeFilter} onChange={(v) => dispatch({ type: 'SET_SIZE_FILTER', payload: v })} label="Size" />
                  <QuantityFilter value={state.quantityFilter} onChange={(n) => dispatch({ type: 'SET_QUANTITY_FILTER', payload: n })} label="Quantity" />
                </div>
              </div>
            )}
          </div>

          <div className="card p-4">
            {loading ? (
              <p className="text-center text-slate-600">Loading slots…</p>
            ) : error ? (
              <div className="p-4 border border-red-300 bg-red-50 rounded-md text-red-800 text-center">
                {error}
              </div>
            ) : (
              <TimeSlotPicker slots={slots} selected={state.time} onSelect={onSelect} pageSize={12} />
            )}
          </div>

          <div className="flex justify-between">
            <button className="btn btn-outline" onClick={prev}>Back</button>
            <button className="btn btn-primary" disabled={!state.time} onClick={next}>Continue</button>
          </div>
        </div>
      )
    }