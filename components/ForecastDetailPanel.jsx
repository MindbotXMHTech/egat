'use client'
import { useEffect, useMemo, useState } from 'react'
import ExportMenu from './ExportMenu'
import { exportTable } from '../lib/tableExport'
import {
  FORECAST_EXPORT_COLUMNS,
  filterForecastGroups,
  flattenForecastExport,
} from '../lib/lifecycleForecast'

export default function ForecastDetailPanel({
  forecast,
  monthKey,
  onSelectMonth,
  openKey,
  onToggle,
  onClose,
  onSelectDevice,
}) {
  const [query, setQuery] = useState('')
  const months = forecast?.months || []
  const activeKey = monthKey || months[0]?.key
  const activeMonth = months.find(m => m.key === activeKey) || months[0]
  const groups = activeMonth?.groups || []

  useEffect(() => {
    setQuery('')
  }, [forecast?.quarter, activeKey])

  const visible = useMemo(
    () => filterForecastGroups(groups, query),
    [groups, query],
  )

  useEffect(() => {
    if (!openKey) return
    const node = document.querySelector(`[data-forecast-group="${openKey}"]`)
    node?.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
  }, [openKey, visible])

  function handleExport(format) {
    exportTable(format, {
      columns: FORECAST_EXPORT_COLUMNS,
      rows: flattenForecastExport(forecast, activeKey, visible),
      filename: 'asset_forecasting',
      title: `Replacement ${forecast?.quarter || ''} ${activeMonth?.label || ''}`,
    })
  }

  return (
    <aside
      className="flex flex-col gap-2.5 rounded-lg p-4 w-full overflow-hidden shrink-0 lg:max-w-[452px]"
      style={{
        background: '#034EA2',
        boxShadow: '0 0 20px rgba(0,0,0,0.1)',
        height: 360,
      }}
    >
      <div className="flex items-start justify-between gap-2 shrink-0 w-full">
        <h3 className="text-base font-bold text-white truncate leading-normal min-w-0">
          Assets to Replace : {forecast?.quarter || ''}
        </h3>
        <button
          type="button"
          onClick={onClose}
          className="text-white/80 hover:text-white text-lg leading-none px-1 shrink-0"
          aria-label="ปิดรายละเอียด"
        >
          ×
        </button>
      </div>
      {forecast?.budget != null ? (
        <p className="text-[11px] text-white/70 -mt-1 shrink-0">
          Budget ฿{Number(forecast.budget).toLocaleString()} · {forecast.count} อุปกรณ์
        </p>
      ) : null}

      <div className="flex flex-wrap gap-1.5 shrink-0">
        {months.map(m => (
          <button
            key={m.key}
            type="button"
            onClick={() => onSelectMonth?.(m.key)}
            className="text-[11px] px-2 py-1 rounded-md whitespace-nowrap"
            style={m.key === activeKey
              ? { background: '#FFCB05', color: '#034EA2', fontWeight: 700 }
              : { background: 'rgba(255,255,255,0.12)', color: '#fff' }}
          >
            {m.label}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="🔍 ค้นหา..."
          className="text-xs rounded-lg px-[10px] py-[6px] bg-white text-egat-text placeholder:text-[#9CA3AF] min-w-0 flex-1 focus:outline-none"
        />
        <ExportMenu onSelect={handleExport} />
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden flex flex-col gap-2.5">
        {visible.length === 0 ? (
          <p className="text-sm text-white/80 py-2">ไม่พบข้อมูล</p>
        ) : visible.map(g => {
          const open = openKey === g.key
          return (
            <div key={g.key} data-forecast-group={g.key} className="bg-white rounded p-2 shrink-0 w-full">
              <button
                type="button"
                className="flex items-center justify-between w-full gap-2 text-left"
                onClick={() => onToggle?.(g.key)}
                aria-expanded={open}
              >
                <span className="flex items-center gap-2 min-w-0 flex-1">
                  <span className="size-2 rounded-full shrink-0" style={{ background: g.color }} />
                  <span className="min-w-0">
                    <span className="block text-base text-[#222] truncate leading-[19px]">{g.groupName}</span>
                    <span className="block text-[11px] text-[#666] truncate">{g.label} · {g.count} รายการ</span>
                  </span>
                </span>
                <span className={`size-6 overflow-hidden shrink-0 ${open ? '' : '-scale-y-100'}`}>
                  <img src="/icons/chevron-yellow.svg" alt="" className="w-full h-full" />
                </span>
              </button>
              {open && (
                <div className="mt-2 pt-2 border-t border-[#E8E8E8]">
                  {g.devices.length === 0 ? (
                    <p className="text-sm text-[#666] py-1">ไม่มีอุปกรณ์ในเดือนนี้</p>
                  ) : g.devices.map((d, i) => (
                    <button
                      key={`${d.id}-${i}`}
                      type="button"
                      onClick={() => onSelectDevice?.(d.id)}
                      className={`w-full text-left ${i > 0 ? 'border-t border-[#E8E8E8] pt-2 mt-2' : ''}`}
                    >
                      <div className="text-sm font-semibold text-[#034EA2]">{d.id}</div>
                      <div className="text-[11px] text-[#666] flex items-center justify-between gap-2">
                        <span className="truncate">{d.site}</span>
                        <span className="shrink-0">RUL {d.rul} yr</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </aside>
  )
}
