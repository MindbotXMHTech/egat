'use client'
import { useEffect, useMemo, useState } from 'react'
import {
  ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ReferenceLine, ResponsiveContainer, Area, BarChart, Legend
} from 'recharts'
import PageHeader from '../../../components/PageHeader'
import KpiCard from '../../../components/KpiCard'
import SectionHeader from '../../../components/SectionHeader'
import StatusBadge from '../../../components/StatusBadge'
import DataTable from '../../../components/DataTable'
import AvgRulCard, { toAvgRulRows } from '../../../components/AvgRulCard'
import ChartFilterBar from '../../../components/ChartFilterBar'
import FailureDetailPanel from '../../../components/FailureDetailPanel'
import DeviceTypeSelect from '../../../components/DeviceTypeSelect'
import { useHeaderFilters } from '../../../components/HeaderFilterContext'
import { useSiteScope } from '../../../components/useSiteScope'
import { FLEET, generateDegradationTrend, MAINTENANCE_SCHEDULE } from '../../../lib/data'
import {
  buildFailureGroups,
  failureDetailTitle,
  isSameFailureSelection,
  parseFailureBarClick,
} from '../../../lib/failurePrediction'
import {
  calendarMonthFromFilters,
  boundsForCalendarMonth,
  calendarTitle,
  filterCalendarItems,
  buildCalendarDays,
} from '../../../lib/calendarFilters'
import { exportChartTable, filterFleet } from '../../../lib/anomalyFilters'
import {
  CALENDAR_ITEM_COLUMNS,
  buildPredictiveAlerts,
  enrichCalendarItems,
  filterActionRows,
  filterPendingRows,
  toRulTableRows,
} from '../../../lib/predictiveFilters'

const TABS = ['Degradation Trend', 'Pending Maintenance', 'Failure Prediction', 'Recommended Actions', 'Calendar']

const PRI_COLOR = { Immediate:'#C53030', High:'#C05621', Medium:'#B7791F', Low:'#1A7F4B' }

const PENDING_ASSETS = FLEET
  .filter(f => f.status === 'Critical' || f.status === 'Warning' || f.failProb > 0.45)
  .sort((a, b) => b.failProb - a.failProb)
  .map(f => {
    const maint = MAINTENANCE_SCHEDULE.find(m => m.asset === f.id)
    return {
      deviceId:    f.id,
      site:        f.site,
      type:        f.type,
      health:      f.health,
      status:      f.status,
      rul:         f.rul,
      failProb:    f.failProb,
      mttr:        f.mttr,
      priority:    maint?.priority || (f.failProb > 0.7 ? 'Immediate' : f.failProb > 0.5 ? 'High' : 'Medium'),
      due:         maint?.due || 'TBD',
      cost:        maint?.cost || 0,
      maintType:   maint?.type || 'Predictive Maintenance',
      assigned:    maint?.assigned || 'ทีม อรส.',
      hours:       maint?.estimatedHours || 4,
      suggestedParts: f.type==='SDH'   ? 'STM-16 Line Card, Fan Module, Power Supply'
                    : f.type==='DWDM'  ? 'EDFA Amplifier, OLP Module, Fiber Patch Cord'
                    : f.type==='Router'? 'SFP+ Module, Power Supply Unit, Memory DIMM'
                    :                   'Radio Unit, Antenna Assembly, Waveguide Filter',
    }
  })

const MONTHS = ['เม.ย. 2026','พ.ค. 2026','มิ.ย. 2026','ก.ค. 2026','ส.ค. 2026','ก.ย. 2026']
const FAILURE_PREDICTION = MONTHS.map((m, i) => ({
  month:  m,
  sdh:    [1,1,2,1,0,1][i],
  dwdm:   [1,2,1,1,1,0][i],
  router: [2,1,1,0,2,1][i],
  mw:     [0,1,1,2,1,1][i],
  total:  [4,5,5,4,4,3][i],
  budget: [370000,490000,430000,350000,380000,310000][i],
}))

