'use client'
import { useMemo, useState } from 'react'
import Link from 'next/link'
import {
  AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend
} from 'recharts'
import PageHeader from '../../components/PageHeader'
import KpiCard from '../../components/KpiCard'
import SectionHeader from '../../components/SectionHeader'
import StatusBadge from '../../components/StatusBadge'
import AlertItem from '../../components/AlertItem'
import AnomalyFilterBar from '../../components/AnomalyFilterBar'
import ThailandAssetMap from '../../components/ThailandAssetMap'
import { useHeaderFilters } from '../../components/HeaderFilterContext'
import { useSiteScope } from '../../components/useSiteScope'
import { generateFleetTrend, LIVE_ALERTS, MODULES, ANOMALY_EVENTS, MAINTENANCE_SCHEDULE } from '../../lib/data'
import { filterFleet } from '../../lib/anomalyFilters'
import { fleetSearchSuggestions } from '../../lib/searchSuggest'
import { STATUS_COLOR } from '../../lib/utils'

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-egat-border rounded-xl px-3 py-2 shadow-card-md text-xs">
      <p className="font-semibold text-egat-text mb-1">{label}</p>
      {payload.map(p => (
        <p key={p.name} style={{ color: p.color }}>
          {p.name}: <span className="font-bold">{p.value}</span>
        </p>
      ))}
    </div>
  )
}

function summarizeFleet(fleet) {
  const list = fleet || []
  const n = list.length || 1
  return {
    total: list.length,
    healthy: list.filter(f => f.status === 'Healthy').length,
    watch: list.filter(f => f.status === 'Watch').length,
    warning: list.filter(f => f.status === 'Warning').length,
    critical: list.filter(f => f.status === 'Critical').length,
    avgHealth: list.length ? +(list.reduce((s, f) => s + f.health, 0) / n).toFixed(1) : 0,
  }
}

