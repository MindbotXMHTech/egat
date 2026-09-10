'use client'
import { useState, useMemo, useEffect } from 'react'
import {
  ComposedChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, ResponsiveContainer,
  Cell, Legend
} from 'recharts'
import PageHeader from '../../../components/PageHeader'
import KpiCard from '../../../components/KpiCard'
import SectionHeader from '../../../components/SectionHeader'
import StatusBadge from '../../../components/StatusBadge'
import DataTable from '../../../components/DataTable'
import AnomalyFilterBar from '../../../components/AnomalyFilterBar'
import ChartFilterBar from '../../../components/ChartFilterBar'
import ThailandAssetMap from '../../../components/ThailandAssetMap'
import AnomalyAlertsView from '../../../components/AnomalyAlertsView'
import RootCauseCluesModal from '../../../components/RootCauseCluesModal'
import DeviceTypeSelect from '../../../components/DeviceTypeSelect'
import { useHeaderFilters } from '../../../components/HeaderFilterContext'
import { useSiteScope } from '../../../components/useSiteScope'
import { FLEET, generateAnomalySeries, ANOMALY_EVENTS, MAINTENANCE_SCHEDULE } from '../../../lib/data'
import { STATUS_COLOR } from '../../../lib/utils'
import {
  buildCalendarDays,
  calendarItemsTitle,
  calendarScheduleTitle,
  DEFAULT_ANOMALY_CALENDAR_MONTH_ISO,
  filterCalendarItems,
  resolveCalendarFromHeader,
} from '../../../lib/calendarFilters'
import {
  uniqueSites,
  filterFleet,
  filterAnomalyRows,
  filterChartRows,
  sortChartRows,
  nextChartSortDir,
  exportChartTable,
  genScoreTrend,
  createEmptyTrendDates,
  recommendedAction,
  matchesTrendWindow,
  buildTrendNotes,
} from '../../../lib/anomalyFilters'
import { anomalySearchSuggestions } from '../../../lib/searchSuggest'
import {
  ALERT_STATUSES,
  AVG_SCORE_COLUMNS,
  TOTAL_ANOMALY_COLUMNS,
  UNRESOLVED_COLUMNS,
  UNRESOLVED_STATUSES,
  toAnomalyAlertRow,
  toAvgScoreRows,
} from '../../../lib/anomalyAlerts'

const TABS  = ['KPI Timeseries', 'Anomaly Table', 'Event Log', 'Anomaly Alerts', 'Maintenance Calendar', 'Algorithm Results']
const KPIS  = ['cpu', 'bw', 'latency', 'pkt_loss']
const KPI_LABELS = { cpu:'CPU (%)', bw:'Bandwidth (%)', latency:'Latency (ms)', pkt_loss:'Packet Loss (%)' }
const SEV_COLOR  = { Critical:'#C53030', High:'#C05621', Medium:'#B7791F', Low:'#1A7F4B' }

// --- General Anomaly Table data (enriched from FLEET + ANOMALY_EVENTS) ---
const GENERAL_ANOMALY_TABLE = ANOMALY_EVENTS.map((e, i) => {
  const f = FLEET.find(x => x.id === e.asset) || {}
  return {
    id:        i + 1,
    deviceId:  e.asset,
    timestamp: e.time,
    rul:       f.rul != null ? `${f.rul} yr` : '-',
    issueType: e.kpi,
    value:     e.value,
    zscore:    e.zscore,
    health:    f.health ?? '-',
    status:    e.severity,
    algo:      e.algo,
    action:    recommendedAction(e.severity),
    iqr:       e.iqr,
    lstm:      e.lstm,
    site:      f.site || '-',
    assetType: f.type || '',
  }
})

const SEARCH_SUGGESTIONS = anomalySearchSuggestions(FLEET, GENERAL_ANOMALY_TABLE)

const DOW_LABELS    = ['อา','จ','อ','พ','พฤ','ศ','ส']

// ── Anomaly Table columns ──────────────────────────────────────────────────────
const ANOMALY_COLS = [
  { key:'deviceId',  label:'Device ID',    sortable:true,
    render:(v) => <span className="font-semibold text-egat-navy">{v}</span> },
  { key:'timestamp', label:'Timestamp',    sortable:true,
    render:(v) => <span className="font-mono text-[10px] text-egat-text-sub">{v}</span> },
  { key:'rul',       label:'RUL',          sortable:true },
  { key:'issueType', label:'Issue Type',   sortable:true },
  { key:'health',    label:'Health Score', sortable:true,
    render:(v) => <span className="font-bold" style={{ color:+v>=80?'#1A7F4B':+v>=65?'#B7791F':'#C53030' }}>{v}</span> },
  { key:'status',    label:'Status',       sortable:true,
    render:(v) => <StatusBadge status={v==='Critical'?'Critical':v==='High'?'Warning':'Watch'} size="xs" /> },
  { key:'action',    label:'Recommend Action', sortable:false,
    render:(v) => <span className="text-xs text-egat-text">{v}</span> },
]

