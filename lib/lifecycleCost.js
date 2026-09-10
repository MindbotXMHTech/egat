export const LCC_CATEGORIES = [
  { key: 'Acquisition', color: '#1B3A6B' },
  { key: 'Maintenance', color: '#E8960C' },
  { key: 'Disposal',    color: '#C05621' },
  { key: 'Operational', color: '#1A7F4B' },
]

export function assetLccCost(asset, category) {
  if (!asset) return 0
  switch (category) {
    case 'Acquisition':
      return Math.round(asset.replaceCost * (asset.age <= 1 ? 1 : 0.05))
    case 'Maintenance':
      return Math.round(asset.maintCost * asset.age)
    case 'Disposal':
      return Math.round(asset.replaceCost * 0.06)
    case 'Operational':
      return Math.round(asset.maintCost * 1.2)
    default:
      return 0
  }
}

export function buildLccPieData(cost) {
  const src = cost || {}
  return LCC_CATEGORIES.map(c => ({
    name: c.key,
    value: Math.round(((src[c.key.toLowerCase()] || 0) / 1e6) * 10) / 10,
    color: c.color,
  }))
}

export function resolveLccPieCategory(data) {
  const match = value => LCC_CATEGORIES.find(c => c.key === value)?.key || null

  if (data == null) return null
  if (typeof data === 'string') return match(data)

  const candidates = [
    data.name,
    data.payload?.name,
    data.payload?.payload?.name,
    data.label,
    typeof data.value === 'string' ? data.value : null,
  ]
  for (const c of candidates) {
    const hit = match(c)
    if (hit) return hit
  }
  return null
}

export function lccCategoryTitle(name) {
  return name ? `${name} Detail` : 'Detail'
}

export function lccCategoryColor(name) {
  return LCC_CATEGORIES.find(c => c.key === name)?.color || '#E8960C'
}

export function toLccDetailRows(assets, category) {
  if (!category) return []
  return (assets || []).map(a => ({
    id: a.id,
    item: a.id,
    type: a.type,
    site: a.site,
    cost: assetLccCost(a, category),
  }))
}

export function filterLccDetailRows(rows, query, typeFilter) {
  let out = rows || []
  if (typeFilter) out = out.filter(r => r.type === typeFilter)
  const q = (query || '').trim().toLowerCase()
  if (!q) return out
  return out.filter(r =>
    [r.item, r.id, r.type, r.site, r.cost].join(' ').toLowerCase().includes(q),
  )
}

export function sortLccDetailRows(rows, dir = 'desc') {
  const copy = [...(rows || [])]
  copy.sort((a, b) => (dir === 'asc' ? a.cost - b.cost : b.cost - a.cost))
  return copy
}

export function uniqueLccTypes(rows) {
  return [...new Set((rows || []).map(r => r.type).filter(Boolean))]
}

export const LCC_EXPORT_COLUMNS = [
  { key: 'item', label: 'Item' },
  { key: 'cost', label: 'Cost' },
  { key: 'type', label: 'Type' },
  { key: 'site', label: 'Site' },
]
