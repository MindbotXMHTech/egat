'use client'
import { useMemo, useState } from 'react'
import DataTable from './DataTable'
import StatusBadge from './StatusBadge'
import {
  HEALTH_STATUS_OPTIONS,
  filterAvgHealthRows,
  healthScoreColor,
} from '../lib/healthDistribution'

export default function AvgHealthView({ rows = [], onBack, onSelect }) {
  const [status, setStatus] = useState('')
  const visible = useMemo(() => filterAvgHealthRows(rows, status), [rows, status])

  return (
    <div className="animate-fade-in flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2 rounded-lg border border-solid text-base font-bold whitespace-nowrap"
          style={{ borderColor: '#FFCB05', color: '#034EA2', background: '#fff' }}
        >
          Back
          <span className="size-4 overflow-hidden shrink-0 inline-flex">
            <img src="/icons/alerts-back.svg" alt="" className="w-full h-full" />
          </span>
        </button>
        <h1 className="text-2xl sm:text-[32px] font-bold leading-none" style={{ color: '#034EA2' }}>
          Avg. Health Score
        </h1>
      </div>
      <div className="card p-5">
        <div className="flex flex-wrap items-end gap-3 mb-3">
          <div>
            <label
              htmlFor="avg-health-status"
              className="block text-[10px] font-semibold uppercase tracking-wider text-egat-text-muted mb-1"
            >
              Status
            </label>
            <select
              id="avg-health-status"
              value={status}
              onChange={e => setStatus(e.target.value)}
              className="text-xs border border-egat-border rounded-lg px-3 py-1.5 bg-egat-surface text-egat-text focus:outline-none focus:border-egat-navy"
              aria-label="กรองสถานะ"
            >
              <option value="">ทุกสถานะ</option>
              {HEALTH_STATUS_OPTIONS.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <p className="text-[10px] text-egat-text-muted pb-1.5">
            กรองตามสถานะอุปกรณ์ · {visible.length} จาก {rows.length} รายการ
          </p>
        </div>
        <DataTable
          title="Avg Health"
          exportName="avg_health_score"
          columns={[
            {
              key: 'deviceId',
              label: 'Device ID',
              sortable: true,
              render: v => <span className="font-semibold text-egat-navy">{v}</span>,
            },
            {
              key: 'health',
              label: 'Avg Health Score',
              sortable: true,
              render: v => (
                <span className="font-black" style={{ color: healthScoreColor(v), fontFamily: 'Inter,sans-serif' }}>
                  {v}
                </span>
              ),
            },
            {
              key: 'status',
              label: 'Status',
              sortable: true,
              render: v => <StatusBadge status={v} size="xs" />,
            },
            { key: 'type', label: 'Type', sortable: true },
            { key: 'site', label: 'Site', sortable: true },
          ]}
          data={visible}
          onRowClick={row => onSelect?.(row.deviceId)}
        />
      </div>
    </div>
  )
}
