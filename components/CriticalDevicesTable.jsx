'use client'
import DataTable from './DataTable'
import { HEALTH_TREND_STYLE, toCriticalTableRows } from '../lib/healthDistribution'

export function TrendCell({ value }) {
  const t = HEALTH_TREND_STYLE[value] || HEALTH_TREND_STYLE.Stable
  return (
    <span className="inline-flex items-center justify-center gap-2">
      <span style={{ color: t.color }}>{value}</span>
      <span className={`${t.box} overflow-hidden shrink-0 inline-flex`}>
        <img src={t.icon} alt="" className="w-full h-full" />
      </span>
    </span>
  )
}

function MaintHistoryDetail(row) {
  const history = Array.isArray(row.maintHistory) ? row.maintHistory : []
  const fields = [
    ['Device ID', row.deviceId],
    ['Health Score', row.health],
    ['Health State', row.healthState || row.status],
    ['Trend', row.trend],
  ]
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        {fields.map(([k, v]) => (
          <div key={k} className="bg-egat-surface-alt rounded-lg p-3">
            <div className="text-[10px] text-egat-text-muted uppercase tracking-wider mb-0.5">{k}</div>
            <div className="text-sm font-semibold text-egat-text">{String(v ?? '—')}</div>
          </div>
        ))}
      </div>
      <div>
        <div className="text-[10px] font-semibold uppercase text-egat-text-muted mb-2">Maintenance History</div>
        {history.length === 0 ? (
          <p className="text-xs text-egat-text-muted">ไม่มีประวัติซ่อม</p>
        ) : (
          <div className="space-y-2">
            {history.map((m, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-egat-surface-alt border border-egat-border-lt">
                <div className="w-1.5 h-1.5 rounded-full bg-egat-navy flex-shrink-0 mt-1" />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-egat-text">{m.type}</span>
                    <span className="text-[10px] text-egat-text-muted">{m.date}</span>
                  </div>
                  <div className="text-[10px] text-egat-text-sub mt-0.5">
                    {m.result}{m.cost != null ? ` · ฿${Number(m.cost).toLocaleString()}` : ''}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

const COLUMNS = [
  {
    key: 'deviceId',
    label: 'Device ID',
    sortable: true,
  },
  {
    key: 'health',
    label: 'Health Score',
    sortable: true,
  },
  {
    key: 'healthState',
    label: 'Health State',
    sortable: true,
    render: v => (
      <span style={{ color: v === 'Critical' ? '#ED1A3B' : '#222' }}>{v}</span>
    ),
  },
  {
    key: 'maintText',
    label: 'Maintenance History',
    sortable: false,
    align: 'left',
    render: v => (
      <span className="block text-left text-sm leading-snug whitespace-pre-line line-clamp-3">
        {v || '—'}
      </span>
    ),
  },
  {
    key: 'trend',
    label: 'Trend',
    sortable: true,
    render: v => <TrendCell value={v} />,
  },
]

export default function CriticalDevicesTable({ data = [], onRowClick, rowDetail = MaintHistoryDetail }) {
  const rows = toCriticalTableRows(data)

  return (
    <div>
      <h2 className="text-xl font-bold text-[#034EA2] mb-4">Critical Devices</h2>
      <DataTable
        variant="sheet"
        hideDetailColumn
        title="Critical Devices"
        exportName="critical_devices"
        columns={COLUMNS}
        data={rows}
        onRowClick={onRowClick}
        rowDetail={rowDetail}
      />
      <p className="text-[10px] text-egat-text-muted mt-2">คลิกแถวเพื่อดูประวัติซ่อม</p>
    </div>
  )
}
