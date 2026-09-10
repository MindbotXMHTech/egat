'use client'
import { useMemo, useState } from 'react'
import PageHeader from '../../../components/PageHeader'
import SectionHeader from '../../../components/SectionHeader'
import { useHeaderFilters } from '../../../components/HeaderFilterContext'
import { apiLookbackBounds, resolveApiQueryRange } from '../../../lib/headerFilters'

const APIs = [
  {
    group: 'CoEM API — Event Management',
    color: '#1B3A6B',
    endpoints: [
      { method:'GET',  path:'/api/v1/coem/events',              desc:'ดึง Event Log ทั้งหมดพร้อม filter ตาม asset, severity, time range' },
      { method:'GET',  path:'/api/v1/coem/events/{id}',         desc:'ดึง Event รายการเดียวพร้อม cascade timeline' },
      { method:'POST', path:'/api/v1/coem/events',              desc:'สร้าง Event ใหม่ (incident reporting)' },
      { method:'PATCH',path:'/api/v1/coem/events/{id}/status',  desc:'อัปเดต status ของ Event (Resolved/In Progress)' },
    ]
  },
  {
    group: 'CoSAM API — Asset Management',
    color: '#7C3AED',
    endpoints: [
      { method:'GET',  path:'/api/v1/cosam/assets',             desc:'ดึง Asset Register ทั้งหมดพร้อม metadata' },
      { method:'GET',  path:'/api/v1/cosam/assets/{id}',        desc:'ดึงข้อมูล Asset รายชิ้น (spec, location, maintenance history)' },
      { method:'GET',  path:'/api/v1/cosam/assets/{id}/history',desc:'ดึงประวัติการบำรุงรักษา' },
      { method:'PUT',  path:'/api/v1/cosam/assets/{id}',        desc:'อัปเดตข้อมูล Asset (age, vendor, config)' },
    ]
  },
  {
    group: 'NCE Performance — SDH/DWDM KPI',
    color: '#1A56DB',
    endpoints: [
      { method:'GET',  path:'/api/v1/nce/kpis',                 desc:'ดึง KPI ล่าสุดทุก Asset (CPU, BW, Latency, Packet Loss)' },
      { method:'GET',  path:'/api/v1/nce/kpis/{assetId}',       desc:'ดึง KPI timeseries รายชิ้น (72h, 288 data points)' },
      { method:'GET',  path:'/api/v1/nce/kpis/{assetId}/anomaly',desc:'ดึง Anomaly events ของ Asset นั้น' },
      { method:'GET',  path:'/api/v1/nce/performance/summary',   desc:'ดึง Fleet-level performance summary' },
    ]
  },
  {
    group: 'IHAMS Core API — AI Modules',
    color: '#1A7F4B',
    endpoints: [
      { method:'GET',  path:'/api/v1/ihams/health/{assetId}',    desc:'ดึง Health Score + sub-dimension weights + KPIs' },
      { method:'GET',  path:'/api/v1/ihams/health/fleet',        desc:'ดึง Health Score summary ทั้ง Fleet' },
      { method:'POST', path:'/api/v1/ihams/rca/analyze',         desc:'ส่ง incident data เพื่อให้ AI วิเคราะห์ Root Cause' },
      { method:'GET',  path:'/api/v1/ihams/anomaly/detect',      desc:'Trigger Anomaly Detection แบบ on-demand' },
      { method:'GET',  path:'/api/v1/ihams/predict/rul/{assetId}',desc:'ดึง Remaining Useful Life forecast' },
      { method:'GET',  path:'/api/v1/ihams/lifecycle/inventory', desc:'ดึง Inventory Optimization recommendations' },
    ]
  },
  {
    group: 'Notification API',
    color: '#C05621',
    endpoints: [
      { method:'GET',  path:'/api/v1/notifications',            desc:'ดึง Notification/Alert ทั้งหมด' },
      { method:'POST', path:'/api/v1/notifications/subscribe',  desc:'Subscribe WebSocket สำหรับ real-time alerts' },
      { method:'PATCH',path:'/api/v1/notifications/{id}/dismiss',desc:'Dismiss notification รายการ' },
    ]
  },
]

const METHOD_COLOR = { GET:'#1A7F4B', POST:'#1B3A6B', PATCH:'#E8960C', PUT:'#7C3AED', DELETE:'#C53030' }
const METHOD_BG    = { GET:'bg-green-50', POST:'bg-blue-50', PATCH:'bg-yellow-50', PUT:'bg-purple-50', DELETE:'bg-red-50' }

function buildExample(from, to, timeFrom, timeTo) {
  const t0 = timeFrom || '00:00'
  const t1 = timeTo || '23:59'
  return {
    request: `GET /api/v1/nce/kpis/RTR-KKN-01?from=${from}T${t0}:00+07:00&to=${to}T${t1}:00+07:00
Authorization: Bearer eyJhbGciOiJIUzI1NiJ9...
Content-Type: application/json`,
    response: `{
  "assetId": "RTR-KKN-01",
  "from": "${from}T${t0}:00+07:00",
  "to": "${to}T${t1}:00+07:00",
  "lookbackDays": 90,
  "timestamp": "${to}T${t1}:00+07:00",
  "kpis": {
    "cpu": 97.1,
    "bandwidth": 94.2,
    "packetLoss": 4.1,
    "latency": 140,
    "errorRate": 8.3
  },
  "status": "Critical",
  "healthScore": 22.4,
  "anomalyDetected": true,
  "zscore": 4.2
}`
  }
}

