import { formatDateTimeRange } from './anomalyFilters'

export function createEmptyHeaderFilters() {
  return {
    dates: [],
    timeFrom: '00:00',
    timeTo: '23:59',
    location: '',
  }
}

export const EMPTY_HEADER_FILTERS = createEmptyHeaderFilters()

export function toggleSelectedDate(dates, iso) {
  const set = new Set(dates || [])
  if (set.has(iso)) set.delete(iso)
  else set.add(iso)
  return [...set].sort()
}

export function isConsecutiveDays(dates) {
  const sorted = [...(dates || [])].sort()
  if (sorted.length <= 1) return true
  for (let i = 1; i < sorted.length; i++) {
    const prev = new Date(`${sorted[i - 1]}T00:00:00`)
    const cur = new Date(`${sorted[i]}T00:00:00`)
    if ((cur - prev) / 86400000 !== 1) return false
  }
  return true
}

export function formatSelectedDates(dates, timeFrom, timeTo) {
  const sorted = [...(dates || [])].sort()
  if (!sorted.length) {
    return { dateLabel: 'เลือกวันที่', timeLabel: '' }
  }
  const { dateLabel, timeLabel } = formatDateTimeRange(
    sorted[0],
    sorted[sorted.length - 1],
    timeFrom,
    timeTo,
  )
  if (sorted.length === 1) {
    return formatDateTimeRange(sorted[0], sorted[0], timeFrom, timeTo)
  }
  if (isConsecutiveDays(sorted)) return { dateLabel, timeLabel }
  return { dateLabel: `${sorted.length} วันที่เลือก`, timeLabel }
}

export function headerToTableFilters(header) {
  const dates = [...(header.dates || [])].sort()
  return {
    dates,
    dateFrom: dates[0] || '',
    dateTo: dates[dates.length - 1] || '',
    timeFrom: header.timeFrom || '00:00',
    timeTo: header.timeTo || '23:59',
    location: header.location || '',
  }
}

/** Which header filters a dashboard route actually uses. */
export function headerControlsForPath(pathname = '') {
  const path = String(pathname || '')
  if (path.startsWith('/dashboard/profile')) {
    return { location: false, date: false }
  }
  if (path.startsWith('/dashboard/api-library')) {
    return { location: false, date: true }
  }
  if (
    path === '/dashboard'
    || path === '/dashboard/'
    || path.startsWith('/dashboard/health')
    || path.startsWith('/dashboard/lifecycle')
  ) {
    return { location: true, date: false }
  }
  return { location: true, date: true }
}

export const API_LOOKBACK_DAYS = 90

function pad2(n) {
  return String(n).padStart(2, '0')
}

export function toIsoDate(date) {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`
}

export function isIsoInRange(iso, minDate, maxDate) {
  if (!iso) return false
  if (minDate && iso < minDate) return false
  if (maxDate && iso > maxDate) return false
  return true
}

export function apiLookbackBounds(now = new Date()) {
  const max = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const min = new Date(max.getFullYear(), max.getMonth(), max.getDate() - API_LOOKBACK_DAYS)
  return { minDate: toIsoDate(min), maxDate: toIsoDate(max) }
}

export function resolveApiQueryRange(header, bounds) {
  const fromSel = header?.dateFrom || ''
  const toSel = header?.dateTo || ''
  const fromOk = isIsoInRange(fromSel, bounds.minDate, bounds.maxDate)
  const toOk = isIsoInRange(toSel, bounds.minDate, bounds.maxDate)
  if (!fromOk && !toOk) {
    return { from: bounds.minDate, to: bounds.maxDate }
  }
  const from = fromOk ? fromSel : toSel
  const to = toOk ? toSel : fromSel
  return from <= to ? { from, to } : { from: to, to: from }
}

export function monthCursorFromIso(iso, fallback = '2026-03-01') {
  const src = iso || fallback
  const [y, m] = String(src).split('-').map(Number)
  return { year: y || 2026, month: Math.min(11, Math.max(0, (m || 3) - 1)) }
}

export function canShiftCalendarMonth(year, month, delta, minDate, maxDate) {
  const d = new Date(year, month + delta, 1)
  const last = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate()
  const start = `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-01`
  const end = `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(last)}`
  if (minDate && end < minDate) return false
  if (maxDate && start > maxDate) return false
  return true
}

export function assetsAtLocation(rows, location, siteKey = 'site') {
  if (!location) return rows || []
  return (rows || []).filter(row => row?.[siteKey] === location)
}

export function assetsInSiteScope(rows, allowedSites, siteKey = 'site') {
  if (!Array.isArray(allowedSites)) return rows || []
  return (rows || []).filter(row => allowedSites.includes(row?.[siteKey]))
}

export function calendarCells(year, monthIndex) {
  const firstDow = new Date(year, monthIndex, 1).getDay()
  const last = new Date(year, monthIndex + 1, 0).getDate()
  const cells = []
  for (let i = 0; i < firstDow; i++) cells.push(null)
  for (let d = 1; d <= last; d++) {
    const iso = `${year}-${String(monthIndex + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    cells.push({ day: d, iso })
  }
  return cells
}
