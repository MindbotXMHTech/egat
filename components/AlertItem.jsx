import { STATUS_COLOR } from '../lib/utils'

const ICONS = { critical:'🔴', warning:'🟠', watch:'🟡', healthy:'🟢', info:'🔵' }

export default function AlertItem({ severity, asset, msg, time }) {
  const c = STATUS_COLOR[severity] || STATUS_COLOR['info']
  return (
    <div className={`flex items-start gap-3 px-3 py-2.5 rounded-lg border text-sm mb-1.5 ${c.bg} ${c.border}`}>
      <div className={`w-2 h-2 rounded-full flex-shrink-0 mt-1.5 ${c.dot}`} />
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-[0.78rem] text-egat-text truncate">{asset}</div>
        <div className="text-[0.74rem] text-egat-text-sub mt-0.5 leading-snug">{msg}</div>
      </div>
      <div className="text-[0.65rem] text-egat-text-muted flex-shrink-0 text-right">{time}</div>
    </div>
  )
}
