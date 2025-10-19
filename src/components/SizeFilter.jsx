import React from 'react'

export default function SizeFilter({ sizes = ['S', 'M', 'L'], value, onChange, label = 'Size' }) {
  return (
    <div className="flex items-center gap-2">
      <label className="label">{label}</label>
      <select className="field max-w-xs" value={value} onChange={e => onChange(e.target.value)}>
        <option value="all">All sizes</option>
        {sizes.map(s => <option key={s} value={s}>{s}</option>)}
      </select>
    </div>
  )
}