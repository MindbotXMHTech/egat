'use client'
import { useEffect, useMemo, useState } from 'react'
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, Sector,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  ReferenceLine
} from 'recharts'
import PageHeader from '../../../components/PageHeader'
import KpiCard from '../../../components/KpiCard'
import SectionHeader from '../../../components/SectionHeader'
import StatusBadge from '../../../components/StatusBadge'
import DataTable from '../../../components/DataTable'
import AlertItem from '../../../components/AlertItem'
import HealthCategoryDetail from '../../../components/HealthCategoryDetail'
import CriticalDevicesTable, { TrendCell } from '../../../components/CriticalDevicesTable'
import AvgHealthView from '../../../components/AvgHealthView'
import ChartFilterBar from '../../../components/ChartFilterBar'
import { useHeaderFilters } from '../../../components/HeaderFilterContext'
import { useSiteScope } from '../../../components/useSiteScope'
import { FLEET, getHealthDetails, generateHealthTrend } from '../../../lib/data'
import { STATUS_COLOR } from '../../../lib/utils'
import { exportChartTable } from '../../../lib/anomalyFilters'
import {
  buildHealthPieData,
  getHealthCategory,
  healthCategoryColor,
  healthCategoryTitle,
  healthScoreColor,
  resolveHealthPieCategory,
  toHealthDetailRows,
  toggleHiddenPieCategory,
  visibleHealthPieData,
  buildHealthTrendNotes,
  createEmptyHealthTrendDates,
  enrichHealthTrend,
  filterHealthTrend,
  toAvgHealthRows,
  toDeviceHealthTableRows,
  healthNotifications,
  HEALTH_TREND_EXPORT_COLUMNS,
  withHealthTrendNotes,
} from '../../../lib/healthDistribution'

const TABS = ['Score Breakdown', 'Device Health Table', 'Trend Analysis', 'Fleet Comparison']
const PIE_PANEL_MS = 340

// All devices table
const DEVICES_TABLE = FLEET.map(f => ({
  deviceId:   f.id,
  type:       f.type,
  site:       f.site,
  region:     f.region,
  health:     f.health,
  status:     f.status,
  category:   getHealthCategory(f.health),
  cpu:        f.cpu,
  bw:         f.bw,
  pktLoss:    f.pkt_loss,
  latency:    f.latency,
  age:        f.age,
  life:       f.life,
  rul:        f.rul,
  uptime:     f.uptime,
  vendor:     f.vendor,
  // Maintenance history (simulated)
  lastMaint:  f.days_maint,
  failProb:   f.failProb,
  maintHistory: [
    { date:`${2025 - Math.floor(f.age/3)}-01-15`, type:'Preventive', result:'Normal', cost:32000 },
    { date:`${2024 - Math.floor(f.age/5)}-08-20`, type:'Corrective', result:'Component replaced', cost:85000 },
    { date:`${2024}-03-10`,                         type:'Inspection', result:'Minor wear detected', cost:15000 },
  ]
}))

