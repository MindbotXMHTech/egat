export const ALERT_STATUSES = ['New', 'In Process', 'Resolved']
export const UNRESOLVED_STATUSES = ['New', 'In Process']

const SEVERITY_TO_STATUS = {
  Critical: 'New',
  High: 'In Process',
  Medium: 'Resolved',
  Low: 'Resolved',
}

export function createEmptyAlertFilters() {
  return {
    timestamp: '',
    deviceId: '',
    anomalyType: 'All',
    score: '',
    status: 'All',
    rootCause: 'All',
  }
}

export function scoreFromZ(zscore) {
  const n = Number(zscore)
  if (!Number.isFinite(n)) return 1
  return Math.min(99, Math.max(1, Math.round(n * 18)))
}

export function formatAlertTimestamp(ts) {
  const m = String(ts || '').match(/^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})(?::(\d{2}))?/)
  if (!m) return String(ts || '')
  const [, y, mo, d, h, mi, s] = m
  return `${d}/${mo}/${y} ${h}:${mi}:${s || '00'}`
}

const CLUE_LAYER_COLOR = {
  Statistical: '#1B3A6B',
  Metric: '#1A56DB',
  IQR: '#C05621',
  LSTM: '#7C3AED',
  Model: '#B7791F',
  Action: '#1A7F4B',
}

export function clueLayerColor(layer) {
  return CLUE_LAYER_COLOR[layer] || '#8896A4'
}

/** Ranked Root Cause Clues for TOR 4.3 / 4.5 / 4.7 modal. */
export function buildRootCauseClues(row) {
  const clues = []
  const z = Number(row.zscore)
  if (Number.isFinite(z)) {
    clues.push({
      name: `Z-Score ${z.toFixed(2)}`,
      detail: z >= 3.5
        ? 'ค่าผิดปกติสูงมากเมื่อเทียบกับค่าเฉลี่ยย้อนหลัง'
        : z >= 2.5
          ? 'เกินเกณฑ์ anomaly (Z-Score > 2.5)'
          : 'เข้าใกล้เกณฑ์เฝ้าระวัง',
      prob: Math.min(0.99, z / 5),
      layer: 'Statistical',
    })
  }
  if (row.anomalyType) {
    clues.push({
      name: row.anomalyType,
      detail: row.value ? `ค่าที่วัดได้ ${row.value}` : 'สัญญาณ KPI ผิดปกติ',
      prob: Math.min(0.95, Math.max(0.4, (Number(row.score) || 50) / 100)),
      layer: 'Metric',
    })
  }
  if (row.iqr) {
    clues.push({
      name: 'IQR outlier',
      detail: 'ค่านอกช่วงควอไทล์ของข้อมูลย้อนหลัง',
      prob: 0.72,
      layer: 'IQR',
    })
  }
  if (row.lstm) {
    clues.push({
      name: 'LSTM reconstruction error',
      detail: 'รูปแบบไม่ตรงกับที่ AutoEncoder เรียนรู้',
      prob: 0.78,
      layer: 'LSTM',
    })
  }
  if (row.algo) {
    clues.push({
      name: `Algorithm: ${row.algo}`,
      detail: 'อัลกอริทึมที่ใช้ตรวจจับเหตุการณ์นี้',
      prob: 0.55,
      layer: 'Model',
    })
  }
  if (row.rootCause || row.action) {
    clues.push({
      name: row.rootCause || row.action,
      detail: 'Recommended Action จากระดับความรุนแรง',
      prob: 0.62,
      layer: 'Action',
    })
  }
  return clues.sort((a, b) => b.prob - a.prob)
}

export function toAnomalyAlertRow(row) {
  const score = scoreFromZ(row.zscore)
  const mapped = {
    deviceId: row.deviceId,
    anomalyType: row.issueType,
    zscore: row.zscore,
    score,
    scoreLabel: `${score}/100`,
    status: SEVERITY_TO_STATUS[row.status] || 'New',
    rootCause: row.action,
    timestamp: row.timestamp,
    timestampLabel: formatAlertTimestamp(row.timestamp),
    site: row.site,
    value: row.value,
    algo: row.algo,
    iqr: row.iqr,
    lstm: row.lstm,
    assetType: row.assetType,
  }
  mapped.clues = buildRootCauseClues(mapped)
  return mapped
}

