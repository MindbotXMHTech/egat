'use client'
import { useEffect, useRef, useState } from 'react'
import { CalendarDays, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react'
import {
  calendarCells,
  canShiftCalendarMonth,
  formatSelectedDates,
  isIsoInRange,
  monthCursorFromIso,
} from '../lib/headerFilters'

const TH_MONTHS_FULL = [
  'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
  'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม',
]
const DOW = ['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส']

export default function HeaderDateTimePicker({
  dates = [],
  timeFrom,
  timeTo,
  onToggleDate,
  onTimeChange,
  onClearDates,
  minDate,
  maxDate,
  hint,
}) {
  const [open, setOpen] = useState(false)
  const [cursor, setCursor] = useState(() => monthCursorFromIso(dates?.[0] || maxDate))
  const ref = useRef(null)
  const wasOpen = useRef(false)
  const { dateLabel, timeLabel } = formatSelectedDates(dates, timeFrom, timeTo)
  const fullDay = (timeFrom || '00:00') === '00:00' && (timeTo || '23:59') === '23:59'
  const triggerLabel = dates.length && timeLabel && !fullDay
    ? `${dateLabel} · ${timeLabel.replace(' น.', '')}`
    : dateLabel
  const selected = new Set(dates)
  const cells = calendarCells(cursor.year, cursor.month)
  const canPrev = canShiftCalendarMonth(cursor.year, cursor.month, -1, minDate, maxDate)
  const canNext = canShiftCalendarMonth(cursor.year, cursor.month, 1, minDate, maxDate)

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

  useEffect(() => {
    if (open && !wasOpen.current && (minDate || maxDate)) {
      const inRange = (dates || []).find(d => isIsoInRange(d, minDate, maxDate))
      const next = monthCursorFromIso(inRange || maxDate || minDate)
      setCursor(c => (c.year === next.year && c.month === next.month) ? c : next)
    }
    wasOpen.current = open
  }, [open, minDate, maxDate, dates])

  function shiftMonth(delta) {
    setCursor(c => {
      if (!canShiftCalendarMonth(c.year, c.month, delta, minDate, maxDate)) return c
      const d = new Date(c.year, c.month + delta, 1)
      return { year: d.getFullYear(), month: d.getMonth() }
    })
  }

  function pickDate(iso) {
    if ((minDate || maxDate) && !isIsoInRange(iso, minDate, maxDate)) return
    onToggleDate(iso)
  }

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-label="เลือกวันที่หลายวัน"
        title={triggerLabel}
        className="relative h-9 w-[168px] sm:w-[196px] flex items-center gap-1.5 text-xs border border-egat-border rounded-lg pl-2 pr-6 bg-white text-egat-text text-left hover:border-egat-navy focus:outline-none focus:border-egat-navy"
      >
        <CalendarDays size={14} className="shrink-0 text-egat-text-muted" />
        <span className="truncate">{triggerLabel}</span>
        <ChevronDown size={14} className="absolute right-1.5 text-egat-text-muted pointer-events-none" />
      </button>
      {open && (
        <div
          role="dialog"
          aria-label="เลือกวันที่หลายวัน"
          className="absolute z-50 top-[calc(100%+6px)] right-0 bg-white border border-egat-border rounded-xl shadow-card-md p-3 w-[280px]"
        >
          <div className="flex items-center justify-between mb-2">
            <button type="button" onClick={() => shiftMonth(-1)} disabled={!canPrev} className="p-1 rounded hover:bg-egat-surface-alt disabled:opacity-30" aria-label="เดือนก่อน">
              <ChevronLeft size={16} />
            </button>
            <div className="text-xs font-semibold text-egat-navy">
              {TH_MONTHS_FULL[cursor.month]} {cursor.year + 543}
            </div>
            <button type="button" onClick={() => shiftMonth(1)} disabled={!canNext} className="p-1 rounded hover:bg-egat-surface-alt disabled:opacity-30" aria-label="เดือนถัดไป">
              <ChevronRight size={16} />
            </button>
          </div>
          <div className="grid grid-cols-7 gap-0.5 mb-1">
            {DOW.map(d => (
              <div key={d} className="text-center text-[10px] text-egat-text-muted py-1">{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-0.5 mb-3">
            {cells.map((c, i) => {
              if (!c) return <div key={`e${i}`} />
              const allowed = isIsoInRange(c.iso, minDate, maxDate) || (!minDate && !maxDate)
              const on = selected.has(c.iso)
              return (
                <button
                  key={c.iso}
                  type="button"
                  disabled={!allowed}
                  onClick={() => pickDate(c.iso)}
                  className={`h-8 rounded-md text-xs ${
                    on
                      ? 'bg-[#034EA2] text-white font-bold'
                      : allowed
                        ? 'text-egat-text hover:bg-egat-surface-alt'
                        : 'text-egat-text-muted/40 cursor-not-allowed'
                  }`}
                >
                  {c.day}
                </button>
              )
            })}
          </div>
          <p className="text-[10px] text-egat-text-muted mb-2">
            {hint || 'คลิกหลายวันเพื่อเลือกพร้อมกัน (Multiple Select)'}
          </p>
          <div className="grid grid-cols-2 gap-2 mb-2">
            <div>
              <label className="block text-[10px] text-egat-text-muted mb-1">จากเวลา</label>
              <input
                type="time"
                value={timeFrom}
                onChange={e => onTimeChange({ timeFrom: e.target.value })}
                className="w-full text-xs border border-egat-border rounded-lg px-2 py-1.5 focus:outline-none focus:border-egat-navy"
              />
            </div>
            <div>
              <label className="block text-[10px] text-egat-text-muted mb-1">ถึงเวลา</label>
              <input
                type="time"
                value={timeTo}
                onChange={e => onTimeChange({ timeTo: e.target.value })}
                className="w-full text-xs border border-egat-border rounded-lg px-2 py-1.5 focus:outline-none focus:border-egat-navy"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClearDates}
              className="flex-1 text-xs rounded-lg py-1.5 border border-egat-border"
            >
              ล้างวันที่
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="flex-1 text-xs font-medium rounded-lg py-1.5"
              style={{ background: '#FFCB05', color: '#034EA2' }}
            >
              ตกลง
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
