'use client'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Search } from 'lucide-react'
import { rankSearchSuggestions, splitHighlight } from '../lib/searchSuggest'

export default function SearchSuggestInput({
  value = '',
  onChange,
  onSearch,
  suggestions = [],
  placeholder = 'ค้นหา...',
}) {
  const wrapRef = useRef(null)
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)

  const ranked = useMemo(
    () => rankSearchSuggestions(suggestions, value, { limit: 8 }),
    [suggestions, value],
  )

  useEffect(() => {
    setActiveIndex(ranked.length ? 0 : -1)
  }, [value, ranked.length])

  useEffect(() => {
    if (!open) return undefined
    function handleDown(e) {
      if (!wrapRef.current?.contains(e.target)) setOpen(false)
    }
    const id = window.setTimeout(() => document.addEventListener('mousedown', handleDown), 0)
    return () => {
      clearTimeout(id)
      document.removeEventListener('mousedown', handleDown)
    }
  }, [open])

  function applySuggestion(item) {
    const next = item?.value ?? ''
    onChange?.(next)
    setOpen(false)
    onSearch?.()
  }

  function handleKeyDown(e) {
    if (e.key === 'Escape') {
      setOpen(false)
      return
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setOpen(true)
      if (!ranked.length) return
      setActiveIndex(i => (i + 1 + ranked.length) % ranked.length)
      return
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault()
      setOpen(true)
      if (!ranked.length) return
      setActiveIndex(i => (i - 1 + ranked.length) % ranked.length)
      return
    }
    if (e.key === 'Enter') {
      if (open && ranked[activeIndex]) {
        e.preventDefault()
        applySuggestion(ranked[activeIndex])
        return
      }
      onSearch?.()
    }
  }

  const showEmpty = open && value.trim() && ranked.length === 0

  return (
    <div ref={wrapRef} className="relative">
      <Search
        size={14}
        className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-egat-text-muted"
      />
      <input
        value={value}
        onChange={e => {
          onChange?.(e.target.value)
          setOpen(true)
        }}
        onFocus={() => setTimeout(() => setOpen(true), 0)}
        onClick={() => setOpen(true)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        autoComplete="off"
        role="combobox"
        aria-expanded={open}
        aria-autocomplete="list"
        className="text-xs border border-egat-border rounded-lg pl-8 pr-[13px] py-[8px] bg-egat-surface text-egat-text placeholder:text-[#9CA3AF] w-44 focus:outline-none focus:border-egat-navy"
      />
      {open && (ranked.length > 0 || showEmpty) && (
        <div
          role="listbox"
          className="absolute left-0 top-full z-50 mt-1 min-w-[280px] overflow-hidden rounded-xl border border-egat-border bg-white py-1 shadow-card-md"
        >
          {showEmpty ? (
            <div className="px-3 py-2 text-xs text-egat-text-muted">ไม่พบผลลัพธ์</div>
          ) : (
            ranked.map((item, index) => {
              const active = index === activeIndex
              return (
                <button
                  key={`${item.group}-${item.value}-${index}`}
                  type="button"
                  role="option"
                  aria-selected={active}
                  onMouseEnter={() => setActiveIndex(index)}
                  onMouseDown={e => e.preventDefault()}
                  onClick={() => applySuggestion(item)}
                  className={`flex w-full items-center gap-2 px-3 py-2 text-left text-xs ${
                    active ? 'bg-[#E5EDF5] text-[#034EA2]' : 'text-egat-text hover:bg-[#E5EDF5]'
                  }`}
                >
                  <Search size={13} className="shrink-0 text-egat-text-muted" />
                  <span className="min-w-0 flex-1 truncate">
                    {splitHighlight(item.label, value).map((part, i) => (
                      <span key={i} className={part.match ? 'font-bold' : 'font-normal'}>
                        {part.text}
                      </span>
                    ))}
                  </span>
                  {item.group && (
                    <span className="shrink-0 text-[10px] text-egat-text-muted">{item.group}</span>
                  )}
                </button>
              )
            })
          )}
        </div>
      )}
    </div>
  )
}
