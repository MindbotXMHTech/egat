'use client'
import { useEffect, useMemo, useRef, useState } from 'react'
import {
  ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, PieChart, Pie, Cell, Legend
} from 'recharts'
import PageHeader from '../../../components/PageHeader'
import KpiCard from '../../../components/KpiCard'
import SectionHeader from '../../../components/SectionHeader'
import StatusBadge from '../../../components/StatusBadge'
import DataTable from '../../../components/DataTable'
import LccCategoryDetail from '../../../components/LccCategoryDetail'
import ForecastDetailPanel from '../../../components/ForecastDetailPanel'
import { useHeaderFilters } from '../../../components/HeaderFilterContext'
import { useSiteScope } from '../../../components/useSiteScope'
import {
  LIFECYCLE, generateBudgetForecast,
  INVENTORY_PARTS, generateQuarterlyForecast
} from '../../../lib/data'
import { assetsAtLocation, assetsInSiteScope } from '../../../lib/headerFilters'
import {
  buildLccPieData,
  assetLccCost,
  lccCategoryColor,
  lccCategoryTitle,
  resolveLccPieCategory,
  toLccDetailRows,
} from '../../../lib/lifecycleCost'
import {
  buildQuarterForecast,
  buildLifecycleAlerts,
  canHidePieCategory,
  isSameQuarterSelection,
  monthGroups,
  parseQuarterBarClick,
  riskAssessmentColor,
  toReplacementPlanRows,
  toggleHiddenPieCategory,
  visiblePieSlices,
} from '../../../lib/lifecycleForecast'

const TABS = ['Near-EoL Assets','Asset Forecasting','Replacement Planning','Inventory Optimization','Cost Analysis','Asset Register']
const PRI_COLOR = { Immediate:'#C53030', High:'#C05621', Medium:'#B7791F', Low:'#1A7F4B' }
const PRI_ORD = { Immediate:0, High:1, Medium:2, Low:3 }

const NEAR_EOL = LIFECYCLE
  .filter(l => l.rul <= 3)
  .sort((a,b) => a.rul - b.rul)
  .map(l => ({ ...l, deviceId:l.id, notes: l.priority==='Immediate'?'ต้องเปลี่ยนทันที':l.priority==='High'?'วางแผนภายใน 1 ปี':'วางแผนภายใน 2 ปี' }))

const LIFECYCLE_TABLE = toReplacementPlanRows(LIFECYCLE.map(l => ({
  ...l,
  deviceId: l.id,
  notes: l.priority==='Immediate'?'ต้องเปลี่ยนทันที':l.priority==='High'?'วางแผนภายใน 1 ปี':l.priority==='Medium'?'วางแผนภายใน 2 ปี':'ยังไม่จำเป็น',
  maintHistory:[
    {date:`${2025-Math.floor(l.age/3)}-01-15`,type:'Preventive',result:'Normal',cost:32000},
    {date:`${2024-Math.floor(l.age/5)}-08-20`,type:'Corrective',result:'Component replaced',cost:85000},
    {date:'2024-03-10',                         type:'Inspection',result:'Minor wear detected',cost:15000},
  ]
})))

