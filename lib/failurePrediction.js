export const FAILURE_GROUPS = [
  { key: 'sdh',    label: 'SDH',    groupName: 'Failure Device Group A', color: '#1B3A6B', assetType: 'SDH' },
  { key: 'dwdm',   label: 'DWDM',   groupName: 'Failure Device Group B', color: '#1A56DB', assetType: 'DWDM' },
  { key: 'router', label: 'Router', groupName: 'Failure Device Group C', color: '#7C3AED', assetType: 'Router' },
  { key: 'mw',     label: 'MW',     groupName: 'Failure Device Group D', color: '#E8960C', assetType: 'MW' },
]

export function pickPredictedDevices(fleet, assetType, count, monthIndex) {
  const pool = (fleet || [])
    .filter(f => f.type === assetType)
    .slice()
    .sort((a, b) => (b.failProb - a.failProb) || String(a.id).localeCompare(String(b.id)))
  const n = Number(count) || 0
  if (!pool.length || n <= 0) return []
  const start = ((Number(monthIndex) || 0) % pool.length + pool.length) % pool.length
  return Array.from({ length: n }, (_, i) => pool[(start + i) % pool.length])
}

export function buildFailureGroups(row, monthIndex, fleet) {
  return FAILURE_GROUPS.map(g => {
    const count = Number(row?.[g.key]) || 0
    return {
      ...g,
      count,
      devices: pickPredictedDevices(fleet, g.assetType, count, monthIndex),
    }
  })
}

export function failureDetailTitle(typeKey) {
  if (!typeKey || typeKey === 'all') return 'All'
  return FAILURE_GROUPS.find(g => g.key === typeKey)?.label || 'All'
}

export function parseFailureBarClick(data, typeKey, rows) {
  const payload = data?.payload || data
  const month = payload?.month
  if (!month || !typeKey) return null
  const list = rows || []
  const monthIndex = list.findIndex(r => r.month === month)
  const row = monthIndex >= 0 ? list[monthIndex] : payload
  return {
    month,
    monthIndex: monthIndex < 0 ? 0 : monthIndex,
    typeKey,
    row,
  }
}

export function isSameFailureSelection(prev, next) {
  return Boolean(
    prev && next && prev.month === next.month && prev.typeKey === next.typeKey,
  )
}