const ALERT_TAB_COLS = [
  { key:'timestamp', label:'Timestamp', sortable:true,
    render:(_v, r) => <span className="font-mono text-[10px] text-egat-text-sub">{r.timestampLabel || r.timestamp}</span> },
  { key:'deviceId',  label:'Device ID', sortable:true,
    render:(v) => <span className="font-semibold text-egat-navy">{v}</span> },
  { key:'anomalyType', label:'Anomaly Type', sortable:true },
  { key:'score', label:'Anomaly Score', sortable:true,
    render:(_v, r) => <span className="font-bold">{r.scoreLabel}</span> },
  { key:'status', label:'Status', sortable:true,
    render:(v) => <StatusBadge status={v} size="xs" /> },
  { key:'rootCause', label:'Root Cause Clues', sortable:false,
    render:(v) => <span className="text-[11px] text-egat-text-sub">{v}</span> },
]

// Row detail modal
function AnomalyDetail(row) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        {[
          ['Device ID', row.deviceId], ['Site', row.site], ['Device Type', row.assetType], ['Timestamp', row.timestamp],
          ['Issue Type', row.issueType], ['Value', row.value], ['Z-Score', row.zscore],
          ['Health Score', row.health], ['RUL', row.rul], ['Algorithm', row.algo],
        ].map(([k,v]) => (
          <div key={k} className="bg-egat-surface-alt rounded-lg p-3">
            <div className="text-[10px] text-egat-text-muted uppercase tracking-wider mb-0.5">{k}</div>
            <div className="text-sm font-semibold text-egat-text">{String(v)}</div>
          </div>
        ))}
      </div>
      <div className="p-4 rounded-xl" style={{ background:'#FFF8E1', border:'1px solid #F6D860' }}>
        <div className="text-[10px] font-semibold uppercase text-egat-gold mb-1">Recommended Action</div>
        <div className="text-sm font-medium text-egat-text">{row.action}</div>
      </div>
      <div className="flex gap-4 text-xs">
        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg ${row.iqr ? 'bg-red-50 text-red-700' : 'bg-egat-surface-alt text-egat-text-muted'}`}>
          <span className={`w-2 h-2 rounded-full ${row.iqr?'bg-red-500':'bg-gray-300'}`} /> IQR Flag
        </div>
        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg ${row.lstm ? 'bg-purple-50 text-purple-700' : 'bg-egat-surface-alt text-egat-text-muted'}`}>
          <span className={`w-2 h-2 rounded-full ${row.lstm?'bg-purple-500':'bg-gray-300'}`} /> LSTM Flag
        </div>
      </div>
    </div>
  )
}

function TrendScoreTooltip({ active, payload }) {
  if (!active || !payload?.length) return null
  const row = payload[0]?.payload || {}
  return (
    <div className="bg-white border border-egat-border rounded-xl px-3 py-2 text-xs space-y-0.5">
      <p>Device ID: <span className="font-bold text-egat-navy">{row.deviceId || '—'}</span></p>
      <p>Time: <span className="font-bold">{row.timestamp || row.hour}</span></p>
      <p>Anomaly Score: <span className="font-bold">{row.score}</span></p>
    </div>
  )
}

