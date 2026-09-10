import { pickPredictedDevices } from './failurePrediction'
import { filterFailureGroups } from './predictiveFilters'

export const FORECAST_GROUPS = [
  { key: 'sdh',    label: 'SDH',    groupName: 'Replacement Group A', color: '#1B3A6B', assetType: 'SDH' },
  { key: 'dwdm',   label: 'DWDM',   groupName: 'Replacement Group B', color: '#1A56DB', assetType: 'DWDM' },
  { key: 'router', label: 'Router', groupName: 'Replacement Group C', color: '#7C3AED', assetType: 'Router' },
  { key: 'mw',     label: 'MW',     groupName: 'Replacement Group D', color: '#E8960C', assetType: 'MW' },
]

const MONTH_TH = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.']

export const FORECAST_EXPORT_COLUMNS = [
  { key: 'quarter', label: 'Quarter' },
  { key: 'month', label: 'Month' },
  { key: 'group', label: 'Type' },
  { key: 'deviceId', label: 'Device ID' },
  { key: 'site', label: 'Site' },
  { key: 'type', label: 'Device Type' },
  { key: 'rul', label: 'RUL (yr)' },
  { key: 'health', label: 'Health' },
  { key: 'replaceCost', label: 'Replace Cost' },
]

const RISK_COLOR = {
  Critical: '#C53030',
  High: '#C05621',
  Medium: '#B7791F',
  Low: '#1A7F4B',
}

export function parseQuarterLabel(label) {
  const m = String(label || '').match(/^Q([1-4])\s+(\d{4})$/i)
  if (!m) return null
  return { qNum: Number(m[1]), year: Number(m[2]) }
}

export function monthsForQuarter(qNum, year) {
  const q = Number(qNum)
  const y = Number(year)
  if (q < 1 || q > 4 || !Number.isFinite(y)) return []
  const start = (q - 1) * 3
  return [0, 1, 2].map(i => {
    const monthIndex = start + i
    return {
      monthIndex,
      key: `${y}-${String(monthIndex + 1).padStart(2, '0')}`,
      label: `${MONTH_TH[monthIndex]} ${y}`,
    }
  })
}

export function splitCount(n, parts = 4) {
  const total = Math.max(0, Number(n) || 0)
  const size = Math.max(1, parts)
  const base = Math.floor(total / size)
  const rem = total % size
  return Array.from({ length: size }, (_, i) => base + (i < rem ? 1 : 0))
}

export function parseQuarterBarClick(data) {
  const payload = data?.payload || data
  const quarter = payload?.quarter
  if (!quarter) return null
  return payload
}

export function isSameQuarterSelection(prev, next) {
  return Boolean(prev && next && prev.quarter === next.quarter)
}

export function buildQuarterForecast(row, lifecycle, quarterIndex = 0) {
  const parsed = parseQuarterLabel(row?.quarter)
  if (!parsed) return null
  const months = monthsForQuarter(parsed.qNum, parsed.year)
  const typeCounts = FORECAST_GROUPS.map(g => {
    const fromRow = (row?.types || []).find(t => t.type === g.assetType)
    return Number(fromRow?.count) || 0
  })
  const typeSum = typeCounts.reduce((s, n) => s + n, 0)
  const counts = typeSum > 0 ? typeCounts : splitCount(row?.count, FORECAST_GROUPS.length)

  const byType = FORECAST_GROUPS.map((g, i) => ({
    ...g,
    devices: pickPredictedDevices(lifecycle, g.assetType, counts[i] || 0, quarterIndex + i),
  }))

  const tagged = byType.flatMap(g =>
    (g.devices || []).map(d => ({ device: d, groupKey: g.key })),
  )

  return {
    quarter: row.quarter,
    budget: row.budget,
    count: Number(row.count) || tagged.length,
    months: months.map((m, mi) => ({
      ...m,
      groups: byType.map(g => {
        const devices = tagged
          .filter((item, di) => di % months.length === mi && item.groupKey === g.key)
          .map(item => item.device)
        return { ...g, devices, count: devices.length }
      }),
    })),
  }
}

export function monthGroups(forecast, monthKey) {
  const month = (forecast?.months || []).find(m => m.key === monthKey) || forecast?.months?.[0]
  return month?.groups || []
}

export { filterFailureGroups as filterForecastGroups }

export function flattenForecastExport(forecast, monthKey, groups) {
  const month = (forecast?.months || []).find(m => m.key === monthKey) || forecast?.months?.[0]
  const list = groups || month?.groups || []
  return list.flatMap(g => (g.devices || []).map(d => ({
    quarter: forecast?.quarter || '',
    month: month?.label || '',
    group: g.label,
    deviceId: d.id,
    site: d.site,
    type: d.type,
    rul: d.rul,
    health: d.health,
    replaceCost: d.replaceCost,
  })))
}

export function targetDateFromEol(eol, priority) {
  const y = Number(eol)
  if (!Number.isFinite(y)) return ''
  if (priority === 'Immediate') return `${y}-03-31`
  if (priority === 'High') return `${y}-06-30`
  if (priority === 'Medium') return `${y}-09-30`
  return `${y}-12-31`
}

export function riskAssessmentFrom(failProb, priority) {
  const p = Number(failProb) || 0
  if (priority === 'Immediate' || p >= 0.7) return 'Critical'
  if (priority === 'High' || p >= 0.5) return 'High'
  if (priority === 'Medium' || p >= 0.3) return 'Medium'
  return 'Low'
}

export function riskAssessmentColor(risk) {
  return RISK_COLOR[risk] || '#8896A4'
}

export function toReplacementPlanRows(rows) {
  return (rows || []).map(l => ({
    ...l,
    targetDate: targetDateFromEol(l.eol, l.priority),
    riskAssessment: riskAssessmentFrom(l.failProb, l.priority),
  }))
}

export function canHidePieCategory(hidden, name, names) {
  const list = names || []
  if (!list.includes(name)) return false
  if (hidden?.[name]) return true
  return list.filter(n => !hidden?.[n]).length > 1
}

export function toggleHiddenPieCategory(hidden, name, names) {
  if (!canHidePieCategory(hidden, name, names)) return { ...(hidden || {}) }
  return { ...(hidden || {}), [name]: !hidden?.[name] }
}

export function visiblePieSlices(pie, hidden) {
  return (pie || []).filter(c => !hidden?.[c.name])
}

export function buildLifecycleAlerts({ assets = [], onOpen } = {}) {
  return (assets || [])
    .filter(a => a.priority === 'Immediate' || a.priority === 'High' || Number(a.rul) <= 1)
    .slice(0, 12)
    .map(a => ({
      id: `lcc-${a.id}`,
      severity: a.priority === 'Immediate' || Number(a.rul) <= 0 ? 'critical' : 'warning',
      asset: a.id,
      msg: a.priority === 'Immediate'
        ? `ต้องเปลี่ยนทันที — Target ${targetDateFromEol(a.eol, a.priority)}`
        : `ใกล้ EoL (RUL ${a.rul} yr) — ${a.priority}`,
      time: a.site || '',
      onOpen: () => onOpen?.(a.id),
    }))
}
