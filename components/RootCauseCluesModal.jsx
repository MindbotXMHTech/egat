'use client'
import { useEffect } from 'react'
import { clueLayerColor } from '../lib/anomalyAlerts'

export default function RootCauseCluesModal({ row, onClose }) {
  useEffect(() => {
    if (!row) return undefined
    function handleKey(e) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [row, onClose])

  if (!row) return null
  const clues = Array.isArray(row.clues) ? row.clues : []

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="root-cause-clues-title"
        className="bg-white rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-egat-border">
          <h3 id="root-cause-clues-title" className="font-bold text-egat-navy text-base">
            Root Cause Clues
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-egat-text-muted hover:text-egat-navy text-xl leading-none"
            aria-label="ปิด"
          >
            ×
          </button>
        </div>
        <div className="px-6 py-4 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            {[
              ['Device ID', row.deviceId],
              ['Site', row.site],
              ['Anomaly Type', row.anomalyType],
              ['Anomaly Score', row.scoreLabel],
              ['Status', row.status],
              ['Timestamp', row.timestampLabel || row.timestamp],
            ].map(([k, v]) => (
              <div key={k} className="bg-egat-surface-alt rounded-lg p-3">
                <div className="text-[10px] text-egat-text-muted uppercase tracking-wider mb-0.5">{k}</div>
                <div className="text-sm font-semibold text-egat-text">{String(v ?? '—')}</div>
              </div>
            ))}
          </div>

          <div className="p-4 rounded-xl" style={{ background: '#FFF8E1', border: '1px solid #F6D860' }}>
            <div className="text-[10px] font-semibold uppercase text-egat-gold mb-1">Recommended Action</div>
            <div className="text-sm font-medium text-egat-text">{row.rootCause || '—'}</div>
          </div>

          <div>
            <div className="text-[10px] font-semibold uppercase text-egat-text-muted mb-2">Root Cause Clues</div>
            {clues.length === 0 ? (
              <p className="text-sm text-egat-text-muted">ไม่มีข้อมูลเพิ่มเติม</p>
            ) : clues.map((c, i) => {
              const color = clueLayerColor(c.layer)
              return (
                <div key={`${c.name}-${i}`} className="flex items-center gap-3 mb-3">
                  <div className="text-xs font-bold w-4 text-egat-text-muted">{i + 1}.</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between gap-2 mb-0.5">
                      <span className="text-xs font-semibold text-egat-text">{c.name}</span>
                      <span className="text-xs font-bold shrink-0" style={{ color }}>
                        {Math.round((c.prob || 0) * 100)}%
                      </span>
                    </div>
                    <div className="h-1.5 rounded-full bg-egat-border-lt overflow-hidden mb-1">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${Math.round((c.prob || 0) * 100)}%`, background: color, opacity: 0.85 }}
                      />
                    </div>
                    <div className="text-[11px] text-egat-text-sub">{c.detail}</div>
                  </div>
                  <span
                    className="text-[10px] px-2 py-0.5 rounded-full shrink-0"
                    style={{ background: `${color}18`, color }}
                  >
                    {c.layer}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