const RECOMMENDED_ACTIONS = MAINTENANCE_SCHEDULE.map(m => {
  const f = FLEET.find(x => x.id === m.asset) || {}
  return {
    asset:    m.asset,
    site:     f.site || '-',
    type:     f.type || '-',
    action:   m.type,
    priority: m.priority,
    due:      m.due,
    cost:     m.cost,
    hours:    m.estimatedHours,
    assigned: m.assigned,
    health:   f.health ?? '-',
    rul:      f.rul != null ? f.rul : '-',
    failProb: f.failProb,
    parts:    f.type==='SDH'   ?'Line Card, Fan Module'
             :f.type==='DWDM'  ?'Amplifier, OLP Module'
             :f.type==='Router'?'SFP+ Module, PSU'
             :                  'Radio Unit, Waveguide',
  }
})

function PendingDetail(row) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        {[['Device ID',row.deviceId],['Site',row.site],['Device Type',row.type],['Health',row.health],
          ['Status',row.status],['RUL',`${row.rul} yr`],[`Fail Probability`,`${(row.failProb*100).toFixed(0)}%`],
          ['MTTR',`${row.mttr}h`],['Priority',row.priority],['Due Date',row.due],
          ['Estimated Cost',`฿${row.cost?.toLocaleString()}`],['Est. Hours',`${row.hours}h`]
        ].map(([k,v])=>(
          <div key={k} className="bg-egat-surface-alt rounded-lg p-3">
            <div className="text-[10px] text-egat-text-muted uppercase tracking-wider mb-0.5">{k}</div>
            <div className="text-sm font-semibold text-egat-text">{String(v)}</div>
          </div>
        ))}
      </div>
      <div className="p-4 rounded-xl" style={{ background:'#FFF8E1', border:'1px solid #F6D860' }}>
        <div className="text-[10px] font-semibold uppercase text-egat-gold mb-1">Recommended Action</div>
        <div className="text-sm font-medium text-egat-text">{row.maintType}</div>
        <div className="text-xs text-egat-text-muted mt-1">{row.assigned}</div>
      </div>
      <div className="p-4 rounded-xl bg-blue-50 border border-blue-200">
        <div className="text-[10px] font-semibold uppercase text-blue-700 mb-1">Suggested Parts</div>
        <div className="text-sm text-egat-text">{row.suggestedParts}</div>
      </div>
    </div>
  )
}

