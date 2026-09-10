export const HEALTH_PIE_CATEGORIES = [
  { key: 'good',     label: 'Good (≥80)',        shortLabel: 'Good',         color: '#1A7F4B' },
  { key: 'warning',  label: 'Warning (65–79)',   shortLabel: 'Warning',      color: '#E8960C' },
  { key: 'critical', label: 'Critical (50–64)',  shortLabel: 'Critical',     color: '#C53030' },
  { key: 'eol',      label: 'End of Life (<50)', shortLabel: 'End of Life',  color: '#8896A4' },
]

export const HEALTH_DETAIL_EXPORT_COLUMNS = [
  { key: 'id', label: 'Device ID' },
  { key: 'health', label: 'Health Score' },
]

export const AVG_HEALTH_EXPORT_COLUMNS = [
  { key: 'deviceId', label: 'Device ID' },
  { key: 'health', label: 'Avg Health Score' },
  { key: 'status', label: 'Status' },
]

export const HEALTH_STATUS_OPTIONS = ['Healthy', 'Watch', 'Warning', 'Critical']

export const HEALTH_TREND_EXPORT_COLUMNS = [
  { key: 'iso', label: 'Date' },
  { key: 'deviceId', label: 'Device ID' },
  { key: 'score', label: 'Health Score' },
  { key: 'anomalyScore', label: 'Anomaly Score' },
  { key: 'notes', label: 'Notes' },
]

export function healthScoreColor(score) {
  const n = Number(score)
  if (n >= 80) return '#1A7F4B'
  if (n >= 65) return '#E8960C'
  if (n >= 50) return '#C53030'
  return '#8896A4'
}

export function healthPiePercent(count, total) {
  const t = Number(total) || 0
  if (t <= 0) return 0
  return Math.round(((Number(count) || 0) / t) * 100)
}

export function getHealthCategory(score) {
  if (score >= 80) return 'Good (≥80)'
  if (score >= 65) return 'Warning (65–79)'
  if (score >= 50) return 'Critical (50–64)'
  return 'End of Life (<50)'
}

export function buildHealthPieData(fleet) {
  const list = fleet || []
  const total = list.length
  return HEALTH_PIE_CATEGORIES.map(cat => {
    const count = list.filter(f => getHealthCategory(f.health) === cat.label).length
    return {
      ...cat,
      count,
      pct: healthPiePercent(count, total),
    }
  })
}

export function healthCategoryTitle(label) {
  const cat = HEALTH_PIE_CATEGORIES.find(
    c => c.label === label || c.shortLabel === label || c.key === label,
  )
  return cat ? `${cat.shortLabel} Detail` : 'Detail'
}

export function healthCategoryColor(label) {
  return HEALTH_PIE_CATEGORIES.find(c => c.label === label)?.color || '#C53030'
}

export function resolveHealthPieCategory(data) {
  const match = value =>
    HEALTH_PIE_CATEGORIES.find(
      c => c.label === value || c.shortLabel === value || c.key === value,
    )?.label || null

  if (data == null) return null
  if (typeof data === 'string') return match(data)

  const candidates = [
    data.label,
    data.payload?.label,
    data.name,
    typeof data.value === 'string' ? data.value : null,
  ]
  for (const c of candidates) {
    const hit = match(c)
    if (hit) return hit
  }
  return null
}

export function toHealthDetailRows(devices, categoryLabel) {
  return (devices || [])
    .filter(d => d.category === categoryLabel)
    .map(d => ({
      id: d.deviceId,
      health: d.health,
      type: d.type,
      site: d.site,
    }))
}

export function filterHealthDetailRows(rows, query, typeFilter) {
  let out = rows || []
  if (typeFilter) out = out.filter(r => r.type === typeFilter)
  const q = (query || '').trim().toLowerCase()
  if (!q) return out
  return out.filter(r =>
    [r.id, r.health, r.type, r.site].join(' ').toLowerCase().includes(q),
  )
}

export function sortHealthDetailRows(rows, dir = 'asc') {
  const copy = [...(rows || [])]
  copy.sort((a, b) => (dir === 'desc' ? b.health - a.health : a.health - b.health))
  return copy
}

export function uniqueHealthTypes(rows) {
  return [...new Set((rows || []).map(r => r.type).filter(Boolean))]
}

export function toggleHiddenPieCategory(hidden, label) {
  const next = { ...(hidden || {}) }
  if (next[label]) delete next[label]
  else next[label] = true
  return next
}

export function visibleHealthPieData(data, hidden) {
  return (data || []).filter(d => !hidden?.[d.label] && !hidden?.[d.key])
}

export function createEmptyHealthTrendDates() {
  return { dateFrom: '', dateTo: '', timeFrom: '00:00', timeTo: '23:59' }
}

export function healthAnomalyScore(healthScore) {
  const n = Number(healthScore)
  if (!Number.isFinite(n)) return 0
  return +(Math.max(0, Math.min(100, 100 - n)).toFixed(1))
}

