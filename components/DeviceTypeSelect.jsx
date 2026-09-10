'use client'
import { ASSET_TYPES } from '../lib/anomalyFilters'

export default function DeviceTypeSelect({ value, onChange, id }) {
  return (
    <select
      id={id}
      value={value}
      onChange={e => onChange(e.target.value)}
      className="text-xs border border-egat-border rounded-lg px-3 py-1.5 bg-egat-surface text-egat-text focus:outline-none focus:border-egat-navy"
      aria-label="Device type"
    >
      <option value="">ทุกประเภท</option>
      {ASSET_TYPES.map(t => (
        <option key={t} value={t}>{t}</option>
      ))}
    </select>
  )
}
