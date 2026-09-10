'use client'
import { useEffect, useMemo, useState } from 'react'
import ExportMenu from './ExportMenu'
import { exportTable } from '../lib/tableExport'
import { LCC_EXPORT_COLUMNS } from '../lib/lifecycleCost'
import {
  filterLccDetailRows,
  sortLccDetailRows,
  uniqueLccTypes,
} from '../lib/lifecycleCost'

export default function LccCategoryDetail({
  title,
  color = '#E8960C',
  rows = [],
  onClose,
}) {
  const [query, setQuery] = useState('')
  const [searchOpen, setSearchOpen] = useState(false)
  const [filterOpen, setFilterOpen] = useState(false)
  const [typeFilter, setTypeFilter] = useState('')
  const [sortDir, setSortDir] = useState('desc')
  const types = useMemo(() => uniqueLccTypes(rows), [rows])
  const visible = useMemo(
    () => sortLccDetailRows(filterLccDetailRows(rows, query, typeFilter), sortDir),
    [rows, query, typeFilter, sortDir],
  )

  useEffect(() => {
    setQuery('')
    setSearchOpen(false)
    setFilterOpen(false)
    setTypeFilter('')
    setSortDir('desc')
  }, [title])

  function handleExport(format) {
    exportTable(format, {
      columns: LCC_EXPORT_COLUMNS,
      rows: visible.map(r => ({ ...r, cost: r.cost.toLocaleString() })),
      filename: 'lcc_detail',
      title,
    })
  }

  return (
    <aside
      className="flex flex-col gap-2.5 rounded-lg px-4 py-[17px] w-full overflow-hidden h-[240px]"
      style={{
        background: color,
        transition: 'background-color 0.35s ease',
      }}
    >
      <div className="flex items-center justify-between gap-2 shrink-0 w-full relative">
        <h3 className="text-base font-bold text-white truncate leading-normal min-w-0">
          {title}
        </h3>
        <div className="flex items-center gap-2 shrink-0">
          {searchOpen && (
            <input
              autoFocus
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="ค้นหา..."
              className="text-xs border-0 rounded-lg px-2 py-1 w-28 focus:outline-none"
            />
          )}
          <button
            type="button"
            onClick={() => { setFilterOpen(v => !v); setSearchOpen(false) }}
            className="bg-[#E5EDF5] rounded-lg p-1 size-6 inline-flex items-center justify-center"
            aria-label="กรอง"
            aria-expanded={filterOpen}
          >
            <span className="size-4 overflow-hidden shrink-0 inline-flex">
              <img src="/icons/flowbite-filter-outline.svg" alt="" className="w-full h-full" />
            </span>
          </button>
          <button
            type="button"
            onClick={() => { setSearchOpen(v => !v); setFilterOpen(false) }}
            className="bg-[#E5EDF5] rounded-lg p-1 size-6 inline-flex items-center justify-center"
            aria-label="ค้นหา"
          >
            <span className="size-4 overflow-hidden shrink-0 inline-flex">
              <img src="/icons/gg-search.svg" alt="" className="w-full h-full" />
            </span>
          </button>
          <ExportMenu onSelect={handleExport} />
          <button
            type="button"
            onClick={onClose}
            className="text-white/90 hover:text-white text-lg leading-none px-0.5"
            aria-label="ปิดรายละเอียด"
          >
            ×
          </button>
        </div>
        {filterOpen && (
          <div className="absolute right-0 top-8 z-10 bg-white rounded-lg shadow-lg p-2 min-w-[140px]">
            <button
              type="button"
              onClick={() => { setTypeFilter(''); setFilterOpen(false) }}
              className={`block w-full text-left text-xs px-2 py-1 rounded ${!typeFilter ? 'bg-[#E5EDF5] font-semibold' : 'hover:bg-egat-surface-alt'}`}
            >
              ทั้งหมด
            </button>
            {types.map(t => (
              <button
                key={t}
                type="button"
                onClick={() => { setTypeFilter(t); setFilterOpen(false) }}
                className={`block w-full text-left text-xs px-2 py-1 rounded ${typeFilter === t ? 'bg-[#E5EDF5] font-semibold' : 'hover:bg-egat-surface-alt'}`}
              >
                {t}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="bg-white rounded overflow-hidden flex flex-col flex-1 min-h-0 w-full">
        <div
          className="grid items-center gap-6 px-2 py-2 shrink-0 rounded-t border-b border-[#034EA2]"
          style={{
            background: '#FFE582',
            gridTemplateColumns: '1fr 1fr',
          }}
        >
          <div className="text-[#222] text-base font-bold text-center leading-tight">
            Item
          </div>
          <button
            type="button"
            onClick={() => setSortDir(d => (d === 'asc' ? 'desc' : 'asc'))}
            className="text-[#222] text-base font-bold text-center leading-tight border-l border-[#3571B5]"
            aria-label="เรียง Cost"
          >
            Cost
          </button>
        </div>
        <div className="overflow-y-auto overflow-x-hidden flex-1 min-h-0" key={title}>
          {visible.length === 0 ? (
            <p className="text-sm text-[#666] p-3">ไม่พบรายการ</p>
          ) : visible.map((r, i) => (
            <div
              key={r.id}
              className="health-detail-row grid items-center gap-6 px-2 py-2 w-full border-b border-[#3571B5]"
              style={{
                gridTemplateColumns: '1fr 1fr',
                animationDelay: `${Math.min(i, 8) * 28}ms`,
              }}
            >
              <span className="text-base text-[#222] truncate">{r.item}</span>
              <span className="text-base text-[#222] text-center border-l border-[#3571B5]">
                {r.cost.toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      </div>
    </aside>
  )
}
