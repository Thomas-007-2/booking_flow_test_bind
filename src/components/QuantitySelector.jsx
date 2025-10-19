import React from 'react'

export default function QuantitySelector({ value = 0, onChange, max }) {
  const safeMax = Number.isFinite(max) && max > 0 ? Math.floor(max) : 0
  const safeValue = Math.min(Math.max(Number.isFinite(value) ? value : 0, 0), safeMax)

  const dec = () => onChange(Math.max(0, safeValue - 1))
  const inc = () => onChange(Math.min(safeMax, safeValue + 1))

  return (
    <div className="inline-flex items-center rounded-md border border-slate-300 overflow-hidden">
      <button
        className="px-2 py-1 hover:bg-slate-100 disabled:opacity-50"
        onClick={dec}
        disabled={safeValue <= 0}
        aria-label="Decrease quantity"
      >
        -
      </button>
      <div className="px-3 py-1 min-w-[2rem] text-center">{safeValue}</div>
      <button
        className="px-2 py-1 hover:bg-slate-100 disabled:opacity-50"
        onClick={inc}
        disabled={safeValue >= safeMax}
        aria-label="Increase quantity"
        title={safeValue >= safeMax ? 'Max available reached' : undefined}
      >
        +
      </button>
    </div>
  )
}