export function toAvgScoreRows(rows) {
  const groups = new Map()
  for (const r of rows) {
    const list = groups.get(r.deviceId) || []
    list.push(r)
    groups.set(r.deviceId, list)
  }
  return [...groups.entries()].map(([deviceId, list]) => {
    const avgZ = list.reduce((s, x) => s + Number(x.zscore || 0), 0) / list.length
    const score = scoreFromZ(avgZ)
    return {
      deviceId,
      zscore: +avgZ.toFixed(2),
      score,
      scoreLabel: `${score}/100`,
      timestamp: list[0].timestamp,
      timestampLabel: list[0].timestampLabel,
      site: list[0].site,
    }
  })
}

export function uniqueAlertValues(rows, key) {
  return [...new Set(rows.map(r => r[key]))].filter(Boolean).sort((a, b) => String(a).localeCompare(String(b), 'th'))
}

export function alertSortField(key) {
  if (key === 'scoreLabel') return 'score'
  if (key === 'timestampLabel') return 'timestamp'
  return key
}

export function sortAlertRows(rows, key, dir) {
  if (!key || !dir) return rows
  const field = alertSortField(key)
  const copy = [...rows]
  copy.sort((a, b) => {
    const av = a[field]
    const bv = b[field]
    const na = Number(av)
    const nb = Number(bv)
    const aVal = Number.isFinite(na) && av !== '' && av != null ? na : String(av ?? '')
    const bVal = Number.isFinite(nb) && bv !== '' && bv != null ? nb : String(bv ?? '')
    if (aVal < bVal) return dir === 'asc' ? -1 : 1
    if (aVal > bVal) return dir === 'asc' ? 1 : -1
    return 0
  })
  return copy
}

export function nextAlertSort(currentKey, currentDir, nextKey) {
  if (currentKey === nextKey) {
    return { key: nextKey, dir: currentDir === 'desc' ? 'asc' : 'desc' }
  }
  const descFirst = nextKey === 'scoreLabel' || nextKey === 'timestampLabel' || nextKey === 'score' || nextKey === 'timestamp'
  return { key: nextKey, dir: descFirst ? 'desc' : 'asc' }
}

export function filterAnomalyAlerts(rows, filters) {
  const deviceQ = (filters.deviceId || '').trim().toLowerCase()
  const scoreQ = (filters.score || '').trim().toLowerCase()
  const timeQ = (filters.timestamp || '').trim().toLowerCase()
  return rows.filter(r => {
    if (deviceQ && !String(r.deviceId).toLowerCase().includes(deviceQ)) return false
    if (timeQ && !String(r.timestampLabel || r.timestamp || '').toLowerCase().includes(timeQ)) return false
    if (filters.anomalyType && filters.anomalyType !== 'All' && r.anomalyType !== filters.anomalyType) return false
    if (scoreQ && !String(r.scoreLabel || '').toLowerCase().includes(scoreQ)) return false
    if (filters.status && filters.status !== 'All' && r.status !== filters.status) return false
    if (filters.rootCause && filters.rootCause !== 'All' && r.rootCause !== filters.rootCause) return false
    return true
  })
}

export function pageRangeLabel(page, pageSize, total) {
  if (total === 0) return `0 - 0 of 0`
  const from = (page - 1) * pageSize + 1
  const to = Math.min(page * pageSize, total)
  return `${from} - ${to} of ${total}`
}

export const TOTAL_ANOMALY_COLUMNS = [
  { key: 'deviceId',    label: 'Device ID',         kind: 'text' },
  { key: 'anomalyType', label: 'Anomaly Type',      kind: 'select' },
  { key: 'scoreLabel',  label: 'Anomaly Score',     kind: 'text',   filterKey: 'score' },
  { key: 'status',      label: 'Status',            kind: 'select' },
  { key: 'rootCause',   label: 'Root Cause Clues',  kind: 'select', align: 'left' },
]

export const AVG_SCORE_COLUMNS = [
  { key: 'deviceId',   label: 'Device ID',     kind: 'text' },
  { key: 'scoreLabel', label: 'Anomaly Score', kind: 'text', filterKey: 'score' },
]

export const UNRESOLVED_COLUMNS = [
  { key: 'timestampLabel', label: 'Timestamp',        kind: 'text',   filterKey: 'timestamp', align: 'left' },
  { key: 'deviceId',       label: 'Device ID',        kind: 'text' },
  { key: 'anomalyType',    label: 'Anomaly Type',     kind: 'select' },
  { key: 'scoreLabel',     label: 'Anomaly Score',    kind: 'text',   filterKey: 'score' },
  { key: 'status',         label: 'Status',           kind: 'select' },
  { key: 'rootCause',      label: 'Root Cause Clues', kind: 'select', align: 'left' },
]

/** TOR 4.7 Anomaly Alerts — Timestamp, Device ID, Anomaly Type, Score, Status, Root Cause Clues. */
export const ALERT_COLUMNS = UNRESOLVED_COLUMNS
