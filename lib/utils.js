export function cx(...classes) {
  return classes.filter(Boolean).join(' ')
}

export const STATUS_COLOR = {
  Healthy:   { text:'text-egat-green',  bg:'bg-egat-green-bg',  border:'border-green-200',  dot:'bg-egat-green',  hex:'#1A7F4B' },
  Watch:     { text:'text-egat-yellow', bg:'bg-egat-yellow-bg', border:'border-yellow-200', dot:'bg-egat-yellow', hex:'#B7791F' },
  Warning:   { text:'text-egat-orange', bg:'bg-egat-orange-bg', border:'border-orange-200', dot:'bg-egat-orange', hex:'#C05621' },
  Critical:  { text:'text-egat-red',    bg:'bg-egat-red-bg',    border:'border-red-200',    dot:'bg-egat-red',    hex:'#C53030' },
  Online:    { text:'text-egat-green',  bg:'bg-egat-green-bg',  border:'border-green-200',  dot:'bg-egat-green',  hex:'#1A7F4B' },
  Immediate: { text:'text-egat-red',    bg:'bg-egat-red-bg',    border:'border-red-200',    dot:'bg-egat-red',    hex:'#C53030' },
  High:      { text:'text-egat-orange', bg:'bg-egat-orange-bg', border:'border-orange-200', dot:'bg-egat-orange', hex:'#C05621' },
  Medium:    { text:'text-egat-yellow', bg:'bg-egat-yellow-bg', border:'border-yellow-200', dot:'bg-egat-yellow', hex:'#B7791F' },
  Low:       { text:'text-egat-green',  bg:'bg-egat-green-bg',  border:'border-green-200',  dot:'bg-egat-green',  hex:'#1A7F4B' },
  Resolved:  { text:'text-egat-blue',   bg:'bg-egat-blue-bg',   border:'border-blue-200',   dot:'bg-egat-blue',   hex:'#1A56DB' },
  New:       { text:'text-egat-red',    bg:'bg-egat-red-bg',    border:'border-red-200',    dot:'bg-egat-red',    hex:'#C53030' },
  'In Process': { text:'text-egat-orange', bg:'bg-egat-orange-bg', border:'border-orange-200', dot:'bg-egat-orange', hex:'#C05621' },
  info:      { text:'text-egat-blue',   bg:'bg-egat-blue-bg',   border:'border-blue-200',   dot:'bg-egat-blue',   hex:'#1A56DB' },
  healthy:   { text:'text-egat-green',  bg:'bg-egat-green-bg',  border:'border-green-200',  dot:'bg-egat-green',  hex:'#1A7F4B' },
  warning:   { text:'text-egat-orange', bg:'bg-egat-orange-bg', border:'border-orange-200', dot:'bg-egat-orange', hex:'#C05621' },
  critical:  { text:'text-egat-red',    bg:'bg-egat-red-bg',    border:'border-red-200',    dot:'bg-egat-red',    hex:'#C53030' },
  watch:     { text:'text-egat-yellow', bg:'bg-egat-yellow-bg', border:'border-yellow-200', dot:'bg-egat-yellow', hex:'#B7791F' },
}

export function fmtBaht(n) {
  if (n >= 1e6) return `฿${(n/1e6).toFixed(1)}M`
  if (n >= 1e3) return `฿${(n/1e3).toFixed(0)}K`
  return `฿${n}`
}

export function fmtPct(n) {
  return `${n.toFixed(1)}%`
}
