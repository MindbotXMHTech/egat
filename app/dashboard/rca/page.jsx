'use client'
import { useState, useMemo, useEffect } from 'react'
import { BarChart, Bar, PieChart, Pie, Sector, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import PageHeader from '../../../components/PageHeader'
import KpiCard from '../../../components/KpiCard'
import SectionHeader from '../../../components/SectionHeader'
import StatusBadge from '../../../components/StatusBadge'
import DataTable from '../../../components/DataTable'
import AnomalyFilterBar from '../../../components/AnomalyFilterBar'
import ThailandAssetMap from '../../../components/ThailandAssetMap'
import RcaCategoryDetail from '../../../components/RcaCategoryDetail'
import { useHeaderFilters } from '../../../components/HeaderFilterContext'
import { useSiteScope } from '../../../components/useSiteScope'
import { INCIDENTS, RCA_CATEGORY_DIST, FLEET } from '../../../lib/data'
import { STATUS_COLOR } from '../../../lib/utils'
import {
  filterIncidents,
} from '../../../lib/anomalyFilters'
import { incidentSearchSuggestions } from '../../../lib/searchSuggest'
import {
  rcaAlertsFromIncidents,
  rcaCategoryTitle,
  nextHiddenCategories,
  resolveRcaPieCategory,
  RCA_CATEGORIES,
  pieDistFromRows,
  toRcaConfidenceRows,
  toRcaDetailRows,
  toRcaTableRow,
  visibleRcaPieData,
} from '../../../lib/rcaDistribution'

const TABS = ['Incident Analysis', 'RCA Table', 'Distribution & Stats']

const SEV_STYLE = {
  critical: { bg:'bg-egat-red-bg',    border:'border-red-200',    dot:'bg-egat-red',    text:'text-egat-red',    hex:'#C53030' },
  warning:  { bg:'bg-egat-orange-bg', border:'border-orange-200', dot:'bg-egat-orange', text:'text-egat-orange', hex:'#C05621' },
  info:     { bg:'bg-egat-blue-bg',   border:'border-blue-200',   dot:'bg-egat-blue',   text:'text-egat-blue',   hex:'#1A56DB' },
  healthy:  { bg:'bg-egat-green-bg',  border:'border-green-200',  dot:'bg-egat-green',  text:'text-egat-green',  hex:'#1A7F4B' },
}
const LAYER_COLOR = { Network:'#1B3A6B', System:'#7C3AED', Application:'#1A56DB', Physical:'#C05621', External:'#8896A4', Configuration:'#B7791F' }

// Flatten INCIDENTS into RCA table rows
const RCA_TABLE = INCIDENTS.map(inc => toRcaTableRow(inc))
const SEARCH_SUGGESTIONS = incidentSearchSuggestions(
  INCIDENTS,
  Object.fromEntries(FLEET.map(f => [f.id, f.site])),
)

const RCA_INCIDENT_COLUMNS = [
  { key:'id', label:'Incident ID', sortable:true, render:(v)=><span className="font-mono text-[10px] font-bold text-egat-navy">{v}</span> },
  { key:'asset', label:'Device ID', sortable:true, render:(v)=><span className="font-semibold text-egat-navy">{v}</span> },
  { key:'category', label:'Issue Category', sortable:true },
  { key:'issueType', label:'Issue Type', sortable:true },
  { key:'start', label:'Timestamp', sortable:true, render:(v)=><span className="font-mono text-[10px]">{v}</span> },
  { key:'rootCause', label:'Identified Root Cause', sortable:false },
  { key:'confidence', label:'Confidence Score', sortable:true, render:(v)=><span className="font-bold" style={{color:'#7C3AED'}}>{v}</span> },
  { key:'contributingFactors', label:'Contributing Factors', sortable:false },
  { key:'status', label:'Status', sortable:true, render:(v)=><StatusBadge status={v} size="xs" /> },
]

const RCA_CONFIDENCE_COLUMNS = [
  { key:'asset', label:'Device ID', sortable:true, render:(v)=><span className="font-semibold text-egat-navy">{v}</span> },
  { key:'id', label:'Incident ID', sortable:true, render:(v)=><span className="font-mono text-[10px] font-bold text-egat-navy">{v}</span> },
  { key:'category', label:'Issue Category', sortable:true },
  { key:'confidence', label:'Avg Confidence', sortable:true, render:(v)=><span className="font-bold" style={{color:'#7C3AED'}}>{v}</span> },
]

// Layer distribution for all causes
const layerDist = Object.entries(
  INCIDENTS.flatMap(i=>i.causes).reduce((acc,c)=>({ ...acc, [c.layer]: (acc[c.layer]||0)+1 }), {})
).map(([layer, count]) => ({ layer, count, color: LAYER_COLOR[layer] }))

function RcaPieActiveShape(props) {
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
      >
        {`${Math.round((percent || 0) * 100)}%`}
      </text>
    </g>
  )
}

