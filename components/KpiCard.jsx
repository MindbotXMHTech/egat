'use client'
import { ArrowUpRight } from 'lucide-react'

export default function KpiCard({ value, label, delta, color = '#1B3A6B', icon, sub, onClick }) {
  const Comp = onClick ? 'button' : 'div'
  return (
    <Comp
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      className={`card p-4 relative overflow-hidden kpi-bar ${onClick ? 'cursor-pointer text-left w-full hover:shadow-card-md transition-shadow pr-9' : ''}`}
      style={{ '--kpi-color': color }}
    >
      {onClick && (
        <ArrowUpRight
          size={18}
          strokeWidth={1.75}
          className="pointer-events-none absolute top-3 right-3"
          style={{ color: '#034EA2' }}
          aria-hidden
        />
      )}
      {icon && <div className="text-xl mb-2 opacity-80">{icon}</div>}
      <div className="font-extrabold leading-none tracking-tight"
           style={{ fontSize:'1.75rem', color, fontFamily:'Inter,sans-serif' }}>
        {value}
      </div>
      <div className="text-[0.68rem] font-semibold uppercase tracking-[0.08em] mt-1.5"
           style={{ color:'#8896A4' }}>
        {label}
      </div>
      {(delta || sub) && (
        <div className="text-[0.72rem] font-medium mt-1" style={{ color }}>
          {delta || sub}
        </div>
      )}
    </Comp>
  )
}
