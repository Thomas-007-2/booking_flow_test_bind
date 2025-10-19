import React from 'react'

export default function Filters({ categories, value, onChange, label = 'Filter products' }) {
  return (
    <div className="flex items-center gap-2">
      <label className="label">{label}</label>
      <select className="field max-w-xs" value={value} onChange={e => onChange(e.target.value)}>
        <option value="all">All</option>
        {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
      </select>
    </div>
  )
}