export default function AnomalyPage() {
  const header = useHeaderFilters()
  const { allowedSites, locations, scopedFleet } = useSiteScope()
  const [asset, setAsset]       = useState(FLEET[0].id)
  const [kpi,   setKpi]         = useState('cpu')
  const [tab,   setTab]         = useState(0)
  const [trendModal, setTrendModal] = useState(null)
  const [query, setQuery]       = useState('')
  const [assetType, setAssetType] = useState('')
  const [alertView, setAlertView] = useState(null)
  const [alertCluesRow, setAlertCluesRow] = useState(null)
  const [tsDraft, setTsDraft] = useState('')
  const [trendDraft, setTrendDraft] = useState('')
  const [trendQuery, setTrendQuery] = useState('')
  const [trendSortDir, setTrendSortDir] = useState(null)
  const [trendThreshold, setTrendThreshold] = useState(75)
  const [trendDates, setTrendDates] = useState(createEmptyTrendDates)

  const filters = useMemo(
    () => ({ ...header.tableFilters, query, assetType, allowedSites }),
    [header.tableFilters, query, assetType, allowedSites],
  )
  const filteredFleet = useMemo(() => filterFleet(scopedFleet, filters), [scopedFleet, filters])
  const filteredEvents = useMemo(
    () => filterAnomalyRows(GENERAL_ANOMALY_TABLE, filters),
    [filters],
  )
  const alertRows = useMemo(
    () => filteredEvents.map(toAnomalyAlertRow),
    [filteredEvents],
  )
  const avgScoreRows = useMemo(() => toAvgScoreRows(alertRows), [alertRows])
  const unresolvedRows = useMemo(
    () => alertRows.filter(r => r.status !== 'Resolved'),
    [alertRows],
  )
  const extraAlerts = useMemo(
    () => filteredEvents
      .filter(r => r.status === 'Critical')
      .slice(0, 8)
      .map((r, i) => ({
        id: `anom-${r.deviceId}-${r.timestamp}-${i}`,
        severity: 'critical',
        asset: r.deviceId,
        msg: `${r.issueType} ${r.value} (Z=${r.zscore}) — ${r.action}`,
        time: r.timestamp,
        onOpen: () => {
          setAlertView(null)
          setTab(3)
          setQuery(r.deviceId)
        },
      })),
    [filteredEvents],
  )
  const calView = useMemo(
    () => resolveCalendarFromHeader(header.tableFilters, DEFAULT_ANOMALY_CALENDAR_MONTH_ISO),
    [header.tableFilters],
  )
  const maintRows = useMemo(
    () => filterCalendarItems(
      MAINTENANCE_SCHEDULE,
      {
        dateFrom: calView.dateFrom,
        dateTo: calView.dateTo,
        location: header.location,
        assetType,
        allowedSites,
      },
      scopedFleet,
    ).map(m => ({
      ...m,
      assetType: m.assetType || scopedFleet.find(f => f.id === m.asset)?.type || '',
    })),
    [calView, header.location, assetType, allowedSites, scopedFleet],
  )
  const calendarDays = useMemo(
    () => buildCalendarDays(calView.year, calView.monthIndex, maintRows),
    [calView, maintRows],
  )
  const headerDateSet = useMemo(
    () => new Set(header.tableFilters.dates || []),
    [header.tableFilters.dates],
  )

  useEffect(() => {
    if (filteredFleet.length && !filteredFleet.some(f => f.id === asset)) {
      setAsset(filteredFleet[0].id)
    }
  }, [filteredFleet, asset])

  useEffect(() => {
    if (!trendModal) return undefined
    function onKey(e) {
      if (e.key === 'Escape') setTrendModal(null)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [trendModal])

  const series    = useMemo(() => generateAnomalySeries(asset, kpi), [asset, kpi])
  const chartSeries = useMemo(
    () => filterChartRows(series, tsDraft, ['time', 'value', 'zscore']),
    [series, tsDraft],
  )
  const scoreTrend = useMemo(() => genScoreTrend(assetType, scopedFleet), [assetType, scopedFleet])
  const chartTrend = useMemo(() => {
    const filtered = filterChartRows(scoreTrend, trendQuery, ['hour', 'score', 'deviceId', 'notes', 'timestamp'])
      .filter(r => matchesTrendWindow(r, trendDates))
    return sortChartRows(filtered, 'score', trendSortDir)
  }, [scoreTrend, trendQuery, trendSortDir, trendDates])
  const anomalies = series.filter(s => s.anomaly)
  const curAsset  = scopedFleet.find(f => f.id === asset) || FLEET.find(f => f.id === asset)

  const unresolved = filteredEvents.filter(r => r.status === 'Critical' || r.status === 'High').length
  const avgScore   = filteredEvents.length
    ? +(filteredEvents.reduce((s,r)=>s+r.zscore,0)/filteredEvents.length).toFixed(2)
    : 0

  const severityTotals = ['Critical','High','Medium','Low'].map(s => ({
    severity: s, count: filteredEvents.filter(e=>e.status===s).length, color: SEV_COLOR[s]
  }))

  // distData
  const distData = [
    { range:'0-20',  count: series.filter(s=>s.value<20).length },
    { range:'20-40', count: series.filter(s=>s.value>=20&&s.value<40).length },
    { range:'40-60', count: series.filter(s=>s.value>=40&&s.value<60).length },
    { range:'60-80', count: series.filter(s=>s.value>=60&&s.value<80).length },
    { range:'80+',   count: series.filter(s=>s.value>=80).length },
  ]

  return (
    <div className="animate-fade-in">
      <PageHeader icon="📊" title="Anomaly Detection"
        subtitle="Real-time anomaly detection using Z-Score + IQR + LSTM AutoEncoder"
        extraAlerts={extraAlerts} />
      {alertView ? (
        <AnomalyAlertsView
          onBack={() => setAlertView(null)}
          rows={alertView === 'zscore' ? avgScoreRows : alertView === 'unresolved' ? unresolvedRows : alertRows}
          sectionTitle={alertView === 'zscore' ? 'Avg. Anomaly Score' : alertView === 'unresolved' ? 'Unresolved Anomalies' : 'Total Anomalies'}
          columns={alertView === 'zscore' ? AVG_SCORE_COLUMNS : alertView === 'unresolved' ? UNRESOLVED_COLUMNS : TOTAL_ANOMALY_COLUMNS}
          exportName={alertView === 'zscore' ? 'avg_anomaly_score' : alertView === 'unresolved' ? 'unresolved_anomalies' : 'anomaly_alerts'}
          statusOptions={alertView === 'unresolved' ? UNRESOLVED_STATUSES : ALERT_STATUSES}
        />
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
          setAssetType('')
          setTrendThreshold(75)
          setTrendDates(createEmptyTrendDates())
          header.resetHeader()
        }}
      />

      <ThailandAssetMap
        assets={filteredFleet}
        selectedSite={header.location || curAsset?.site}
        onSelectSite={site => {
          header.setLocation(site)
          const first = scopedFleet.find(f => f.site === site)
          if (first) setAsset(first.id)
        }}
      />

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div>
          <label className="block text-[10px] font-semibold uppercase tracking-wider text-egat-text-muted mb-1">Asset</label>
          <select value={asset} onChange={e => setAsset(e.target.value)}
            className="text-xs border border-egat-border rounded-lg px-3 py-1.5 bg-egat-surface text-egat-text focus:outline-none focus:border-egat-navy">
            {(filteredFleet.length ? filteredFleet : FLEET).map(f => <option key={f.id} value={f.id}>{f.id}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-[10px] font-semibold uppercase tracking-wider text-egat-text-muted mb-1">Device Type</label>
          <DeviceTypeSelect value={assetType} onChange={setAssetType} />
        </div>
        <div className="flex flex-wrap gap-1 bg-egat-surface-alt border border-egat-border rounded-lg p-1 w-fit">
          {TABS.map((t, i) => (
            <button key={t} onClick={() => setTab(i)}
              className={`tab-pill ${tab===i?'active':''}`}>{t}</button>
          ))}
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-5">
        <KpiCard value={series.length}      label="Data Points"        color="#1B3A6B" />
        <KpiCard value={anomalies.length}   label="Anomalies Found"    color="#C53030" delta={`${((anomalies.length/series.length)*100).toFixed(1)}% rate`} onClick={() => setAlertView('total')} />
        <KpiCard value={avgScore}           label="Avg Z-Score"        color="#C05621" onClick={() => setAlertView('zscore')} />
        <KpiCard value={unresolved}         label="Unresolved"         color="#C53030" delta="Critical + High" onClick={() => setAlertView('unresolved')} />
        <KpiCard value={curAsset?.status||'-'} label="Asset Status"   color={STATUS_COLOR[curAsset?.status||'Watch']?.hex} />
      </div>

      <div className="mb-4">
        <label className="block text-[10px] font-semibold uppercase tracking-wider text-egat-text-muted mb-1">KPI</label>
        <div className="flex gap-1 flex-wrap">
          {KPIS.map(k => (
            <button key={k} onClick={() => setKpi(k)}
              className={`text-xs px-3 py-1.5 rounded-lg border transition-all ${kpi===k?'border-egat-navy bg-egat-navy text-white':'border-egat-border bg-egat-surface text-egat-text-sub hover:border-egat-navy'}`}>
              {KPI_LABELS[k]}
            </button>
          ))}
        </div>
      </div>

      {/* ─── Tab 0: KPI Timeseries ─────────────────────────────────────────────── */}
      {tab === 0 && (
        <div className="space-y-4">
          <div className="flex flex-col gap-4">
            <div className="card p-5 min-w-0">
              <SectionHeader title={`${KPI_LABELS[kpi]} — 72h Timeseries with Anomaly Detection`} />
              <ChartFilterBar
                query={tsDraft}
                onQueryChange={setTsDraft}
                onReset={() => setTsDraft('')}
                resetVariant="muted"
                onExport={format => exportChartTable(
                  format,
                  chartSeries,
                  [
                    { key: 'time', label: 'Time' },
                    { key: 'value', label: KPI_LABELS[kpi] },
                    { key: 'zscore', label: 'Z-Score' },
                    { key: 'anomaly', label: 'Anomaly' },
                  ],
                  'timeseries_72h',
                  'KPI Timeseries 72h',
                )}
                countLabel={`${chartSeries.length} รายการ`}
              />
              <ResponsiveContainer width="100%" height={280}>
                <ComposedChart data={chartSeries} margin={{ top:10, right:10, bottom:5, left:5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#EEF2F7" />
                  <XAxis dataKey="time" tick={{ fontSize:9, fill:'#8896A4' }} interval={11} />
                  <YAxis tick={{ fontSize:10, fill:'#8896A4' }} />
                  <Tooltip contentStyle={{ borderRadius:10, border:'1px solid #DDE3ED', fontSize:11 }} />
                  <ReferenceLine y={chartSeries[0]?.threshold ?? series[0]?.threshold} stroke="#C53030" strokeDasharray="5 4"
                    label={{ value:'Threshold', position:'insideTopRight', fontSize:10, fill:'#C53030' }} />
                  <Line type="monotone" dataKey="value" stroke="#1B3A6B" strokeWidth={1.5}
                    dot={({ cx,cy,payload }) => payload.anomaly
                      ? <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r={5} fill="#C53030" stroke="white" strokeWidth={1.5}/>
                      : <circle key={`${cx}-${cy}`} r={0} />}
                    name={KPI_LABELS[kpi]} />
                </ComposedChart>
              </ResponsiveContainer>
              <p className="text-xs text-egat-text-muted mt-2">
                จุดสีแดง = anomaly ที่ตรวจพบ (Z-Score &gt; 2.5) &nbsp;·&nbsp; เส้นประ = threshold
              </p>
            </div>

            <div className="card p-5 min-w-0">
              <SectionHeader title="Anomaly Score Trend — 24h (คลิกกราฟเพื่อดูรายละเอียด)" />
              <ChartFilterBar
                query={trendDraft}
                onQueryChange={setTrendDraft}
                onSearch={() => setTrendQuery(trendDraft)}
                onReset={() => {
                  setTrendDraft('')
                  setTrendQuery('')
                  setTrendSortDir(null)
                  setTrendThreshold(75)
                  setTrendDates(createEmptyTrendDates())
                  setAssetType('')
                }}
                showSearchButton
                sortLabel="Anomaly Score"
                onSort={() => setTrendSortDir(d => nextChartSortDir(d))}
                typeValue={assetType}
                onTypeChange={setAssetType}
                thresholdValue={trendThreshold}
                onThresholdChange={setTrendThreshold}
                dateFilters={trendDates}
                onDateChange={patch => setTrendDates(d => ({ ...d, ...patch }))}
                onExport={format => exportChartTable(
                  format,
                  chartTrend.map(r => ({
                    ...r,
                    notes: buildTrendNotes({ ...r, threshold: trendThreshold }),
                  })),
                  [
                    { key: 'deviceId', label: 'Device ID' },
                    { key: 'timestamp', label: 'Time' },
                    { key: 'score', label: 'Anomaly Score' },
                    { key: 'notes', label: 'Notes' },
                  ],
                  'anomaly_score_trend',
                  'Anomaly Score Trend 24h',
                )}
                countLabel={`${chartTrend.length} รายการ`}
              />
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={chartTrend} margin={{ top:5, right:10, bottom:5, left:5 }}
                  onClick={(e) => e?.activePayload && setTrendModal(e.activePayload[0]?.payload)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#EEF2F7" />
                  <XAxis dataKey="hour" tick={{ fontSize:9, fill:'#8896A4' }} interval={3} />
                  <YAxis tick={{ fontSize:10, fill:'#8896A4' }} domain={[0,100]} />
                  <Tooltip content={<TrendScoreTooltip />} />
                  <ReferenceLine y={trendThreshold} stroke="#C53030" strokeDasharray="4 3" label={{ value:'Alert threshold', position:'insideTopRight', fontSize:9, fill:'#C53030' }} />
                  <Bar dataKey="score" radius={[3,3,0,0]} name="Anomaly Score" cursor="pointer">
                    {chartTrend.map((e,i) => <Cell key={`${e.hour}-${i}`} fill={e.score>trendThreshold?'#C53030':'#1B3A6B'} fillOpacity={0.8} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <p className="text-[10px] text-egat-text-muted mt-1">
                ชี้ที่แถบกราฟเพื่อดูอุปกรณ์ เวลา และคะแนน · คลิกเพื่อเปิดหมายเหตุ
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="card p-5 min-w-0">
              <SectionHeader title="Z-Score Distribution" />
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={series.slice(0,36)} margin={{ top:5, right:5, bottom:5, left:5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#EEF2F7" />
                  <XAxis dataKey="time" tick={{ fontSize:8, fill:'#8896A4' }} interval={5} />
                  <YAxis tick={{ fontSize:9, fill:'#8896A4' }} />
                  <Tooltip contentStyle={{ borderRadius:10, fontSize:11 }} />
                  <ReferenceLine y={2.5} stroke="#C53030" strokeDasharray="4 3" />
                  <Bar dataKey="zscore" radius={[2,2,0,0]} name="Z-Score">
                    {series.slice(0,36).map((e,i) =>
                      <Cell key={i} fill={e.anomaly?'#C53030':'#1B3A6B'} fillOpacity={e.anomaly?1:0.6} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="card p-5 min-w-0">
              <SectionHeader title="Value Distribution" />
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={distData} margin={{ top:5, right:5, bottom:5, left:5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#EEF2F7" />
                  <XAxis dataKey="range" tick={{ fontSize:10, fill:'#8896A4' }} />
                  <YAxis tick={{ fontSize:10, fill:'#8896A4' }} />
                  <Tooltip contentStyle={{ borderRadius:10, fontSize:11 }} />
                  <Bar dataKey="count" radius={[4,4,0,0]} name="จำนวน">
                    {distData.map((e,i) => <Cell key={i} fill={e.range==='80+'?'#C53030':'#1B3A6B'} fillOpacity={0.75} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* ─── Tab 1: General Anomaly Table ─────────────────────────────────────── */}
      {tab === 1 && (
        <div className="card p-5">
          <SectionHeader title="General Anomaly Table — ทุก Asset" />
          {/* Summary cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
            {severityTotals.map(s => (
              <div key={s.severity} className="rounded-xl p-3 border border-egat-border text-center" style={{ borderLeftWidth:4, borderLeftColor:s.color }}>
                <div className="text-2xl font-black" style={{ color:s.color, fontFamily:'Inter,sans-serif' }}>{s.count}</div>
                <div className="text-[11px] text-egat-text-muted mt-0.5">{s.severity}</div>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
            <div className="rounded-xl border border-egat-border p-3">
              <div className="text-[10px] text-egat-text-muted uppercase mb-0.5">Total Anomalies</div>
              <div className="text-2xl font-black text-egat-navy" style={{ fontFamily:'Inter,sans-serif' }}>{filteredEvents.length}</div>
            </div>
            <div className="rounded-xl border border-egat-border p-3">
              <div className="text-[10px] text-egat-text-muted uppercase mb-0.5">Avg Anomaly Z-Score</div>
              <div className="text-2xl font-black" style={{ color:'#C05621', fontFamily:'Inter,sans-serif' }}>{avgScore}</div>
            </div>
            <div className="rounded-xl border border-egat-border p-3">
              <div className="text-[10px] text-egat-text-muted uppercase mb-0.5">Unresolved (Critical+High)</div>
              <div className="text-2xl font-black text-red-600" style={{ fontFamily:'Inter,sans-serif' }}>{unresolved}</div>
            </div>
          </div>
          <DataTable
            title="Anomaly"
            columns={ANOMALY_COLS}
            data={filteredEvents}
            rowDetail={AnomalyDetail}
            exportName="anomaly_events"
          />
        </div>
      )}

      {/* ─── Tab 2: Event Log ─────────────────────────────────────────────────── */}
      {tab === 2 && (
        <div className="card p-5">
          <SectionHeader title="Anomaly Event Log — All Assets" />
          <DataTable
            title="Event Log"
            columns={[
              { key:'timestamp', label:'Time',      sortable:true, render:(v)=><span className="font-mono text-[10px]">{v}</span> },
              { key:'deviceId',  label:'Asset',     sortable:true, render:(v)=><span className="font-semibold text-egat-navy">{v}</span> },
              { key:'issueType', label:'KPI',       sortable:true },
              { key:'value',     label:'Value',     sortable:false, render:(v,r)=><span className="font-bold" style={{color:SEV_COLOR[r.status]}}>{v}</span> },
              { key:'zscore',    label:'Z-Score',   sortable:true, render:(v)=><span className="font-bold" style={{color:+v>3.5?'#C53030':+v>2.8?'#C05621':'#B7791F'}}>{v}</span> },
              { key:'status',    label:'Severity',  sortable:true, render:(v)=><StatusBadge status={v==='Critical'?'Critical':v==='High'?'Warning':'Watch'} size="xs" /> },
              { key:'algo',      label:'Algorithm', sortable:false, render:(v)=><span className="font-mono text-[10px] text-egat-text-sub">{v}</span> },
            ]}
            data={filteredEvents}
            rowDetail={AnomalyDetail}
            exportName="event_log"
          />
        </div>
      )}

      {/* ─── Tab 3: Anomaly Alerts (TOR 4.7) ─────────────────────────────────── */}
      {tab === 3 && (
        <div className="card p-5">
          <SectionHeader title="Anomaly Alerts — Real-time" />
          <DataTable
            title="Anomaly Alerts"
            columns={ALERT_TAB_COLS}
            data={unresolvedRows}
            onRowClick={setAlertCluesRow}
            exportName="anomaly_alerts"
            defaultSortKey="score"
            defaultSortDir="desc"
          />
        </div>
      )}

      {/* ─── Tab 4: Maintenance Calendar ──────────────────────────────────────── */}
      {tab === 4 && (
        <div className="card p-5">
          <SectionHeader title={calendarScheduleTitle(calView.year, calView.monthIndex)} />
          <div className="flex items-center gap-3 mt-3 mb-3">
            <label className="text-[10px] font-semibold uppercase tracking-wider text-egat-text-muted">Device Type</label>
            <DeviceTypeSelect value={assetType} onChange={setAssetType} />
          </div>
          <div>
            {/* Day-of-week headers */}
            <div className="grid grid-cols-7 gap-1 mb-1">
              {DOW_LABELS.map(d => (
                <div key={d} className="text-center text-[10px] font-semibold uppercase text-egat-text-muted py-1">{d}</div>
              ))}
            </div>
            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-1">
              {Array.from({length: calendarDays[0]?.dow || 0}, (_,i) => <div key={`empty-${i}`} />)}
              {calendarDays.map(d => {
                const selected = headerDateSet.has(d.due)
                return (
                <div key={d.day}
                  className={`min-h-[56px] rounded-lg p-1.5 border text-center transition-colors ${
                    selected ? 'border-egat-navy bg-egat-navy/10' :
                    d.items.length > 0 ? 'border-orange-200 bg-orange-50' :
                    'border-egat-border-lt bg-egat-surface-alt'
                  }`}>
                  <div className={`text-[11px] font-bold mb-1 ${selected ? 'text-egat-navy' : 'text-egat-text'}`}>{d.day}</div>
                  {d.items.map((m, mi) => (
                    <div key={mi} className="text-[9px] leading-tight rounded px-1 mb-0.5 truncate"
                      style={{
                        background: m.priority==='Immediate'?'#FEF2F2':m.priority==='High'?'#FFF7ED':'#F0FDF4',
                        color:      m.priority==='Immediate'?'#B91C1C':m.priority==='High'?'#C05621':'#1A7F4B',
                      }}>
                      {m.asset}
                    </div>
                  ))}
                </div>
                )
              })}
            </div>
            {/* Legend */}
            <div className="flex gap-4 mt-4 text-[10px]">
              {[['bg-red-100 text-red-700','Immediate'],['bg-orange-100 text-orange-700','High'],['bg-green-100 text-green-700','Medium/Low']].map(([cls, label]) => (
                <div key={label} className="flex items-center gap-1.5">
                  <div className={`w-3 h-3 rounded ${cls.split(' ')[0]}`} /><span className="text-egat-text-muted">{label}</span>
                </div>
              ))}
            </div>
          </div>
          {/* List view */}
          <div className="mt-6">
            <SectionHeader title={calendarItemsTitle(calView.year, calView.monthIndex)} />
            <DataTable
              title="Maintenance"
              columns={[
                { key:'asset',     label:'Asset',    sortable:true, render:(v)=><span className="font-semibold text-egat-navy">{v}</span> },
                { key:'assetType', label:'Device Type', sortable:true },
                { key:'type',      label:'Type',     sortable:false },
                { key:'due',       label:'Due Date', sortable:true, render:(v)=><span className="font-mono text-[10px]">{v}</span> },
                { key:'priority',  label:'Priority', sortable:true, render:(v)=><StatusBadge status={v} size="xs" /> },
                { key:'assigned',  label:'Assigned', sortable:false },
                { key:'cost',      label:'Cost (฿)', sortable:true, render:(v)=><span className="font-bold text-egat-text">{v?.toLocaleString()}</span> },
              ]}
              data={maintRows}
              exportName="maintenance"
            />
          </div>
        </div>
      )}

      {/* ─── Tab 5: Algorithm Results ─────────────────────────────────────────── */}
      {tab === 5 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="card p-5">
            <SectionHeader title="Algorithm Comparison — Detection Rate" />
            <ResponsiveContainer width="100%" height={260}>
              <BarChart layout="vertical" data={[
                { algo:'Z-Score',       precision:0.88, recall:0.82, f1:0.85 },
                { algo:'IQR',           precision:0.79, recall:0.74, f1:0.76 },
                { algo:'LSTM AutoENC',  precision:0.92, recall:0.89, f1:0.90 },
                { algo:'Ensemble',      precision:0.95, recall:0.93, f1:0.94 },
              ]} margin={{ top:5, right:20, bottom:5, left:80 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#EEF2F7" />
                <XAxis type="number" domain={[0.6,1.0]} tick={{ fontSize:10, fill:'#8896A4' }} tickFormatter={v=>`${(v*100).toFixed(0)}%`} />
                <YAxis type="category" dataKey="algo" tick={{ fontSize:11, fill:'#4A5568' }} />
                <Tooltip contentStyle={{ borderRadius:10, fontSize:11 }} formatter={v=>`${(v*100).toFixed(0)}%`} />
                <Legend iconSize={8} wrapperStyle={{ fontSize:11 }} />
                <Bar dataKey="precision" fill="#1B3A6B" radius={[0,3,3,0]} name="Precision" />
                <Bar dataKey="recall"    fill="#E8960C" radius={[0,3,3,0]} name="Recall"    />
                <Bar dataKey="f1"        fill="#1A7F4B" radius={[0,3,3,0]} name="F1 Score"  />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="card p-5">
            <SectionHeader title="Algorithm Details" />
            {[
              { name:'Z-Score', desc:'ตรวจจับค่าผิดปกติโดยคำนวณ standard deviation จากค่าเฉลี่ย threshold = μ ± 2.5σ', color:'#1B3A6B' },
              { name:'IQR', desc:'Inter-Quartile Range outlier detection ทนต่อ skewed data และ non-normal distributions', color:'#1A56DB' },
              { name:'LSTM AutoEncoder', desc:'Deep learning model ที่ฝึกจาก normal patterns ตรวจจับ anomaly จาก reconstruction error สูง', color:'#7C3AED' },
              { name:'Ensemble', desc:'รวม 3 algorithms โดยใช้ majority voting และ weighted confidence score', color:'#1A7F4B' },
            ].map(a => (
              <div key={a.name} className="flex gap-3 p-3 rounded-lg border border-egat-border-lt mb-2 hover:bg-egat-surface-alt">
                <div className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0" style={{ background:a.color }} />
                <div>
                  <div className="text-sm font-semibold" style={{ color:a.color }}>{a.name}</div>
                  <div className="text-xs text-egat-text-sub mt-0.5">{a.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {alertCluesRow && (
        <RootCauseCluesModal row={alertCluesRow} onClose={() => setAlertCluesRow(null)} />
      )}

      {/* Trend Modal — TOR 4.6 */}
      {trendModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setTrendModal(null)}>
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="trend-score-title"
            className="bg-white rounded-2xl max-w-md w-full"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-egat-border">
              <h3 id="trend-score-title" className="font-bold text-egat-navy text-base">Anomaly Score Detail</h3>
              <button
                type="button"
                onClick={() => setTrendModal(null)}
                className="text-egat-text-muted hover:text-egat-navy text-xl leading-none"
                aria-label="ปิด"
              >
                ×
              </button>
            </div>
            <div className="px-6 py-4 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {[
                  ['Device ID', trendModal.deviceId],
                  ['Time', trendModal.timestamp || trendModal.hour],
                  ['Anomaly Score', trendModal.score],
                  ['Device Type', trendModal.assetType],
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
                  {buildTrendNotes({ ...trendModal, threshold: trendThreshold })}
                </div>
              </div>
              <div className={`text-center py-2 rounded-lg text-sm font-semibold ${trendModal.score > trendThreshold ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
                {trendModal.score > trendThreshold ? 'เกินเกณฑ์เตือน' : 'ปกติ'}
              </div>
            </div>
          </div>
        </div>
      )}
      </>
      )}
    </div>
  )
}