// RCA Detail modal
function RcaDetail(row) {
  const inc = row._inc
  if (!inc) return null
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        {[['Incident ID',inc.id],['Device ID',inc.asset],['Issue Type',row.issueType],['Issue Category',row.category],
          ['Started',inc.start],['Duration',inc.duration],
          ['Severity',inc.severity],['Status',inc.status],['Affected Services',inc.affectedServices],
          ['Data Loss',inc.dataLoss?'ใช่':'ไม่']
        ].map(([k,v])=>(
          <div key={k} className="bg-egat-surface-alt rounded-lg p-3">
            <div className="text-[10px] text-egat-text-muted uppercase tracking-wider mb-0.5">{k}</div>
            <div className="text-sm font-semibold text-egat-text">{String(v)}</div>
          </div>
        ))}
      </div>
      <div className="p-4 rounded-xl bg-red-50 border border-red-200">
        <div className="text-[10px] font-semibold uppercase text-red-700 mb-1">Root Cause</div>
        <div className="text-sm font-medium text-egat-text">{inc.rootCause}</div>
      </div>
      <div className="p-4 rounded-xl bg-orange-50 border border-orange-200">
        <div className="text-[10px] font-semibold uppercase text-orange-800 mb-1">Contributing Factors</div>
        <div className="text-sm font-medium text-egat-text">{row.contributingFactors}</div>
      </div>
      {/* Cause list */}
      <div>
        <div className="text-[10px] font-semibold uppercase text-egat-text-muted mb-2">Root Cause Clues</div>
        {inc.causes.map((c,i)=>(
          <div key={i} className="flex items-center gap-3 mb-2">
            <div className="text-xs font-bold w-4 text-egat-text-muted">{i+1}.</div>
            <div className="flex-1">
              <div className="flex justify-between mb-0.5">
                <span className="text-xs font-semibold text-egat-text">{c.name}</span>
                <span className="text-xs font-bold" style={{color:c.prob>0.7?'#C53030':c.prob>0.5?'#C05621':'#B7791F'}}>{(c.prob*100).toFixed(0)}%</span>
              </div>
              <div className="h-1.5 rounded-full bg-egat-border-lt overflow-hidden">
                <div className="h-full rounded-full" style={{width:`${c.prob*100}%`,background:LAYER_COLOR[c.layer],opacity:0.8}} />
              </div>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded-full" style={{background:`${LAYER_COLOR[c.layer]}18`,color:LAYER_COLOR[c.layer]}}>{c.layer}</span>
          </div>
        ))}
      </div>
      {/* Cascade */}
      <div>
        <div className="text-[10px] font-semibold uppercase text-egat-text-muted mb-2">Event Cascade</div>
        <div className="space-y-2">
          {inc.cascade.map((e,i)=>{
            const s = SEV_STYLE[e.severity]||SEV_STYLE.info
            return (
              <div key={i} className={`flex gap-2 p-2 rounded-lg border ${s.bg} ${s.border}`}>
                <span className="font-mono text-[10px] font-bold" style={{color:s.hex}}>{e.time}</span>
                <span className="text-xs text-egat-text">{e.event}</span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default function RcaPage() {
  const header = useHeaderFilters()
  const { allowedSites, locations, scopedFleet } = useSiteScope()
  const [incIdx, setIncIdx] = useState(0)
  const [tab,    setTab]    = useState(0)
  const [query, setQuery]   = useState('')
  const [pieCat, setPieCat] = useState(null)
  const [hiddenCats, setHiddenCats] = useState(() => new Set())
  const [kpiView, setKpiView] = useState(null)

  const siteByAsset = useMemo(
    () => Object.fromEntries(scopedFleet.map(f => [f.id, f.site])),
    [scopedFleet],
  )
  const filters = useMemo(
    () => ({ ...header.tableFilters, query, allowedSites }),
    [header.tableFilters, query, allowedSites],
  )
  const filteredIncidents = useMemo(
    () => filterIncidents(INCIDENTS, filters, siteByAsset),
    [filters, siteByAsset],
  )
  const mapAssets = useMemo(() => {
    const ids = new Set(filteredIncidents.map(i => i.asset))
    return scopedFleet.filter(f => ids.has(f.id))
  }, [filteredIncidents, scopedFleet])

  useEffect(() => {
    if (!filteredIncidents.length) return
    const currentId = INCIDENTS[incIdx]?.id
    if (!filteredIncidents.some(i => i.id === currentId)) {
      const next = INCIDENTS.findIndex(i => i.id === filteredIncidents[0].id)
      if (next >= 0) setIncIdx(next)
    }
  }, [filteredIncidents, incIdx])

  const inc = INCIDENTS[incIdx] || INCIDENTS[0]
  const causeData = (inc?.causes || []).map(c => ({ ...c, barProb: +(c.prob*100).toFixed(0) }))
  const rcaTable = RCA_TABLE.filter(r => filteredIncidents.some(i => i.id === r.id))
  const avgConf = rcaTable.length
    ? +(rcaTable.reduce((s,r)=>s+r.confNum,0)/rcaTable.length*100).toFixed(1)
    : 0
  const pieDetailRows = useMemo(
    () => toRcaDetailRows(rcaTable, pieCat),
    [rcaTable, pieCat],
  )
  const pieData = useMemo(
    () => visibleRcaPieData(pieDistFromRows(rcaTable, RCA_CATEGORY_DIST), hiddenCats)
      .filter(e => e.count > 0),
    [rcaTable, hiddenCats],
  )
  const confidenceRows = useMemo(
    () => toRcaConfidenceRows(rcaTable),
    [rcaTable],
  )

  function openIncident(id) {
    const next = INCIDENTS.findIndex(i => i.id === id)
    if (next < 0) return
    setIncIdx(next)
    setKpiView(null)
    setPieCat(null)
    setTab(0)
    const site = siteByAsset[INCIDENTS[next].asset]
    if (site) header.setLocation(site)
  }

  const rcaAlerts = useMemo(
    () => rcaAlertsFromIncidents(filteredIncidents, openIncident),
    [filteredIncidents, siteByAsset],
  )

  function handlePieClick(data) {
    const cat = resolveRcaPieCategory(data)
    if (!cat || hiddenCats.has(cat)) return
    setPieCat(prev => (prev === cat ? null : cat))
  }

  function handleLegendToggle(category) {
    if (!category) return
    setHiddenCats(prev => {
      const next = nextHiddenCategories(prev, category, RCA_CATEGORIES)
      return next
    })
    setPieCat(prev => (prev === category ? null : prev))
  }

  const pieActiveIndex = pieCat
    ? pieData.findIndex(e => e.category === pieCat)
    : -1

  return (
    <div className="animate-fade-in">
      <PageHeader
        icon="🔍"
        title="Root Cause Analysis"
        subtitle="Rule-Based + GNN + Bayesian Network + Association Rules | AI-Powered Diagnosis"
        extraAlerts={rcaAlerts}
      />

      {kpiView ? (
        <div className="card p-5">
          <button
            type="button"
            onClick={() => setKpiView(null)}
            className="flex items-center gap-2 px-4 py-2 mb-4 rounded-lg border border-solid text-base font-bold whitespace-nowrap bg-white"
            style={{ borderColor: '#FFCB05', color: '#034EA2' }}
          >
            Back
            <span className="size-4 overflow-hidden shrink-0 inline-flex">
              <img src="/icons/alerts-back.svg" alt="" className="w-full h-full" />
            </span>
          </button>
          <SectionHeader title={kpiView === 'confidence' ? 'Average Confidence Score' : 'Total Analyzed Issues'} />
          <DataTable
            title={kpiView === 'confidence' ? 'Avg Confidence' : 'Analyzed Issues'}
            columns={kpiView === 'confidence' ? RCA_CONFIDENCE_COLUMNS : RCA_INCIDENT_COLUMNS}
            data={kpiView === 'confidence' ? confidenceRows : rcaTable}
            rowDetail={RcaDetail}
            exportName={kpiView === 'confidence' ? 'rca_avg_confidence' : 'rca_analyzed_issues'}
            defaultSortKey={kpiView === 'confidence' ? 'confNum' : 'start'}
            defaultSortDir={kpiView === 'confidence' ? 'desc' : 'desc'}
          />
        </div>
      ) : (
      <>
      <AnomalyFilterBar
        filters={filters}
        locations={locations}
        suggestions={SEARCH_SUGGESTIONS}
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

      <ThailandAssetMap
        assets={mapAssets}
        selectedSite={header.location || (inc ? siteByAsset[inc.asset] : undefined)}
        onSelectSite={site => {
          header.setLocation(site)
          const hit = INCIDENTS.find(i => siteByAsset[i.asset] === site)
          if (hit) setIncIdx(INCIDENTS.findIndex(i => i.id === hit.id))
        }}
      />

      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        <KpiCard
          value={filteredIncidents.length}
          label="Total Incidents"
          color="#1B3A6B"
          sub="คลิกดูตาราง"
          onClick={() => setKpiView('incidents')}
        />
        <KpiCard value={filteredIncidents.filter(i=>i.status==='Resolved').length} label="Resolved" color="#1A7F4B" />
        <KpiCard
          value={`${avgConf}%`}
          label="Avg Confidence"
          color="#7C3AED"
          sub="คลิกดูตาราง"
          onClick={() => setKpiView('confidence')}
        />
        <KpiCard value="<15min"            label="Avg Diagnosis"     color="#E8960C" sub="Mean time" />
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-1 mb-4 bg-egat-surface-alt border border-egat-border rounded-lg p-1 w-fit">
        {TABS.map((t,i)=>(
          <button key={t} onClick={()=>{ setTab(i); if (i !== 2) setPieCat(null) }} className={`tab-pill ${tab===i?'active':''}`}>{t}</button>
        ))}
      </div>

      {/* ─── Tab 0: Incident Analysis ─────────────────────────────────────────── */}
      {tab===0 && (
        <>
          {/* Incident selector */}
          <div className="mb-4">
            <label className="block text-[10px] font-semibold uppercase tracking-wider text-egat-text-muted mb-2">เลือก Incident</label>
            <div className="flex gap-2 flex-wrap">
              {filteredIncidents.map((row) => {
                const i = INCIDENTS.findIndex(x => x.id === row.id)
                return (
                <button key={row.id} onClick={()=>setIncIdx(i)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-xs font-medium transition-all ${i===incIdx?'border-egat-navy bg-egat-navy text-white':'border-egat-border bg-egat-surface text-egat-text-sub hover:border-egat-navy'}`}>
                  <span className={`w-2 h-2 rounded-full flex-shrink-0 ${i===incIdx?'bg-egat-gold':STATUS_COLOR[row.status]?.dot}`} />
                  {row.id}
                </button>
                )
              })}
            </div>
          </div>

          {/* Incident header */}
          <div className="card p-5 mb-4" style={{borderLeft:'4px solid #1B3A6B'}}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="text-base font-bold text-egat-navy">{inc.title}</div>
                <div className="text-xs text-egat-text-sub mt-1">{inc.id} · {inc.asset} · {inc.start} · {inc.duration}</div>
                <div className="text-xs text-egat-text-muted mt-1">{inc.impact}</div>
              </div>
              <StatusBadge status={inc.status} />
            </div>
            <div className="mt-3 pt-3 border-t border-egat-border-lt">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-egat-text-muted">Root Cause: </span>
              <span className="text-xs font-semibold text-egat-red">{inc.rootCause}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
            {/* Cascade */}
            <div className="card p-5">
              <SectionHeader title="Event Cascade Timeline" />
              <div className="relative pl-5">
                <div className="absolute left-2 top-2 bottom-2 w-px bg-egat-border-lt" />
                {inc.cascade.map((e,i)=>{
                  const s = SEV_STYLE[e.severity]||SEV_STYLE.info
                  return (
                    <div key={i} className="relative mb-3 last:mb-0">
                      <div className={`absolute -left-3 top-2 w-2.5 h-2.5 rounded-full border-2 border-egat-surface ${s.dot}`} />
                      <div className={`ml-2 p-3 rounded-lg border ${s.bg} ${s.border}`}>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[11px] font-bold" style={{color:s.hex}}>{e.time}</span>
                          <span className={`text-[10px] font-semibold ${s.text}`}>{e.severity.toUpperCase()}</span>
                        </div>
                        <div className="text-xs text-egat-text mt-0.5">{e.event}</div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Bayesian */}
            <div className="card p-5">
              <SectionHeader title="Bayesian Cause Probability" />
              <ResponsiveContainer width="100%" height={240}>
                <BarChart layout="vertical" data={causeData} margin={{top:5,right:20,bottom:5,left:10}}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#EEF2F7" />
                  <XAxis type="number" domain={[0,100]} tick={{fontSize:10,fill:'#8896A4'}} tickFormatter={v=>`${v}%`} />
                  <YAxis type="category" dataKey="name" tick={{fontSize:10,fill:'#4A5568'}} width={140} />
                  <Tooltip contentStyle={{borderRadius:10,fontSize:11}} formatter={v=>`${v}%`} />
                  <Bar dataKey="barProb" radius={[0,4,4,0]} name="Probability">
                    {causeData.map((e,i)=><Cell key={i} fill={LAYER_COLOR[e.layer]||'#1B3A6B'} fillOpacity={0.8} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <div className="mt-3 flex flex-wrap gap-2">
                {Object.entries(LAYER_COLOR).map(([l,c])=>(
                  <div key={l} className="flex items-center gap-1.5 text-[10px] text-egat-text-sub">
                    <div className="w-2 h-2 rounded-sm" style={{background:c}} />{l}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Cause hierarchy + Data integration */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="card p-5">
              <SectionHeader title="Cause Hierarchy (GNN Analysis)" />
              <div className="space-y-2 mt-2">
                {causeData.map((c,i)=>(
                  <div key={i} className="flex items-center gap-3">
                    <div className="text-xs font-bold w-4 text-egat-text-muted">{i+1}.</div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-semibold text-egat-text">{c.name}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] px-2 py-0.5 rounded-full"
                            style={{background:`${LAYER_COLOR[c.layer]}15`,color:LAYER_COLOR[c.layer]}}>{c.layer}</span>
                          <span className="text-xs font-bold" style={{color:c.prob>0.7?'#C53030':c.prob>0.5?'#C05621':'#B7791F'}}>{c.barProb}%</span>
                        </div>
                      </div>
                      <div className="h-1.5 bg-egat-border-lt rounded-full overflow-hidden">
                        <div className="h-full rounded-full" style={{width:`${c.barProb}%`,background:LAYER_COLOR[c.layer],opacity:0.75}} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="card p-5">
              <SectionHeader title="Data Integration Sources" />
              {[
                {name:'CoEM API',label:'Event Management',data:`${inc.cascade.length} events retrieved`,color:'#1B3A6B'},
                {name:'CoSAM API',label:'Asset Management',data:'Asset specs, maintenance history',color:'#7C3AED'},
                {name:'NCE Performance',label:'SDH/DWDM KPI',data:'72h performance data (288 points)',color:'#1A56DB'},
              ].map(src=>(
                <div key={src.name} className="mb-3 p-3 rounded-lg border border-egat-border-lt hover:bg-egat-surface-alt transition-colors">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-1.5 h-1.5 rounded-full" style={{background:src.color}} />
                    <span className="text-xs font-bold" style={{color:src.color}}>{src.name}</span>
                    <span className="text-[10px] text-egat-text-muted">— {src.label}</span>
                  </div>
                  <div className="font-mono text-[10px] text-egat-text-sub bg-egat-surface-alt border border-egat-border-lt rounded-md px-2 py-1.5 mt-1">
                    GET /api/v1/{src.name.toLowerCase().replace(' ','')} → {src.data}
                  </div>
                </div>
              ))}
              <div className="mt-2 p-3 rounded-lg bg-egat-blue-bg border border-blue-200">
                <div className="text-[10px] font-semibold text-egat-blue uppercase tracking-wider mb-1">AI Model Pipeline</div>
                <div className="text-xs text-egat-text-sub">Rule-based pre-filter → GNN topology analysis → Bayesian inference → Association rule mining → Ranked cause list</div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ─── Tab 1: RCA Table ─────────────────────────────────────────────────── */}
      {tab===1 && (
        <div className="card p-5">
          <SectionHeader title="RCA Incident Table — All Incidents" />
          <DataTable
            title="RCA Incident"
            columns={RCA_INCIDENT_COLUMNS}
            data={rcaTable}
            rowDetail={RcaDetail}
            exportName="rca_incidents"
          />
        </div>
      )}

      {/* ─── Tab 2: Distribution & Stats ──────────────────────────────────────── */}
      {tab===2 && (
        <div className="space-y-4">
          <div className={pieCat ? 'space-y-4' : 'grid grid-cols-1 lg:grid-cols-2 gap-4'}>
            {/* Root Cause Distribution Pie */}
            <div className="card p-5">
              <SectionHeader title="Root Cause Distribution" />
              <div className={pieCat
                ? 'grid grid-cols-1 lg:grid-cols-2 gap-4 items-stretch lg:h-[256px]'
                : ''}>
                <div className="min-w-0 h-[256px]">
                  {pieData.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-sm text-egat-text-muted">
                      ไม่มีข้อมูลในหมวดที่แสดง
                    </div>
                  ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={pieData} dataKey="count" nameKey="category"
                        cx="50%" cy="50%" outerRadius={90} innerRadius={50}
                        paddingAngle={3}
                        cursor="pointer"
                        isAnimationActive={false}
                        activeIndex={pieActiveIndex >= 0 ? pieActiveIndex : undefined}
                        activeShape={RcaPieActiveShape}
                        onClick={handlePieClick}
                        label={({ pct }) => `${pct}%`}
                        labelLine={false}>
                        {pieData.map((e)=>(
                          <Cell key={e.category} fill={e.color} cursor="pointer" />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{borderRadius:10,fontSize:11}} formatter={(v,n)=>[`${v} incidents`,n]} />
                    </PieChart>
                  </ResponsiveContainer>
                  )}
                </div>
                {pieCat && (
                  <RcaCategoryDetail
                    key={pieCat}
                    title={rcaCategoryTitle(pieCat)}
                    rows={pieDetailRows}
                    onClose={() => setPieCat(null)}
                    onSelectRow={openIncident}
                  />
                )}
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {RCA_CATEGORY_DIST.map(e => {
                  const off = hiddenCats.has(e.category)
                  return (
                    <button
                      key={e.category}
                      type="button"
                      onClick={() => handleLegendToggle(e.category)}
                      className={`flex items-center gap-1.5 text-[11px] px-2 py-1 rounded-lg border transition-opacity ${off ? 'opacity-40 line-through border-egat-border-lt' : 'border-egat-border bg-white'}`}
                      title={off ? 'คลิกเพื่อแสดงหมวดนี้' : 'คลิกเพื่อซ่อนหมวดนี้'}
                    >
                      <span className="w-2 h-2 rounded-sm shrink-0" style={{ background: e.color }} />
                      {e.category}
                    </button>
                  )
                })}
              </div>
              <p className="text-[10px] text-egat-text-muted mt-2">คลิก legend เพื่อซ่อน/แสดงหมวด · คลิกกราฟเพื่อดูตารางรายละเอียด</p>
            </div>

            {/* Layer distribution */}
            <div className="card p-5">
              <SectionHeader title="Cause Layer Distribution" />
              <ResponsiveContainer width="100%" height={260}>
                <BarChart layout="vertical" data={layerDist} margin={{top:5,right:20,bottom:5,left:10}}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#EEF2F7" />
                  <XAxis type="number" tick={{fontSize:10,fill:'#8896A4'}} />
                  <YAxis type="category" dataKey="layer" tick={{fontSize:11,fill:'#4A5568'}} width={100} />
                  <Tooltip contentStyle={{borderRadius:10,fontSize:11}} />
                  <Bar dataKey="count" radius={[0,4,4,0]} name="จำนวน">
                    {layerDist.map((e,i)=><Cell key={i} fill={e.color} fillOpacity={0.8} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Confidence by incident */}
          <div className="card p-5">
            <SectionHeader title="Confidence Score per Incident" />
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={rcaTable} margin={{top:5,right:10,bottom:5,left:5}}>
                <CartesianGrid strokeDasharray="3 3" stroke="#EEF2F7" />
                <XAxis dataKey="id" tick={{fontSize:8,fill:'#8896A4'}} />
                <YAxis domain={[0,100]} tick={{fontSize:9,fill:'#8896A4'}} tickFormatter={v=>`${v}%`} />
                <Tooltip contentStyle={{borderRadius:10,fontSize:11}} formatter={v=>`${(v*100).toFixed(0)}%`} />
                <Bar dataKey="confNum" radius={[4,4,0,0]} name="Confidence">
                  {rcaTable.map((e,i)=><Cell key={i} fill={e.confNum>0.85?'#1A7F4B':e.confNum>0.7?'#E8960C':'#C05621'} fillOpacity={0.85} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <div className="mt-3 p-3 rounded-xl bg-purple-50 border border-purple-200 text-xs text-purple-800">
              <span className="font-semibold">Average Confidence Score: {avgConf}%</span> — คำนวณจาก Top Bayesian cause probability ของทุก incident
            </div>
          </div>
        </div>
      )}
      </>
      )}
    </div>
  )
}
