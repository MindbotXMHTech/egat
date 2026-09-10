import { STATUS_COLOR } from '../lib/utils'

export default function StatusBadge({ status, size = 'sm' }) {
  const c = STATUS_COLOR[status] || STATUS_COLOR['Watch']
  const pad = size === 'xs' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-0.5 text-[11px]'
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full font-semibold ${pad} ${c.text} ${c.bg} border ${c.border}`}>
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${c.dot}`} />
      {status}
    </span>
  )
}
