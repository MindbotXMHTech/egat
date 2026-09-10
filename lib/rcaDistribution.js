export const RCA_CATEGORIES = [
  'Hardware Failure',
  'Software Bug',
  'Configuration Error',
  'External/Environmental',
]

const RCA_ALERT_SEV = { P1: 'critical', P2: 'warning', P3: 'watch' }

export function issueTypeFromIncident(inc) {
  const first = String(inc?.rootCause || '').split('→')[0].trim()
  if (first) return first
  return inc?.causes?.[0]?.name || '-'
}

export function contributingFactorsFromIncident(inc) {
  const names = (inc?.causes || []).slice(1).map(c => c.name).filter(Boolean)
  return names.length ? names.join(' · ') : '-'
}

export function toRcaTableRow(inc) {
  return {
    id: inc.id,
    asset: inc.asset,
    title: inc.title,
    start: inc.start,
    duration: inc.duration,
    rootCause: inc.rootCause,
    issueType: issueTypeFromIncident(inc),
    contributingFactors: contributingFactorsFromIncident(inc),
    severity: inc.severity,
    status: inc.status,
    services: inc.affectedServices,
    dataLoss: inc.dataLoss ? 'ใช่' : 'ไม่',
    topCause: inc.causes?.[0]?.name || '-',
    confidence: inc.causes?.[0]?.prob ? `${(inc.causes[0].prob * 100).toFixed(0)}%` : '-',
    confNum: inc.causes?.[0]?.prob || 0,
    layer: inc.causes?.[0]?.layer || '-',
    cascadeCount: inc.cascade?.length || 0,
    category: classifyRcaCategory(inc.rootCause),
    _inc: inc,
  }
}

export function toRcaConfidenceRows(table) {
  return [...(table || [])]
    .map(r => ({
      id: r.id,
      asset: r.asset,
      category: r.category,
      confidence: r.confidence,
      confNum: r.confNum,
      issueType: r.issueType,
      contributingFactors: r.contributingFactors,
      _inc: r._inc,
    }))
    .sort((a, b) => b.confNum - a.confNum)
}

export function pieDistFromRows(rows, palette) {
  const counts = Object.fromEntries(RCA_CATEGORIES.map(c => [c, 0]))
  for (const r of rows || []) {
    if (counts[r.category] != null) counts[r.category] += 1
  }
  return (palette || []).map(e => ({
    ...e,
    count: counts[e.category] || 0,
  }))
}

export function visibleRcaPieData(dist, hidden) {
  const hiddenSet = hidden instanceof Set ? hidden : new Set(hidden || [])
  const visible = (dist || []).filter(e => !hiddenSet.has(e.category))
  const total = visible.reduce((s, e) => s + Number(e.count || 0), 0)
  return visible.map(e => ({
    ...e,
    pct: total ? Math.round((Number(e.count) / total) * 100) : 0,
  }))
}

export function nextHiddenCategories(hidden, category, allCategories = RCA_CATEGORIES) {
  const next = new Set(hidden)
  if (next.has(category)) {
    next.delete(category)
    return next
  }
  const visibleCount = allCategories.filter(c => !next.has(c)).length
  if (visibleCount <= 1) return next
  next.add(category)
  return next
}

export function rcaAlertsFromIncidents(incidents, onOpen) {
  return [...(incidents || [])]
    .sort((a, b) => String(b.start).localeCompare(String(a.start)))
    .slice(0, 6)
    .map(inc => ({
      id: `rca-${inc.id}`,
      severity: RCA_ALERT_SEV[inc.severity] || 'info',
      asset: inc.asset,
      msg: `RCA ใหม่ ${inc.id} — ${inc.title}`,
      time: inc.start,
      onOpen: onOpen ? () => onOpen(inc.id) : undefined,
    }))
}

export function classifyRcaCategory(rootCause = '') {
  const rc = String(rootCause)
  if (
    rc.includes('Hardware') ||
    rc.includes('Fiber Cut') ||
    rc.includes('UPS') ||
    rc.includes('Power') ||
    rc.includes('Line Card')
  ) {
    return 'Hardware Failure'
  }
  if (rc.includes('Bug') || rc.includes('Memory')) return 'Software Bug'
  if (rc.includes('Config') || rc.includes('Misconfig')) return 'Configuration Error'
  return 'External/Environmental'
}

export function resolveRcaPieCategory(data) {
  if (data == null) return null
  if (typeof data === 'string') {
    return RCA_CATEGORIES.includes(data) ? data : null
  }
  const candidates = [
    data.category,
    data.payload?.category,
    data.name,
    typeof data.value === 'string' ? data.value : null,
  ]
  return candidates.find(c => typeof c === 'string' && RCA_CATEGORIES.includes(c)) || null
}

export function toRcaDetailRows(table, category) {
  return (table || [])
    .filter(r => r.category === category)
    .map(r => ({
      id: r.id,
      issue: String(r.id).replace(/^INC-20\d\d-/, ''),
      rate: r.confidence,
      description: r.title || r.rootCause || '',
      asset: r.asset,
    }))
}

export function filterRcaDetailRows(rows, query) {
  const q = (query || '').trim().toLowerCase()
  if (!q) return rows || []
  return (rows || []).filter(r =>
    [r.issue, r.id, r.description, r.rate, r.asset].join(' ').toLowerCase().includes(q),
  )
}

export const RCA_PIE_EXPORT_COLUMNS = [
  { key: 'issue', label: 'รหัสแจ้งซ่อม' },
  { key: 'rate', label: 'โอกาสเกิดปัญหา' },
  { key: 'description', label: 'รายละเอียด' },
  { key: 'asset', label: 'Device ID' },
  { key: 'id', label: 'Incident ID' },
]

export function rcaCategoryTitle(category) {
  return category ? `${category} Detail` : 'Category Detail'
}