// Device detail modal
function DeviceDetail(row) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        {[['Device ID',row.deviceId],['Type',row.type],['Site',row.site],['Region',row.region],
          ['Health Score',row.health],['Status',row.status],['CPU',`${row.cpu}%`],['BW',`${row.bw}%`],
          ['Packet Loss',`${row.pktLoss}%`],['Latency',`${row.latency}ms`],['Age',`${row.age} yr`],
          ['RUL',`${row.rul} yr`],['Uptime',`${row.uptime}%`],['Vendor',row.vendor],
        ].map(([k,v])=>(
          <div key={k} className="bg-egat-surface-alt rounded-lg p-3">
            <div className="text-[10px] text-egat-text-muted uppercase tracking-wider mb-0.5">{k}</div>
            <div className="text-sm font-semibold text-egat-text">{String(v)}</div>
          </div>
        ))}
      </div>
      <div>
        <div className="text-[10px] font-semibold uppercase text-egat-text-muted mb-2">Maintenance History</div>
        <div className="space-y-2">
          {row.maintHistory.map((m,i)=>(
            <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-egat-surface-alt border border-egat-border-lt">
              <div className="w-1.5 h-1.5 rounded-full bg-egat-navy flex-shrink-0 mt-1" />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-egat-text">{m.type}</span>
                  <span className="text-[10px] text-egat-text-muted">{m.date}</span>
                </div>
                <div className="text-[10px] text-egat-text-sub mt-0.5">{m.result} · ฿{m.cost.toLocaleString()}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function HealthTrendTooltip({ active, payload }) {
  if (!active || !payload?.length) return null
  const row = payload[0]?.payload || {}
  return (
    <div className="bg-white border border-egat-border rounded-xl px-3 py-2 text-xs space-y-0.5">
      <p>Device ID: <span className="font-bold text-egat-navy">{row.deviceId || '—'}</span></p>
      <p>Time: <span className="font-bold">{row.timestamp || row.iso || row.date}</span></p>
      <p>Health Score: <span className="font-bold">{row.score}</span></p>
      <p>Anomaly Score: <span className="font-bold">{row.anomalyScore}</span></p>
    </div>
  )
}

function HealthPieActiveShape(props) {
  const {
    cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, percent, midAngle,
  } = props
  const RADIAN = Math.PI / 180
  const r = (outerRadius || 0) + 18
  const x = cx + r * Math.cos(-(midAngle || 0) * RADIAN)
  const y = cy + r * Math.sin(-(midAngle || 0) * RADIAN)
  return (
    <g>
      <Sector
        cx={cx} cy={cy}
        innerRadius={innerRadius}
        outerRadius={(outerRadius || 0) + 8}
        startAngle={startAngle} endAngle={endAngle}
        fill={fill}
      />
      <text
        x={x} y={y}
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
        fill={fill}
        fontSize={12}
        fontWeight={700}
      >
        {`${Math.round((percent || 0) * 100)}%`}
      </text>
    </g>
  )
}

export default function HealthPage() {
  const header = useHeaderFilters()
  const { allowedSites } = useSiteScope()
  const [asset,      setAsset]      = useState(FLEET[0].id)
  const [tab,        setTab]        = useState(0)
  const [avgView,    setAvgView]    = useState(false)
  const [hiddenCats, setHiddenCats] = useState({})
  const [trendQuery, setTrendQuery] = useState('')
  const [trendDates, setTrendDates] = useState(createEmptyHealthTrendDates)
  const [trendThreshold, setTrendThreshold] = useState(50)
  const [trendType,  setTrendType]  = useState('')
  const [trendModal, setTrendModal] = useState(null)
  const [pieCat,     setPieCat]     = useState(null)
  const [panelCat,   setPanelCat]   = useState(null)
  const [panelOpen,  setPanelOpen]  = useState(false)

  const scopedDevices = useMemo(
    () => DEVICES_TABLE.filter(d => {
      if (Array.isArray(allowedSites) && !allowedSites.includes(d.site)) return false
      return !header.location || d.site === header.location
    }),
    [header.location, allowedSites],
  )
  const pieSource = useMemo(() => buildHealthPieData(scopedDevices), [scopedDevices])
  const pieVisible = useMemo(() => visibleHealthPieData(pieSource, hiddenCats), [pieSource, hiddenCats])
  const deviceTableRows = useMemo(() => toDeviceHealthTableRows(scopedDevices), [scopedDevices])
  const avgRows = useMemo(() => toAvgHealthRows(scopedDevices), [scopedDevices])
  const extraAlerts = useMemo(
    () => healthNotifications(scopedDevices, (id) => {
      setAvgView(false)
      setAsset(id)
      setTab(1)
    }),
    [scopedDevices],
  )

  const pieDetailRows = useMemo(
    () => toHealthDetailRows(scopedDevices, panelCat),
    [panelCat, scopedDevices],
  )
  const pieActiveIndex = pieCat
    ? pieVisible.findIndex(e => e.label === pieCat)
    : -1
  const piePanelPct = pieSource.find(c => c.label === panelCat)?.pct

  useEffect(() => {
    if (!scopedDevices.length) return
    if (!scopedDevices.some(d => d.deviceId === asset)) setAsset(scopedDevices[0].deviceId)
  }, [scopedDevices, asset])

  useEffect(() => {
    if (pieCat) return undefined
    setPanelOpen(false)
    const t = setTimeout(() => setPanelCat(null), PIE_PANEL_MS)
    return () => clearTimeout(t)
  }, [pieCat])

  useEffect(() => {
    if (!trendModal) return undefined
    function onKey(e) {
      if (e.key === 'Escape') setTrendModal(null)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [trendModal])

  function handleHealthPieClick(data) {
    const cat = resolveHealthPieCategory(data)
    if (!cat) return
    if (hiddenCats[cat]) {
      setHiddenCats(h => toggleHiddenPieCategory(h, cat))
    }
    if (pieCat === cat) {
      setPieCat(null)
      return
    }
    const alreadyOpen = Boolean(pieCat)
    setPanelCat(cat)
    setPieCat(cat)
    if (alreadyOpen) {
      setPanelOpen(true)
      return
    }
    setPanelOpen(false)
    requestAnimationFrame(() => {
      requestAnimationFrame(() => setPanelOpen(true))
    })
  }

  function handleTogglePie(label, e) {
    e.stopPropagation()
    setHiddenCats(h => toggleHiddenPieCategory(h, label))
    if (pieCat === label) setPieCat(null)
  }

  function handleTrendType(type) {
    setTrendType(type)
    const pool = scopedDevices.filter(d => !type || d.type === type)
    if (pool.length && !pool.some(d => d.deviceId === asset)) setAsset(pool[0].deviceId)
  }

  const details = getHealthDetails(asset)
  const trend = useMemo(() => {
    const device = scopedDevices.find(d => d.deviceId === asset) || { deviceId: asset }
    return enrichHealthTrend(generateHealthTrend(asset), device, trendThreshold)
  }, [asset, scopedDevices, trendThreshold])
  const chartTrend = useMemo(
    () => filterHealthTrend(trend, { query: trendQuery, dates: trendDates }),
    [trend, trendQuery, trendDates],
  )

  if (!details) return null

  const { score, status, dimensions, weights, kpis } = details
  const sclr    = STATUS_COLOR[status]?.hex || '#1B3A6B'
  const dimData = Object.entries(dimensions).map(([key,val])=>({
    dim:key, value:val, weight:weights[key], weighted:+(val*weights[key]).toFixed(1)
  }))
  const radarData = Object.entries(dimensions).map(([key,val])=>({dim:key, score:val, fullMark:100}))
  const fleetScores = scopedDevices.map(f=>{
    const d = getHealthDetails(f.deviceId)
    return {id:f.deviceId.replace(/-01$/,''),score:d?.score||0,status:f.status,fill:STATUS_COLOR[f.status]?.hex}
  }).sort((a,b)=>a.score-b.score)

  const avgHealth = scopedDevices.length
    ? +(scopedDevices.reduce((s,f)=>s+f.health,0)/scopedDevices.length).toFixed(1)
    : 0

  const assetOptions = scopedDevices.filter(d => !trendType || tab !== 2 || d.type === trendType)

  if (avgView) {
    return (
      <>
        <PageHeader icon="💚" title="Health Score"
          subtitle="Weighted Composite Scoring | Performance · Availability · Error Rate · Age · Maintenance"
          extraAlerts={extraAlerts} />
        <AvgHealthView
          rows={avgRows}
          onBack={() => setAvgView(false)}
          onSelect={id => { setAsset(id); setAvgView(false) }}
        />
      </>
    )
  }

  return (
    <div className="animate-fade-in">
      <PageHeader icon="💚" title="Health Score"
        subtitle="Weighted Composite Scoring | Performance · Availability · Error Rate · Age · Maintenance"
        extraAlerts={extraAlerts} />

      {/* Asset selector */}
      <div className="flex items-center gap-3 mb-4">
        <div>
          <label className="block text-[10px] font-semibold uppercase tracking-wider text-egat-text-muted mb-1">Asset</label>
          <select value={asset} onChange={e=>setAsset(e.target.value)}
            className="text-xs border border-egat-border rounded-lg px-3 py-1.5 bg-egat-surface text-egat-text focus:outline-none focus:border-egat-navy">
            {(assetOptions.length ? assetOptions : scopedDevices).map(f=><option key={f.deviceId} value={f.deviceId}>{f.deviceId} — {f.site}</option>)}
          </select>
        </div>
        <StatusBadge status={status} />
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-5">
        <KpiCard value={score}                     label="Health Score / 100"  color={sclr} delta={status} />
        <KpiCard value={`${kpis.cpu}%`}            label="CPU Utilisation"     color={kpis.cpu>85?'#C53030':'#1B3A6B'} />
        <KpiCard value={`${kpis.bw}%`}             label="BW Utilisation"      color={kpis.bw>85?'#C53030':'#1B3A6B'} />
        <KpiCard value={`${kpis.pkt_loss}%`}       label="Packet Loss"         color={kpis.pkt_loss>2?'#C53030':'#1A7F4B'} />
        <KpiCard value={avgHealth}                  label="Fleet Avg Health"    color="#E8960C" delta={`${scopedDevices.length} assets`} onClick={() => setAvgView(true)} />
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-1 mb-4 bg-egat-surface-alt border border-egat-border rounded-lg p-1 w-fit">
        {TABS.map((t,i)=>(
          <button key={t} onClick={()=>{ setTab(i); if (i !== 0) { setPieCat(null); setPanelOpen(false); setPanelCat(null) } }} className={`tab-pill ${tab===i?'active':''}`}>{t}</button>
        ))}
      </div>

      {/* ─── Tab 0: Score Breakdown ───────────────────────────────────────────── */}
      {tab===0 && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Score + alerts */}
            <div className="card p-5 flex flex-col items-center">
              <div className="relative w-44 h-44 my-4">
                <svg viewBox="0 0 160 160" className="w-full h-full -rotate-90">
                  <circle cx="80" cy="80" r="66" fill="none" stroke="#EEF2F7" strokeWidth="10" />
                  <circle cx="80" cy="80" r="66" fill="none" stroke={sclr} strokeWidth="10"
                    strokeDasharray={`${2*Math.PI*66*score/100} ${2*Math.PI*66}`}
                    strokeLinecap="round" style={{transition:'stroke-dasharray 0.8s ease'}} />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div className="text-[2.8rem] font-black leading-none" style={{color:sclr,fontFamily:'Inter,sans-serif'}}>{score}</div>
                  <div className="text-xs text-egat-text-muted mt-1">/ 100</div>
                </div>
              </div>
              <StatusBadge status={status} />
              <div className="w-full mt-4 space-y-2 text-xs">
                <div className="text-[10px] font-semibold uppercase tracking-wider text-egat-text-muted mb-2">Smart Alerts</div>
                {kpis.cpu>85    && <AlertItem severity="warning"  asset={asset} msg={`CPU ${kpis.cpu}% — เกินเกณฑ์`} time="" />}
                {kpis.bw>85     && <AlertItem severity="warning"  asset={asset} msg={`BW ${kpis.bw}% — ใกล้ขีดจำกัด`} time="" />}
                {kpis.pkt_loss>2&& <AlertItem severity="critical" asset={asset} msg={`Packet loss ${kpis.pkt_loss}% — วิกฤต`} time="" />}
                {kpis.latency>100&&<AlertItem severity="warning"  asset={asset} msg={`Latency ${kpis.latency}ms — สูงเกิน`} time="" />}
                {kpis.days_maint>180&&<AlertItem severity="watch" asset={asset} msg={`บำรุงรักษา ${kpis.days_maint} วัน`} time="" />}
                {score>=80      && <AlertItem severity="healthy"  asset={asset} msg="ทุก KPI อยู่ในเกณฑ์ปกติ" time="" />}
              </div>
            </div>

            {/* Radar */}
            <div className="card p-5">
              <SectionHeader title="Sub-Score Radar" />
              <ResponsiveContainer width="100%" height={280}>
                <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="70%">
                  <PolarGrid stroke="#EEF2F7" />
                  <PolarAngleAxis dataKey="dim" tick={{fontSize:10,fill:'#4A5568'}} />
                  <PolarRadiusAxis angle={90} domain={[0,100]} tick={{fontSize:8,fill:'#8896A4'}} />
                  <Radar dataKey="score" stroke={sclr} fill={sclr} fillOpacity={0.15} strokeWidth={2} dot={{r:3,fill:sclr}} />
                  <Tooltip contentStyle={{borderRadius:10,fontSize:11}} />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            {/* Formula */}
            <div className="card p-5">
              <SectionHeader title="Weighted Composite Formula" />
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-egat-border">
                      {['Dimension','Weight','Score','Weighted'].map(h=>(
                        <th key={h} className="pb-2 text-left font-semibold uppercase tracking-wider" style={{color:'#8896A4',fontSize:'9px'}}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {dimData.map(d=>(
                      <tr key={d.dim} className="border-b border-egat-border-lt">
                        <td className="py-2 pr-2 font-medium text-egat-text-sub">{d.dim}</td>
                        <td className="py-2 pr-2 font-bold text-egat-text-muted">{Math.round(d.weight*100)}%</td>
                        <td className="py-2 pr-2">
                          <div className="flex items-center gap-2">
                            <span className="font-bold" style={{color:d.value>=80?'#1A7F4B':d.value>=65?'#B7791F':'#C53030'}}>{d.value}</span>
                            <div className="flex-1 h-1.5 bg-egat-border-lt rounded-full min-w-[40px]">
                              <div className="h-full rounded-full" style={{width:`${d.value}%`,background:d.value>=80?'#1A7F4B':d.value>=65?'#B7791F':'#C53030',opacity:0.7}} />
                            </div>
                          </div>
                        </td>
                        <td className="py-2 font-bold text-egat-text">{d.weighted}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-4 pt-3 border-t border-egat-border-lt flex justify-between items-center">
                <span className="text-xs text-egat-text-muted">Composite Score</span>
                <span className="text-2xl font-black" style={{color:sclr,fontFamily:'Inter,sans-serif'}}>
                  {score}<span className="text-sm font-normal text-egat-text-muted"> / 100</span>
                </span>
              </div>
            </div>
          </div>

          {/* Health Score Pie */}
          <div className="card p-5">
            <SectionHeader title="Fleet Health Distribution" />
            <div className={`health-pie-split ${panelOpen ? 'is-open' : ''}`}>
              <div className="flex items-center gap-6 min-w-0 w-full lg:flex-1">
                <ResponsiveContainer width="55%" height={220}>
                  <PieChart>
                    <Pie data={pieVisible} dataKey="count" nameKey="label"
                      cx="50%" cy="50%" outerRadius={85} innerRadius={48}
                      paddingAngle={3}
                      cursor="pointer"
                      isAnimationActive={false}
                      activeIndex={pieActiveIndex >= 0 ? pieActiveIndex : undefined}
                      activeShape={HealthPieActiveShape}
                      onClick={handleHealthPieClick}>
                      {pieVisible.map((e,i)=><Cell key={i} fill={e.color} cursor="pointer" />)}
                    </Pie>
                    <Tooltip
                      contentStyle={{borderRadius:10,fontSize:11}}
                      formatter={(v, n, item) => {
                        const pct = item?.payload?.pct
                        return [`${v} assets${pct != null ? ` (${pct}%)` : ''}`, n]
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex-1 space-y-3">
                  {pieSource.map(c=>(
                    <div
                      key={c.label}
                      className={`rounded-lg px-1.5 py-1 -mx-1.5 transition-colors duration-300 ${pieCat === c.label ? 'bg-egat-surface-alt' : 'hover:bg-egat-surface-alt/60'}`}
                      style={{ opacity: hiddenCats[c.label] ? 0.35 : 1 }}
                    >
                      <div className="flex items-center justify-between mb-0.5">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <button
                            type="button"
                            title={hiddenCats[c.label] ? 'แสดงหมวดนี้' : 'ซ่อนหมวดนี้'}
                            onClick={e => handleTogglePie(c.label, e)}
                            className="w-2.5 h-2.5 rounded-full shrink-0 border border-white/60"
                            style={{ background: c.color }}
                            aria-pressed={!hiddenCats[c.label]}
                          />
                          <button
                            type="button"
                            onClick={() => handleHealthPieClick(c.label)}
                            className="text-[11px] text-egat-text text-left truncate"
                          >
                            {c.label}
                          </button>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleHealthPieClick(c.label)}
                          className="text-sm font-black"
                          style={{color:c.color,fontFamily:'Inter,sans-serif'}}
                        >
                          {c.count}
                          <span className="text-[10px] font-semibold text-egat-text-muted ml-1">{c.pct}%</span>
                        </button>
                      </div>
                      <div className="h-1.5 rounded-full bg-egat-border-lt overflow-hidden">
                        <div className="h-full rounded-full transition-[width] duration-300" style={{width:`${scopedDevices.length ? (c.count/scopedDevices.length)*100 : 0}%`,background:c.color,opacity: hiddenCats[c.label] ? 0.3 : 0.8}} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className={`health-pie-panel ${panelOpen ? 'is-open' : ''}`}>
                {panelCat && (
                  <HealthCategoryDetail
                    title={healthCategoryTitle(panelCat)}
                    color={healthCategoryColor(panelCat)}
                    percent={piePanelPct}
                    rows={pieDetailRows}
                    onClose={() => setPieCat(null)}
                    onSelectRow={id => setAsset(id)}
                  />
                )}
              </div>
            </div>
            <p className="text-[10px] text-egat-text-muted mt-2">คลิกจุดสีเพื่อซ่อน/แสดงหมวด · คลิกชื่อหรือกราฟเพื่อดูตารางและเปอร์เซ็นต์</p>
          </div>

          <div className="card p-6">
            <CriticalDevicesTable
              data={scopedDevices.filter(d => d.status === 'Critical').sort((a,b)=>a.health-b.health)}
              onRowClick={row => setAsset(row.deviceId)}
            />
          </div>
        </div>
      )}

      {/* ─── Tab 1: Device Health Table ───────────────────────────────────────── */}
      {tab===1 && (
        <div className="card p-5">
          <SectionHeader title="Device Health Score Table — ทุก Asset" />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
            {pieSource.map(c=>(
              <div key={c.label} className="rounded-xl border p-3 text-center" style={{borderLeftWidth:4,borderLeftColor:c.color}}>
                <div className="text-2xl font-black" style={{color:c.color,fontFamily:'Inter,sans-serif'}}>{c.count}</div>
                <div className="text-[10px] text-egat-text-muted leading-tight mt-0.5">{c.label}</div>
              </div>
            ))}
          </div>
          <DataTable
            title="Device Health"
            columns={[
              {key:'deviceId', label:'Device ID',   sortable:true, render:(v)=><span className="font-semibold text-egat-navy">{v}</span>},
              {key:'type',     label:'Type',         sortable:true},
              {key:'site',     label:'Site',         sortable:true},
              {key:'health',   label:'Health Score', sortable:true, render:(v)=>(
                <div className="flex items-center gap-2">
                  <span className="font-black text-sm" style={{color:healthScoreColor(v),fontFamily:'Inter,sans-serif'}}>{v}</span>
                  <div className="h-1.5 w-16 rounded-full bg-egat-border-lt overflow-hidden">
                    <div className="h-full rounded-full" style={{width:`${v}%`,background:healthScoreColor(v),opacity:0.8}} />
                  </div>
                </div>
              )},
              {key:'healthState', label:'Health State', sortable:true},
              {key:'maintText', label:'Maintenance History', sortable:false, render:(v)=>(
                <span className="block text-left text-sm leading-snug whitespace-pre-line line-clamp-3">{v || '—'}</span>
              )},
              {key:'trend', label:'Trend', sortable:true, render:(v)=><TrendCell value={v} />},
              {key:'status',   label:'Status',       sortable:true, render:(v)=><StatusBadge status={v} size="xs" />},
              {key:'cpu',      label:'CPU%',          sortable:true, render:(v)=><span style={{color:+v>85?'#C53030':'inherit'}}>{v}%</span>},
              {key:'uptime',   label:'Uptime',        sortable:true, render:(v)=><span style={{color:+v>=99?'#1A7F4B':'inherit'}}>{v}%</span>},
              {key:'rul',      label:'RUL (yr)',       sortable:true, render:(v)=><span style={{color:+v<=1?'#C53030':+v<=3?'#C05621':'inherit'}}>{v}</span>},
            ]}
            data={deviceTableRows}
            rowDetail={DeviceDetail}
            exportName="device_health_scores"
          />
        </div>
      )}

      {/* ─── Tab 2: Trend Analysis ────────────────────────────────────────────── */}
      {tab===2 && (
        <div className="card p-5">
          <SectionHeader title={`Health Score Trend — 90 วัน (${asset}) คลิกกราฟเพื่อดูรายละเอียด`} />
          <ChartFilterBar
            query={trendQuery}
            onQueryChange={setTrendQuery}
            onReset={() => {
              setTrendQuery('')
              setTrendDates(createEmptyHealthTrendDates())
              setTrendThreshold(50)
              setTrendType('')
            }}
            resetVariant="muted"
            typeValue={trendType}
            onTypeChange={handleTrendType}
            thresholdValue={trendThreshold}
            onThresholdChange={setTrendThreshold}
            dateFilters={trendDates}
            onDateChange={patch => setTrendDates(d => ({ ...d, ...patch }))}
            onExport={format => exportChartTable(
              format,
              withHealthTrendNotes(chartTrend, trendThreshold),
              HEALTH_TREND_EXPORT_COLUMNS,
              'health_score_trend',
              'Health Score Trend 90d',
            )}
            countLabel={`${chartTrend.length} รายการ`}
          />
          <ResponsiveContainer width="100%" height={320}>
            <LineChart data={chartTrend} margin={{top:10,right:10,bottom:5,left:5}}
              isAnimationActive={false}
              onClick={(e)=>e?.activePayload&&setTrendModal(e.activePayload[0]?.payload)}>
              <CartesianGrid strokeDasharray="3 3" stroke="#EEF2F7" />
              <XAxis dataKey="date" tick={{fontSize:9,fill:'#8896A4'}} interval={14} />
              <YAxis domain={[0,100]} tick={{fontSize:10,fill:'#8896A4'}} />
              <Tooltip content={<HealthTrendTooltip />} />
              <ReferenceLine y={80} stroke="#1A7F4B" strokeDasharray="4 3"
                label={{value:'Target 80',position:'insideTopRight',fontSize:9,fill:'#1A7F4B'}} />
              <ReferenceLine y={trendThreshold} stroke="#C53030" strokeDasharray="5 4"
                label={{value:`Score ${trendThreshold}`,position:'insideBottomRight',fontSize:9,fill:'#C53030'}} />
              <Line type="monotone" dataKey="score" stroke={sclr} strokeWidth={2.5}
                isAnimationActive={false}
                activeDot={{ r: 6, cursor: 'pointer' }}
                dot={(props)=>{
                  const {cx,cy,payload} = props
                  const low = payload.score < trendThreshold
                  return (
                    <circle
                      key={`${payload.iso || payload.date}-${cx}`}
                      cx={cx} cy={cy}
                      r={low ? 4 : 3}
                      fill={low ? '#C53030' : sclr}
                      stroke="white"
                      strokeWidth={1.5}
                      style={{ cursor: 'pointer' }}
                    />
                  )
                }}
                name="Health Score" />
            </LineChart>
          </ResponsiveContainer>
          <p className="text-[10px] text-egat-text-muted mt-1">
            ชี้ที่จุดกราฟเพื่อดูอุปกรณ์ เวลา คะแนนสุขภาพ และคะแนนความผิดปกติ · คลิกเพื่อเปิดหมายเหตุ
          </p>
        </div>
      )}

      {/* ─── Tab 3: Fleet Comparison ──────────────────────────────────────────── */}
      {tab===3 && (
        <div className="card p-5">
          <SectionHeader title="Fleet Health Score Comparison" />
          <ResponsiveContainer width="100%" height={360}>
            <BarChart data={fleetScores} layout="vertical" margin={{top:5,right:20,bottom:5,left:10}}>
              <CartesianGrid strokeDasharray="3 3" stroke="#EEF2F7" />
              <XAxis type="number" domain={[0,100]} tick={{fontSize:10,fill:'#8896A4'}} />
              <YAxis type="category" dataKey="id" tick={{fontSize:10,fill:'#4A5568'}} width={90} />
              <Tooltip contentStyle={{borderRadius:10,fontSize:11}} />
              <ReferenceLine x={80} stroke="#1A7F4B" strokeDasharray="4 3" />
              <ReferenceLine x={50} stroke="#C53030" strokeDasharray="4 3" />
              <Bar dataKey="score" radius={[0,4,4,0]} name="Health Score">
                {fleetScores.map((e,i)=><Cell key={i} fill={e.fill} fillOpacity={0.8} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Trend modal — TOR 7.5 */}
      {trendModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={()=>setTrendModal(null)}>
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="health-trend-title"
            className="bg-white rounded-2xl max-w-md w-full"
            onClick={e=>e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-egat-border">
              <h3 id="health-trend-title" className="font-bold text-egat-navy text-base">Health Score Detail</h3>
              <button
                type="button"
                onClick={()=>setTrendModal(null)}
                className="text-egat-text-muted hover:text-egat-navy text-xl leading-none"
                aria-label="ปิด"
              >
                ×
              </button>
            </div>
            <div className="px-6 py-4 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {[
                  ['Device ID', trendModal.deviceId || asset],
                  ['Time', trendModal.timestamp || trendModal.iso || trendModal.date],
                  ['Health Score', trendModal.score],
                  ['Anomaly Score', trendModal.anomalyScore],
                  ['Device Type', trendModal.type],
                  ['Site', trendModal.site],
                ].map(([k, v]) => (
                  <div key={k} className="bg-egat-surface-alt rounded-lg p-3">
                    <div className="text-[10px] text-egat-text-muted uppercase tracking-wider mb-0.5">{k}</div>
                    <div className="text-sm font-semibold text-egat-text">{String(v ?? '—')}</div>
                  </div>
                ))}
              </div>
              <div className="p-4 rounded-xl" style={{ background: '#FFF8E1', border: '1px solid #F6D860' }}>
                <div className="text-[10px] font-semibold uppercase text-egat-gold mb-1">Notes</div>
                <div className="text-sm font-medium text-egat-text">
                  {buildHealthTrendNotes({ ...trendModal, threshold: trendThreshold })}
                </div>
              </div>
              <div className={`text-center py-2 rounded-lg text-sm font-semibold ${trendModal.score>=80?'bg-green-50 text-green-700':trendModal.score>=50?'bg-yellow-50 text-yellow-700':'bg-red-50 text-red-700'}`}>
                {trendModal.score>=80?'สุขภาพดี':trendModal.score>=50?'ต้องตรวจสอบ':'วิกฤต'}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
