const TH_MONTHS_FULL = [
  'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
  'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม',
]

const EN_MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

function pad2(n) {
  return String(n).padStart(2, '0')
}

/** Predictive Calendar empty-header month (April 2026). */
export const DEFAULT_CALENDAR_MONTH_ISO = '2026-04-01'
/** Anomaly Maintenance Calendar empty-header month (March 2026 — existing prototype default). */
export const DEFAULT_ANOMALY_CALENDAR_MONTH_ISO = '2026-03-01'

export function createCalendarFilters() {
  return {
    dateFrom: '2026-04-01',
    dateTo: '2026-04-30',
    timeFrom: '08:00',
    timeTo: '12:00',
    query: '',
  }
}

export const EMPTY_CALENDAR_FILTERS = createCalendarFilters()

export function calendarMonthFromFilters(dateFrom, dateTo, fallbackIso = DEFAULT_CALENDAR_MONTH_ISO) {
  const src = dateFrom || dateTo || fallbackIso
  const parts = String(src).split('-').map(Number)
  const year = parts[0] || 2026
  const monthIndex = Math.min(11, Math.max(0, (parts[1] || 4) - 1))
  return { year, monthIndex }
}

/** Month to show + due-date bounds from header min/max (empty header → fallback month). */
export function resolveCalendarFromHeader(tableFilters = {}, fallbackIso = DEFAULT_CALENDAR_MONTH_ISO) {
  const dateFrom = tableFilters.dateFrom || ''
  const dateTo = tableFilters.dateTo || ''
  const month = calendarMonthFromFilters(dateFrom, dateTo, fallbackIso)
  if (dateFrom || dateTo) {
    return {
      year: month.year,
      monthIndex: month.monthIndex,
      dateFrom: dateFrom || dateTo,
      dateTo: dateTo || dateFrom,
    }
  }
  return {
    year: month.year,
    monthIndex: month.monthIndex,
    ...boundsForCalendarMonth(month.year, month.monthIndex),
  }
}

export function boundsForCalendarMonth(year, monthIndex) {
  const last = new Date(year, monthIndex + 1, 0).getDate()
  return {
    dateFrom: `${year}-${pad2(monthIndex + 1)}-01`,
    dateTo: `${year}-${pad2(monthIndex + 1)}-${pad2(last)}`,
  }
}

export function calendarTitle(year, monthIndex) {
  return `Maintenance Calendar — ${TH_MONTHS_FULL[monthIndex] || ''} ${year}`
}

export function calendarScheduleTitle(year, monthIndex) {
  const th = TH_MONTHS_FULL[monthIndex] || ''
  const en = EN_MONTHS[monthIndex] || ''
  return `Maintenance Schedule — ${th} ${year + 543} (${en} ${year})`
}

export function calendarItemsTitle(year, monthIndex) {
  return `Maintenance Items — ${TH_MONTHS_FULL[monthIndex] || ''} ${year}`
}

export function itemInDateRange(due, dateFrom, dateTo) {
  if (!due) return false
  if (!dateFrom && !dateTo) return true
  const start = dateFrom || dateTo
  const end = dateTo || dateFrom
  return due >= start && due <= end
}

export function matchesCalendarQuery(item, fleetById, query) {
  const q = (query || '').trim().toLowerCase()
  if (!q) return true
  const f = fleetById?.[item.asset] || {}
  const hay = [item.asset, item.type, item.priority, item.assigned, f.site, f.type]
    .filter(Boolean)
    .join(' ')
  return hay.toLowerCase().includes(q)
}

export function filterCalendarItems(schedule, filters, fleet) {
  const fleetById = Object.fromEntries((fleet || []).map(f => [f.id, f]))
  return (schedule || []).filter(item => {
    if (!itemInDateRange(item.due, filters.dateFrom, filters.dateTo)) return false
    const site = fleetById[item.asset]?.site
    if (Array.isArray(filters.allowedSites) && !filters.allowedSites.includes(site)) return false
    if (filters.location) {
      if (site !== filters.location) return false
    }
    if (filters.assetType) {
      const asset = fleetById[item.asset]
      const assetType = item.assetType || asset?.type
      if (assetType !== filters.assetType) return false
    }
    return matchesCalendarQuery(item, fleetById, filters.query)
  })
}

export function buildCalendarDays(year, monthIndex, items) {
  const last = new Date(year, monthIndex + 1, 0).getDate()
  const days = []
  for (let d = 1; d <= last; d++) {
    const due = `${year}-${pad2(monthIndex + 1)}-${pad2(d)}`
    days.push({
      day: d,
      due,
      dow: new Date(year, monthIndex, d).getDay(),
      items: (items || []).filter(m => m.due === due),
    })
  }
  return days
}
