'use client'
import { useMemo, useState } from 'react'
import { filterRcaDetailRows, RCA_PIE_EXPORT_COLUMNS } from '../lib/rcaDistribution'
import ExportMenu from './ExportMenu'
import { exportTable } from '../lib/tableExport'

export default function RcaCategoryDetail({
  title,
  rows = [],
  onClose,
  onSelectRow,
}) {
  const [query, setQuery] = useState('')
  const [searchOpen, setSearchOpen] = useState(false)
  const visible = useMemo(() => filterRcaDetailRows(rows, query), [rows, query])

  function handleExport(format) {
    exportTable(format, {
      columns: RCA_PIE_EXPORT_COLUMNS,
      rows: visible,
      filename: 'rca_category_detail',
      title,
    })
  }

  return (
    <div className="flex flex-col gap-2.5 min-w-0 h-[256px]">
      <div className="flex items-start justify-between gap-2 shrink-0 w-full">
        <h3 className="text-base font-bold text-[#1A202C] truncate leading-normal min-w-0">
          {title}
        </h3>
        <div className="flex items-center gap-1.5 shrink-0">
          {searchOpen && (
            <input
              autoFocus
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="ค้นหา..."
              className="text-xs border border-egat-border rounded-lg px-2 py-1 w-36 focus:outline-none focus:border-egat-navy"
            />
          )}
          <ExportMenu variant="compact" onSelect={handleExport} />
          <button
            type="button"
            onClick={() => setSearchOpen(v => !v)}
            className="bg-[#E5EDF5] rounded-lg p-1 size-8 inline-flex items-center justify-center"
            aria-label="ค้นหา"
          >
            <span className="size-4 overflow-hidden shrink-0 inline-flex">
              <img src="/icons/gg-search.svg" alt="" className="w-full h-full" />
            </span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="text-[#8896A4] hover:text-[#1A202C] text-lg leading-none px-1"
            aria-label="ปิดรายละเอียด"
          >
            ×
          </button>
        </div>
      </div>

      <div className="bg-white rounded overflow-hidden flex flex-col flex-1 min-h-0 w-full">
        <div
          className="grid items-center gap-6 px-2 py-2 shrink-0 rounded-t"
          style={{
            background: '#034EA2',
            gridTemplateColumns: '85px minmax(90px,0.8fr) minmax(0,1fr)',
          }}
        >
          <div className="text-white text-base font-bold text-center leading-tight">
            Issue<br />Category
          </div>
          <div className="text-white text-base font-bold text-center leading-tight border-l border-white/40 pl-2">
            Occurrence rate
          </div>
          <div className="text-white text-base font-bold leading-tight border-l border-white/40 pl-2">
            Description
          </div>
        </div>
        <div className="overflow-y-auto overflow-x-hidden flex-1 min-h-0">
          {visible.length === 0 ? (
            <p className="text-sm text-[#666] p-3">ไม่พบรายการ</p>
          ) : visible.map(r => (
            <button
              key={r.id}
              type="button"
              onClick={() => onSelectRow?.(r.id)}
              className="grid items-center gap-6 px-2 py-2 w-full text-left border-b border-[#3571B5] hover:bg-[#E5EDF5]/50"
              style={{ gridTemplateColumns: '85px minmax(90px,0.8fr) minmax(0,1fr)' }}
            >
              <span className="text-base text-[#222] text-center font-mono">{r.issue}</span>
              <span className="text-base text-[#222] text-center border-l border-[#3571B5]">{r.rate}</span>
              <span className="text-base text-[#222] min-w-0 break-words border-l border-[#3571B5] pl-2">{r.description}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
