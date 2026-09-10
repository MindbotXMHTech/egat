'use client'
import { useEffect, useRef, useState } from 'react'
import { ChevronDown } from 'lucide-react'

export default function HeaderLocationSelect({
  location,
  locations = [],
  onChange,
  allLabel = 'ทุก Site / Location',
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const label = location || allLabel

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

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        aria-expanded={open}
        aria-haspopup="listbox"
        title={label}
        aria-label={`Site / Location: ${label}`}
        className="relative h-9 w-[156px] sm:w-[176px] flex items-center gap-1.5 text-xs border border-egat-border rounded-lg pl-2 pr-6 bg-white text-egat-text text-left hover:border-egat-navy focus:outline-none focus:border-egat-navy"
      >
        <span className="size-4 overflow-hidden shrink-0 inline-flex">
          <img src="/icons/location-pin.svg" alt="" className="w-full h-full" />
        </span>
        <span className="truncate font-medium">{label}</span>
        <ChevronDown size={14} className="absolute right-1.5 text-egat-text-muted pointer-events-none" />
      </button>
      {open && (
        <ul
          role="listbox"
          aria-label="เลือก Site"
          className="absolute z-50 top-[calc(100%+6px)] right-0 max-h-64 overflow-y-auto bg-white border border-egat-border rounded-xl shadow-card-md py-1 min-w-full w-56"
        >
          <li>
            <button
              type="button"
              role="option"
              aria-selected={!location}
              onClick={() => { onChange(''); setOpen(false) }}
              className={`w-full text-left px-3 py-2 text-xs hover:bg-egat-surface-alt ${!location ? 'font-bold text-[#034EA2]' : 'text-egat-text'}`}
            >
              {allLabel}
            </button>
          </li>
          {locations.map(site => (
            <li key={site}>
              <button
                type="button"
                role="option"
                aria-selected={location === site}
                onClick={() => { onChange(site); setOpen(false) }}
                className={`w-full text-left px-3 py-2 text-xs hover:bg-egat-surface-alt ${location === site ? 'font-bold text-[#034EA2] bg-[#E5EDF5]' : 'text-egat-text'}`}
              >
                {site}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
