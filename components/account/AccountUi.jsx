'use client'
import Link from 'next/link'
import { Plus } from 'lucide-react'

export function Icon({ src, className = 'size-6' }) {
  return (
    <span className={`${className} overflow-hidden shrink-0 inline-flex`}>
      <img src={src} alt="" className="w-full h-full" />
    </span>
  )
}

const goldBtnClass = 'inline-flex items-center justify-center gap-2.5 h-[51px] rounded-lg pl-3 pr-4 text-base font-bold whitespace-nowrap disabled:opacity-60'
const goldBtnStyle = { background: '#FFCB05', color: '#034EA2' }
const outlineBtnClass = 'inline-flex items-center justify-center h-[51px] rounded-lg px-6 text-base font-bold whitespace-nowrap bg-white'
const outlineBtnStyle = { border: '1px solid #FFCB05', color: '#034EA2' }
const backBtnClass = 'flex items-center gap-2 px-4 py-2 rounded-lg border border-solid text-base font-bold whitespace-nowrap bg-white'
const backBtnStyle = { borderColor: '#FFCB05', color: '#034EA2' }
const iconActionClass = 'size-6 rounded flex items-center justify-center shrink-0 hover:opacity-80 transition-opacity'
const iconActionStyle = { background: '#CDDCEC', color: '#034EA2' }

function GoldInner({ children, icon, iconPosition }) {
  const glyph = icon === 'plus'
    ? <Plus size={16} strokeWidth={2.5} />
    : icon === 'edit'
      ? <Icon src="/icons/eva-edit-2-fill.svg" className="size-6" />
      : null
  return (
    <>
      {iconPosition === 'left' && glyph}
      {children}
      {iconPosition !== 'left' && glyph}
    </>
  )
}

export function GoldButton({
  children,
  onClick,
  type = 'button',
  icon,
  iconPosition = 'right',
  disabled = false,
  href,
}) {
  const inner = <GoldInner icon={icon} iconPosition={iconPosition}>{children}</GoldInner>
  if (href) {
    return <Link href={href} className={goldBtnClass} style={goldBtnStyle}>{inner}</Link>
  }
  return (
    <button type={type} onClick={onClick} disabled={disabled} className={goldBtnClass} style={goldBtnStyle}>
      {inner}
    </button>
  )
}

export function OutlineButton({ children, onClick, type = 'button', href }) {
  if (href) {
    return <Link href={href} className={outlineBtnClass} style={outlineBtnStyle}>{children}</Link>
  }
  return (
    <button type={type} onClick={onClick} className={outlineBtnClass} style={outlineBtnStyle}>
      {children}
    </button>
  )
}

export function BackButton({ onClick, href, children = 'Back' }) {
  const inner = (
    <>
      {children}
      <Icon src="/icons/alerts-back.svg" className="size-4" />
    </>
  )
  if (href) {
    return <Link href={href} className={backBtnClass} style={backBtnStyle}>{inner}</Link>
  }
  return (
    <button type="button" onClick={onClick} className={backBtnClass} style={backBtnStyle}>
      {inner}
    </button>
  )
}

export function SectionTitle({ children }) {
  return (
    <h2 className="text-xl font-bold w-full" style={{ color: '#034EA2' }}>{children}</h2>
  )
}

export function FieldLabel({ children, required = false }) {
  return (
    <div className="flex items-center gap-1 text-xl leading-normal" style={{ color: '#034EA2' }}>
      <span>{children}</span>
      {required && <span style={{ color: '#ED1A3B' }}>*</span>}
    </div>
  )
}

export function FieldValue({ children }) {
  return (
    <p className="text-base py-2 rounded-lg" style={{ color: '#222' }}>{children || '—'}</p>
  )
}

export function BoxedInput({ value, onChange, placeholder, type = 'text', disabled = false }) {
  return (
    <input
      type={type}
      value={value}
      disabled={disabled}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full bg-white text-base px-2 py-2 rounded-lg outline-none disabled:bg-slate-50"
      style={{ border: '1px solid #034EA2', color: '#222' }}
    />
  )
}

export function BoxedSelect({ value, onChange, placeholder = 'Select', options = [] }) {
  return (
    <div className="relative w-full">
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full appearance-none bg-white text-base px-2 py-2 pr-8 rounded-lg outline-none"
        style={{ border: '1px solid #034EA2', color: value ? '#222' : '#64748B' }}
      >
        <option value="">{placeholder}</option>
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2">
        <Icon src="/icons/arrow-drop-down.svg" className="size-4" />
      </span>
    </div>
  )
}

export function SuccessModal({ title, onDone, href }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-[#222]/20" onClick={onDone} />
      <div
        className="relative bg-white rounded-[24px] p-8 flex flex-col items-center gap-6"
        onClick={e => e.stopPropagation()}
      >
        <span className="relative size-[90px] overflow-hidden shrink-0">
          <img src="/icons/ep-success-filled.svg" alt="" className="absolute inset-0 size-full max-w-none" />
        </span>
        <p className="text-[36px] leading-normal text-center font-normal" style={{ color: '#222' }}>
          {title}
        </p>
        {href ? (
          <Link
            href={href}
            className="px-6 py-2 rounded-lg text-base font-bold tracking-[0.1px] leading-6 text-center"
            style={{ background: '#FFCB05', color: '#034EA2' }}
          >
            Done
          </Link>
        ) : (
          <button
            type="button"
            onClick={onDone}
            className="px-6 py-2 rounded-lg text-base font-bold tracking-[0.1px] leading-6 text-center"
            style={{ background: '#FFCB05', color: '#034EA2' }}
          >
            Done
          </button>
        )}
      </div>
    </div>
  )
}

export function ModuleChips({ modules = [] }) {
  if (!modules.length) return <p className="text-sm" style={{ color: '#64748B' }}>—</p>
  return (
    <div className="flex flex-wrap gap-2">
      {modules.map(m => (
        <span
          key={m.id}
          className="px-2.5 py-1 rounded-full text-xs font-semibold"
          style={{ background: '#E8F0FA', color: '#034EA2' }}
        >
          {m.label}
        </span>
      ))}
    </div>
  )
}

export function IconAction({ label, onClick, href, children }) {
  const className = 'size-6 rounded flex items-center justify-center shrink-0 hover:opacity-80 transition-opacity'
  const style = { background: '#CDDCEC', color: '#034EA2' }
  if (href) {
    return (
      <Link href={href} title={label} aria-label={label} className={className} style={style}>
        {children}
      </Link>
    )
  }
  return (
    <button type="button" onClick={onClick} title={label} aria-label={label} className={className} style={style}>
      {children}
    </button>
  )
}
