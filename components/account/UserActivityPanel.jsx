'use client'
import { useEffect, useMemo, useState } from 'react'
import { ChevronDown } from 'lucide-react'
import {
  ACTIVITY_KIND,
  ACTIVITY_LOOKBACK_DAYS,
  activitiesForAccount,
  filterActivities,
  filtersForActivities,
  formatActivityTime,
} from '../../lib/userActivity'

function KindBadge({ kind }) {
  const meta = ACTIVITY_KIND[kind] || ACTIVITY_KIND.view
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold tracking-wide"
      style={{ background: meta.bg, color: meta.color }}
    >
      {meta.label}
    </span>
  )
}

function ResultPill({ result }) {
  const ok = result !== 'denied'
  return (
    <span
      className="text-[11px] font-semibold"
      style={{ color: ok ? '#1A7F4B' : '#C53030' }}
    >
      {ok ? 'สำเร็จ' : 'ไม่สำเร็จ'}
    </span>
  )
}

export default function UserActivityPanel({ account }) {
  const [open, setOpen] = useState(false)
  const [filter, setFilter] = useState('all')

  const rows = useMemo(() => activitiesForAccount(account), [account])
  const filters = useMemo(() => filtersForActivities(rows), [rows])
  const visible = useMemo(() => filterActivities(rows, filter), [rows, filter])
  const latest = rows[0]

  useEffect(() => {
    setFilter('all')
  }, [account?.id])

  return (
    <div className="rounded-lg overflow-hidden bg-white">
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        aria-expanded={open}
        className="w-full flex items-center gap-3 px-5 py-4 text-left"
        style={{ background: '#034EA2' }}
      >
        <span className="w-1 self-stretch rounded-full shrink-0" style={{ background: '#FFCB05', minHeight: 28 }} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-white font-bold text-base">User Activity</span>
            <span
              className="text-[11px] font-semibold px-2 py-0.5 rounded-full"
              style={{ background: 'rgba(255,203,5,0.18)', color: '#FFCB05' }}
            >
              {ACTIVITY_LOOKBACK_DAYS} วัน
            </span>
          </div>
          <p className="text-xs mt-0.5 truncate" style={{ color: 'rgba(255,255,255,0.72)' }}>
            {rows.length
              ? `${rows.length} รายการ · ล่าสุด ${formatActivityTime(latest.at)}`
              : 'ยังไม่มีกิจกรรมใน 90 วัน'}
          </p>
        </div>
        <ChevronDown
          size={20}
          className="shrink-0 transition-transform"
          style={{ color: '#FFCB05', transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}
        />
      </button>

      {open && (
        <div className="px-5 py-4 flex flex-col gap-4">
          <p className="text-xs" style={{ color: '#64748B' }}>
            บันทึกการเข้าใช้และการดำเนินการบน Admin Web Portal ย้อนหลัง {ACTIVITY_LOOKBACK_DAYS} วัน (ข้อมูลจำลอง)
          </p>

          <div className="flex flex-wrap gap-2">
            {filters.map(f => {
              const active = filter === f.id
              return (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setFilter(f.id)}
                  className="px-3 py-1 rounded-full text-xs font-semibold"
                  style={
                    active
                      ? { background: '#034EA2', color: '#fff' }
                      : { background: '#E8F0FA', color: '#034EA2' }
                  }
                >
                  {f.label}
                </button>
              )
            })}
          </div>

          {visible.length === 0 ? (
            <div className="rounded-lg px-4 py-8 text-center text-sm" style={{ background: '#F8FAFC', color: '#64748B' }}>
              ไม่มีกิจกรรมในหมวดนี้
            </div>
          ) : (
            <ul className="flex flex-col max-h-[420px] overflow-y-auto pr-1">
              {visible.map((item, index) => {
                const meta = ACTIVITY_KIND[item.kind] || ACTIVITY_KIND.view
                return (
                  <li
                    key={item.id}
                    className="flex gap-3 py-3"
                    style={{ borderTop: index === 0 ? 'none' : '1px solid #EEF2F7' }}
                  >
                    <span
                      className="mt-1.5 size-2.5 rounded-full shrink-0"
                      style={{ background: meta.color }}
                    />
                    <div className="flex-1 min-w-0 flex flex-col gap-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <KindBadge kind={item.kind} />
                        <span className="ml-auto">
                          <ResultPill result={item.result} />
                        </span>
                      </div>
                      <p className="text-sm font-medium" style={{ color: '#0D2240' }}>{item.detail}</p>
                      <p className="text-xs" style={{ color: '#64748B' }}>
                        {formatActivityTime(item.at)}
                        {item.module ? ` · ${item.module}` : ''}
                        {item.ip ? ` · IP ${item.ip}` : ''}
                        {item.device ? ` · ${item.device}` : ''}
                        {item.location ? ` · ${item.location}` : ''}
                      </p>
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
