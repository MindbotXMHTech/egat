'use client'
import { useMemo, useState } from 'react'

export function rulPercentColor(pct) {
  if (pct >= 65) return '#34C759'
  if (pct >= 40) return '#FFD537'
  return '#ED1A3B'
}

export function toAvgRulRows(fleet) {
  return fleet.map(f => ({
    id: f.id,
    rul: Number(f.rul) || 0,
    pct: Math.round(Number(f.health) || 0),
  }))
}

export function filterAvgRulRows(rows, query) {
  const q = (query || '').trim().toLowerCase()
  if (!q) return rows
  return rows.filter(r =>
    String(r.id).toLowerCase().includes(q) || String(r.pct).includes(q),
  )
}

export function sortAvgRulRows(rows, dir) {
  const copy = [...rows]
  copy.sort((a, b) => (dir === 'asc' ? a.rul - b.rul : b.rul - a.rul))
  return copy
}

export default function AvgRulCard({ rows = [], selectedId, onSelect, onViewTable }) {
  const [query, setQuery] = useState('')
  const [sortDir, setSortDir] = useState('desc')

  const visible = useMemo(
    () => sortAvgRulRows(filterAvgRulRows(rows, query), sortDir),
    [rows, query, sortDir],
  )

  return (
    <div className="bg-white rounded-lg p-4 mb-5 flex flex-col gap-4"
      style={{ boxShadow: '0 0 10px rgba(0,0,0,0.1)', height: 200 }}>
      <div className="flex flex-wrap items-center justify-between gap-3 shrink-0">
        <h2 className="text-base font-bold min-w-0 flex-1" style={{ color: '#034EA2' }}>
          Avg. Remaining Useful Life - RUL
        </h2>
        <div className="flex items-center gap-4">
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="🔍 ค้นหา..."
            className="text-xs border border-egat-border rounded-lg px-[13px] py-[8px] bg-white text-egat-text placeholder:text-[#9CA3AF] w-44 focus:outline-none focus:border-egat-navy"
          />
          {onViewTable && (
            <button
              type="button"
              onClick={onViewTable}
              className="text-sm px-3 py-1 rounded-lg border border-solid whitespace-nowrap"
              style={{ borderColor: '#FFCB05', color: '#034EA2', background: '#fff' }}
            >
              ดูตาราง
            </button>
          )}
          <button
            type="button"
            onClick={() => setSortDir(d => (d === 'desc' ? 'asc' : 'desc'))}
            className="flex items-center gap-2 px-2 py-1 rounded-lg text-sm whitespace-nowrap"
            style={{ background: '#E5EDF5', color: '#4E4E4E' }}
          >
            <span className="size-4 overflow-hidden shrink-0 inline-flex">
              <img
                src="/icons/arrow-upward.svg"
                alt=""
                className={`w-full h-full ${sortDir === 'asc' ? 'rotate-180' : ''}`}
              />
            </span>
            RUL
          </button>
        </div>
      </div>

      <div className="h-[127px] overflow-y-auto overflow-x-hidden w-full">
        {visible.length === 0 ? (
          <p className="text-sm text-egat-text-muted py-4 text-center">ไม่พบข้อมูล</p>
        ) : visible.map((row, i) => (
          <div key={row.id}>
            {i > 0 && <div className="border-t border-egat-border" />}
            <button
              type="button"
              onClick={() => onSelect?.(row.id)}
              className={`flex items-center justify-between w-full py-1 text-left ${selectedId === row.id ? 'bg-egat-surface-alt rounded' : ''}`}
            >
              <span className="text-base text-[#222] min-w-0 truncate">{row.id}</span>
              <span
                className="w-[108px] shrink-0 text-center text-base font-bold pr-12"
                style={{ color: rulPercentColor(row.pct) }}
              >
                {row.pct}%
              </span>
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
