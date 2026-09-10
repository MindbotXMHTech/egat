import { exportTable } from './tableExport'
import { matchesAllowedSites } from './authAccounts'

const TH_MONTHS = ['ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.','ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.']

export const ASSET_TYPES = ['SDH', 'DWDM', 'Router', 'MW']

export function createEmptyAnomalyFilters() {
  return {
    dateFrom: '',
    dateTo: '',
    timeFrom: '08:00',
    timeTo: '12:00',
    location: '',
    query: '',
    assetType: '',
  }
}

export const EMPTY_ANOMALY_FILTERS = createEmptyAnomalyFilters()

function pad2(n) {
  return String(n).padStart(2, '0')
}

function fmtTimeDot(t) {
  if (!t) return ''
  return t.replace(':', '.')
}

export function formatDateTimeRange(dateFrom, dateTo, timeFrom, timeTo) {
  if (!dateFrom && !dateTo) {
    return { dateLabel: 'เลือกวันที่และเวลา', timeLabel: '' }
  }
  const from = new Date(`${dateFrom || dateTo}T00:00:00`)
  const to = new Date(`${dateTo || dateFrom}T00:00:00`)
  const be = to.getFullYear() + 543
  let dateLabel
  if (from.getMonth() === to.getMonth() && from.getFullYear() === to.getFullYear()) {
    dateLabel = `${pad2(from.getDate())} - ${pad2(to.getDate())} ${TH_MONTHS[to.getMonth()]} ${be}`
  } else {
    dateLabel = `${pad2(from.getDate())} ${TH_MONTHS[from.getMonth()]} - ${pad2(to.getDate())} ${TH_MONTHS[to.getMonth()]} ${be}`
  }
  const timeLabel = `${fmtTimeDot(timeFrom || '00:00')} - ${fmtTimeDot(timeTo || '23:59')} น.`
  return { dateLabel, timeLabel }
}

export function uniqueSites(fleet) {
  return [...new Set(fleet.map(f => f.site))].sort((a, b) => a.localeCompare(b, 'th'))
}

export function matchesQuery(haystack, query) {
  if (!query) return true
  return haystack.toLowerCase().includes(query.trim().toLowerCase())
}

export function filterFleet(fleet, filters) {
  return fleet.filter(f => {
    if (!matchesAllowedSites(f.site, filters.allowedSites)) return false
    if (filters.location && f.site !== filters.location) return false
    if (filters.assetType && f.type !== filters.assetType) return false
    return matchesQuery(`${f.id} ${f.site} ${f.region} ${f.type}`, filters.query)
  })
}

export function dateKeyFromTimestamp(ts) {
  const m = String(ts || '').match(/^(\d{4}-\d{2}-\d{2})/)
  return m ? m[1] : ''
}

export function timeKeyFromTimestamp(ts) {
  const m = String(ts || '').match(/(\d{2}:\d{2})/)
  return m ? m[1] : ''
}

export function matchesSelectedDateTime(ts, filters) {
  if (!filters) return true
  if (filters.dates?.length) {
    const day = dateKeyFromTimestamp(ts)
    if (!filters.dates.includes(day)) return false
    const t = timeKeyFromTimestamp(ts) || '00:00'
    if (filters.timeFrom && t < filters.timeFrom) return false
    if (filters.timeTo && t > filters.timeTo) return false
    return true
  }
  const hasDate = Boolean(filters.dateFrom || filters.dateTo)
  if (!hasDate) return true
  const start = `${filters.dateFrom || filters.dateTo} ${filters.timeFrom || '00:00'}`
  const end = `${filters.dateTo || filters.dateFrom} ${filters.timeTo || '23:59'}`
  return String(ts) >= start && String(ts) <= end
}

export function filterAnomalyRows(rows, filters) {
  return rows.filter(r => {
    if (!matchesAllowedSites(r.site, filters.allowedSites)) return false
    if (filters.location && r.site !== filters.location) return false
    if (filters.assetType && r.assetType !== filters.assetType) return false
    if (!matchesQuery(`${r.deviceId} ${r.site} ${r.issueType} ${r.status} ${r.algo} ${r.timestamp} ${r.assetType} ${r.action}`, filters.query)) {
      return false
    }
    return matchesSelectedDateTime(r.timestamp, filters)
  })
}

