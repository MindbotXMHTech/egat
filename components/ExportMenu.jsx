'use client'
import { useEffect, useRef, useState } from 'react'
import { EXPORT_FORMATS } from '../lib/tableExport'

export default function ExportMenu({ onSelect, variant = 'toolbar', label = 'Export' }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    if (!open) return undefined
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    const id = window.setTimeout(() => document.addEventListener('mousedown', handleClick), 0)
    return () => {
      clearTimeout(id)
      document.removeEventListener('mousedown', handleClick)
    }
  }, [open])

  const alerts = variant === 'alerts'
  const compact = variant === 'compact'

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className={alerts
          ? 'flex items-center gap-2 px-4 py-2 font-bold text-base'
          : compact
            ? 'text-[10px] border border-egat-border rounded-lg px-2 py-1 bg-white hover:border-egat-navy transition-colors'
            : 'text-xs border border-egat-border rounded-lg px-3 py-1.5 bg-egat-surface hover:bg-egat-navy hover:text-white hover:border-egat-navy transition-colors'}
        style={alerts ? { color: '#FFCB05' } : undefined}
      >
        {alerts ? (
          <>
            {label}
            <span className="size-6 overflow-hidden shrink-0 inline-flex">
              <img src="/icons/alerts-export.svg" alt="" className="w-full h-full" />
            </span>
          </>
        ) : `⬇ ${label}`}
      </button>
      {open && (
        <div className={`absolute z-30 top-[calc(100%+6px)] ${alerts ? 'right-0' : 'right-0'} bg-white border border-egat-border rounded-xl shadow-card-md py-1 min-w-[140px]`}>
          {EXPORT_FORMATS.map(fmt => (
            <button
              key={fmt.id}
              type="button"
              onClick={() => {
                setOpen(false)
                onSelect?.(fmt.id)
              }}
              className="w-full text-left text-xs px-3 py-2 hover:bg-egat-surface-alt text-egat-text"
            >
              {fmt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
