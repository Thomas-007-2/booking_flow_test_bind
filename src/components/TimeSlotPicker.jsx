import React from 'react'
import classNames from 'classnames'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export default function TimeSlotPicker({ slots, selected, onSelect, pageSize = 12 }) {
  if (!slots) return null

  const total = slots.length
  const [page, setPage] = React.useState(0)

  // Reset page when data set changes
  React.useEffect(() => {
    setPage(0)
  }, [total])

  // Ensure selected item is visible
  React.useEffect(() => {
    if (!slots || !selected) return
    const idx = slots.findIndex(s => s.label === selected)
    if (idx >= 0) {
      const targetPage = Math.floor(idx / pageSize)
      setPage(p => (p === targetPage ? p : targetPage))
    }
  }, [slots, selected, pageSize])

  if (total === 0) {
    return (
      <div className="p-4 border border-amber-300 bg-amber-50 rounded-md text-amber-800">
        No times available. Try another date or change duration.
      </div>
    )
  }

  const pageCount = Math.max(1, Math.ceil(total / pageSize))
  const startIdx = page * pageSize
  const visible = slots.slice(startIdx, startIdx + pageSize)

  const canPrev = page > 0
  const canNext = page < pageCount - 1

  function prevPage() {
    setPage(p => Math.max(0, p - 1))
  }
  function nextPage() {
    setPage(p => Math.min(pageCount - 1, p + 1))
  }

  return (
    <div>
      <div className="relative">
        {/* Left Arrow */}
        <button
          onClick={prevPage}
          disabled={!canPrev}
          aria-label="Earlier times"
          title="Earlier times"
          className={classNames(
            'absolute left-0 top-1/2 -translate-y-1/2 p-1 sm:p-2 bg-transparent text-slate-600 hover:text-brand transition',
            !canPrev && 'opacity-30 cursor-not-allowed'
          )}
        >
          <ChevronLeft size={32} />
        </button>

        {/* Grid with padding to avoid overlap under arrows */}
        <div className="px-10 sm:px-12">
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
            {visible.map(s => {
              const disabled = (s.available ?? 0) <= 0
              const isSelected = selected === s.label
              return (
                <button
                  key={s.label}
                  disabled={disabled}
                  onClick={() => onSelect(s)}
                  className={classNames(
                    'px-3 py-2 rounded-full border text-sm font-medium transition-colors',
                    isSelected
                      ? 'bg-brand text-white border-brand'
                      : 'bg-white hover:bg-slate-50 border-slate-300 text-slate-800',
                    disabled && 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed hover:bg-slate-100'
                  )}
                >
                  {s.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Right Arrow */}
        <button
          onClick={nextPage}
          disabled={!canNext}
          aria-label="Later times"
          title="Later times"
          className={classNames(
            'absolute right-0 top-1/2 -translate-y-1/2 p-1 sm:p-2 bg-transparent text-slate-600 hover:text-brand transition',
            !canNext && 'opacity-30 cursor-not-allowed'
          )}
        >
          <ChevronRight size={32} />
        </button>
      </div>

      {/* Range indicator */}
      <div className="mt-2 text-center text-xs text-slate-500">
        {startIdx + 1}-{Math.min(startIdx + visible.length, total)} of {total}
      </div>
    </div>
  )
}