export default function OverviewPage() {
  const header = useHeaderFilters()
  const { allowedSites, scopedFleet } = useSiteScope()
  const [query, setQuery] = useState('')
  const suggestions = useMemo(() => fleetSearchSuggestions(scopedFleet), [scopedFleet])
  const filters = useMemo(
    () => ({ ...header.tableFilters, query, allowedSites }),
    [header.tableFilters, query, allowedSites],
  )
  const fleet = useMemo(() => filterFleet(scopedFleet, filters), [scopedFleet, filters])
  const summary = useMemo(() => summarizeFleet(fleet), [fleet])
  const fleetIds = useMemo(() => new Set(fleet.map(f => f.id)), [fleet])
  const trend = generateFleetTrend()

  const statusCounts = [
    { name:'Healthy', value:summary.healthy,  color:'#1A7F4B' },
    { name:'Watch',   value:summary.watch,    color:'#B7791F' },
    { name:'Warning', value:summary.warning,  color:'#C05621' },
    { name:'Critical',value:summary.critical, color:'#C53030' },
  ]

  const liveAlerts = LIVE_ALERTS.filter(a => fleetIds.has(a.asset)).slice(0, 4)
  const criticalAnomalies = ANOMALY_EVENTS.filter(e => e.severity === 'Critical' && fleetIds.has(e.asset)).length
  const urgentMaint = MAINTENANCE_SCHEDULE.filter(m => m.priority === 'Immediate' && fleetIds.has(m.asset)).length

  return (
    <div className="animate-fade-in">
      <PageHeader
        icon="📡"
        title="Fleet Overview — IHAMS Dashboard"
        subtitle={`สถานะอุปกรณ์เครือข่าย กฟผ. ฝ่ายระบบสื่อสาร (อรส.) | Real-time Monitoring`}
        badge="LIVE"
      />

      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 mb-3">
        <KpiCard value={summary.total}     label="Total Assets"    color="#1B3A6B" />
        <KpiCard value={`${summary.avgHealth}`} label="Avg Health Score" color="#1A56DB" />
        <KpiCard value={summary.healthy}   label="Healthy"         color="#1A7F4B" />
        <KpiCard value={summary.watch}     label="Watch"           color="#B7791F" />
        <KpiCard value={summary.warning}   label="Warning"         color="#C05621" />
        <KpiCard value={summary.critical}  label="Critical"        color="#C53030" delta="ต้องดำเนินการ" />
        <KpiCard value={criticalAnomalies} label="Critical Anomalies" color="#C53030" delta="24h" />
        <KpiCard value={urgentMaint} label="Urgent Maintenance" color="#C05621" delta="รอดำเนินการ" />
      </div>

      <AnomalyFilterBar
        filters={filters}
        locations={[]}
        suggestions={suggestions}
        showDate={false}
        showLocation={false}
        onChange={patch => {
          if ('query' in patch) setQuery(patch.query ?? '')
        }}
        onSearch={() => {}}
        onReset={() => {
          setQuery('')
          header.resetHeader()
        }}
      />

      <SectionHeader title="Network Asset Map — Thailand" />
      <ThailandAssetMap
        assets={fleet}
        selectedSite={header.location}
        onSelectSite={header.setLocation}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mb-4">
        <div className="card p-5">
          <SectionHeader title="สถานะอุปกรณ์" />
          <div className="flex items-center gap-3">
            <div style={{ width:110, height:110 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={statusCounts} cx="50%" cy="50%" innerRadius={32} outerRadius={50}
                       dataKey="value" stroke="none">
                    {statusCounts.map((e,i)=>(<Cell key={i} fill={e.color} />))}
                  </Pie>
                  <Tooltip formatter={(v,n)=>[v,n]} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-1.5 flex-1">
              {statusCounts.map(s=>(
                <div key={s.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full" style={{ background:s.color }} />
                    <span className="text-egat-text-sub">{s.name}</span>
                  </div>
                  <span className="font-bold" style={{ color:s.color }}>{s.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="card p-4">
          <SectionHeader title="Live Alerts" />
          <div className="space-y-0">
            {liveAlerts.length ? liveAlerts.map(a=>(
              <AlertItem key={a.id} {...a} />
            )) : (
              <p className="text-xs text-egat-text-muted py-3">ไม่มี alert ตามเงื่อนไขที่เลือก</p>
            )}
          </div>
        </div>

        <div className="card p-5 md:col-span-2 xl:col-span-1">
          <SectionHeader title="Module Status" />
          <div className="space-y-2">
            {MODULES.map(m=>(
              <Link key={m.id} href={m.path}
                className="flex items-center gap-3 p-2.5 rounded-lg border border-egat-border-lt hover:border-egat-border hover:bg-egat-surface-alt transition-all group">
                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background:m.color }} />
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold text-egat-text truncate">{m.label}</div>
                  <div className="text-[10px] text-egat-text-muted">{m.pts} คะแนน · {m.status}</div>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                      style={{ background:`${m.color}15`, color:m.color }}>
                  {m.pts}pt
                </span>
              </Link>
            ))}
          </div>
          <div className="mt-3 pt-3 border-t border-egat-border-lt flex justify-between text-xs">
            <span className="text-egat-text-muted">Technical Score Total</span>
            <span className="font-black text-egat-gold">170 pts</span>
          </div>
        </div>
      </div>

      <div className="card p-5 mb-4">
        <SectionHeader title="Fleet Health Trend — 7 วัน" />
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={trend} margin={{ top:5, right:5, bottom:5, left:5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#EEF2F7" />
            <XAxis dataKey="day" tick={{ fontSize:10, fill:'#8896A4' }} />
            <YAxis domain={[0,14]} tick={{ fontSize:10, fill:'#8896A4' }} />
            <Tooltip content={<CustomTooltip />} />
            <Area type="monotone" dataKey="healthy"  stackId="1" stroke="#1A7F4B" fill="#EAFAF1" name="Healthy"  />
            <Area type="monotone" dataKey="watch"    stackId="1" stroke="#B7791F" fill="#FEFCE8" name="Watch"    />
            <Area type="monotone" dataKey="warning"  stackId="1" stroke="#C05621" fill="#FFF5ED" name="Warning"  />
            <Area type="monotone" dataKey="critical" stackId="1" stroke="#C53030" fill="#FFF0F0" name="Critical" />
            <Legend iconSize={8} iconType="circle" wrapperStyle={{ fontSize:11 }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="card p-5">
        <SectionHeader title={`Asset Register — Fleet Status (${fleet.length})`} />
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-egat-border">
                {['Asset ID','Type','Site','Region','Health','Status','CPU','BW','Uptime','RUL'].map(h=>(
                  <th key={h} className="pb-2 text-left font-semibold uppercase tracking-wider"
                      style={{ color:'#8896A4', fontSize:'10px' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {fleet.length ? fleet.map((f,i)=>(
                <tr key={f.id} className={`border-b border-egat-border-lt hover:bg-egat-surface-alt transition-colors ${i%2===0?'':'bg-egat-surface-alt/40'}`}>
                  <td className="py-2 pr-3 font-semibold text-egat-navy">{f.id}</td>
                  <td className="py-2 pr-3 text-egat-text-sub">{f.type}</td>
                  <td className="py-2 pr-3 text-egat-text-sub">{f.site}</td>
                  <td className="py-2 pr-3 text-egat-text-sub">{f.region}</td>
                  <td className="py-2 pr-3 font-bold" style={{ color: STATUS_COLOR[f.status]?.hex }}>
                    {f.health}
                  </td>
                  <td className="py-2 pr-3"><StatusBadge status={f.status} size="xs" /></td>
                  <td className="py-2 pr-3 text-egat-text-sub">{f.cpu}%</td>
                  <td className="py-2 pr-3 text-egat-text-sub">{f.bw}%</td>
                  <td className="py-2 pr-3 text-egat-text-sub">{f.uptime}%</td>
                  <td className="py-2 font-semibold text-egat-text">{f.rul}y</td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={10} className="py-6 text-center text-egat-text-muted">ไม่พบอุปกรณ์ตามเงื่อนไขที่ค้นหา</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
