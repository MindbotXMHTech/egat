function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function rankMatch(label, query) {
  const text = String(label ?? '').toLowerCase()
  const q = String(query ?? '').trim().toLowerCase()
  if (!q) return null
  if (text === q) return { rank: 0, index: 0 }
  if (text.startsWith(q)) return { rank: 1, index: 0 }
  const wordStart = new RegExp(`(?:^|[\\s\\-_/])${escapeRegExp(q)}`)
  const wordMatch = wordStart.exec(text)
  if (wordMatch) {
    const index = wordMatch.index + (wordMatch[0].length - q.length)
    return { rank: 2, index }
  }
  const index = text.indexOf(q)
  if (index >= 0) return { rank: 3, index }
  return null
}

/** Split label so the matching query can be highlighted. */
export function splitHighlight(label, query) {
  const text = String(label ?? '')
  const q = String(query ?? '').trim()
  if (!q) return [{ text, match: false }]
  const index = text.toLowerCase().indexOf(q.toLowerCase())
  if (index < 0) return [{ text, match: false }]
  const before = text.slice(0, index)
  const match = text.slice(index, index + q.length)
  const after = text.slice(index + q.length)
  return [
    ...(before ? [{ text: before, match: false }] : []),
    { text: match, match: true },
    ...(after ? [{ text: after, match: false }] : []),
  ]
}

/**
 * Rank suggestion rows like Google/YouTube: exact → prefix → word start → contains.
 * Empty query returns the first `limit` items in source order (browse on focus).
 */
export function rankSearchSuggestions(items, query, { limit = 8 } = {}) {
  const source = Array.isArray(items) ? items : []
  const q = String(query ?? '').trim()
  const cap = Math.max(1, limit)

  if (!q) return source.slice(0, cap)

  const bestByValue = new Map()
  source.forEach((item, sourceIndex) => {
    const label = item?.label ?? item?.value ?? ''
    const value = String(item?.value ?? label)
    const hit = rankMatch(label, q)
    if (!hit) return
    const key = value.toLowerCase()
    const next = { ...item, value, label, ...hit, sourceIndex }
    const prev = bestByValue.get(key)
    if (
      !prev ||
      next.rank < prev.rank ||
      (next.rank === prev.rank && next.index < prev.index) ||
      (next.rank === prev.rank && next.index === prev.index && String(next.label).length < String(prev.label).length)
    ) {
      bestByValue.set(key, next)
    }
  })

  return [...bestByValue.values()]
    .sort((a, b) => {
      if (a.rank !== b.rank) return a.rank - b.rank
      if (a.index !== b.index) return a.index - b.index
      const len = String(a.label).length - String(b.label).length
      if (len !== 0) return len
      return String(a.label).localeCompare(String(b.label), 'th')
    })
    .slice(0, cap)
}

export function fleetSearchSuggestions(fleet = []) {
  const items = []
  const sites = new Set()
  const types = new Set()
  const regions = new Set()
  for (const row of fleet) {
    if (row?.id) items.push({ value: row.id, label: row.id, group: 'อุปกรณ์' })
    if (row?.site) sites.add(row.site)
    if (row?.type) types.add(row.type)
    if (row?.region) regions.add(row.region)
  }
  for (const site of [...sites].sort((a, b) => a.localeCompare(b, 'th'))) {
    items.push({ value: site, label: site, group: 'สถานี' })
  }
  for (const type of [...types].sort((a, b) => a.localeCompare(b, 'th'))) {
    items.push({ value: type, label: type, group: 'ประเภท' })
  }
  for (const region of [...regions].sort((a, b) => a.localeCompare(b, 'th'))) {
    items.push({ value: region, label: region, group: 'ภูมิภาค' })
  }
  return items
}

function pushUnique(items, seen, value, group) {
  const label = String(value ?? '').trim()
  if (!label) return
  const key = `${group}:${label.toLowerCase()}`
  if (seen.has(key)) return
  seen.add(key)
  items.push({ value: label, label, group })
}

export function anomalySearchSuggestions(fleet = [], rows = []) {
  const items = fleetSearchSuggestions(fleet)
  const seen = new Set(items.map(item => `${item.group}:${item.value.toLowerCase()}`))
  for (const row of rows) {
    pushUnique(items, seen, row.deviceId, 'อุปกรณ์')
    pushUnique(items, seen, row.site, 'สถานี')
    pushUnique(items, seen, row.issueType, 'อาการ')
    pushUnique(items, seen, row.status, 'สถานะ')
    pushUnique(items, seen, row.algo, 'อัลกอริทึม')
    pushUnique(items, seen, row.assetType, 'ประเภท')
  }
  return items
}

export function incidentSearchSuggestions(incidents = [], siteByAsset = {}) {
  const items = []
  const seen = new Set()
  for (const row of incidents) {
    pushUnique(items, seen, row.id, 'เหตุการณ์')
    pushUnique(items, seen, row.title, 'หัวข้อ')
    pushUnique(items, seen, row.asset, 'อุปกรณ์')
    pushUnique(items, seen, siteByAsset[row.asset] || row.site, 'สถานี')
    pushUnique(items, seen, row.rootCause, 'สาเหตุ')
    pushUnique(items, seen, row.status, 'สถานะ')
  }
  return items
}
