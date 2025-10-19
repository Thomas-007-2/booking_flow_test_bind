import React from 'react'

export default function QuantityFilter({ value = 1, onChange, min = 1, max = 20, label = 'Quantity' }) {
  const lo = Math.max(1, Math.floor(min))
  const hi = Math.max(lo, Math.floor(max))
  const options = []
  for (let i = lo; i <= hi; i++) options.push(i)

  return (
    <div className="flex items-center gap-2">
      <label className="label">{label}</label>
      <select
        className="field max-w-[120px]"
        value={value}
        onChange={e => onChange(parseInt(e.target.value, 10) || lo)}
      >
        {options.map(n => (
          <option key={n} value={n}>{n}</option>
        ))}
      </select>
    </div>
  )
}