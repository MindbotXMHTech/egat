'use client'
import { useEffect, useMemo, useState } from 'react'
import {
  ALERT_STATUSES,
  TOTAL_ANOMALY_COLUMNS,
  createEmptyAlertFilters,
  filterAnomalyAlerts,
  nextAlertSort,
  pageRangeLabel,
  sortAlertRows,
  uniqueAlertValues,
} from '../lib/anomalyAlerts'
import ExportMenu from './ExportMenu'
import RootCauseCluesModal from './RootCauseCluesModal'
import { exportTable } from '../lib/tableExport'

function Icon({ src, alt = '', className = 'size-6' }) {
  return (
    <span className={`${className} overflow-hidden shrink-0 inline-flex`}>
      <img src={src} alt={alt} className="w-full h-full" />
    </span>
  )
}

export default function AnomalyAlertsView({
  rows = [],
  onBack,
  sectionTitle = 'Total Anomalies',
  columns = TOTAL_ANOMALY_COLUMNS,
  exportName = 'anomaly_alerts',
  statusOptions = ALERT_STATUSES,
}) {
  const [filters, setFilters] = useState(createEmptyAlertFilters)
  const [hidden, setHidden] = useState({})
  const [showCols, setShowCols] = useState(false)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(25)
  const [sortKey, setSortKey] = useState('scoreLabel')
  const [sortDir, setSortDir] = useState('desc')
  const [cluesRow, setCluesRow] = useState(null)

  const cluesEnabled = columns.some(c => c.key === 'rootCause')
  const visibleCols = columns.filter(c => !hidden[c.key])

  const typeOptions = useMemo(() => uniqueAlertValues(rows, 'anomalyType'), [rows])
  const causeOptions = useMemo(() => uniqueAlertValues(rows, 'rootCause'), [rows])

  const filtered = useMemo(
    () => sortAlertRows(filterAnomalyAlerts(rows, filters), sortKey, sortDir),
    [rows, filters, sortKey, sortDir],
  )
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const safePage = Math.min(page, totalPages)
  const pageRows = filtered.slice((safePage - 1) * pageSize, safePage * pageSize)

  useEffect(() => { setPage(1) }, [filters, pageSize])

  useEffect(() => {
    document.querySelector('main')?.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  useEffect(() => {
    if (!cluesRow) return undefined
    function handleKey(e) {
      if (e.key === 'Escape') setCluesRow(null)
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [cluesRow])

  function patchFilter(key, value) {
    setFilters(f => ({ ...f, [key]: value }))
  }

  function handleExport(format) {
    exportTable(format, {
      columns: visibleCols,
      rows: filtered,
      filename: exportName,
      title: sectionTitle,
    })
  }

  const colCount = visibleCols.length
  const wide = columns.length > 4

  return (
    <div className="animate-fade-in flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-solid text-base font-bold whitespace-nowrap"
            style={{ borderColor: '#FFCB05', color: '#034EA2', background: '#fff' }}
          >
            Back
            <Icon src="/icons/alerts-back.svg" className="size-4" />
          </button>
          <h1 className="text-2xl sm:text-[32px] font-bold leading-none" style={{ color: '#034EA2' }}>
            Anomaly Alerts
          </h1>
        </div>
        <p className="text-base tracking-tight" style={{ color: '#034EA2' }}>
          Anomaly Detection provide real-time notifications when unusual patterns or behaviors are detected
          {' '}within your data. This feature helps you quickly identify and address potential issues before they escalate.
        </p>
      </div>

      <div className="bg-white rounded-lg p-4 sm:p-6">
        <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr] items-center gap-3 mb-4">
          <div className="hidden sm:block" />
          <h2 className="text-xl font-bold text-center" style={{ color: '#034EA2' }}>{sectionTitle}</h2>
          <div className="flex items-center gap-2 sm:justify-self-end">
            <div className="relative">
              <button type="button" onClick={() => setShowCols(v => !v)}
                className="flex items-center gap-2 px-4 py-2 font-bold text-base"
                style={{ color: '#FFCB05' }}>
                Manage Column
                <Icon src="/icons/alerts-settings.svg" className="size-6" />
              </button>
              {showCols && (
                <div className="absolute right-0 z-20 top-11 bg-white border border-egat-border rounded-xl shadow-card-md p-3 min-w-[200px]">
                  {columns.map(c => (
                    <label key={c.key} className="flex items-center gap-2 text-xs py-1 cursor-pointer">
                      <input type="checkbox" checked={!hidden[c.key]}
                        onChange={() => setHidden(h => ({ ...h, [c.key]: !h[c.key] }))}
                        className="accent-[#034EA2]" />
                      {c.label}
                    </label>
                  ))}
                </div>
              )}
            </div>
            <div className="w-px h-5 bg-egat-border" />
            <ExportMenu variant="alerts" onSelect={handleExport} />
          </div>
        </div>

        <div className="overflow-auto max-h-[60vh]" onClick={() => setShowCols(false)}>
          <table className={`w-full border-separate border-spacing-0 text-base ${wide ? 'min-w-[1100px]' : 'min-w-[640px]'}`}>
            <thead className="sticky top-0 z-10">
              <tr style={{ background: '#034EA2' }}>
                {visibleCols.map(c => (
                  <th key={c.key} className="h-[51px] px-4 text-white font-bold whitespace-nowrap">
                    <span className="inline-flex items-center justify-center gap-2.5">
                      <button
                        type="button"
                        onClick={() => {
                          const next = nextAlertSort(sortKey, sortDir, c.key)
                          setSortKey(next.key)
                          setSortDir(next.dir)
                        }}
                        className="inline-flex items-center gap-1"
                      >
                        {c.label}
                        {sortKey === c.key ? (sortDir === 'asc' ? ' ↑' : ' ↓') : null}
                      </button>
                      <Icon src="/icons/alerts-filter.svg" className="size-6" />
                    </span>
                  </th>
                ))}
                <th className="w-[120px]" />
              </tr>
              <tr>
                {visibleCols.map(c => {
                  const filterKey = c.filterKey || c.key
                  const value = filters[filterKey]
                  const selectOptions = c.key === 'anomalyType' ? typeOptions
                    : c.key === 'status' ? statusOptions
                    : c.key === 'rootCause' ? causeOptions
                    : []
                  return (
                    <th key={c.key} className="pt-2 pb-1 px-1 font-normal">
                      {c.kind === 'select' ? (
                        <div className="relative">
                          <select
                            value={value}
                            onChange={e => patchFilter(filterKey, e.target.value)}
                            onClick={e => e.stopPropagation()}
                            className="w-full h-[51px] rounded-lg px-4 pr-8 appearance-none font-bold text-[#3571B5] bg-white focus:outline-none"
                            style={{ border: '1px solid #3571B5' }}
                          >
                            <option value="All">All</option>
                            {selectOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                          </select>
                          <img src="/icons/alerts-chevron-down.svg" alt=""
                            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 size-4 rotate-180" />
                        </div>
                      ) : (
                        <input
                          value={value}
                          onChange={e => patchFilter(filterKey, e.target.value)}
                          onClick={e => e.stopPropagation()}
                          className="w-full h-[51px] rounded-lg px-4 font-bold text-egat-text bg-white focus:outline-none"
                          style={{ border: '1px solid #3571B5' }}
                        />
                      )}
                    </th>
                  )
                })}
                <th className="pt-2 pb-1 px-1">
                  <button type="button"
                    onClick={() => setFilters(createEmptyAlertFilters())}
                    className="w-full h-[51px] rounded-lg font-bold"
                    style={{ border: '1px solid #FFCB05', color: '#034EA2', background: '#fff' }}>
                    Reset
                  </button>
                </th>
              </tr>
            </thead>
            <tbody>
              {pageRows.length === 0 ? (
                <tr>
                  <td colSpan={colCount + 1} className="text-center py-10 text-egat-text-muted">ไม่พบข้อมูล</td>
                </tr>
              ) : pageRows.map((row, i) => (
                <tr key={`${row.deviceId}-${row.timestamp}-${i}`}
                  className="h-10"
                  style={{ background: i % 2 === 1 ? '#E5EDF5' : '#fff' }}>
                  {visibleCols.map(c => (
                    <td key={c.key}
                      className={`px-4 text-egat-text border-r border-[#3571B5] ${c.align === 'left' ? 'max-w-[220px] text-left' : 'text-center'}`}>
                      <span className={c.align === 'left' ? 'block truncate' : undefined}>{row[c.key]}</span>
                    </td>
                  ))}
                  <td className="px-4 text-center">
                    {cluesEnabled && (
                      <button
                        type="button"
                        onClick={() => setCluesRow(row)}
                        className="text-[10px] px-2 py-0.5 rounded border border-egat-navy text-egat-navy hover:bg-egat-navy hover:text-white"
                      >
                        ดู
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-8 p-4 text-base" style={{ color: '#034EA2' }}>
          <label className="flex items-center gap-3">
            Rows per page:
            <select value={pageSize} onChange={e => setPageSize(+e.target.value)}
              className="bg-transparent font-normal focus:outline-none cursor-pointer">
              {[10, 25, 50].map(n => <option key={n} value={n}>{n}</option>)}
            </select>
          </label>
          <span>{pageRangeLabel(safePage, pageSize, filtered.length)}</span>
          <div className="flex items-center">
            <button type="button" disabled={safePage <= 1} onClick={() => setPage(p => Math.max(1, p - 1))}
              className="disabled:opacity-40 p-0.5">
              <img src="/icons/alerts-page-prev.svg" alt="Previous" className="size-5 rotate-90" />
            </button>
            <button type="button" disabled={safePage >= totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              className="disabled:opacity-40 p-0.5">
              <img src="/icons/alerts-page-next.svg" alt="Next" className="size-5 -rotate-90" />
            </button>
          </div>
        </div>
      </div>

      {cluesRow && (
        <RootCauseCluesModal row={cluesRow} onClose={() => setCluesRow(null)} />
      )}
    </div>
  )
}
