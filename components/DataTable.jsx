'use client'
import { useState, useMemo } from 'react'
import ExportMenu from './ExportMenu'
import { exportTable } from '../lib/tableExport'

/**
 * DataTable — reusable table with:
 *   - Column show/hide toggle
 *   - Per-column search / global search
 *   - Row count selector
 *   - Pagination
 *   - Export CSV / Excel / PDF / XML
 *   - Row detail modal (via onRowClick prop)
 *
 * Props:
 *   columns  : [{ key, label, render?, sortable? }]
 *   data     : array of row objects
 *   onRowClick : (row) => void   — extra row-click handler (runs even when rowDetail opens a modal)
 *   rowDetail  : (row) => JSX    — modal body; if provided, clicking a row shows built-in modal
 *   title    : string
 *   exportName : string (filename without extension)
 *   variant  : 'default' | 'sheet'  — sheet matches Figma data-grid (navy borders, footer)
 *   hideDetailColumn : hide the trailing "ดู" column while keeping row clicks
 */
export default function DataTable({
  columns = [],
  data = [],
  onRowClick,
  rowDetail,
  title = 'Data',
  exportName = 'export',
  variant = 'default',
  hideDetailColumn = false,
  defaultSortKey = null,
  defaultSortDir = 'asc',
}) {
  const sheet = variant === 'sheet'
  const showDetailCol = !hideDetailColumn && !!(rowDetail || onRowClick)
  const rowOpts = sheet ? [10, 25, 50] : [5, 10, 20, 50]

  const [search,    setSearch]    = useState('')
  const [rowCount,  setRowCount]  = useState(10)
  const [page,      setPage]      = useState(1)
  const [colFilters,setColFilters]= useState({})
  const [hiddenCols,setHiddenCols]= useState({})
  const [sortKey,   setSortKey]   = useState(defaultSortKey)
  const [sortDir,   setSortDir]   = useState(defaultSortDir)
  const [showColMenu, setShowColMenu] = useState(false)
  const [modalRow,  setModalRow]  = useState(null)

  const visibleCols = columns.filter(c => !hiddenCols[c.key])
  const colSpan = visibleCols.length + (showDetailCol ? 1 : 0)

  // filter + sort
  const filtered = useMemo(() => {
    let rows = data
    // global search
    if (search) {
      const q = search.toLowerCase()
      rows = rows.filter(r => visibleCols.some(c => String(r[c.key] ?? '').toLowerCase().includes(q)))
    }
    // column filters
    Object.entries(colFilters).forEach(([k, v]) => {
      if (v) rows = rows.filter(r => String(r[k] ?? '').toLowerCase().includes(v.toLowerCase()))
    })
    // sort
    if (sortKey) {
      rows = [...rows].sort((a, b) => {
        const av = a[sortKey] ?? '', bv = b[sortKey] ?? ''
        const cmp = isNaN(av) ? String(av).localeCompare(String(bv)) : Number(av) - Number(bv)
        return sortDir === 'asc' ? cmp : -cmp
      })
    }
    return rows
  }, [data, search, colFilters, sortKey, sortDir, visibleCols])

  const totalPages = Math.max(1, Math.ceil(filtered.length / rowCount))
  const pageRows   = filtered.slice((page - 1) * rowCount, page * rowCount)
  const rangeStart = filtered.length === 0 ? 0 : (page - 1) * rowCount + 1
  const rangeEnd   = Math.min(page * rowCount, filtered.length)

  function handleSort(key) {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir('asc') }
  }

  function handleReset() {
    setSearch(''); setColFilters({}); setSortKey(defaultSortKey); setSortDir(defaultSortDir); setPage(1)
  }

  function handleExport(format) {
    exportTable(format, {
      columns: visibleCols,
      rows: filtered,
      filename: exportName,
      title,
    })
  }

  function handleRowClick(row) {
    if (rowDetail) setModalRow(row)
    if (onRowClick) onRowClick(row)
  }

  function vBorder(isLast) {
    if (!sheet) return ''
    if (isLast && !showDetailCol) return ''
    return 'border-r border-[#3571B5]'
  }

  return (
    <div>
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2 mb-3">
        {/* Global search */}
        <input
          value={search} onChange={e => { setSearch(e.target.value); setPage(1) }}
          placeholder="🔍 ค้นหา..."
          className="text-xs border border-egat-border rounded-lg px-3 py-1.5 bg-egat-surface focus:outline-none focus:border-egat-navy w-44"
        />

        {/* Row count */}
        <select value={rowCount} onChange={e => { setRowCount(+e.target.value); setPage(1) }}
          className="text-xs border border-egat-border rounded-lg px-2 py-1.5 bg-egat-surface focus:outline-none">
          {rowOpts.map(n => <option key={n} value={n}>{n} แถว</option>)}
        </select>

        {/* Column toggle */}
        <div className="relative">
          <button onClick={() => setShowColMenu(v => !v)}
            className="text-xs border border-egat-border rounded-lg px-3 py-1.5 bg-egat-surface hover:border-egat-navy transition-colors">
            คอลัมน์ ▾
          </button>
          {showColMenu && (
            <div className="absolute z-50 top-9 left-0 bg-white border border-egat-border rounded-xl shadow-card-md p-3 min-w-[180px]">
              {columns.map(c => (
                <label key={c.key} className="flex items-center gap-2 text-xs py-1 cursor-pointer hover:text-egat-navy">
                  <input type="checkbox" checked={!hiddenCols[c.key]}
                    onChange={() => setHiddenCols(h => ({ ...h, [c.key]: !h[c.key] }))}
                    className="accent-egat-navy" />
                  {c.label}
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Reset */}
        <button onClick={handleReset}
          className="text-xs border border-egat-border rounded-lg px-3 py-1.5 bg-egat-surface hover:border-egat-navy transition-colors">
          Reset
        </button>

        <div className="ml-auto">
          <ExportMenu onSelect={handleExport} />
        </div>

        {/* Count */}
        <span className="text-[10px] text-egat-text-muted whitespace-nowrap">
          {filtered.length} รายการ
        </span>
      </div>

      {/* Table */}
      <div
        className={sheet
          ? 'overflow-x-auto'
          : 'overflow-x-auto rounded-xl border border-egat-border'}
        onClick={() => setShowColMenu(false)}>
        <div className={sheet ? 'max-h-[348px] overflow-y-auto' : undefined}>
          <table className={sheet ? 'w-full min-w-[800px] text-base border-collapse' : 'w-full text-xs min-w-[600px]'}>
            <thead className={sheet ? 'bg-[#F7FAFC] sticky top-0 z-10' : 'bg-egat-surface-alt'}>
              <tr>
                {visibleCols.map((c, ci) => (
                  <th key={c.key}
                    className={sheet
                      ? `pb-0 text-center border-b border-[#3571B5] ${vBorder(ci === visibleCols.length - 1)}`
                      : 'pb-0 text-left border-b border-egat-border'}>
                    <div className={`px-3 pt-2 pb-1 flex items-center gap-1 ${sheet ? 'justify-center' : ''}`}>
                      <button
                        className={`font-semibold uppercase tracking-wider text-[10px] flex items-center gap-1 ${c.sortable !== false ? 'hover:text-egat-navy cursor-pointer' : 'cursor-default'}`}
                        style={{ color: '#8896A4' }}
                        onClick={() => c.sortable !== false && handleSort(c.key)}>
                        {c.label}
                        {c.sortable !== false && sortKey === c.key && (
                          <span className="text-egat-navy">{sortDir === 'asc' ? '↑' : '↓'}</span>
                        )}
                      </button>
                    </div>
                    {/* per-column filter */}
                    <div className="px-2 pb-2">
                      <input
                        value={colFilters[c.key] || ''}
                        onChange={e => { setColFilters(f => ({ ...f, [c.key]: e.target.value })); setPage(1) }}
                        placeholder="กรอง..."
                        className="w-full text-[10px] border border-egat-border-lt rounded px-1.5 py-0.5 bg-white focus:outline-none focus:border-egat-navy"
                        onClick={e => e.stopPropagation()}
                      />
                    </div>
                  </th>
                ))}
                {showDetailCol && (
                  <th className={sheet
                    ? 'px-3 pb-2 text-center text-[10px] font-semibold uppercase tracking-wider border-b border-[#3571B5]'
                    : 'px-3 pb-2 text-left text-[10px] font-semibold uppercase tracking-wider'}
                    style={{ color:'#8896A4' }}>
                    รายละเอียด
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {pageRows.length === 0 ? (
                <tr><td colSpan={colSpan} className="text-center py-8 text-egat-text-muted text-xs">ไม่พบข้อมูล</td></tr>
              ) : pageRows.map((row, ri) => (
                <tr key={ri}
                  className={`${sheet ? 'border-b border-[#3571B5] hover:bg-[#E5EDF5]/50' : 'border-b border-egat-border-lt hover:bg-egat-surface-alt'} transition-colors ${(rowDetail || onRowClick) ? 'cursor-pointer' : ''}`}
                  onClick={() => handleRowClick(row)}>
                  {visibleCols.map((c, ci) => (
                    <td key={c.key} className={sheet
                      ? `px-2 py-2 text-base text-[#222] ${c.align === 'left' ? 'text-left' : 'text-center'} ${vBorder(ci === visibleCols.length - 1)}`
                      : 'px-3 py-2.5'}>
                      {c.render ? c.render(row[c.key], row) : String(row[c.key] ?? '-')}
                    </td>
                  ))}
                  {showDetailCol && (
                    <td className={sheet ? 'px-3 py-2 text-center' : 'px-3 py-2.5'}>
                      <button className="text-[10px] px-2 py-0.5 rounded border border-egat-navy text-egat-navy hover:bg-egat-navy hover:text-white transition-colors">
                        ดู
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {sheet ? (
        <div className="flex items-center justify-end gap-8 pt-4 text-base text-[#034EA2]">
          <label className="inline-flex items-center gap-2">
            <span>Rows per page:</span>
            <span className="relative inline-flex items-center">
              <select
                value={rowCount}
                onChange={e => { setRowCount(+e.target.value); setPage(1) }}
                className="appearance-none bg-transparent pr-5 text-base text-[#034EA2] focus:outline-none cursor-pointer"
                aria-label="Rows per page"
              >
                {rowOpts.map(n => <option key={n} value={n}>{n}</option>)}
              </select>
              <span className="pointer-events-none absolute right-0 size-4 overflow-hidden inline-flex">
                <img src="/icons/arrow-drop-down.svg" alt="" className="w-full h-full" />
              </span>
            </span>
          </label>
          <span className="whitespace-nowrap">
            {rangeStart} - {rangeEnd} of {filtered.length}
          </span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              aria-label="Previous page"
              className="size-8 inline-flex items-center justify-center disabled:opacity-40"
            >
              <span className="size-5 overflow-hidden inline-flex -rotate-90 -scale-y-100">
                <img src="/icons/keyboard-arrow-down.svg" alt="" className="w-full h-full" />
              </span>
            </button>
            <button
              type="button"
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              aria-label="Next page"
              className="size-8 inline-flex items-center justify-center disabled:opacity-40"
            >
              <span className="size-5 overflow-hidden inline-flex -rotate-90">
                <img src="/icons/keyboard-arrow-down.svg" alt="" className="w-full h-full" />
              </span>
            </button>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between mt-3">
          <span className="text-[10px] text-egat-text-muted">
            หน้า {page} / {totalPages} · แสดง {Math.min(rowCount, pageRows.length)} จาก {filtered.length}
          </span>
          <div className="flex gap-1">
            <button onClick={() => setPage(1)} disabled={page === 1}
              className="text-[10px] px-2 py-1 rounded border border-egat-border disabled:opacity-40 hover:border-egat-navy transition-colors">«</button>
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              className="text-[10px] px-2 py-1 rounded border border-egat-border disabled:opacity-40 hover:border-egat-navy transition-colors">‹</button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const p = Math.max(1, Math.min(totalPages - 4, page - 2)) + i
              return (
                <button key={p} onClick={() => setPage(p)}
                  className={`text-[10px] px-2 py-1 rounded border transition-colors ${p === page ? 'border-egat-navy bg-egat-navy text-white' : 'border-egat-border hover:border-egat-navy'}`}>
                  {p}
                </button>
              )
            })}
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
              className="text-[10px] px-2 py-1 rounded border border-egat-border disabled:opacity-40 hover:border-egat-navy transition-colors">›</button>
            <button onClick={() => setPage(totalPages)} disabled={page === totalPages}
              className="text-[10px] px-2 py-1 rounded border border-egat-border disabled:opacity-40 hover:border-egat-navy transition-colors">»</button>
          </div>
        </div>
      )}

      {/* Built-in row detail modal */}
      {modalRow && rowDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={() => setModalRow(null)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-egat-border">
              <h3 className="font-bold text-egat-navy text-base">{title} — รายละเอียด</h3>
              <button onClick={() => setModalRow(null)} className="text-egat-text-muted hover:text-egat-navy text-xl leading-none">×</button>
            </div>
            <div className="px-6 py-4">
              {rowDetail(modalRow)}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
