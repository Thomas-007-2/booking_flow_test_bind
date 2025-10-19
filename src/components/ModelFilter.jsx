import React from 'react'

export default function ModelFilter({ options = [], value, onChange, label = 'Model' }) {
  return (
    <div className="flex items-center gap-2">
      <label className="label">{label}</label>
      <select
        className="field max-w-xs"
        value={value}
        onChange={e => onChange(e.target.value)}
      >
        <option value="all">All models</option>
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  )
}