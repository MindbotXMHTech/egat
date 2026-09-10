import { matchesQuery } from './anomalyFilters'
import { matchesAllowedSites } from './authAccounts'

export const RUL_TABLE_COLUMNS = [
  { key: 'deviceId', label: 'Device ID' },
  { key: 'site', label: 'Site' },
  { key: 'type', label: 'Device Type' },
  { key: 'rul', label: 'Avg RUL (yr)' },
  { key: 'health', label: 'Health %' },
  { key: 'status', label: 'Status' },
]

export const FAILURE_EXPORT_COLUMNS = [
  { key: 'month', label: 'Month' },
  { key: 'group', label: 'Type' },
  { key: 'groupName', label: 'Group' },
  { key: 'deviceId', label: 'Device ID' },
  { key: 'site', label: 'Site' },
  { key: 'type', label: 'Device Type' },
  { key: 'failProb', label: 'Fail %' },
  { key: 'rul', label: 'RUL (yr)' },
]

export const CALENDAR_ITEM_COLUMNS = [
  { key: 'asset', label: 'Asset' },
  { key: 'assetType', label: 'Device Type' },
  { key: 'site', label: 'Site' },
  { key: 'type', label: 'Type' },
  { key: 'due', label: 'Due Date' },
  { key: 'priority', label: 'Priority' },
  { key: 'assigned', label: 'Assigned' },
  { key: 'cost', label: 'Cost (฿)' },
]

export function dueMatchesHeaderDates(due, filters) {
  if (!filters?.dates?.length) return true
  if (!due || due === 'TBD') return false
  return filters.dates.includes(due)
}

export function filterPendingRows(rows, filters = {}) {
  return (rows || []).filter(r => {
    if (!matchesAllowedSites(r.site, filters.allowedSites)) return false
    if (filters.location && r.site !== filters.location) return false
    if (filters.assetType && r.type !== filters.assetType) return false
    if (!dueMatchesHeaderDates(r.due, filters)) return false
    return matchesQuery(
      [r.deviceId, r.site, r.type, r.priority, r.assigned, r.maintType, r.suggestedParts]
        .filter(Boolean).join(' '),
      filters.query,
    )
  })
}

export function filterActionRows(rows, filters = {}) {
  return (rows || []).filter(r => {
    if (!matchesAllowedSites(r.site, filters.allowedSites)) return false
    if (filters.location && r.site !== filters.location) return false
    if (filters.assetType && r.type !== filters.assetType) return false
    if (!dueMatchesHeaderDates(r.due, filters)) return false
    return matchesQuery(
      [r.asset, r.site, r.type, r.action, r.priority, r.assigned, r.parts]
        .filter(Boolean).join(' '),
      filters.query,
    )
  })
}

export function toRulTableRows(fleet) {
  return (fleet || []).map(f => ({
    deviceId: f.id,
    site: f.site,
    type: f.type,
    rul: Number(f.rul) || 0,
    health: Number(f.health) || 0,
    status: f.status,
    failProb: f.failProb,
  }))
}

export function rulUnderOneMonth(rul) {
  return Number(rul) * 12 < 1
}

export function filterFailureGroups(groups, query) {
  const q = (query || '').trim().toLowerCase()
  if (!q) return groups || []
  return (groups || []).map(g => {
    const groupHit = `${g.label || ''} ${g.groupName || ''} ${g.key || ''}`.toLowerCase().includes(q)
    const devices = groupHit
      ? g.devices
      : (g.devices || []).filter(d =>
        `${d.id} ${d.site || ''} ${d.type || ''}`.toLowerCase().includes(q),
      )
    return { ...g, devices, count: (devices || []).length }
  }).filter(g => (g.devices || []).length > 0)
}

export function flattenFailureExport(groups, month) {
  return (groups || []).flatMap(g => (g.devices || []).map(d => ({
    month: month || '',
    group: g.label,
    groupName: g.groupName,
    deviceId: d.id,
    site: d.site,
    type: d.type,
    failProb: `${((d.failProb || 0) * 100).toFixed(0)}%`,
    rul: d.rul,
  })))
}

export function enrichCalendarItems(items, fleet) {
  const byId = Object.fromEntries((fleet || []).map(f => [f.id, f]))
  return (items || []).map(m => {
    const f = byId[m.asset] || {}
    return {
      ...m,
      site: f.site || '-',
      assetType: m.assetType || f.type || '-',
    }
  })
}

export function buildPredictiveAlerts({ fleet = [], pending = [], onOpenMaint, onOpenRul } = {}) {
  const alerts = []
  for (const row of pending) {
    if (row.priority !== 'Immediate' && row.priority !== 'High') continue
    alerts.push({
      id: `pm-maint-${row.deviceId}`,
      severity: row.priority === 'Immediate' ? 'critical' : 'warning',
      asset: row.deviceId,
      msg: `ต้องบำรุงรักษา (${row.priority}) — กำหนด ${row.due}`,
      time: row.due,
      onOpen: () => onOpenMaint?.(row.deviceId),
    })
  }
  for (const f of fleet) {
    if (!rulUnderOneMonth(f.rul)) continue
    alerts.push({
      id: `pm-rul-${f.id}`,
      severity: 'critical',
      asset: f.id,
      msg: `RUL น้อยกว่า 1 เดือน (${Number(f.rul) || 0} yr)`,
      time: 'RUL',
      onOpen: () => onOpenRul?.(f.id),
    })
  }
  return alerts.slice(0, 12)
}
