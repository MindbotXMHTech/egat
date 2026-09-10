'use client'
import { uniqueSites } from '../../lib/anomalyFilters'
import { FLEET } from '../../lib/data'
import { FieldLabel } from './AccountUi'

const SITES = uniqueSites(FLEET)

export default function SiteAccessPicker({
  allSites,
  sites = [],
  onChange,
}) {
  const selected = new Set(sites)

  function setAll(next) {
    onChange({ sitesAll: next, sites: next ? [] : sites })
  }

  function toggle(site) {
    const next = new Set(selected)
    if (next.has(site)) next.delete(site)
    else next.add(site)
    onChange({ sitesAll: false, sites: SITES.filter(s => next.has(s)) })
  }

  function selectAllListed() {
    onChange({ sitesAll: false, sites: [...SITES] })
  }

  return (
    <div className="flex flex-col gap-3">
      <FieldLabel required>Sites</FieldLabel>
      <label className="flex items-center gap-2 text-base cursor-pointer" style={{ color: '#222' }}>
        <input
          type="checkbox"
          checked={allSites}
          onChange={e => setAll(e.target.checked)}
          className="size-4 rounded"
        />
        ทุกไซต์
      </label>
      {!allSites && (
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3 text-xs" style={{ color: '#64748B' }}>
            <button type="button" className="underline" onClick={selectAllListed}>เลือกทั้งหมด</button>
            <button type="button" className="underline" onClick={() => onChange({ sitesAll: false, sites: [] })}>
              ล้าง
            </button>
            <span>เลือกแล้ว {selected.size} ไซต์</span>
          </div>
          <div
            className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 max-h-52 overflow-y-auto rounded-lg p-3"
            style={{ border: '1px solid #034EA2' }}
          >
            {SITES.map(site => (
              <label key={site} className="flex items-center gap-2 text-sm cursor-pointer" style={{ color: '#222' }}>
                <input
                  type="checkbox"
                  checked={selected.has(site)}
                  onChange={() => toggle(site)}
                  className="size-4 rounded"
                />
                {site}
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