export default function ApiLibraryPage() {
  const header = useHeaderFilters()
  const [activeGroup, setActiveGroup] = useState(APIs[0].group)
  const [search, setSearch] = useState('')
  const lookback = apiLookbackBounds()
  const range = resolveApiQueryRange(header.tableFilters, lookback)
  const example = useMemo(
    () => buildExample(range.from, range.to, header.timeFrom, header.timeTo),
    [range.from, range.to, header.timeFrom, header.timeTo],
  )

  const filteredApis = APIs.map(api => ({
    ...api,
    endpoints: api.endpoints.filter(e =>
      !search || e.path.toLowerCase().includes(search.toLowerCase()) || e.desc.toLowerCase().includes(search.toLowerCase())
    )
  })).filter(api => !search || api.endpoints.length > 0)

  return (
    <div className="animate-fade-in">
      <PageHeader icon="📚" title="API Library"
        subtitle="REST API Reference | CoEM · CoSAM · NCE · IHAMS · Lookback 90 วัน"
        badge="v2.1.0" />

      {/* Search */}
      <div className="mb-5">
        <input
          value={search} onChange={e => setSearch(e.target.value)}
          placeholder="🔍 ค้นหา endpoint หรือ description..."
          className="w-full max-w-md text-sm border border-egat-border rounded-xl px-4 py-2.5 bg-egat-surface focus:outline-none focus:border-egat-navy"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left: Group list */}
        <div className="lg:col-span-1">
          <div className="card p-4 sticky top-4">
            <SectionHeader title="API Groups" />
            <div className="mt-3 space-y-1">
              {APIs.map(api => (
                <button key={api.group}
                  onClick={() => setActiveGroup(api.group)}
                  className={`w-full text-left px-3 py-2.5 rounded-lg text-xs transition-all ${activeGroup===api.group?'text-white':'text-egat-text-sub hover:bg-egat-surface-alt'}`}
                  style={activeGroup===api.group?{background:api.color}:{}}>
                  <div className="font-semibold leading-tight truncate">{api.group.split('—')[0].trim()}</div>
                  <div className="text-[10px] opacity-70 mt-0.5 truncate">{api.group.split('—')[1]?.trim()}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Endpoints */}
        <div className="lg:col-span-3 space-y-6">
          {filteredApis.map(api => (
            <div key={api.group} className="card p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-2 h-8 rounded-full" style={{background:api.color}} />
                <div>
                  <div className="text-base font-bold" style={{color:api.color}}>{api.group.split('—')[0].trim()}</div>
                  <div className="text-xs text-egat-text-muted">{api.group.split('—')[1]?.trim()}</div>
                </div>
              </div>
              <div className="space-y-2">
                {api.endpoints.map((ep, i) => (
                  <div key={i} className="flex gap-3 items-start p-3 rounded-xl border border-egat-border-lt bg-egat-surface-alt hover:bg-white transition-colors group">
                    <span className={`text-[10px] font-black px-2 py-1 rounded-lg flex-shrink-0 ${METHOD_BG[ep.method]}`}
                          style={{color:METHOD_COLOR[ep.method]}}>
                      {ep.method}
                    </span>
                    <div className="flex-1 min-w-0">
                      <code className="text-xs font-mono text-egat-navy truncate block">{ep.path}</code>
                      <div className="text-[11px] text-egat-text-muted mt-0.5">{ep.desc}</div>
                    </div>
                    <button className="text-[10px] opacity-0 group-hover:opacity-100 px-2 py-1 border border-egat-border rounded-lg text-egat-text-sub transition-all hover:border-egat-navy">
                      Try
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Example request/response */}
          <div className="card p-5">
            <SectionHeader title="ตัวอย่าง Request / Response" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <div className="text-[10px] font-semibold uppercase text-egat-text-muted mb-2">Request</div>
                <pre className="text-[11px] font-mono bg-[#0D2240] text-green-300 p-4 rounded-xl overflow-x-auto leading-relaxed">
                  {example.request}
                </pre>
              </div>
              <div>
                <div className="text-[10px] font-semibold uppercase text-egat-text-muted mb-2">Response (200 OK)</div>
                <pre className="text-[11px] font-mono bg-[#0D2240] text-blue-200 p-4 rounded-xl overflow-x-auto leading-relaxed">
                  {example.response}
                </pre>
              </div>
            </div>
          </div>

          {/* Auth info */}
          <div className="card p-5">
            <SectionHeader title="Authentication" />
            <div className="mt-3 space-y-3 text-xs">
              {[
                ['Protocol',    'Bearer Token (JWT) ส่งใน Authorization header'],
                ['Token URL',   'POST /api/v1/auth/token'],
                ['Expiry',      '8 ชั่วโมง (หมดอายุตอนสิ้นสุดกะงาน)'],
                ['Scope',       'read:assets, write:events, admin:config'],
                ['Rate Limit',  '1,000 req/min (per employee ID)'],
                ['Lookback',    `ย้อนหลังได้สูงสุด 90 วัน (${range.from} → ${range.to})`],
              ].map(([k,v])=>(
                <div key={k} className="flex gap-3 py-2 border-b border-egat-border-lt">
                  <span className="font-semibold w-28 flex-shrink-0 text-egat-text-muted">{k}</span>
                  <span className="text-egat-text">{v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