export default function PredictivePage() {
  const header = useHeaderFilters()
  const { allowedSites, scopedFleet } = useSiteScope()
  const [asset,    setAsset]    = useState(FLEET[0].id)
  const [tab,      setTab]      = useState(0)
  const [assetType, setAssetType] = useState('')
  const [rulView,  setRulView]  = useState(false)
  const [barModal, setBarModal] = useState(null)
  const [openGroup, setOpenGroup] = useState(null)
  const [calQuery, setCalQuery] = useState('')

  const filters = useMemo(
    () => ({ ...header.tableFilters, assetType, allowedSites }),
    [header.tableFilters, assetType, allowedSites],
  )
  const filteredFleet = useMemo(() => filterFleet(scopedFleet, filters), [scopedFleet, filters])
  const pendingRows = useMemo(
    () => filterPendingRows(PENDING_ASSETS, filters),
    [filters],
  )
  const actionRows = useMemo(
    () => filterActionRows(RECOMMENDED_ACTIONS, filters),
    [filters],
  )
  const avgRulRows = useMemo(() => toAvgRulRows(filteredFleet), [filteredFleet])
  const rulTableRows = useMemo(() => toRulTableRows(filteredFleet), [filteredFleet])

  const curAsset = filteredFleet.find(f => f.id === asset) || scopedFleet.find(f => f.id === asset)
  const series   = generateDegradationTrend(asset)
  const avgRul   = +(pendingRows.reduce((s,a)=>s+a.rul,0)/Math.max(1,pendingRows.length)).toFixed(1)

  const failureGroups = useMemo(() => {
    if (!barModal) return []
    const groups = buildFailureGroups(barModal.row, barModal.monthIndex, filteredFleet)
    if (!assetType) return groups
    return groups.filter(g => g.assetType === assetType)
  }, [barModal, filteredFleet, assetType])

  const calMonth = useMemo(
    () => calendarMonthFromFilters(header.tableFilters.dateFrom, header.tableFilters.dateTo),
    [header.tableFilters.dateFrom, header.tableFilters.dateTo],
  )
  const calRange = useMemo(() => {
    if (header.tableFilters.dateFrom || header.tableFilters.dateTo) {
      return {
        dateFrom: header.tableFilters.dateFrom,
        dateTo: header.tableFilters.dateTo,
      }
    }
    return boundsForCalendarMonth(calMonth.year, calMonth.monthIndex)
  }, [header.tableFilters.dateFrom, header.tableFilters.dateTo, calMonth])
  const calItems = useMemo(
    () => enrichCalendarItems(
      filterCalendarItems(
        MAINTENANCE_SCHEDULE,
        { ...calRange, query: calQuery, assetType, location: header.location, allowedSites },
        scopedFleet,
      ),
      scopedFleet,
    ),
    [calRange, calQuery, assetType, header.location, allowedSites, scopedFleet],
  )
  const calDays = useMemo(
    () => buildCalendarDays(calMonth.year, calMonth.monthIndex, calItems),
    [calMonth, calItems],
  )
  const extraAlerts = useMemo(
    () => buildPredictiveAlerts({
      fleet: filteredFleet,
      pending: pendingRows,
      onOpenMaint: (id) => {
        setRulView(false)
        setAsset(id)
        setTab(1)
      },
      onOpenRul: (id) => {
        setAsset(id)
        setRulView(true)
      },
    }),
    [filteredFleet, pendingRows],
  )
  const DOW = ['อา','จ','อ','พ','พฤ','ศ','ส']

  useEffect(() => {
    if (!filteredFleet.length) return
    if (!filteredFleet.some(f => f.id === asset)) setAsset(filteredFleet[0].id)
  }, [filteredFleet, asset])

  function handleFailureBarClick(typeKey, data) {
    const next = parseFailureBarClick(data, typeKey, FAILURE_PREDICTION)
    if (!next) return
    if (isSameFailureSelection(barModal, next)) {
      closeFailureDetail()
      return
    }
    setBarModal(next)
    setOpenGroup(next.typeKey)
  }

  function closeFailureDetail() {
    setBarModal(null)
    setOpenGroup(null)
  }

  function openRulTable() {
    setRulView(true)
  }

  return (
    <div className="animate-fade-in">
      <PageHeader icon="🔧" title="Predictive Maintenance"
        subtitle="Degradation Modeling · RUL Forecasting · AI-Powered Maintenance Planning"
        extraAlerts={extraAlerts} />

      {rulView ? (
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setRulView(false)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-solid text-base font-bold whitespace-nowrap"
              style={{ borderColor: '#FFCB05', color: '#034EA2', background: '#fff' }}
            >
              Back
              <span className="size-4 overflow-hidden shrink-0 inline-flex">
                <img src="/icons/alerts-back.svg" alt="" className="w-full h-full" />
              </span>
            </button>
            <h2 className="text-xl font-bold" style={{ color: '#034EA2' }}>Avg. Remaining Useful Life</h2>
          </div>
          <div className="card p-5">
            <SectionHeader title="Device ID + Avg RUL" />
            <DataTable
              title="RUL"
              columns={[
                {key:'deviceId', label:'Device ID', sortable:true, render:(v)=><span className="font-semibold text-egat-navy">{v}</span>},
                {key:'site',     label:'Site',      sortable:true},
                {key:'type',     label:'Device Type', sortable:true},
                {key:'rul',      label:'Avg RUL (yr)', sortable:true},
                {key:'health',   label:'Health %',  sortable:true, render:(v)=><span className="font-bold" style={{color:+v>=80?'#1A7F4B':+v>=65?'#B7791F':'#C53030'}}>{v}</span>},
                {key:'status',   label:'Status',    sortable:true, render:(v)=><StatusBadge status={v} size="xs" />},
              ]}
              data={rulTableRows}
              defaultSortKey="rul"
              defaultSortDir="asc"
              onRowClick={(row) => {
                setAsset(row.deviceId)
                setRulView(false)
                setTab(0)
              }}
              exportName="avg_rul"
            />
          </div>
        </div>
      ) : (
      <>

      <div className="flex flex-wrap items-end gap-3 mb-4">
        <div>
          <label className="block text-[10px] font-semibold uppercase tracking-wider text-egat-text-muted mb-1">Asset</label>
          <select value={asset} onChange={e=>setAsset(e.target.value)}
            className="text-xs border border-egat-border rounded-lg px-3 py-1.5 bg-egat-surface text-egat-text focus:outline-none focus:border-egat-navy">
            {(filteredFleet.length ? filteredFleet : scopedFleet).map(f=><option key={f.id} value={f.id}>{f.id} — {f.site}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-[10px] font-semibold uppercase tracking-wider text-egat-text-muted mb-1">Device Type</label>
          <DeviceTypeSelect value={assetType} onChange={setAssetType} />
        </div>
        <StatusBadge status={curAsset?.status||'Watch'} />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-5">
        <KpiCard value={`${curAsset?.rul??0} yr`}       label="Remaining Useful Life" color="#1B3A6B" />
        <KpiCard value={`${((curAsset?.failProb||0)*100).toFixed(0)}%`} label="Fail Probability" color={curAsset?.failProb>0.6?'#C53030':'#C05621'} />
        <KpiCard value={`${curAsset?.mttr??0}h`}         label="MTTR"                color="#7C3AED" />
        <KpiCard value={`${curAsset?.mtbf??0}h`}         label="MTBF"                color="#1A56DB" />
        <KpiCard value={avgRul}                           label="Fleet Avg RUL"       color="#1A7F4B" delta={`${pendingRows.length} pending`} onClick={openRulTable} />
      </div>

      <AvgRulCard
        rows={avgRulRows}
        selectedId={asset}
        onSelect={setAsset}
        onViewTable={openRulTable}
      />

      <div className="flex flex-wrap gap-1 mb-4 bg-egat-surface-alt border border-egat-border rounded-lg p-1 w-fit">
        {TABS.map((t,i)=>(
          <button key={t} onClick={()=>{ setTab(i); if (i !== 2) closeFailureDetail() }} className={`tab-pill ${tab===i?'active':''}`}>{t}</button>
        ))}
      </div>

      {tab===0 && (
        <div className="space-y-4">
          <div className="card p-5">
            <SectionHeader title={`Health Degradation & RUL Forecast — ${asset}`} />
            <ResponsiveContainer width="100%" height={320}>
              <ComposedChart data={series} margin={{top:10,right:10,bottom:5,left:5}}>
                <CartesianGrid strokeDasharray="3 3" stroke="#EEF2F7" />
                <XAxis dataKey="date" tick={{fontSize:8,fill:'#8896A4'}} interval={14} />
                <YAxis domain={[0,100]} tick={{fontSize:10,fill:'#8896A4'}} />
                <Tooltip contentStyle={{borderRadius:10,border:'1px solid #DDE3ED',fontSize:11}} />
                <ReferenceLine y={80} stroke="#1A7F4B" strokeDasharray="4 3"
                  label={{value:'Target 80',position:'insideTopRight',fontSize:9,fill:'#1A7F4B'}} />
                <ReferenceLine y={50} stroke="#C53030" strokeDasharray="5 4"
                  label={{value:'Critical 50',position:'insideTopRight',fontSize:9,fill:'#C53030'}} />
                <Area type="monotone" dataKey="p90"    stroke="transparent" fill="#FEE2E2" fillOpacity={0.4} name="P90" />
                <Area type="monotone" dataKey="upper"  stroke="transparent" fill="#E8960C" fillOpacity={0.12} name="Upper" />
                <Area type="monotone" dataKey="lower"  stroke="transparent" fill="#E8960C" fillOpacity={0.12} name="Lower" />
                <Line type="monotone" dataKey="actual"   stroke="#1B3A6B" strokeWidth={2} dot={false} name="Actual" />
                <Line type="monotone" dataKey="forecast" stroke="#E8960C" strokeWidth={1.5} strokeDasharray="5 3" dot={false} name="Forecast" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
          <div className="card p-5">
            <SectionHeader title="Remaining Useful Life" />
            <div className="mt-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-egat-text">{asset}</span>
                <span className="text-sm font-bold" style={{color:curAsset?.rul<=1?'#C53030':curAsset?.rul<=3?'#C05621':'#1A7F4B'}}>
                  {curAsset?.rul??0} yr remaining
                </span>
              </div>
              <div className="h-4 rounded-full bg-egat-border-lt overflow-hidden">
                <div className="h-full rounded-full transition-all duration-700"
                  style={{width:`${Math.min(100,((curAsset?.rul||0)/(curAsset?.life||15))*100)}%`,
                          background:curAsset?.rul<=1?'#C53030':curAsset?.rul<=3?'#E8960C':'#1A7F4B'}} />
              </div>
              <div className="flex justify-between text-[10px] text-egat-text-muted mt-1">
                <span>EoL: {2026+(curAsset?.rul??0)}</span>
                <span>Age: {curAsset?.age??0} yr / Life: {curAsset?.life??15} yr</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {tab===1 && (
        <div className="card p-5">
          <SectionHeader title="Maintenance-Pending Assets" />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
            {['Immediate','High','Medium','Low'].map(p=>(
              <div key={p} className="rounded-xl border p-3 text-center" style={{borderLeftWidth:4,borderLeftColor:PRI_COLOR[p]}}>
                <div className="text-2xl font-black" style={{color:PRI_COLOR[p],fontFamily:'Inter,sans-serif'}}>
                  {pendingRows.filter(a=>a.priority===p).length}
                </div>
                <div className="text-[11px] text-egat-text-muted">{p}</div>
              </div>
            ))}
          </div>
          <DataTable
            title="Pending"
            columns={[
              {key:'deviceId', label:'Device ID', sortable:true, render:(v)=><span className="font-semibold text-egat-navy">{v}</span>},
              {key:'rul',      label:'RUL (yr)',  sortable:true},
              {key:'failProb', label:'Fail%',     sortable:true, render:(v)=><span className="font-bold" style={{color:+v>0.6?'#C53030':+v>0.4?'#C05621':'#B7791F'}}>{(+v*100).toFixed(0)}%</span>},
              {key:'maintType', label:'Recommended Action', sortable:false, render:(v)=><span className="text-xs text-egat-text">{v}</span>},
              {key:'suggestedParts', label:'Suggested Parts', sortable:false, render:(v)=><span className="text-xs text-egat-text max-w-[180px] truncate block" title={v}>{v}</span>},
              {key:'priority', label:'Priority',  sortable:true, render:(v)=><StatusBadge status={v} size="xs" />},
              {key:'due',      label:'Due',       sortable:true, render:(v)=><span className="font-mono text-[10px]">{v}</span>},
              {key:'cost',     label:'Cost (฿)',  sortable:true, render:(v)=><span className="font-bold">{v?.toLocaleString()}</span>},
            ]}
            data={pendingRows}
            rowDetail={PendingDetail}
            exportName="pending_maintenance"
          />
        </div>
      )}

      {tab===2 && (
        <div className="card p-5">
          <SectionHeader title="Failure Prediction — ถัดไป 6 เดือน (คลิกแถบเพื่อดูรายละเอียด)" />
          <div className={barModal
            ? 'grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(260px,452px)] gap-4 items-start'
            : ''}>
            <div className="min-w-0">
              <ResponsiveContainer width="100%" height={360}>
                <BarChart data={FAILURE_PREDICTION} margin={{top:10,right:10,bottom:5,left:5}}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#EEF2F7" />
                  <XAxis dataKey="month" tick={{fontSize:10,fill:'#8896A4'}} />
                  <YAxis yAxisId="left" tick={{fontSize:10,fill:'#8896A4'}} />
                  <YAxis yAxisId="right" orientation="right" tick={{fontSize:9,fill:'#8896A4'}} tickFormatter={v=>`${(v/1000).toFixed(0)}K`} />
                  <Tooltip contentStyle={{borderRadius:10,fontSize:11}} formatter={(v,n)=>n==='budget'?`฿${v?.toLocaleString()}`:v} />
                  <Legend iconSize={8} wrapperStyle={{fontSize:11}} />
                  <Bar yAxisId="left" dataKey="sdh"    stackId="a" fill="#1B3A6B" name="SDH"    cursor="pointer" onClick={(d)=>handleFailureBarClick('sdh', d)} />
                  <Bar yAxisId="left" dataKey="dwdm"   stackId="a" fill="#1A56DB" name="DWDM"   cursor="pointer" onClick={(d)=>handleFailureBarClick('dwdm', d)} />
                  <Bar yAxisId="left" dataKey="router" stackId="a" fill="#7C3AED" name="Router" cursor="pointer" onClick={(d)=>handleFailureBarClick('router', d)} />
                  <Bar yAxisId="left" dataKey="mw"     stackId="a" fill="#E8960C" name="MW"     cursor="pointer" radius={[4,4,0,0]} onClick={(d)=>handleFailureBarClick('mw', d)} />
                  <Line yAxisId="right" type="monotone" dataKey="budget" stroke="#C53030" strokeWidth={2} strokeDasharray="4 3" dot={{r:4,fill:'#C53030'}} name="budget" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            {barModal && (
              <FailureDetailPanel
                titleSuffix={failureDetailTitle(barModal.typeKey)}
                month={barModal.month}
                groups={failureGroups}
                openKey={openGroup}
                onToggle={(key)=>setOpenGroup(prev => prev === key ? null : key)}
                onClose={closeFailureDetail}
                onSelectDevice={setAsset}
              />
            )}
          </div>
          <p className="text-[10px] text-egat-text-muted mt-2">คลิกแถบเพื่อดูรายละเอียดแต่ละเดือน — ค้นหาและ Export ได้จากกล่องรายการ</p>
        </div>
      )}

      {tab===3 && (
        <div className="card p-5">
          <SectionHeader title="Recommended Maintenance Actions" />
          <DataTable
            title="Maintenance Action"
            columns={[
              {key:'asset',    label:'Asset',    sortable:true, render:(v)=><span className="font-semibold text-egat-navy">{v}</span>},
              {key:'action',   label:'Action',   sortable:false},
              {key:'priority', label:'Priority', sortable:true, render:(v)=><StatusBadge status={v} size="xs" />},
              {key:'due',      label:'Due',      sortable:true, render:(v)=><span className="font-mono text-[10px]">{v}</span>},
              {key:'health',   label:'Health',   sortable:true, render:(v)=><span className="font-bold" style={{color:+v>=80?'#1A7F4B':+v>=65?'#B7791F':'#C53030'}}>{v}</span>},
              {key:'cost',     label:'Cost (฿)', sortable:true, render:(v)=><span className="font-bold">{v?.toLocaleString()}</span>},
              {key:'hours',    label:'Hrs',      sortable:true},
              {key:'assigned', label:'Assigned', sortable:false},
            ]}
            data={actionRows}
            rowDetail={(row)=>(
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  {[['Asset',row.asset],['Site',row.site],['Type',row.type],['Health',row.health],['RUL',`${row.rul} yr`],
                    ['Failure Probability', row.failProb != null ? `${(+row.failProb * 100).toFixed(0)}%` : '-'],
                    ['Priority',row.priority],['Due',row.due],['Cost',`฿${row.cost?.toLocaleString()}`],['Hours',`${row.hours}h`],['Assigned',row.assigned]].map(([k,v])=>(
                    <div key={k} className="bg-egat-surface-alt rounded-lg p-2">
                      <div className="text-[10px] text-egat-text-muted uppercase mb-0.5">{k}</div>
                      <div className="text-xs font-semibold">{String(v)}</div>
                    </div>
                  ))}
                </div>
                <div className="p-3 rounded-xl bg-blue-50 border border-blue-200">
                  <div className="text-[10px] font-semibold text-blue-700 uppercase mb-0.5">Suggested Parts</div>
                  <div className="text-xs">{row.parts}</div>
                </div>
              </div>
            )}
            exportName="recommended_actions"
          />
        </div>
      )}

      {tab===4 && (
        <div className="card p-5">
          <SectionHeader title={calendarTitle(calMonth.year, calMonth.monthIndex)} />
          <ChartFilterBar
            query={calQuery}
            onQueryChange={setCalQuery}
            typeValue={assetType}
            onTypeChange={setAssetType}
            onReset={() => {
              setCalQuery('')
              setAssetType('')
            }}
            resetVariant="muted"
            onExport={format => exportChartTable(
              format,
              calItems.map(r => ({ ...r, cost: r.cost?.toLocaleString?.() ?? r.cost })),
              CALENDAR_ITEM_COLUMNS,
              'maintenance_items',
              'Maintenance Items',
            )}
            countLabel={`${calItems.length} รายการ`}
          />
          <div className="mt-3">
            <div className="grid grid-cols-7 gap-1 mb-1">
              {DOW.map(d=><div key={d} className="text-center text-[10px] font-semibold text-egat-text-muted py-1">{d}</div>)}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {Array.from({length:calDays[0]?.dow || 0},(_,i)=><div key={`e${i}`} />)}
              {calDays.map(d=>(
                <div key={d.day} className={`min-h-[56px] rounded-lg p-1.5 border text-center ${d.items.length>0?'border-orange-200 bg-orange-50':'border-egat-border-lt bg-egat-surface-alt'}`}>
                  <div className="text-[11px] font-bold mb-1 text-egat-text">{d.day}</div>
                  {d.items.map((m,mi)=>(
                    <div key={mi} className="text-[9px] rounded px-1 mb-0.5 truncate leading-tight"
                      style={{background:m.priority==='Immediate'?'#FEF2F2':m.priority==='High'?'#FFF7ED':'#F0FDF4',
                              color:m.priority==='Immediate'?'#B91C1C':m.priority==='High'?'#C05621':'#1A7F4B'}}>
                      {m.asset}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
          <div className="mt-6">
            <SectionHeader title="Maintenance Items" />
            <DataTable
              title="Maintenance"
              columns={[
                { key:'asset',     label:'Asset',    sortable:true, render:(v)=><span className="font-semibold text-egat-navy">{v}</span> },
                { key:'assetType', label:'Device Type', sortable:true },
                { key:'site',      label:'Site',     sortable:true },
                { key:'type',      label:'Type',     sortable:false },
                { key:'due',       label:'Due Date', sortable:true, render:(v)=><span className="font-mono text-[10px]">{v}</span> },
                { key:'priority',  label:'Priority', sortable:true, render:(v)=><StatusBadge status={v} size="xs" /> },
                { key:'assigned',  label:'Assigned', sortable:false },
                { key:'cost',      label:'Cost (฿)', sortable:true, render:(v)=><span className="font-bold">{v?.toLocaleString()}</span> },
              ]}
              data={calItems}
              exportName="maintenance_items"
            />
          </div>
        </div>
      )}

      </>
      )}

    </div>
  )
}