function LifecycleDetail(row) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        {[['Device ID',row.id||row.deviceId],['Type',row.type],['Site',row.site],['Region',row.region],
          ['Vendor',row.vendor],['Age',`${row.age} yr`],['Design Life',`${row.life} yr`],
          ['RUL',`${row.rul} yr`],['EoL Year',row.eol],['Target Date',row.targetDate],
          ['Health',row.health],
          ['Fail Prob',`${(row.failProb*100).toFixed(0)}%`],['Risk Assessment',row.riskAssessment],
          ['Priority',row.priority],
          ['Replace Cost',`฿${row.replaceCost?.toLocaleString()}`],['Annual Maint',`฿${row.maintCost?.toLocaleString()}`],
        ].map(([k,v])=>(
          <div key={k} className="bg-egat-surface-alt rounded-lg p-3">
            <div className="text-[10px] text-egat-text-muted uppercase tracking-wider mb-0.5">{k}</div>
            <div className="text-sm font-semibold text-egat-text">{String(v)}</div>
          </div>
        ))}
      </div>
      <div className="p-4 rounded-xl" style={{background:'#FFF8E1',border:'1px solid #F6D860'}}>
        <div className="text-[10px] font-semibold uppercase text-egat-gold mb-1">Recommendation</div>
        <div className="text-sm font-medium">{row.notes}</div>
      </div>
      {row.maintHistory && (
        <div>
          <div className="text-[10px] font-semibold uppercase text-egat-text-muted mb-2">Maintenance History</div>
          <div className="space-y-2">
            {row.maintHistory.map((m,i)=>(
              <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-egat-surface-alt border border-egat-border-lt">
                <div className="w-1.5 h-1.5 rounded-full bg-egat-navy flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold">{m.type}</span>
                    <span className="text-[10px] text-egat-text-muted">{m.date}</span>
                  </div>
                  <div className="text-[10px] text-egat-text-sub mt-0.5">{m.result} · ฿{m.cost.toLocaleString()}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

const LCC_PANEL_MS = 340

function costTotals(assets) {
  return {
    acquisition: (assets || []).reduce((s, a) => s + assetLccCost(a, 'Acquisition'), 0),
    maintenance: (assets || []).reduce((s, a) => s + assetLccCost(a, 'Maintenance'), 0),
    disposal: (assets || []).reduce((s, a) => s + assetLccCost(a, 'Disposal'), 0),
    operational: (assets || []).reduce((s, a) => s + assetLccCost(a, 'Operational'), 0),
  }
}

function summarizeLifecycle(assets) {
  const list = assets || []
  return {
    immediate: list.filter(l => l.priority === 'Immediate').length,
    high: list.filter(l => l.priority === 'High').length,
    eolNext3: list.filter(l => l.rul <= 3).length,
    avgRul: list.length ? +(list.reduce((s, l) => s + l.rul, 0) / list.length).toFixed(1) : 0,
    totalReplace: list.reduce((s, l) => s + (l.replaceCost || 0), 0),
  }
}

export default function LifecyclePage() {
  const header = useHeaderFilters()
  const { allowedSites } = useSiteScope()
  const scoped = useMemo(
    () => assetsAtLocation(assetsInSiteScope(LIFECYCLE, allowedSites), header.location),
    [header.location, allowedSites],
  )
  const nearEol = useMemo(
    () => assetsAtLocation(assetsInSiteScope(NEAR_EOL, allowedSites), header.location),
    [header.location, allowedSites],
  )
  const planRows = useMemo(
    () => assetsAtLocation(assetsInSiteScope(LIFECYCLE_TABLE, allowedSites), header.location),
    [header.location, allowedSites],
  )
  const summary = useMemo(() => summarizeLifecycle(scoped), [scoped])
  const costPie = useMemo(() => buildLccPieData(costTotals(scoped)), [scoped])
  const totalCost = costPie.reduce((s, c) => s + c.value, 0)
  const budget5yr = useMemo(() => generateBudgetForecast(5, scoped), [scoped])
  const quarterlyData = useMemo(
    () => generateQuarterlyForecast(header.location ? scoped : undefined),
    [header.location, scoped],
  )
  const replacementRows = useMemo(
    () => planRows.filter(l => l.priority !== 'Low').sort((a, b) =>
      (PRI_ORD[a.priority] - PRI_ORD[b.priority]) || a.rul - b.rul
    ),
    [planRows],
  )
  const [tab,          setTab]          = useState(0)
  const [quarterSel,   setQuarterSel]    = useState(null)
  const [monthKey,     setMonthKey]      = useState(null)
  const [openGroup,    setOpenGroup]     = useState(null)
  const [hiddenPie,    setHiddenPie]    = useState({})
  const [pieCat,       setPieCat]       = useState(null)
  const [panelCat,     setPanelCat]     = useState(null)
  const [panelOpen,    setPanelOpen]    = useState(false)
  const pieCatRef = useRef(null)
  const openGenRef = useRef(0)
  pieCatRef.current = pieCat
  const pieNames = costPie.map(c => c.name)
  const pieVisible = useMemo(() => visiblePieSlices(costPie, hiddenPie), [costPie, hiddenPie])
  const visibleCost = pieVisible.reduce((s, c) => s + c.value, 0)
  const pieDetailRows = useMemo(
    () => toLccDetailRows(scoped, panelCat),
    [scoped, panelCat],
  )
  const extraAlerts = useMemo(
    () => buildLifecycleAlerts({
      assets: scoped,
      onOpen: () => setTab(2),
    }),
    [scoped],
  )

  useEffect(() => {
    setQuarterSel(null)
    setMonthKey(null)
    setOpenGroup(null)
    setPieCat(null)
    setPanelOpen(false)
    setPanelCat(null)
    setHiddenPie({})
  }, [header.location])

  function closeForecast() {
    setQuarterSel(null)
    setMonthKey(null)
    setOpenGroup(null)
  }

  function handleQuarterClick(data) {
    const payload = parseQuarterBarClick(data)
    if (!payload) return
    if (isSameQuarterSelection(quarterSel, payload)) {
      closeForecast()
      return
    }
    const idx = quarterlyData.findIndex(q => q.quarter === payload.quarter)
    const built = buildQuarterForecast(payload, scoped, idx < 0 ? 0 : idx)
    if (!built) return
    setQuarterSel(built)
    const firstMonth = built.months[0]
    setMonthKey(firstMonth?.key || null)
    const firstGroup = firstMonth?.groups.find(g => g.count > 0)
    setOpenGroup(firstGroup?.key || null)
  }

  function handleMonthSelect(key) {
    setMonthKey(key)
    const groups = monthGroups(quarterSel, key)
    setOpenGroup(groups.find(g => g.count > 0)?.key || null)
  }

  function closeLccPanel() {
    openGenRef.current += 1
    setPieCat(null)
  }

  useEffect(() => {
    if (pieCat) return undefined
    setPanelOpen(false)
    const t = setTimeout(() => setPanelCat(null), LCC_PANEL_MS)
    return () => clearTimeout(t)
  }, [pieCat])

  function handleTogglePie(name, e) {
    e?.stopPropagation?.()
    setHiddenPie(h => {
      const next = toggleHiddenPieCategory(h, name, pieNames)
      if (next[name] && pieCatRef.current === name) closeLccPanel()
      return next
    })
  }

  function handleLccPieClick(data) {
    const cat = resolveLccPieCategory(data)
    if (!cat) return
    if (hiddenPie[cat]) {
      setHiddenPie(h => toggleHiddenPieCategory(h, cat, pieNames))
    }
    if (pieCatRef.current === cat) {
      closeLccPanel()
      return
    }
    const alreadyOpen = Boolean(pieCatRef.current)
    pieCatRef.current = cat
    setPanelCat(cat)
    setPieCat(cat)
    if (alreadyOpen) {
      setPanelOpen(true)
      return
    }
    setPanelOpen(false)
    const gen = ++openGenRef.current
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (openGenRef.current === gen && pieCatRef.current === cat) setPanelOpen(true)
      })
    })
  }

  return (
    <div className="animate-fade-in">
      <PageHeader icon="📈" title="Asset Lifecycle Management"
        subtitle="EoL Planning · Budget Forecasting · Replacement Scheduling · Inventory Optimization"
        extraAlerts={extraAlerts} />

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-5">
        <KpiCard value={summary.immediate}      label="Immediate Replace"  color="#C53030" />
        <KpiCard value={summary.high}           label="High Priority"      color="#C05621" />
        <KpiCard value={summary.eolNext3}       label="EoL ≤ 3yr"          color="#B7791F" />
        <KpiCard value={`${summary.avgRul}yr`}  label="Avg RUL"            color="#1B3A6B" />
        <KpiCard value={`฿${(summary.totalReplace/1e6).toFixed(0)}M`} label="Replace Budget" color="#E8960C" />
      </div>

      <div className="flex flex-wrap gap-1 mb-4 bg-egat-surface-alt border border-egat-border rounded-lg p-1 w-fit">
        {TABS.map((t,i)=>(
          <button key={t} onClick={()=>{
            setTab(i)
            if (i !== 1) closeForecast()
            if (i !== 4) { closeLccPanel(); setPanelOpen(false); setPanelCat(null) }
          }} className={`tab-pill ${tab===i?'active':''}`}>{t}</button>
        ))}
      </div>

      {/* ─── Tab 0: Near-EoL Assets ───────────────────────────────────────────── */}
      {tab===0 && (
        <div className="card p-5">
          <SectionHeader title={`Near End-of-Life Assets (RUL ≤ 3 yr) — ${nearEol.length} รายการ`} />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
            {['Immediate','High','Medium','Low'].map(p=>(
              <div key={p} className="rounded-xl border p-3 text-center" style={{borderLeftWidth:4,borderLeftColor:PRI_COLOR[p]}}>
                <div className="text-2xl font-black" style={{color:PRI_COLOR[p],fontFamily:'Inter,sans-serif'}}>{nearEol.filter(a=>a.priority===p).length}</div>
                <div className="text-[11px] text-egat-text-muted">{p}</div>
              </div>
            ))}
          </div>
          <DataTable
            title="Near-EoL Asset"
            columns={[
              {key:'id',          label:'Device ID',    sortable:true, render:(v)=><span className="font-semibold text-egat-navy">{v}</span>},
              {key:'type',        label:'Type',          sortable:true},
              {key:'site',        label:'Site',          sortable:true},
              {key:'age',         label:'Age (yr)',      sortable:true},
              {key:'rul',         label:'RUL (yr)',      sortable:true, render:(v)=><span className="font-bold" style={{color:+v<=1?'#C53030':+v<=2?'#C05621':'#B7791F'}}>{v}</span>},
              {key:'eol',         label:'EoL Year',      sortable:true},
              {key:'health',      label:'Health',        sortable:true, render:(v)=><span className="font-bold" style={{color:+v>=80?'#1A7F4B':+v>=65?'#B7791F':'#C53030'}}>{v}</span>},
              {key:'priority',    label:'Priority',      sortable:true, render:(v)=><StatusBadge status={v} size="xs" />},
              {key:'replaceCost', label:'Replace Cost',  sortable:true, render:(v)=><span className="font-bold">฿{v?.toLocaleString()}</span>},
            ]}
            data={nearEol}
            rowDetail={LifecycleDetail}
            exportName="near_eol_assets"
          />
        </div>
      )}

      {/* ─── Tab 1: Asset Forecasting ─────────────────────────────────────────── */}
      {tab===1 && (
        <div className="space-y-4">
          <div className="card p-5">
            <SectionHeader title="Asset Replacement Forecasting by Quarter — คลิกแถบเพื่อดูรายเดือน" />
            <div className={quarterSel
              ? 'grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(260px,452px)] gap-4 items-start'
              : ''}>
              <div className="min-w-0">
                <ResponsiveContainer width="100%" height={320}>
                  <ComposedChart data={quarterlyData} margin={{top:10,right:10,bottom:5,left:5}}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#EEF2F7" />
                    <XAxis dataKey="quarter" tick={{fontSize:9,fill:'#8896A4'}} />
                    <YAxis yAxisId="left" tick={{fontSize:10,fill:'#8896A4'}} />
                    <YAxis yAxisId="right" orientation="right" tick={{fontSize:9,fill:'#8896A4'}} tickFormatter={v=>`฿${(v/1e6).toFixed(0)}M`} />
                    <Tooltip contentStyle={{borderRadius:10,fontSize:11}} formatter={(v,n)=>n==='budget'?`฿${v?.toLocaleString()}`:v} />
                    <Legend iconSize={8} wrapperStyle={{fontSize:11}} />
                    <Bar yAxisId="left" dataKey="count" fill="#1B3A6B" radius={[4,4,0,0]} name="Assets to Replace"
                      cursor="pointer" onClick={handleQuarterClick} />
                    <Line yAxisId="right" type="monotone" dataKey="budget" stroke="#E8960C" strokeWidth={2} dot={{r:4,fill:'#E8960C'}} name="budget" />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
              {quarterSel && (
                <ForecastDetailPanel
                  forecast={quarterSel}
                  monthKey={monthKey}
                  onSelectMonth={handleMonthSelect}
                  openKey={openGroup}
                  onToggle={key => setOpenGroup(prev => prev === key ? null : key)}
                  onClose={closeForecast}
                  onSelectDevice={() => setTab(2)}
                />
              )}
            </div>
            <p className="text-[10px] text-egat-text-muted mt-1">คลิกแถบเพื่อดูรายเดือน · กล่องรายการแยกกลุ่ม · Toggle · Export</p>
          </div>

          <div className="card p-5">
            <SectionHeader title="5-Year Budget Forecast" />
            <ResponsiveContainer width="100%" height={240}>
              <ComposedChart data={budget5yr} margin={{top:10,right:10,bottom:5,left:5}}>
                <CartesianGrid strokeDasharray="3 3" stroke="#EEF2F7" />
                <XAxis dataKey="year" tick={{fontSize:10,fill:'#8896A4'}} />
                <YAxis tick={{fontSize:9,fill:'#8896A4'}} tickFormatter={v=>`฿${(v/1e6).toFixed(0)}M`} />
                <Tooltip contentStyle={{borderRadius:10,fontSize:11}} formatter={v=>`฿${v?.toLocaleString()}`} />
                <Legend iconSize={8} wrapperStyle={{fontSize:11}} />
                <Bar dataKey="replacement" stackId="a" fill="#C53030" fillOpacity={0.85} name="CAPEX (Replacement)" />
                <Bar dataKey="maintenance" stackId="a" fill="#1B3A6B" fillOpacity={0.85} name="OPEX (Maintenance)" />
                <Line type="monotone" dataKey="contingency" stroke="#E8960C" strokeWidth={2} strokeDasharray="4 3" dot={{r:3}} name="Contingency 10%" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* ─── Tab 2: Replacement Planning ──────────────────────────────────────── */}
      {tab===2 && (
        <div className="card p-5">
          <SectionHeader title="Optimal Replacement Planning" />
          <DataTable
            title="Replacement Plan"
            columns={[
              {key:'id',          label:'Device ID',    sortable:true, render:(v)=><span className="font-semibold text-egat-navy">{v}</span>},
              {key:'type',        label:'Type',          sortable:true},
              {key:'region',      label:'Region',        sortable:true},
              {key:'priority',    label:'Priority',      sortable:true, render:(v)=><StatusBadge status={v} size="xs" />},
              {key:'rul',         label:'RUL (yr)',      sortable:true, render:(v)=><span className="font-bold" style={{color:+v<=0?'#C53030':+v<=2?'#C05621':'#B7791F'}}>{v}</span>},
              {key:'eol',         label:'EoL Year',      sortable:true},
              {key:'targetDate',  label:'Target Date',    sortable:true, render:(v)=><span className="font-mono text-[10px]">{v}</span>},
              {key:'riskAssessment',label:'Risk Assessment', sortable:true, render:(v)=>(
                <span className="font-bold" style={{color:riskAssessmentColor(v)}}>{v}</span>
              )},
              {key:'failProb',    label:'Fail Prob',     sortable:true, render:(v)=><span className="font-bold" style={{color:+v>0.6?'#C53030':+v>0.4?'#C05621':'inherit'}}>{(+v*100).toFixed(0)}%</span>},
              {key:'replaceCost', label:'Replace ฿',    sortable:true, render:(v)=><span className="font-bold">฿{(v/1e6).toFixed(1)}M</span>},
              {key:'notes',       label:'Recommendation', sortable:false},
            ]}
            data={replacementRows}
            rowDetail={LifecycleDetail}
            exportName="replacement_planning"
          />
        </div>
      )}

      {/* ─── Tab 3: Inventory Optimization ───────────────────────────────────── */}
      {tab===3 && (
        <div className="card p-5">
          <SectionHeader title="Inventory Optimization — อะไหล่และอุปกรณ์" />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
            <div className="rounded-xl border border-egat-border p-3">
              <div className="text-[10px] text-egat-text-muted uppercase mb-0.5">Total Parts</div>
              <div className="text-2xl font-black text-egat-navy" style={{fontFamily:'Inter,sans-serif'}}>{INVENTORY_PARTS.length}</div>
            </div>
            <div className="rounded-xl border border-red-200 bg-red-50 p-3">
              <div className="text-[10px] text-red-600 uppercase mb-0.5">สต๊อกเป็นศูนย์</div>
              <div className="text-2xl font-black text-red-600" style={{fontFamily:'Inter,sans-serif'}}>{INVENTORY_PARTS.filter(p=>p.currentStock===0).length}</div>
            </div>
            <div className="rounded-xl border border-orange-200 bg-orange-50 p-3">
              <div className="text-[10px] text-orange-600 uppercase mb-0.5">ต่ำกว่า Reorder</div>
              <div className="text-2xl font-black text-orange-600" style={{fontFamily:'Inter,sans-serif'}}>{INVENTORY_PARTS.filter(p=>p.currentStock<p.reorderPoint&&p.currentStock>0).length}</div>
            </div>
            <div className="rounded-xl border border-green-200 bg-green-50 p-3">
              <div className="text-[10px] text-green-600 uppercase mb-0.5">สต๊อกพอเพียง</div>
              <div className="text-2xl font-black text-green-600" style={{fontFamily:'Inter,sans-serif'}}>{INVENTORY_PARTS.filter(p=>p.currentStock>=p.reorderPoint).length}</div>
            </div>
          </div>
          <DataTable
            title="Inventory Part"
            columns={[
              {key:'part',          label:'Part Name',      sortable:true, render:(v)=><span className="font-semibold text-egat-text">{v}</span>},
              {key:'category',      label:'Category',        sortable:true},
              {key:'currentStock',  label:'Current Stock',   sortable:true, render:(v,r)=>(
                <span className="font-black text-base" style={{color:+v===0?'#C53030':+v<r.reorderPoint?'#C05621':'#1A7F4B',fontFamily:'Inter,sans-serif'}}>{v}</span>
              )},
              {key:'reorderPoint',  label:'Reorder Pt',     sortable:true},
              {key:'unitCost',      label:'Unit Cost (฿)',   sortable:true, render:(v)=><span>฿{v?.toLocaleString()}</span>},
              {key:'lead',          label:'Lead Time',       sortable:false},
              {key:'recommendation',label:'Recommendation',  sortable:false, render:(v)=>(
                <span className={`text-[10px] ${v.includes('⚠️')?'text-red-600 font-semibold':v.includes('สั่งซื้อ')?'text-orange-600':'text-green-700'}`}>{v}</span>
              )},
            ]}
            data={INVENTORY_PARTS}
            rowDetail={(row)=>(
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  {[['Part',row.part],['Category',row.category],['Current Stock',row.currentStock],
                    ['Reorder Point',row.reorderPoint],['Unit Cost',`฿${row.unitCost?.toLocaleString()}`],['Lead Time',row.lead]
                  ].map(([k,v])=>(
                    <div key={k} className="bg-egat-surface-alt rounded-lg p-3">
                      <div className="text-[10px] text-egat-text-muted uppercase mb-0.5">{k}</div>
                      <div className="text-sm font-semibold">{String(v)}</div>
                    </div>
                  ))}
                </div>
                <div className={`p-4 rounded-xl border ${row.currentStock===0?'bg-red-50 border-red-200':row.currentStock<row.reorderPoint?'bg-orange-50 border-orange-200':'bg-green-50 border-green-200'}`}>
                  <div className={`text-[10px] font-semibold uppercase mb-1 ${row.currentStock===0?'text-red-600':row.currentStock<row.reorderPoint?'text-orange-600':'text-green-700'}`}>Recommendation</div>
                  <div className="text-sm">{row.recommendation}</div>
                </div>
              </div>
            )}
            exportName="inventory_optimization"
          />
        </div>
      )}

      {/* ─── Tab 4: Life Cycle Cost Analysis ─────────────────────────────────── */}
      {tab===4 && (
        <div className="space-y-4">
          <div className="card p-5">
              <SectionHeader title="Life Cycle Cost Analysis — Fleet Total" />
              <div className={`lcc-pie-split ${panelOpen ? 'is-open' : ''} mt-3`}>
                <div className="flex items-center gap-4 min-w-0 w-full lg:flex-1">
                  <ResponsiveContainer width="55%" height={240}>
                    <PieChart>
                      <Pie data={pieVisible} dataKey="value" nameKey="name"
                        cx="50%" cy="50%" outerRadius={85} innerRadius={50} paddingAngle={3}
                        cursor="pointer"
                        isAnimationActive={false}
                        onClick={handleLccPieClick}>
                        {pieVisible.map((e)=><Cell key={e.name} fill={e.color} cursor="pointer" />)}
                      </Pie>
                      <Tooltip contentStyle={{borderRadius:10,fontSize:11}} formatter={(v,n)=>[`฿${v}M`,n]} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex-1 space-y-3">
                    {costPie.map(c=>{
                      const off = Boolean(hiddenPie[c.name])
                      const shareBase = visibleCost || totalCost
                      const share = off ? 0 : (c.value / (shareBase || 1)) * 100
                      const canHide = canHidePieCategory(hiddenPie, c.name, pieNames)
                      return (
                      <div
                        key={c.name}
                        className={`rounded-lg px-1.5 py-1 -mx-1.5 transition-colors duration-300 ${pieCat === c.name ? 'bg-egat-surface-alt' : ''} ${off ? 'opacity-40' : ''}`}
                      >
                        <div className="flex items-center justify-between mb-0.5">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <button
                              type="button"
                              onClick={(e) => handleTogglePie(c.name, e)}
                              disabled={!off && !canHide}
                              className="w-3.5 h-3.5 rounded-[3px] border shrink-0"
                              style={{
                                background: off ? 'transparent' : c.color,
                                borderColor: c.color,
                                cursor: (!off && !canHide) ? 'not-allowed' : 'pointer',
                              }}
                              title={off ? 'แสดงหมวดนี้' : (canHide ? 'ซ่อนหมวดนี้' : 'ต้องเหลืออย่างน้อย 1 หมวด')}
                              aria-label={off ? `แสดง ${c.name}` : `ซ่อน ${c.name}`}
                            />
                            <button
                              type="button"
                              onClick={() => handleLccPieClick(c.name)}
                              className={`text-xs text-left ${off ? 'line-through' : ''}`}
                            >
                              {c.name}
                            </button>
                          </div>
                          <span className="text-sm font-black" style={{color:c.color,fontFamily:'Inter,sans-serif'}}>฿{c.value}M</span>
                        </div>
                        <button type="button" onClick={() => handleLccPieClick(c.name)} className="block w-full text-left">
                          <div className="h-1.5 rounded-full bg-egat-border-lt overflow-hidden">
                            <div className="h-full rounded-full" style={{width:`${share}%`,background:c.color,opacity:0.8}} />
                          </div>
                          <div className="text-[10px] text-egat-text-muted">{off ? 'ซ่อนอยู่' : `${share.toFixed(1)}%`}</div>
                        </button>
                      </div>
                      )
                    })}
                    <div className="pt-2 border-t border-egat-border-lt flex justify-between">
                      <span className="text-xs font-semibold text-egat-text-muted">{visibleCost < totalCost ? 'Visible LCC' : 'Total LCC'}</span>
                      <span className="text-sm font-black text-egat-navy" style={{fontFamily:'Inter,sans-serif'}}>฿{visibleCost.toFixed(1)}M</span>
                    </div>
                  </div>
                </div>
                <div className={`lcc-pie-panel ${panelOpen ? 'is-open' : ''}`}>
                  {panelCat && (
                    <LccCategoryDetail
                      title={lccCategoryTitle(panelCat)}
                      color={lccCategoryColor(panelCat)}
                      rows={pieDetailRows}
                      onClose={closeLccPanel}
                    />
                  )}
                </div>
              </div>
              <p className="text-[10px] text-egat-text-muted mt-2">คลิกช่องสีเพื่อซ่อน/แสดงหมวด · คลิกชื่อหรือกราฟเพื่อดู Item/Cost · Export ได้จากแผงรายละเอียด</p>
            </div>

          <div className="card p-5">
            <SectionHeader title="Cost Breakdown by Asset Type" />
            <div className="flex flex-col gap-3">
              {['SDH','DWDM','Router','MW'].map(type=>{
                const assets = scoped.filter(l=>l.type===type)
                const totalR = assets.reduce((s,l)=>s+l.replaceCost,0)
                const totalM = assets.reduce((s,l)=>s+l.maintCost*5,0)
                return (
                  <div key={type} className="flex flex-col gap-2 rounded-xl p-[13px] bg-egat-surface-alt border border-egat-border-lt">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-egat-navy leading-5">{type}</span>
                      <span className="text-xs text-egat-text-muted leading-4">{assets.length} units</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <div className="text-egat-text-muted text-[10px] leading-4">Replacement (CAPEX)</div>
                        <div className="text-xs font-bold leading-4" style={{color:'#DC2626'}}>฿{(totalR/1e6).toFixed(1)}M</div>
                      </div>
                      <div>
                        <div className="text-egat-text-muted text-[10px] leading-4">5yr Maintenance (OPEX)</div>
                        <div className="text-xs font-bold leading-4 text-egat-navy">฿{(totalM/1e6).toFixed(1)}M</div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="card p-5">
            <SectionHeader title="Annual Budget Requirement — 5 ปีข้างหน้า" />
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={budget5yr} margin={{top:5,right:10,bottom:5,left:5}}>
                <CartesianGrid strokeDasharray="3 3" stroke="#EEF2F7" />
                <XAxis dataKey="year" tick={{fontSize:10,fill:'#8896A4'}} />
                <YAxis tick={{fontSize:9,fill:'#8896A4'}} tickFormatter={v=>`฿${(v/1e6).toFixed(0)}M`} />
                <Tooltip contentStyle={{borderRadius:10,fontSize:11}} formatter={v=>`฿${v?.toLocaleString()}`} />
                <Legend iconSize={8} wrapperStyle={{fontSize:11}} />
                <Bar dataKey="replacement" stackId="a" fill="#C53030" fillOpacity={0.85} name="CAPEX" />
                <Bar dataKey="maintenance" stackId="a" fill="#1B3A6B" fillOpacity={0.85} name="OPEX" />
                <Bar dataKey="contingency" fill="#E8960C" fillOpacity={0.6} name="Contingency" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* ─── Tab 5: Asset Register ────────────────────────────────────────────── */}
      {tab===5 && (
        <div className="card p-5">
          <SectionHeader title={`Full Asset Register — ทุก Asset (${planRows.length})`} />
          <DataTable
            title="Asset"
            columns={[
              {key:'id',          label:'Device ID',    sortable:true, render:(v)=><span className="font-semibold text-egat-navy">{v}</span>},
              {key:'type',        label:'Type',          sortable:true},
              {key:'region',      label:'Region',        sortable:true},
              {key:'vendor',      label:'Vendor',        sortable:true},
              {key:'age',         label:'Age (yr)',      sortable:true},
              {key:'rul',         label:'RUL (yr)',      sortable:true, render:(v)=><span className="font-bold" style={{color:+v<=1?'#C53030':+v<=3?'#C05621':'#1A7F4B'}}>{v}</span>},
              {key:'health',      label:'Health',        sortable:true, render:(v)=><span className="font-bold" style={{color:+v>=80?'#1A7F4B':+v>=65?'#B7791F':'#C53030'}}>{v}</span>},
              {key:'priority',    label:'Priority',      sortable:true, render:(v)=><StatusBadge status={v} size="xs" />},
              {key:'replaceCost', label:'Replace ฿',    sortable:true, render:(v)=><span>฿{(v/1e6).toFixed(1)}M</span>},
            ]}
            data={planRows}
            rowDetail={LifecycleDetail}
            exportName="asset_register"
          />
        </div>
      )}

    </div>
  )
}
