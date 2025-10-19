import React, { useState, useEffect, useMemo } from 'react'
import Calendar from '../components/Calendar'
import { useBooking } from '../context/BookingContext'
import { startOfToday, startOfMonth, endOfMonth, eachDayOfInterval, format, startOfDay, addDays } from 'date-fns'
import Filters from '../components/Filters'
import SizeFilter from '../components/SizeFilter'
import ModelFilter from '../components/ModelFilter'
import QuantityFilter from '../components/QuantityFilter'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { supabase } from '../lib/supabaseClient'

export default function DateStep() {
  const { state, dispatch, prev, next, location, duration, categories, merchant, products } = useBooking()
  const today = startOfToday()
  const current = state.date || today

  const [view, setView] = useState(startOfMonth(current))
  const [statusByDate, setStatusByDate] = useState({})
  const [isFilterVisible, setIsFilterVisible] = useState(false)
  const [loading, setLoading] = useState(false)

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

  // Reset model filter if it becomes invalid for current filters/location
  useEffect(() => {
    if (state.modelFilter !== 'all') {
      const stillExists = modelOptions.some(o => o.value === state.modelFilter)
      if (!stillExists) {
        dispatch({ type: 'SET_MODEL_FILTER', payload: 'all' })
      }
    }
  }, [modelOptions, state.modelFilter, dispatch])

  useEffect(() => {
    if (!location || !duration || !merchant) {
      setStatusByDate({})
      return
    }

    setLoading(true)
    const start = startOfMonth(view)
    const end = endOfMonth(view)
    const days = eachDayOfInterval({ start, end })

    const promises = days.map(async (day) => {
      const dayStart = startOfDay(day)
      const dayEnd = addDays(dayStart, 1) // [dayStart, next day)

      const { data, error } = await supabase.rpc('get_location_availability_summary', {
        p_merchant_id: merchant.id,
        p_location_id: location.id,
        p_start_time: dayStart.toISOString(),
        p_end_time: dayEnd.toISOString(),
        p_category_id: state.productFilter === 'all' ? null : state.productFilter,
        p_size_filter: state.sizeFilter === 'all' ? null : state.sizeFilter
      })

      const key = format(day, 'yyyy-MM-dd')

      if (error) {
        console.warn('[DateStep] availability summary RPC error for', key, error)
        return { date: key, status: 'none' }
      }

      const minQty = Math.max(1, Number(state.quantityFilter) || 1)
      let status = 'none'

      if (state.modelFilter !== 'all') {
        const row = (data || []).find(r => r.product_id === state.modelFilter)
        const total = Number(row?.total_available ?? 0)
        status = total >= minQty ? 'avail' : 'none'
      } else {
        const total = (data || []).reduce((sum, r) => sum + Number(r.total_available || 0), 0)
        status = total >= minQty ? 'avail' : 'none'
      }

      return { date: key, status }
    })

    Promise.all(promises).then(results => {
      const newStatusMap = results.reduce((acc, item) => {
        if (!item) return acc
        acc[item.date] = item.status
        return acc
      }, {})
      setStatusByDate(newStatusMap)
      setLoading(false)
    })

  }, [view, location, duration, state.productFilter, state.sizeFilter, state.modelFilter, state.quantityFilter, merchant])

  function onSelect(d) {
    dispatch({ type: 'SET_DATE', payload: d })
  }

  return (
    <div className="space-y-3 md:space-y-4">
      <h2 className="text-lg md:text-xl font-semibold">Pick a start date</h2>

      <div>
        {!isFilterVisible ? (
          <button
            onClick={() => setIsFilterVisible(true)}
            className="text-sm text-brand hover:underline flex items-center gap-1"
          >
            <ChevronDown size={16} />
            <span>Optional: filter availability for a specific bike</span>
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
            <div className="flex flex-wrap gap-3 md:gap-4 items-center">
              <Filters
                categories={visibleCategories}
                value={state.productFilter}
                onChange={(v) => dispatch({ type: 'SET_PRODUCT_FILTER', payload: v })}
                label="Category"
              />
              <ModelFilter
                options={modelOptions}
                value={state.modelFilter}
                onChange={(v) => dispatch({ type: 'SET_MODEL_FILTER', payload: v })}
                label="Model"
              />
              <SizeFilter
                sizes={ALL_SIZES}
                value={state.sizeFilter}
                onChange={(v) => dispatch({ type: 'SET_SIZE_FILTER', payload: v })}
                label="Size"
              />
              <QuantityFilter
                value={state.quantityFilter}
                onChange={(n) => dispatch({ type: 'SET_QUANTITY_FILTER', payload: n })}
                label="Quantity"
              />
            </div>
          </div>
        )}
      </div>

      {loading && <div className="text-center p-4">Checking availability...</div>}
      <Calendar
        value={state.date}
        onChange={onSelect}
        view={view}
        onViewChange={(v) => setView(startOfMonth(v))}
        statusByDate={statusByDate}
      />

      <div className="flex justify-between">
        <button className="btn btn-outline" onClick={prev}>Back</button>
        <button className="btn btn-primary" disabled={!state.date} onClick={next}>Continue</button>
      </div>
    </div>
  )
}