'use client'
import { useEffect, useRef, useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { formatDateTimeRange } from '../lib/anomalyFilters'

export default function DateTimeRangeField({ filters, onChange }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const { dateLabel, timeLabel } = formatDateTimeRange(
    filters.dateFrom, filters.dateTo, filters.timeFrom, filters.timeTo,
  )

  useEffect(() => {
    if (!open) return undefined
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    const id = window.setTimeout(() => document.addEventListener('mousedown', handleClick), 0)
    return () => {
      clearTimeout(id)
      document.removeEventListener('mousedown', handleClick)
    }
  }, [open])

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className="relative flex items-center gap-4 text-xs border border-egat-border rounded-lg pl-[17px] pr-7 py-[7px] bg-white text-egat-text min-w-[268px] text-left hover:border-egat-navy focus:outline-none focus:border-egat-navy"
      >
        <span className="whitespace-nowrap">{dateLabel}</span>
        {timeLabel ? <span className="whitespace-nowrap">{timeLabel}</span> : null}
        <ChevronDown size={14} className="absolute right-2.5 text-egat-text-muted" />
      </button>
      {open && (
        <div className="absolute z-30 top-[calc(100%+6px)] left-0 bg-white border border-egat-border rounded-xl shadow-card-md p-3 w-[280px]">
          <div className="grid grid-cols-2 gap-2 mb-2">
            <div>
              <label className="block text-[10px] text-egat-text-muted mb-1">จากวันที่</label>
              <input type="date" value={filters.dateFrom}
                onChange={e => onChange({ dateFrom: e.target.value, dateTo: filters.dateTo || e.target.value })}
                className="w-full text-xs border border-egat-border rounded-lg px-2 py-1.5 focus:outline-none focus:border-egat-navy" />
            </div>
            <div>
              <label className="block text-[10px] text-egat-text-muted mb-1">ถึงวันที่</label>
              <input type="date" value={filters.dateTo}
                onChange={e => onChange({ dateTo: e.target.value, dateFrom: filters.dateFrom || e.target.value })}
                className="w-full text-xs border border-egat-border rounded-lg px-2 py-1.5 focus:outline-none focus:border-egat-navy" />
            </div>
            <div>
              <label className="block text-[10px] text-egat-text-muted mb-1">จากเวลา</label>
              <input type="time" value={filters.timeFrom}
                onChange={e => onChange({ timeFrom: e.target.value })}
                className="w-full text-xs border border-egat-border rounded-lg px-2 py-1.5 focus:outline-none focus:border-egat-navy" />
            </div>
            <div>
              <label className="block text-[10px] text-egat-text-muted mb-1">ถึงเวลา</label>
              <input type="time" value={filters.timeTo}
                onChange={e => onChange({ timeTo: e.target.value })}
                className="w-full text-xs border border-egat-border rounded-lg px-2 py-1.5 focus:outline-none focus:border-egat-navy" />
            </div>
          </div>
          <button type="button" onClick={() => setOpen(false)}
            className="w-full text-xs font-medium rounded-lg py-1.5"
            style={{ background: '#FFCB05', color: '#034EA2' }}>
            ตกลง
          </button>
        </div>
      )}
    </div>
  )
}