export function buildTrendNotes({ deviceId, site, hour, score, threshold = 75 }) {
  const where = site ? `${deviceId} (${site})` : deviceId
  if (score >= 85) {
    return `${where} คะแนน ${score} ในช่วง ${hour} — สัญญาณผิดปกติสูง ควรตรวจสอบทันที`
  }
  if (score >= threshold) {
    return `${where} คะแนน ${score} ในช่วง ${hour} — เกินเกณฑ์เฝ้าระวัง (${threshold})`
  }
  return `${where} คะแนน ${score} ในช่วง ${hour} — อยู่ในเกณฑ์ปกติ`
}

/** 24h anomaly score series. Each hour is tied to a device for hover/modal (TOR 4.6). */
export function genScoreTrend(assetType = '', fleet = []) {
  const seed = Math.max(0, ASSET_TYPES.indexOf(assetType) + 1)
  const pool = fleet.filter(f => !assetType || f.type === assetType)
  const devices = pool.length ? pool : fleet
  return Array.from({ length: 24 }, (_, i) => {
    const hour = `${String(i).padStart(2, '0')}:00`
    const score = Math.min(99.9, +(50 + ((i * 5 + seed * 9) % 30) + (i > 18 ? 12 : 0) + seed).toFixed(1))
    const device = devices[i % Math.max(devices.length, 1)] || {}
    const deviceId = device.id || '—'
    const site = device.site || ''
    return {
      hour,
      score,
      anomalyCount: (i + seed) % 4,
      assetType: assetType || device.type || 'All',
      timestamp: `2026-03-23 ${hour}`,
      deviceId,
      site,
      notes: buildTrendNotes({ deviceId, site, hour, score }),
    }
  })
}

export function matchesTrendWindow(row, filters) {
  if (!matchesSelectedDateTime(row.timestamp, filters)) return false
  if (filters.dates?.length || filters.dateFrom || filters.dateTo) return true
  const t = row.hour || timeKeyFromTimestamp(row.timestamp)
  if (filters.timeFrom && t < filters.timeFrom) return false
  if (filters.timeTo && t > filters.timeTo) return false
  return true
}

export function createEmptyTrendDates() {
  return { dateFrom: '', dateTo: '', timeFrom: '00:00', timeTo: '23:59' }
}

export function recommendedAction(severity) {
  if (severity === 'Critical') return 'ส่งซ่อมฉุกเฉิน'
  if (severity === 'High') return 'ตรวจสอบภายใน 24h'
  return 'ติดตามสัญญาณ'
}

export function filterChartRows(rows, query, fields) {
  const q = (query || '').trim().toLowerCase()
  if (!q) return rows
  return rows.filter(r => fields.some(f => String(r[f] ?? '').toLowerCase().includes(q)))
}

export function sortChartRows(rows, key, dir) {
  if (!key || !dir) return rows
  const copy = [...rows]
  copy.sort((a, b) => {
    const av = a[key]
    const bv = b[key]
    const na = Number(av)
    const nb = Number(bv)
    const aVal = Number.isFinite(na) ? na : String(av ?? '')
    const bVal = Number.isFinite(nb) ? nb : String(bv ?? '')
    if (aVal < bVal) return dir === 'asc' ? -1 : 1
    if (aVal > bVal) return dir === 'asc' ? 1 : -1
    return 0
  })
  return copy
}

export function nextChartSortDir(dir) {
  if (dir === 'desc') return 'asc'
  if (dir === 'asc') return null
  return 'desc'
}

export function exportChartCsv(rows, columns, filename) {
  exportTable('csv', { columns, rows, filename, title: filename })
}

export function exportChartTable(format, rows, columns, filename, title) {
  exportTable(format, { columns, rows, filename, title: title || filename })
}

export function filterIncidents(incidents, filters, siteByAsset = {}) {
  return incidents.filter(inc => {
    const site = siteByAsset[inc.asset] || ''
    if (!matchesAllowedSites(site, filters.allowedSites)) return false
    if (filters.location && site !== filters.location) return false
    if (!matchesQuery(`${inc.id} ${inc.title} ${inc.asset} ${inc.rootCause} ${inc.status} ${site}`, filters.query)) {
      return false
    }
    return matchesSelectedDateTime(inc.start, filters)
  })
}