export function buildHealthTrendNotes({
  deviceId = '—',
  site = '',
  date = '',
  score,
  anomalyScore,
  threshold = 50,
} = {}) {
  const where = site ? `${deviceId} (${site})` : deviceId
  const health = Number(score)
  const anomaly = anomalyScore != null ? anomalyScore : healthAnomalyScore(health)
  if (!Number.isFinite(health)) {
    return `${where} — ไม่มีข้อมูลคะแนนสุขภาพ`
  }
  if (health < threshold) {
    return `${where} คะแนนสุขภาพ ${health} วันที่ ${date} — ต่ำกว่าเกณฑ์ (${threshold}) คะแนนความผิดปกติ ${anomaly} ควรตรวจสอบ`
  }
  if (health < 80) {
    return `${where} คะแนนสุขภาพ ${health} วันที่ ${date} — เฝ้าระวัง คะแนนความผิดปกติ ${anomaly}`
  }
  return `${where} คะแนนสุขภาพ ${health} วันที่ ${date} — อยู่ในเกณฑ์ปกติ คะแนนความผิดปกติ ${anomaly}`
}

export function enrichHealthTrend(rows, device = {}, threshold = 50) {
  const deviceId = device.deviceId || device.id || '—'
  const site = device.site || ''
  const type = device.type || ''
  return (rows || []).map(r => {
    const anomalyScore = healthAnomalyScore(r.score)
    return {
      ...r,
      deviceId,
      site,
      type,
      timestamp: r.iso || r.date,
      anomalyScore,
      notes: buildHealthTrendNotes({
        deviceId,
        site,
        date: r.date,
        score: r.score,
        anomalyScore,
        threshold,
      }),
    }
  })
}

export function withHealthTrendNotes(rows, threshold = 50) {
  return (rows || []).map(r => ({
    ...r,
    notes: buildHealthTrendNotes({ ...r, threshold }),
  }))
}

export function filterHealthTrend(rows, { query = '', dates = {} } = {}) {
  let out = rows || []
  const q = String(query || '').trim().toLowerCase()
  if (q) {
    out = out.filter(r =>
      [r.date, r.iso, r.score, r.deviceId, r.anomalyScore, r.notes]
        .join(' ')
        .toLowerCase()
        .includes(q),
    )
  }
  const start = dates.dateFrom || dates.dateTo
  const end = dates.dateTo || dates.dateFrom
  if (start) {
    out = out.filter(r => r.iso && r.iso >= start && r.iso <= end)
  }
  return out
}

export function toAvgHealthRows(devices) {
  return (devices || []).map(d => ({
    deviceId: d.deviceId || d.id,
    health: Number(d.health) || 0,
    type: d.type,
    site: d.site,
    status: d.status,
    category: d.category,
  }))
}

export function filterAvgHealthRows(rows, status) {
  const list = rows || []
  if (!status) return list
  return list.filter(r => r.status === status)
}

export function toDeviceHealthTableRows(devices) {
  return (devices || []).map(d => ({
    ...d,
    healthState: HEALTH_PIE_CATEGORIES.find(c => c.label === d.category)?.shortLabel
      || d.status
      || '—',
    maintText: formatMaintHistory(d.maintHistory, d.deviceId),
    trend: resolveHealthTrend(d),
  }))
}

export function healthNotifications(devices, onOpen) {
  return (devices || [])
    .filter(d => Number(d.health) < 65 || d.status === 'Critical' || d.status === 'Warning')
    .sort((a, b) => Number(a.health) - Number(b.health))
    .slice(0, 10)
    .map(d => {
      const cat = d.category || getHealthCategory(d.health)
      const critical = Number(d.health) < 50 || d.status === 'Critical'
      return {
        id: `health-${d.deviceId}`,
        severity: critical ? 'critical' : d.status === 'Warning' ? 'warning' : 'watch',
        asset: d.deviceId,
        msg: `Health Score ${d.health} — ${cat}`,
        time: d.site || '',
        onOpen: onOpen ? () => onOpen(d.deviceId) : undefined,
      }
    })
}

export function formatMaintDate(iso) {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return String(iso || '')
  const day = d.getUTCDate()
  const month = d.toLocaleDateString('en-GB', { month: 'long', timeZone: 'UTC' })
  const year = d.getUTCFullYear()
  return `${day} ${month}, ${year}`
}

export function formatMaintHistory(entries, deviceId) {
  const first = (entries || [])[0]
  if (!first) return ''
  const date = formatMaintDate(first.date)
  return `${date}  Issue ID : ${deviceId}\n${first.type}\nNotes: ${first.result}`
}

export function resolveHealthTrend({ health = 0, failProb = 0, lastMaint } = {}) {
  if (health < 20 || failProb >= 0.7) return 'Down'
  if (lastMaint != null && lastMaint <= 45) return 'Up'
  return 'Stable'
}

export const HEALTH_TREND_STYLE = {
  Up:     { color: '#FFCB05', icon: '/icons/trend-up.svg',     box: 'size-5' },
  Down:   { color: '#ED1A3B', icon: '/icons/trend-down.svg',   box: 'size-5' },
  Stable: { color: '#034EA2', icon: '/icons/trend-stable.svg', box: 'w-[16px] h-[6px]' },
}

export function toCriticalTableRows(devices) {
  return (devices || []).map(d => ({
    ...d,
    healthState: d.status || 'Critical',
    maintText: formatMaintHistory(d.maintHistory, d.deviceId),
    trend: resolveHealthTrend(d),
  }))
}
