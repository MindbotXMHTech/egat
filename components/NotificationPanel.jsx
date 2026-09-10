'use client'
import { useMemo, useState } from 'react'
import { LIVE_ALERTS } from '../lib/data'
import { getAlertPopupDetails } from '../lib/alertDetails'
import StatusBadge from './StatusBadge'
import { useSiteScope } from './useSiteScope'

const SEV = {
  critical: { bg:'bg-red-50',    border:'border-red-200',    dot:'bg-red-500',    label:'วิกฤต',   textColor:'text-red-700'    },
  warning:  { bg:'bg-orange-50', border:'border-orange-200', dot:'bg-orange-400', label:'เตือน',   textColor:'text-orange-700' },
  watch:    { bg:'bg-yellow-50', border:'border-yellow-200', dot:'bg-yellow-400', label:'ติดตาม',  textColor:'text-yellow-700' },
  info:     { bg:'bg-blue-50',   border:'border-blue-200',   dot:'bg-blue-400',   label:'ข้อมูล', textColor:'text-blue-700'   },
  healthy:  { bg:'bg-green-50',  border:'border-green-200',  dot:'bg-green-500',  label:'ปกติ',    textColor:'text-green-700'  },
}

export default function NotificationPanel({ extraAlerts = [] }) {
  const [open,       setOpen]       = useState(false)
  const [dismissed,  setDismissed]  = useState(new Set())
  const [filter,     setFilter]     = useState('all')
  const [detail,     setDetail]     = useState(null)
  const { allowedIdSet } = useSiteScope()

  const visibleLive = useMemo(
    () => LIVE_ALERTS.filter(a => allowedIdSet.has(a.asset)),
    [allowedIdSet],
  )
  const allAlerts  = [...extraAlerts, ...visibleLive]
  const active     = allAlerts.filter(a => !dismissed.has(a.id))
  const critCount  = active.filter(a => a.severity === 'critical').length
  const filtered   = filter === 'all' ? active : active.filter(a => a.severity === filter)
  const popup = detail ? getAlertPopupDetails(detail) : null

  function openDetail(alert) {
    setDetail(alert)
    setOpen(false)
  }

  return (
    <div className="relative">
      {/* Bell button */}
      <button
        onClick={() => setOpen(v => !v)}
        className="relative flex items-center justify-center w-9 h-9 rounded-xl border border-egat-border bg-egat-surface hover:border-egat-navy transition-colors"
        title="การแจ้งเตือน">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-egat-text-sub">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
          <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
        </svg>
        {critCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[16px] h-4 text-[9px] font-bold bg-red-500 text-white rounded-full flex items-center justify-center px-0.5">
            {critCount > 9 ? '9+' : critCount}
          </span>
        )}
      </button>

      {/* Panel */}
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-11 z-50 w-96 max-h-[520px] bg-white border border-egat-border rounded-2xl shadow-card-md overflow-hidden flex flex-col">
            {/* Header */}
            <div className="px-4 py-3 border-b border-egat-border bg-egat-surface-alt flex items-center justify-between">
              <div>
                <div className="text-sm font-bold text-egat-navy">การแจ้งเตือน</div>
                <div className="text-[10px] text-egat-text-muted">{active.length} รายการที่ยังไม่ได้อ่าน</div>
              </div>
              <button onClick={() => setDismissed(new Set(allAlerts.map(a => a.id)))}
                className="text-[10px] text-egat-text-muted hover:text-egat-navy transition-colors">
                ล้างทั้งหมด
              </button>
            </div>

            {/* Filter tabs */}
            <div className="flex gap-1 px-3 py-2 border-b border-egat-border-lt bg-egat-surface-alt">
              {['all','critical','warning','watch','info'].map(f => (
                <button key={f} onClick={() => setFilter(f)}
                  className={`text-[10px] px-2 py-0.5 rounded-full border transition-colors ${filter===f ? 'border-egat-navy bg-egat-navy text-white' : 'border-egat-border text-egat-text-sub hover:border-egat-navy'}`}>
                  {f === 'all' ? 'ทั้งหมด' : SEV[f]?.label || f}
                </button>
              ))}
            </div>

            {/* Alerts */}
            <div className="overflow-y-auto flex-1">
              {filtered.length === 0 ? (
                <div className="text-center py-10 text-egat-text-muted text-xs">ไม่มีการแจ้งเตือน</div>
              ) : filtered.map(a => {
                const s = SEV[a.severity] || SEV.info
                return (
                  <div
                    key={a.id}
                    className={`flex gap-3 px-4 py-3 border-b border-egat-border-lt ${s.bg} hover:opacity-90 transition-opacity cursor-pointer`}
                    onClick={() => openDetail(a)}
                    role="button"
                  >
                    <span className={`mt-1.5 w-2 h-2 rounded-full flex-shrink-0 ${s.dot}`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className={`text-[10px] font-bold ${s.textColor}`}>{a.asset}</span>
                        <span className="text-[9px] text-egat-text-muted whitespace-nowrap">{a.time}</span>
                      </div>
                      <div className="text-xs text-egat-text mt-0.5 leading-snug">{a.msg}</div>
                    </div>
                    <button
                      onClick={e => {
                        e.stopPropagation()
                        setDismissed(d => new Set([...d, a.id]))
                      }}
                      className="text-egat-text-muted hover:text-egat-navy text-sm leading-none flex-shrink-0">×</button>
                  </div>
                )
              })}
            </div>

            {/* Footer */}
            <div className="px-4 py-2 border-t border-egat-border bg-egat-surface-alt">
              <div className="flex gap-3 text-[10px] text-egat-text-muted">
                <span>🔴 {active.filter(a=>a.severity==='critical').length} วิกฤต</span>
                <span>🟠 {active.filter(a=>a.severity==='warning').length} เตือน</span>
                <span>🟡 {active.filter(a=>a.severity==='watch').length} ติดตาม</span>
              </div>
            </div>
          </div>
        </>
      )}

      {popup && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
          onClick={() => setDetail(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[85vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-egat-border">
              <h3 className="font-bold text-egat-navy text-base">รายละเอียดการแจ้งเตือน</h3>
              <button
                type="button"
                onClick={() => setDetail(null)}
                className="text-egat-text-muted hover:text-egat-navy text-xl leading-none"
                aria-label="ปิด"
              >
                ×
              </button>
            </div>
            <div className="px-6 py-4 space-y-4">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-sm font-bold text-egat-navy">{popup.asset}</div>
                  <div className="text-xs text-egat-text-sub mt-0.5">{popup.msg}</div>
                </div>
                <StatusBadge
                  status={popup.severity === 'critical' ? 'Critical' : popup.severity === 'warning' ? 'Warning' : 'Watch'}
                  size="xs"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  ['Device ID', popup.asset],
                  ['Site', popup.site],
                  ['Device Type', popup.type],
                  ['เวลา', popup.time],
                  ['Health Score', popup.health],
                  ['RUL', popup.rul],
                  ...(popup.hasMock ? [
                    ['KPI', popup.kpi],
                    ['Value', popup.value],
                    ['Threshold', popup.threshold],
                    ['Z-Score', popup.zscore],
                    ['ตรวจพบเมื่อ', popup.detectedAt],
                    ['ระยะเวลา', popup.duration],
                    ['Algorithm', popup.algorithm],
                  ] : []),
                ].map(([k, v]) => (
                  <div key={k} className="bg-egat-surface-alt rounded-lg p-3">
                    <div className="text-[10px] text-egat-text-muted uppercase tracking-wider mb-0.5">{k}</div>
                    <div className="text-sm font-semibold text-egat-text">{String(v)}</div>
                  </div>
                ))}
              </div>
              {popup.action ? (
                <div className="p-4 rounded-xl" style={{ background:'#FFF8E1', border:'1px solid #F6D860' }}>
                  <div className="text-[10px] font-semibold uppercase text-egat-gold mb-1">Recommended Action</div>
                  <div className="text-sm font-medium text-egat-text">{popup.action}</div>
                </div>
              ) : null}
              {popup.timeline.length > 0 ? (
                <div>
                  <div className="text-[10px] font-semibold uppercase text-egat-text-muted mb-2">Timeline</div>
                  <div className="space-y-2">
                    {popup.timeline.map(item => (
                      <div key={`${item.time}-${item.event}`} className="flex gap-3 text-xs">
                        <span className="font-mono text-egat-text-muted w-12 shrink-0">{item.time}</span>
                        <span className="text-egat-text">{item.event}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
              {detail?.onOpen ? (
                <button
                  type="button"
                  onClick={() => {
                    detail.onOpen()
                    setDetail(null)
                  }}
                  className="w-full text-sm font-semibold py-2 rounded-lg"
                  style={{ background: '#FFCB05', color: '#034EA2' }}
                >
                  ไปยังรายการ
                </button>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
