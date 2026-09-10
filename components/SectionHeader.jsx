export default function SectionHeader({ title, action }) {
  return (
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center gap-2">
        <div className="sec-bar" />
        <span className="text-[0.78rem] font-bold uppercase tracking-[0.07em]" style={{ color:'#1B3A6B' }}>
          {title}
        </span>
      </div>
      {action && <div className="text-xs">{action}</div>}
    </div>
  )
}
