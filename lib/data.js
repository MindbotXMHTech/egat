// ─────────────────────────────────────────────────────────────────────────────
// IHAMS Mock Data  v2.0 — 3× expanded, all edge cases covered
// 36 assets · 4 types · 6 regions · all status/priority combinations
// ─────────────────────────────────────────────────────────────────────────────

// ── Assets (36) ───────────────────────────────────────────────────────────────
export const ASSETS = [
  // ── SDH (9) ────────────────────────────────────────────────────────────────
  { id:'SDH-BKK-01',  type:'SDH',    site:'สนญ. กลาง กทม.',     region:'Central',   vendor:'Ericsson', lat:13.755, lon:100.521, age:12, life:15 },
  { id:'SDH-BKK-02',  type:'SDH',    site:'สนญ. กลาง กทม. 2',   region:'Central',   vendor:'Ericsson', lat:13.748, lon:100.533, age:3,  life:15 },
  { id:'SDH-CNX-01',  type:'SDH',    site:'เชียงใหม่',           region:'North',     vendor:'Ericsson', lat:18.792, lon:98.981,  age:8,  life:15 },
  { id:'SDH-KKN-01',  type:'SDH',    site:'ขอนแก่น',             region:'Northeast', vendor:'Nokia',    lat:16.432, lon:102.828, age:15, life:15 },
  { id:'SDH-NRT-01',  type:'SDH',    site:'นนทบุรี',             region:'Central',   vendor:'Ericsson', lat:13.860, lon:100.521, age:5,  life:15 },
  { id:'SDH-PLK-01',  type:'SDH',    site:'พิษณุโลก',            region:'North',     vendor:'Nokia',    lat:16.816, lon:100.261, age:10, life:15 },
  { id:'SDH-RYG-01',  type:'SDH',    site:'ระยอง',               region:'East',      vendor:'Ericsson', lat:12.681, lon:101.282, age:9,  life:15 },
  { id:'SDH-HYI-01',  type:'SDH',    site:'หาดใหญ่',             region:'South',     vendor:'Ericsson', lat:7.019,  lon:100.474, age:6,  life:15 },
  { id:'SDH-UDN-01',  type:'SDH',    site:'อุดรธานี',            region:'Northeast', vendor:'Nokia',    lat:17.413, lon:102.788, age:7,  life:15 },

  // ── DWDM (9) ───────────────────────────────────────────────────────────────
  { id:'DWDM-BKK-01', type:'DWDM',   site:'สนญ. กลาง กทม.',     region:'Central',   vendor:'Huawei',   lat:13.762, lon:100.512, age:5,  life:20 },
  { id:'DWDM-BKK-02', type:'DWDM',   site:'สนญ. กลาง กทม. 2',   region:'Central',   vendor:'Huawei',   lat:13.751, lon:100.540, age:15, life:20 },
  { id:'DWDM-CNX-01', type:'DWDM',   site:'เชียงใหม่',           region:'North',     vendor:'ZTE',      lat:18.800, lon:98.990,  age:8,  life:20 },
  { id:'DWDM-PKT-01', type:'DWDM',   site:'ภูเก็ต',              region:'South',     vendor:'Huawei',   lat:7.882,  lon:98.390,  age:3,  life:20 },
  { id:'DWDM-CMI-01', type:'DWDM',   site:'เชียงใหม่ 2',         region:'North',     vendor:'ZTE',      lat:18.808, lon:99.009,  age:6,  life:20 },
  { id:'DWDM-KKN-01', type:'DWDM',   site:'ขอนแก่น',             region:'Northeast', vendor:'Huawei',   lat:16.440, lon:102.840, age:19, life:20 },
  { id:'DWDM-HYI-01', type:'DWDM',   site:'หาดใหญ่',             region:'South',     vendor:'Nokia',    lat:7.008,  lon:100.462, age:11, life:20 },
  { id:'DWDM-RYG-01', type:'DWDM',   site:'ระยอง',               region:'East',      vendor:'Huawei',   lat:12.670, lon:101.270, age:4,  life:20 },
  { id:'DWDM-NKP-01', type:'DWDM',   site:'นครพนม',              region:'Northeast', vendor:'ZTE',      lat:17.414, lon:104.793, age:9,  life:20 },

  // ── Router (9) ─────────────────────────────────────────────────────────────
  { id:'RTR-BKK-01',  type:'Router', site:'สนญ. กลาง กทม.',     region:'Central',   vendor:'Cisco',    lat:13.743, lon:100.504, age:7,  life:10 },
  { id:'RTR-BKK-02',  type:'Router', site:'สนญ. กลาง กทม. 2',   region:'Central',   vendor:'Juniper',  lat:13.760, lon:100.528, age:2,  life:10 },
  { id:'RTR-BKK-03',  type:'Router', site:'สมุทรปราการ',         region:'Central',   vendor:'Cisco',    lat:13.599, lon:100.600, age:9,  life:10 },
  { id:'RTR-CNX-01',  type:'Router', site:'เชียงใหม่',           region:'North',     vendor:'Cisco',    lat:18.780, lon:98.975,  age:4,  life:10 },
  { id:'RTR-KKN-01',  type:'Router', site:'ขอนแก่น',             region:'Northeast', vendor:'Cisco',    lat:16.433, lon:102.831, age:9,  life:10 },
  { id:'RTR-HYI-01',  type:'Router', site:'หาดใหญ่',             region:'South',     vendor:'Cisco',    lat:7.023,  lon:100.479, age:6,  life:10 },
  { id:'RTR-NKP-01',  type:'Router', site:'นครพนม',              region:'Northeast', vendor:'Juniper',  lat:17.408, lon:104.782, age:3,  life:10 },
  { id:'RTR-PLK-01',  type:'Router', site:'พิษณุโลก',            region:'North',     vendor:'Cisco',    lat:16.822, lon:100.270, age:8,  life:10 },
  { id:'RTR-UDN-01',  type:'Router', site:'อุดรธานี',            region:'Northeast', vendor:'Juniper',  lat:17.412, lon:102.792, age:3,  life:10 },

  // ── MW (9) ─────────────────────────────────────────────────────────────────
  { id:'MW-BKK-01',   type:'MW',     site:'สนญ. กลาง กทม.',     region:'Central',   vendor:'Nokia',    lat:13.770, lon:100.515, age:8,  life:12 },
  { id:'MW-CNX-01',   type:'MW',     site:'เชียงใหม่',           region:'North',     vendor:'Nokia',    lat:18.795, lon:98.965,  age:4,  life:12 },
  { id:'MW-CNX-02',   type:'MW',     site:'เชียงใหม่ 2',         region:'North',     vendor:'Ericsson', lat:18.815, lon:99.020,  age:11, life:12 },
  { id:'MW-HYI-01',   type:'MW',     site:'หาดใหญ่',             region:'South',     vendor:'Nokia',    lat:7.005,  lon:100.468, age:5,  life:12 },
  { id:'MW-KKN-01',   type:'MW',     site:'ขอนแก่น',             region:'Northeast', vendor:'Ericsson', lat:16.427, lon:102.820, age:10, life:12 },
  { id:'MW-NKP-01',   type:'MW',     site:'นครพนม',              region:'Northeast', vendor:'Nokia',    lat:17.420, lon:104.800, age:4,  life:12 },
  { id:'MW-PLK-01',   type:'MW',     site:'พิษณุโลก',            region:'North',     vendor:'Nokia',    lat:16.820, lon:100.258, age:11, life:12 },
  { id:'MW-RYG-01',   type:'MW',     site:'ระยอง',               region:'East',      vendor:'Ericsson', lat:12.675, lon:101.292, age:6,  life:12 },
  { id:'MW-UDN-01',   type:'MW',     site:'อุดรธานี',            region:'Northeast', vendor:'Nokia',    lat:17.406, lon:102.775, age:2,  life:12 },
]

// ── KPI Presets (per asset) ────────────────────────────────────────────────────
// Designed to produce all status categories: Critical / Warning / Watch / Healthy
const KPI_PRESETS = {
  // ── SDH ────────────────────────────────────────────────────────────────────
  'SDH-BKK-01':  { cpu:88, bw:82, pkt_loss:1.2, latency:42,  errors:3.1, days_maint:210 }, // Warning
  'SDH-BKK-02':  { cpu:38, bw:31, pkt_loss:0.0, latency:8,   errors:0.1, days_maint:14  }, // Healthy
  'SDH-CNX-01':  { cpu:55, bw:48, pkt_loss:0.1, latency:18,  errors:0.4, days_maint:45  }, // Watch
  'SDH-KKN-01':  { cpu:95, bw:92, pkt_loss:4.8, latency:180, errors:9.5, days_maint:340 }, // Critical
  'SDH-NRT-01':  { cpu:44, bw:51, pkt_loss:0.0, latency:12,  errors:0.2, days_maint:28  }, // Healthy
  'SDH-PLK-01':  { cpu:76, bw:72, pkt_loss:1.6, latency:72,  errors:2.8, days_maint:155 }, // Warning
  'SDH-RYG-01':  { cpu:74, bw:68, pkt_loss:1.2, latency:55,  errors:2.2, days_maint:170 }, // Warning
  'SDH-HYI-01':  { cpu:60, bw:55, pkt_loss:0.3, latency:24,  errors:0.7, days_maint:80  }, // Watch
  'SDH-UDN-01':  { cpu:65, bw:60, pkt_loss:0.5, latency:30,  errors:1.0, days_maint:110 }, // Watch

  // ── DWDM ───────────────────────────────────────────────────────────────────
  'DWDM-BKK-01': { cpu:62, bw:71, pkt_loss:0.0, latency:12,  errors:0.1, days_maint:30  }, // Healthy
  'DWDM-BKK-02': { cpu:81, bw:86, pkt_loss:2.4, latency:105, errors:5.0, days_maint:280 }, // Critical
  'DWDM-CNX-01': { cpu:52, bw:58, pkt_loss:0.1, latency:15,  errors:0.3, days_maint:50  }, // Healthy
  'DWDM-PKT-01': { cpu:45, bw:38, pkt_loss:0.0, latency:9,   errors:0.2, days_maint:20  }, // Healthy
  'DWDM-CMI-01': { cpu:58, bw:61, pkt_loss:0.1, latency:15,  errors:0.5, days_maint:50  }, // Healthy
  'DWDM-KKN-01': { cpu:93, bw:96, pkt_loss:5.2, latency:210, errors:11.0,days_maint:365 }, // Critical
  'DWDM-HYI-01': { cpu:68, bw:65, pkt_loss:0.7, latency:48,  errors:1.4, days_maint:130 }, // Watch
  'DWDM-RYG-01': { cpu:40, bw:35, pkt_loss:0.0, latency:10,  errors:0.2, days_maint:18  }, // Healthy
  'DWDM-NKP-01': { cpu:62, bw:58, pkt_loss:0.4, latency:28,  errors:0.8, days_maint:95  }, // Watch

  // ── Router ─────────────────────────────────────────────────────────────────
  'RTR-BKK-01':  { cpu:76, bw:80, pkt_loss:2.2, latency:88,  errors:4.0, days_maint:155 }, // Warning
  'RTR-BKK-02':  { cpu:32, bw:28, pkt_loss:0.0, latency:7,   errors:0.1, days_maint:10  }, // Healthy
  'RTR-BKK-03':  { cpu:94, bw:89, pkt_loss:3.9, latency:160, errors:8.1, days_maint:310 }, // Critical
  'RTR-CNX-01':  { cpu:48, bw:42, pkt_loss:0.1, latency:14,  errors:0.3, days_maint:35  }, // Healthy
  'RTR-KKN-01':  { cpu:97, bw:94, pkt_loss:4.1, latency:140, errors:8.3, days_maint:320 }, // Critical
  'RTR-HYI-01':  { cpu:68, bw:72, pkt_loss:0.8, latency:55,  errors:1.1, days_maint:90  }, // Watch
  'RTR-NKP-01':  { cpu:41, bw:36, pkt_loss:0.0, latency:11,  errors:0.2, days_maint:22  }, // Healthy
  'RTR-PLK-01':  { cpu:78, bw:74, pkt_loss:1.8, latency:80,  errors:3.5, days_maint:160 }, // Warning
  'RTR-UDN-01':  { cpu:44, bw:39, pkt_loss:0.0, latency:11,  errors:0.1, days_maint:15  }, // Healthy

  // ── MW ─────────────────────────────────────────────────────────────────────
  'MW-BKK-01':   { cpu:70, bw:66, pkt_loss:1.2, latency:60,  errors:1.8, days_maint:140 }, // Watch/Warning
  'MW-CNX-01':   { cpu:50, bw:45, pkt_loss:0.2, latency:20,  errors:0.5, days_maint:60  }, // Healthy
  'MW-CNX-02':   { cpu:91, bw:88, pkt_loss:3.5, latency:130, errors:7.2, days_maint:295 }, // Critical
  'MW-HYI-01':   { cpu:57, bw:53, pkt_loss:0.4, latency:28,  errors:0.8, days_maint:70  }, // Watch
  'MW-KKN-01':   { cpu:76, bw:72, pkt_loss:1.8, latency:82,  errors:3.2, days_maint:165 }, // Warning
  'MW-NKP-01':   { cpu:52, bw:44, pkt_loss:0.2, latency:22,  errors:0.3, days_maint:25  }, // Healthy
  'MW-PLK-01':   { cpu:74, bw:65, pkt_loss:1.8, latency:78,  errors:2.4, days_maint:160 }, // Warning
  'MW-RYG-01':   { cpu:63, bw:59, pkt_loss:0.5, latency:32,  errors:0.9, days_maint:95  }, // Watch
  'MW-UDN-01':   { cpu:35, bw:30, pkt_loss:0.0, latency:9,   errors:0.1, days_maint:8   }, // Healthy
}

// ── Health compute ─────────────────────────────────────────────────────────────
function computeHealth(asset) {
  const p = KPI_PRESETS[asset.id]
  const perf     = 100 - (p.cpu + p.bw) / 2
  const avail    = Math.max(0, 100 - p.pkt_loss * 18)
  const errScore = Math.max(0, 100 - p.errors * 10)
  const ageFact  = Math.max(0, (1 - asset.age / asset.life) * 100)
  const maint    = Math.max(0, 100 - p.days_maint / 3)
  const raw = 0.30*perf + 0.25*avail + 0.20*errScore + 0.15*ageFact + 0.10*maint
  return Math.round(Math.max(0, Math.min(100, raw)) * 10) / 10
}

function statusFromScore(s) {
  if (s >= 80) return 'Healthy'
  if (s >= 65) return 'Watch'
  if (s >= 50) return 'Warning'
  return 'Critical'
}

// ── Fleet (36 assets enriched) ────────────────────────────────────────────────
export const FLEET = ASSETS.map(a => {
  const p      = KPI_PRESETS[a.id]
  const health = computeHealth(a)
  return {
    ...a,
    ...p,
    health,
    status:   statusFromScore(health),
    uptime:   +Math.max(90, Math.min(99.99, 99.5 - (p.pkt_loss*2 + p.errors*0.5))).toFixed(2),
    rul:      Math.max(0, a.life - a.age),
    failProb: +Math.min(0.97, ((a.age/a.life)*0.55 + p.pkt_loss*0.07 + (p.cpu>85?0.15:0))).toFixed(2),
    mttr:     +(1.5 + p.errors*0.4 + (p.days_maint/200)).toFixed(1),  // hours
    mtbf:     +(8760 / Math.max(0.5, p.errors*1.2 + p.pkt_loss*3)).toFixed(0), // hours/year
  }
})

export const FLEET_SUMMARY = {
  total:     FLEET.length,
  healthy:   FLEET.filter(f=>f.status==='Healthy').length,
  watch:     FLEET.filter(f=>f.status==='Watch').length,
  warning:   FLEET.filter(f=>f.status==='Warning').length,
  critical:  FLEET.filter(f=>f.status==='Critical').length,
  avgHealth: +(FLEET.reduce((s,f)=>s+f.health,0)/FLEET.length).toFixed(1),
  avgUptime: +(FLEET.reduce((s,f)=>s+f.uptime,0)/FLEET.length).toFixed(2),
  totalMttr: +(FLEET.reduce((s,f)=>s+f.mttr,0)/FLEET.length).toFixed(1),
}

// ── 7-day fleet trend ──────────────────────────────────────────────────────────
export function generateFleetTrend() {
  const days = Array.from({length:7},(_,i)=>{
    const d = new Date(); d.setDate(d.getDate()-6+i)
    return d.toLocaleDateString('th-TH',{month:'short',day:'numeric'})
  })
  const base = FLEET_SUMMARY.avgHealth
  const scenarios = [
    { healthy:FLEET_SUMMARY.healthy, watch:FLEET_SUMMARY.watch, warning:FLEET_SUMMARY.warning, critical:FLEET_SUMMARY.critical },
  ]
  return days.map((day,i)=>({
    day,
    healthy:  FLEET_SUMMARY.healthy  + (i<3?-1:0) + (i===5?1:0),
    watch:    FLEET_SUMMARY.watch    + (i===2?2:0) + (i>4?-1:0),
    warning:  FLEET_SUMMARY.warning  + (i===1?1:i===4?-1:0),
    critical: FLEET_SUMMARY.critical + (i===2?1:i===6?-1:0),
    avgHealth: +(base - 2.5 + i*0.5 + (i===2?-4:0) + (i===5?2:0)).toFixed(1),
    incidents: [3,1,5,2,1,0,0][i],
  }))
}

// ── Anomaly time series ────────────────────────────────────────────────────────
export function generateAnomalySeries(assetId, kpi='cpu') {
  const pts    = 72
  const preset = KPI_PRESETS[assetId]
  const base   = { cpu:preset?.cpu||65, bw:preset?.bw||60, latency:preset?.latency||30, pkt_loss:preset?.pkt_loss||0.5 }[kpi] || 60
  const anomalyAt = [10, 22, 38, 55, 65]
  return Array.from({length:pts},(_,i)=>{
    const t     = new Date(); t.setHours(t.getHours()-pts+i)
    const noise = (Math.random()-0.5)*8
    const spike = anomalyAt.includes(i) ? (base>70 ? +(Math.random()*25+15) : -(Math.random()*20)) : 0
    const trend = (base>70 ? i*0.05 : 0)
    const val   = Math.max(0, Math.min(kpi==='pkt_loss'?10:100, base + noise + spike + trend))
    const zScore= anomalyAt.includes(i) ? +(2.6+Math.random()*1.8).toFixed(2) : +(Math.random()*1.5).toFixed(2)
    return {
      time:      t.toLocaleTimeString('th-TH',{hour:'2-digit',minute:'2-digit'}),
      value:     +val.toFixed(1),
      anomaly:   anomalyAt.includes(i),
      zscore:    zScore,
      iqr_flag:  zScore > 2.2,
      lstm_score:+(Math.random()*(anomalyAt.includes(i)?0.3:0.15)+( anomalyAt.includes(i)?0.65:0.02)).toFixed(3),
      threshold: kpi==='pkt_loss' ? 2.5 : base+22,
      baseline:  base,
    }
  })
}

// ── Anomaly events (24) ───────────────────────────────────────────────────────
export const ANOMALY_EVENTS = [
  // Critical
  { time:'2026-03-23 08:14', asset:'RTR-KKN-01',  kpi:'CPU Utilisation',    value:'97.1%',  zscore:4.2, severity:'Critical', algo:'Ensemble',     iqr:true,  lstm:true  },
  { time:'2026-03-23 07:40', asset:'DWDM-KKN-01', kpi:'Error Rate',          value:'11.0%',  zscore:4.0, severity:'Critical', algo:'LSTM AE',      iqr:true,  lstm:true  },
  { time:'2026-03-23 06:30', asset:'SDH-BKK-01',  kpi:'Packet Loss',         value:'3.1%',   zscore:3.8, severity:'Critical', algo:'Z-Score+IQR',  iqr:true,  lstm:false },
  { time:'2026-03-23 05:55', asset:'RTR-BKK-03',  kpi:'CPU Utilisation',     value:'94.3%',  zscore:3.6, severity:'Critical', algo:'Ensemble',     iqr:true,  lstm:true  },
  { time:'2026-03-22 23:10', asset:'SDH-KKN-01',  kpi:'Latency',             value:'182ms',  zscore:3.5, severity:'Critical', algo:'Z-Score',      iqr:true,  lstm:true  },
  { time:'2026-03-22 22:15', asset:'RTR-BKK-01',  kpi:'Latency',             value:'142ms',  zscore:3.1, severity:'Critical', algo:'Z-Score',      iqr:false, lstm:true  },
  { time:'2026-03-22 20:30', asset:'MW-CNX-02',   kpi:'Packet Loss',         value:'3.5%',   zscore:3.0, severity:'Critical', algo:'IQR+LSTM',     iqr:true,  lstm:true  },
  { time:'2026-03-22 18:45', asset:'DWDM-BKK-02', kpi:'BW Utilisation',      value:'86.2%',  zscore:2.9, severity:'Critical', algo:'Ensemble',     iqr:true,  lstm:false },
  // High
  { time:'2026-03-22 18:00', asset:'MW-PLK-01',   kpi:'BW Utilisation',      value:'88.4%',  zscore:2.8, severity:'High',     algo:'IQR',          iqr:true,  lstm:false },
  { time:'2026-03-22 16:20', asset:'SDH-PLK-01',  kpi:'CPU Utilisation',     value:'79.1%',  zscore:2.7, severity:'High',     algo:'Z-Score',      iqr:false, lstm:true  },
  { time:'2026-03-22 15:00', asset:'RTR-PLK-01',  kpi:'Error Rate',          value:'4.8%',   zscore:2.7, severity:'High',     algo:'LSTM AE',      iqr:false, lstm:true  },
  { time:'2026-03-22 14:22', asset:'SDH-RYG-01',  kpi:'Error Rate',          value:'4.8%',   zscore:2.5, severity:'High',     algo:'LSTM AE',      iqr:false, lstm:true  },
  { time:'2026-03-22 12:10', asset:'MW-KKN-01',   kpi:'Latency',             value:'98ms',   zscore:2.5, severity:'High',     algo:'Z-Score',      iqr:false, lstm:false },
  { time:'2026-03-22 10:55', asset:'MW-BKK-01',   kpi:'CPU Utilisation',     value:'75.2%',  zscore:2.4, severity:'High',     algo:'IQR',          iqr:true,  lstm:false },
  // Medium
  { time:'2026-03-22 09:30', asset:'SDH-HYI-01',  kpi:'Packet Loss',         value:'0.8%',   zscore:2.3, severity:'Medium',   algo:'Z-Score',      iqr:false, lstm:false },
  { time:'2026-03-22 08:00', asset:'DWDM-HYI-01', kpi:'BW Utilisation',      value:'72.3%',  zscore:2.2, severity:'Medium',   algo:'IQR',          iqr:true,  lstm:false },
  { time:'2026-03-21 21:45', asset:'SDH-UDN-01',  kpi:'CPU Utilisation',     value:'65.4%',  zscore:2.2, severity:'Medium',   algo:'Z-Score',      iqr:false, lstm:false },
  { time:'2026-03-21 19:15', asset:'DWDM-NKP-01', kpi:'Latency',             value:'35ms',   zscore:2.1, severity:'Medium',   algo:'LSTM AE',      iqr:false, lstm:true  },
  { time:'2026-03-21 16:00', asset:'RTR-HYI-01',  kpi:'CPU Utilisation',     value:'68.3%',  zscore:2.2, severity:'Medium',   algo:'Z-Score',      iqr:false, lstm:false },
  // Low
  { time:'2026-03-21 14:30', asset:'MW-HYI-01',   kpi:'BW Utilisation',      value:'57.1%',  zscore:2.0, severity:'Low',      algo:'IQR',          iqr:true,  lstm:false },
  { time:'2026-03-21 12:00', asset:'SDH-BKK-02',  kpi:'CPU Utilisation',     value:'41.5%',  zscore:1.9, severity:'Low',      algo:'Z-Score',      iqr:false, lstm:false },
  { time:'2026-03-21 10:20', asset:'DWDM-CMI-01', kpi:'Latency',             value:'16ms',   zscore:1.8, severity:'Low',      algo:'LSTM AE',      iqr:false, lstm:true  },
  { time:'2026-03-21 08:45', asset:'MW-RYG-01',   kpi:'Error Rate',          value:'0.9%',   zscore:1.8, severity:'Low',      algo:'Z-Score',      iqr:false, lstm:false },
  { time:'2026-03-20 22:30', asset:'RTR-CNX-01',  kpi:'Packet Loss',         value:'0.1%',   zscore:1.7, severity:'Low',      algo:'IQR',          iqr:false, lstm:false },
]

// ── Degradation trend ──────────────────────────────────────────────────────────
export function generateDegradationTrend(assetId) {
  const asset = FLEET.find(f=>f.id===assetId)
  if (!asset) return []
  const pts  = []
  const base = asset.health
  for (let i=-90; i<=asset.rul*365/8; i+=8) {
    const d = new Date(); d.setDate(d.getDate()+i)
    const future = i>0
    const deg    = future ? base - (i/25)*0.9 : base + (i/30)*0.5
    const noise  = (Math.random()-0.5)*(future?1.5:4)
    const val    = Math.max(0, Math.min(100, deg+noise))
    pts.push({
      date:     d.toLocaleDateString('th-TH',{month:'short',day:'numeric',year:'2-digit'}),
      actual:   !future ? +val.toFixed(1) : null,
      forecast: future  ? +val.toFixed(1) : null,
      upper:    future  ? +Math.min(100, val+7).toFixed(1) : null,
      lower:    future  ? +Math.max(0, val-7).toFixed(1) : null,
      p90:      future  ? +Math.min(100, val+12).toFixed(1) : null,
      p10:      future  ? +Math.max(0, val-12).toFixed(1) : null,
      threshold: 50,
      target:    80,
    })
  }
  return pts
}

// ── Maintenance schedule (18) ──────────────────────────────────────────────────
export const MAINTENANCE_SCHEDULE = [
  { asset:'RTR-KKN-01',  type:'ซ่อมบำรุงฉุกเฉิน',                due:'2026-03-25', priority:'Immediate', cost:95000,  assigned:'ทีม อรส. 1', estimatedHours:8 },
  { asset:'DWDM-KKN-01', type:'เปลี่ยน Line Card + Firmware',    due:'2026-03-26', priority:'Immediate', cost:180000, assigned:'ทีม อรส. 2', estimatedHours:12 },
  { asset:'RTR-BKK-03',  type:'ซ่อมบำรุงฉุกเฉิน Memory',        due:'2026-03-27', priority:'Immediate', cost:75000,  assigned:'ทีม อรส. 1', estimatedHours:6 },
  { asset:'SDH-KKN-01',  type:'ตรวจสอบและเปลี่ยน Module',        due:'2026-03-28', priority:'Immediate', cost:120000, assigned:'ทีม อรส. 3', estimatedHours:10 },
  { asset:'MW-CNX-02',   type:'ปรับ Antenna Alignment',           due:'2026-04-01', priority:'High',      cost:45000,  assigned:'ทีม อรส. 2', estimatedHours:4 },
  { asset:'SDH-BKK-01',  type:'บำรุงรักษาเชิงป้องกัน',           due:'2026-04-10', priority:'High',      cost:45000,  assigned:'ทีม อรส. 2', estimatedHours:5 },
  { asset:'RTR-BKK-01',  type:'อัปเกรดซอฟต์แวร์ + Config Audit', due:'2026-04-12', priority:'High',      cost:38000,  assigned:'ทีม อรส. 1', estimatedHours:4 },
  { asset:'DWDM-BKK-02', type:'ทำความสะอาดและตรวจสอบ Amplifier', due:'2026-04-15', priority:'High',      cost:52000,  assigned:'ทีม อรส. 2', estimatedHours:6 },
  { asset:'RTR-PLK-01',  type:'เปลี่ยน Power Supply Unit',        due:'2026-04-18', priority:'High',      cost:34000,  assigned:'ทีม อรส. 3', estimatedHours:3 },
  { asset:'SDH-PLK-01',  type:'บำรุงรักษาเชิงป้องกัน',           due:'2026-04-22', priority:'High',      cost:40000,  assigned:'ทีม อรส. 3', estimatedHours:5 },
  { asset:'MW-PLK-01',   type:'ปรับเทียบสัญญาณ + Spectrum',       due:'2026-05-01', priority:'Medium',    cost:22000,  assigned:'ทีม อรส. 3', estimatedHours:4 },
  { asset:'MW-KKN-01',   type:'ตรวจสอบ RF Path + อุปกรณ์ปลาย',  due:'2026-05-05', priority:'Medium',    cost:28000,  assigned:'ทีม อรส. 2', estimatedHours:5 },
  { asset:'SDH-RYG-01',  type:'บำรุงรักษาเชิงป้องกัน',           due:'2026-05-10', priority:'Medium',    cost:38000,  assigned:'ทีม อรส. 2', estimatedHours:5 },
  { asset:'MW-BKK-01',   type:'ตรวจสอบ Fan Unit + Cooling',       due:'2026-05-15', priority:'Medium',    cost:18000,  assigned:'ทีม อรส. 1', estimatedHours:2 },
  { asset:'SDH-HYI-01',  type:'ทดสอบ Line + ตรวจสอบสาย Fiber',   due:'2026-05-20', priority:'Medium',    cost:25000,  assigned:'ทีม อรส. 3', estimatedHours:4 },
  { asset:'DWDM-BKK-01', type:'ทำความสะอาดหัวต่อออปติก',         due:'2026-06-05', priority:'Low',       cost:12000,  assigned:'ทีม อรส. 3', estimatedHours:2 },
  { asset:'RTR-HYI-01',  type:'Firmware Upgrade',                  due:'2026-06-10', priority:'Low',       cost:8000,   assigned:'ทีม อรส. 2', estimatedHours:2 },
  { asset:'DWDM-CMI-01', type:'Routine Inspection',                due:'2026-06-20', priority:'Low',       cost:10000,  assigned:'ทีม อรส. 3', estimatedHours:2 },
]

// ── Root Cause Analysis Incidents (9) ─────────────────────────────────────────
export const INCIDENTS = [
  {
    id:'INC-2026-0312', asset:'RTR-KKN-01',
    title:'การสื่อสารขัดข้องครั้งใหญ่ — ขอนแก่น',
    start:'2026-03-12 02:14', duration:'4h 32m', impact:'บริการขัดข้อง 3 วงจร', status:'Resolved',
    rootCause:'CPU Overload → Memory Exhaustion → Process Crash',
    severity:'P1', affectedServices:3, dataLoss:false,
    causes:[
      { name:'CPU Overload (>90%)',         prob:0.92, layer:'Network',       confidence:'High'   },
      { name:'Memory Exhaustion (98%)',      prob:0.88, layer:'System',        confidence:'High'   },
      { name:'Routing Table Corruption',     prob:0.75, layer:'Application',   confidence:'Medium' },
      { name:'Link Flapping',                prob:0.61, layer:'Physical',      confidence:'Medium' },
      { name:'Configuration Error',          prob:0.34, layer:'Configuration', confidence:'Low'    },
    ],
    cascade:[
      { time:'02:14', event:'CPU spike ตรวจพบ (94.2%)',           severity:'warning'  },
      { time:'02:18', event:'Memory ถึงขีดจำกัด (98%)',           severity:'critical' },
      { time:'02:22', event:'Routing process crash',               severity:'critical' },
      { time:'02:24', event:'Link RTR-KKN-01 ↔ BKK down',         severity:'critical' },
      { time:'03:10', event:'วิศวกรรับทราบเหตุการณ์',            severity:'info'     },
      { time:'05:20', event:'Config rollback สำเร็จ',             severity:'info'     },
      { time:'06:46', event:'ระบบกลับมาทำงานปกติ',               severity:'healthy'  },
    ],
  },
  {
    id:'INC-2026-0308', asset:'SDH-BKK-01',
    title:'Packet Loss สูงผิดปกติ — สำนักงานกลาง',
    start:'2026-03-08 14:00', duration:'2h 15m', impact:'คุณภาพสัญญาณลดลง 3 เส้นทาง', status:'Resolved',
    rootCause:'Physical Layer Degradation → Optical Power Loss',
    severity:'P2', affectedServices:3, dataLoss:false,
    causes:[
      { name:'Optical Power Degradation',    prob:0.89, layer:'Physical',    confidence:'High'   },
      { name:'Fiber Connector Contamination',prob:0.82, layer:'Physical',    confidence:'High'   },
      { name:'Amplifier Gain Reduction',     prob:0.54, layer:'Network',     confidence:'Medium' },
      { name:'Environmental Interference',   prob:0.31, layer:'External',    confidence:'Low'    },
    ],
    cascade:[
      { time:'14:00', event:'Packet loss 3.1% ตรวจพบ',           severity:'warning'  },
      { time:'14:05', event:'Optical power -2dBm ต่ำกว่าเกณฑ์',  severity:'warning'  },
      { time:'14:20', event:'วิศวกรตรวจสอบ fiber connector',      severity:'info'     },
      { time:'15:30', event:'ทำความสะอาดหัวต่อออปติก',           severity:'info'     },
      { time:'16:15', event:'ระบบกลับมาทำงานปกติ',               severity:'healthy'  },
    ],
  },
  {
    id:'INC-2026-0215', asset:'MW-PLK-01',
    title:'Microwave Link Degradation — พิษณุโลก',
    start:'2026-02-15 09:30', duration:'6h 05m', impact:'Throughput ลดลง 60%', status:'Resolved',
    rootCause:'Rain Fade → ACM Modulation Downgrade',
    severity:'P2', affectedServices:1, dataLoss:false,
    causes:[
      { name:'Rain Fade Attenuation',        prob:0.95, layer:'Physical',    confidence:'High'   },
      { name:'ACM Modulation Downgrade',     prob:0.87, layer:'Network',     confidence:'High'   },
      { name:'Antenna Misalignment',         prob:0.42, layer:'Physical',    confidence:'Medium' },
      { name:'Co-channel Interference',      prob:0.28, layer:'External',    confidence:'Low'    },
    ],
    cascade:[
      { time:'09:30', event:'RSSI ลดลง (-82dBm)',                 severity:'warning'  },
      { time:'09:45', event:'ACM ลด: 256QAM → 16QAM',            severity:'warning'  },
      { time:'10:10', event:'Throughput ลดลง 60%',                severity:'critical' },
      { time:'12:00', event:'ฝนหยุด — สัญญาณเริ่มฟื้นตัว',       severity:'info'     },
      { time:'15:35', event:'กลับสู่ 256QAM ปกติ',               severity:'healthy'  },
    ],
  },
  {
    id:'INC-2026-0210', asset:'RTR-BKK-03',
    title:'Memory Leak — สมุทรปราการ Router',
    start:'2026-02-10 16:22', duration:'3h 18m', impact:'Packet forwarding ลดลง 45%', status:'Resolved',
    rootCause:'Software Bug → Memory Leak → Forwarding Table Flush',
    severity:'P2', affectedServices:2, dataLoss:false,
    causes:[
      { name:'BGP Process Memory Leak',      prob:0.91, layer:'Application',   confidence:'High'   },
      { name:'IOS-XE Version Bug (17.9.2)',   prob:0.85, layer:'System',        confidence:'High'   },
      { name:'Excessive Route Updates',       prob:0.62, layer:'Network',       confidence:'Medium' },
      { name:'Missing Watchdog Timer',        prob:0.45, layer:'Configuration', confidence:'Medium' },
    ],
    cascade:[
      { time:'16:22', event:'Memory utilisation เพิ่มขึ้นต่อเนื่อง (78%)', severity:'warning'  },
      { time:'17:05', event:'Memory 91% — BGP process ไม่ตอบสนอง',         severity:'critical' },
      { time:'17:15', event:'Forwarding table flush — packet drop 45%',      severity:'critical' },
      { time:'18:10', event:'วิศวกร restart BGP process',                   severity:'info'     },
      { time:'19:00', event:'อัปเกรด IOS-XE เป็น 17.9.4',                  severity:'info'     },
      { time:'19:40', event:'Memory กลับสู่ปกติ (42%)',                     severity:'healthy'  },
    ],
  },
  {
    id:'INC-2026-0128', asset:'DWDM-KKN-01',
    title:'DWDM Fiber Cut — ขอนแก่น',
    start:'2026-01-28 03:45', duration:'8h 22m', impact:'ขาดการสื่อสาร 100% เส้นทาง KKN-NKP', status:'Resolved',
    rootCause:'Physical Fiber Cut → Protection Switching Failure',
    severity:'P1', affectedServices:5, dataLoss:true,
    causes:[
      { name:'Fiber Physical Cut (Construction)', prob:0.98, layer:'Physical',      confidence:'High'   },
      { name:'Protection Switch Delay (>50ms)',   prob:0.72, layer:'Network',       confidence:'Medium' },
      { name:'OLP Module Degradation',            prob:0.58, layer:'Physical',      confidence:'Medium' },
      { name:'Monitoring Alert Delay',            prob:0.35, layer:'Application',   confidence:'Low'    },
    ],
    cascade:[
      { time:'03:45', event:'Fiber cut ตรวจพบจาก OSC loss',                severity:'critical' },
      { time:'03:46', event:'APS/MSP Protection switching triggered',       severity:'critical' },
      { time:'03:50', event:'Protection path ไม่สามารถ restore ได้',        severity:'critical' },
      { time:'04:30', event:'แจ้งทีม NOC และ ผู้รับเหมา',                  severity:'info'     },
      { time:'08:15', event:'ทีมซ่อม Fiber ถึงพื้นที่',                    severity:'info'     },
      { time:'11:22', event:'Fiber splice เสร็จสิ้น — ระบบ restore',       severity:'info'     },
      { time:'12:07', event:'Traffic ทุกเส้นทางกลับสู่ปกติ',               severity:'healthy'  },
    ],
  },
  {
    id:'INC-2026-0115', asset:'SDH-KKN-01',
    title:'Power Failure — ขอนแก่น SDH',
    start:'2026-01-15 20:00', duration:'5h 45m', impact:'Site ออฟไลน์ทั้งหมด', status:'Resolved',
    rootCause:'Commercial Power Outage → UPS Failure → Generator Fault',
    severity:'P1', affectedServices:4, dataLoss:false,
    causes:[
      { name:'Commercial Power Outage',            prob:0.99, layer:'External',    confidence:'High'   },
      { name:'UPS Battery Aging (SOH 42%)',         prob:0.88, layer:'Physical',    confidence:'High'   },
      { name:'Automatic Transfer Switch Fault',     prob:0.71, layer:'Physical',    confidence:'High'   },
      { name:'Generator Fuel Low',                  prob:0.55, layer:'Physical',    confidence:'Medium' },
      { name:'Cooling System Overtemp',             prob:0.32, layer:'System',      confidence:'Low'    },
    ],
    cascade:[
      { time:'20:00', event:'ไฟฟ้าดับ — UPS เปิดใช้งาน',                  severity:'warning'  },
      { time:'20:28', event:'UPS Battery หมด — อุปกรณ์ดับ',               severity:'critical' },
      { time:'20:30', event:'Generator สตาร์ทไม่ติด',                     severity:'critical' },
      { time:'20:35', event:'แจ้งทีมช่างไฟและ EGAT Telecom',              severity:'info'     },
      { time:'21:15', event:'ทีมช่างถึงพื้นที่ — เติมน้ำมัน Generator',   severity:'info'     },
      { time:'22:10', event:'Generator เดินเครื่องสำเร็จ',                severity:'info'     },
      { time:'01:45', event:'ไฟฟ้าปกติ — ระบบกลับมาทำงาน',              severity:'healthy'  },
    ],
  },
  {
    id:'INC-2026-0105', asset:'RTR-PLK-01',
    title:'Configuration Error — พิษณุโลก Router',
    start:'2026-01-05 11:30', duration:'1h 50m', impact:'Routing loop ส่งผลต่อ 2 subnet', status:'Resolved',
    rootCause:'Misconfigured Static Route → Routing Loop → CPU Storm',
    severity:'P3', affectedServices:2, dataLoss:false,
    causes:[
      { name:'Static Route Misconfiguration', prob:0.94, layer:'Configuration', confidence:'High'   },
      { name:'Missing Route Filter',          prob:0.78, layer:'Configuration', confidence:'High'   },
      { name:'Routing Loop (TTL exhaustion)', prob:0.88, layer:'Network',       confidence:'High'   },
      { name:'Change Management Bypass',      prob:0.65, layer:'Application',   confidence:'Medium' },
    ],
    cascade:[
      { time:'11:30', event:'CPU spike หลัง config push',                  severity:'warning'  },
      { time:'11:32', event:'Routing loop ตรวจพบ — ICMP TTL exceeded',     severity:'critical' },
      { time:'11:35', event:'CPU 94% — service degraded',                  severity:'critical' },
      { time:'11:45', event:'วิศวกร rollback configuration',               severity:'info'     },
      { time:'13:10', event:'Route converge สำเร็จ — ระบบปกติ',           severity:'healthy'  },
    ],
  },
  {
    id:'INC-2025-1218', asset:'MW-CNX-02',
    title:'Co-Channel Interference — เชียงใหม่ MW',
    start:'2025-12-18 06:00', duration:'12h 30m', impact:'Link capacity ลดลง 70%', status:'Resolved',
    rootCause:'External Interference Source → ACM Downgrade → Capacity Reduction',
    severity:'P2', affectedServices:1, dataLoss:false,
    causes:[
      { name:'External Interference (5.8GHz)',  prob:0.87, layer:'External',    confidence:'High'   },
      { name:'Frequency Overlap (Adjacent)',     prob:0.79, layer:'Physical',    confidence:'High'   },
      { name:'ACM Modulation Downgrade',         prob:0.92, layer:'Network',     confidence:'High'   },
      { name:'Antenna Pattern Mismatch',         prob:0.41, layer:'Physical',    confidence:'Low'    },
    ],
    cascade:[
      { time:'06:00', event:'Modulation downgrade 512QAM → QPSK',          severity:'warning'  },
      { time:'06:15', event:'Throughput ลดลง 70%',                         severity:'critical' },
      { time:'08:30', event:'Spectrum analyzer ระบุ interference source',   severity:'info'     },
      { time:'10:00', event:'ย้ายความถี่จาก 5810 → 5750 MHz',             severity:'info'     },
      { time:'18:30', event:'Modulation กลับสู่ 512QAM',                   severity:'healthy'  },
    ],
  },
  {
    id:'INC-2025-1105', asset:'SDH-BKK-01',
    title:'Hardware Board Failure — สำนักงานกลาง SDH',
    start:'2025-11-05 13:15', duration:'7h 10m', impact:'2 STM-16 tributaries down', status:'Resolved',
    rootCause:'STM-16 Line Card Hardware Failure → Service Interruption',
    severity:'P1', affectedServices:2, dataLoss:true,
    causes:[
      { name:'STM-16 Line Card Failure',      prob:0.96, layer:'Physical',    confidence:'High'   },
      { name:'Board Overheating (65°C)',       prob:0.82, layer:'Physical',    confidence:'High'   },
      { name:'Cooling Fan Failure',           prob:0.77, layer:'Physical',    confidence:'High'   },
      { name:'Age Degradation (12yr)',        prob:0.68, layer:'Physical',    confidence:'Medium' },
      { name:'Inadequate Preventive Maint.',  prob:0.54, layer:'Application', confidence:'Medium' },
    ],
    cascade:[
      { time:'13:15', event:'STM-16 card อุณหภูมิสูง (65°C)',            severity:'warning'  },
      { time:'13:22', event:'Line card failover — tributary 1,2 down',    severity:'critical' },
      { time:'13:25', event:'แจ้งทีม NOC และประสานงาน Ericsson TAC',      severity:'info'     },
      { time:'15:00', event:'ทีม Ericsson ถึงพื้นที่',                    severity:'info'     },
      { time:'17:45', event:'เปลี่ยน STM-16 Line Card ใหม่',             severity:'info'     },
      { time:'20:25', event:'ระบบ sync สำเร็จ — tributary กลับมาปกติ',  severity:'healthy'  },
    ],
  },
]

// ── Health details ─────────────────────────────────────────────────────────────
export function getHealthDetails(assetId) {
  const asset = FLEET.find(f=>f.id===assetId)
  if (!asset) return null
  const p    = KPI_PRESETS[assetId]
  const perf     = 100-(p.cpu+p.bw)/2
  const avail    = Math.max(0,100-p.pkt_loss*18)
  const errScore = Math.max(0,100-p.errors*10)
  const ageFact  = Math.max(0,(1-asset.age/asset.life)*100)
  const maint    = Math.max(0,100-p.days_maint/3)
  return {
    score: asset.health, status: asset.status,
    dimensions:{
      'Performance':  +perf.toFixed(1),
      'Availability': +avail.toFixed(1),
      'Error Rate':   +errScore.toFixed(1),
      'Age Factor':   +ageFact.toFixed(1),
      'Maintenance':  +maint.toFixed(1),
    },
    weights:{ 'Performance':0.30,'Availability':0.25,'Error Rate':0.20,'Age Factor':0.15,'Maintenance':0.10 },
    kpis: p, asset,
  }
}

// ── Health trend (90 days) ─────────────────────────────────────────────────────
function pad2(n) {
  return String(n).padStart(2, '0')
}

function trendNoise(assetId, i) {
  let h = 2166136261
  const s = `${assetId}:${i}`
  for (let k = 0; k < s.length; k++) h = Math.imul(h ^ s.charCodeAt(k), 16777619)
  return ((h >>> 0) % 1000) / 250 - 2
}

export function generateHealthTrend(assetId) {
  const asset = FLEET.find(f=>f.id===assetId)
  const base  = asset?.health || 70
  const isCrit = base < 50
  return Array.from({length:90},(_,i)=>{
    const d = new Date(); d.setDate(d.getDate()-89+i)
    const trend  = isCrit ? -(0.08*(90-i)/90) : -(0.04*(90-i)/90)
    const noise  = trendNoise(assetId, i)
    const dip    = (i===25||i===55) ? -10 : (i===40&&isCrit?-15:0)
    const spike  = (i===70&&base>75) ? +8 : 0
    return {
      iso:   `${d.getFullYear()}-${pad2(d.getMonth()+1)}-${pad2(d.getDate())}`,
      date:  d.toLocaleDateString('th-TH',{month:'short',day:'numeric'}),
      score: +Math.max(0,Math.min(100, base+trend*i+noise+dip+spike)).toFixed(1),
    }
  })
}

// ── Asset Lifecycle ────────────────────────────────────────────────────────────
const REPLACE_COSTS = { SDH:3200000, DWDM:4800000, Router:2100000, MW:1800000 }
const MAINT_COSTS   = { SDH:185000,  DWDM:245000,  Router:155000,  MW:135000  }

function getPriority(a) {
  const rul = a.life - a.age
  const pct = a.age / a.life
  if (rul<=0 || pct>0.94) return 'Immediate'
  if (rul<=2 || pct>0.80) return 'High'
  if (rul<=4 || pct>0.60) return 'Medium'
  return 'Low'
}

export const LIFECYCLE = ASSETS.map(a=>({
  ...a,
  health:      computeHealth(a),
  rul:         Math.max(0, a.life-a.age),
  eol:         new Date().getFullYear() + Math.max(0,a.life-a.age),
  failProb:    +Math.min(0.97,((a.age/a.life)*0.55+(KPI_PRESETS[a.id]?.pkt_loss||0)*0.07)).toFixed(2),
  priority:    getPriority(a),
  replaceCost: REPLACE_COSTS[a.type]||2000000,
  maintCost:   MAINT_COSTS[a.type]  ||150000,
}))

export const LIFECYCLE_SUMMARY = {
  total:        LIFECYCLE.length,
  immediate:    LIFECYCLE.filter(l=>l.priority==='Immediate').length,
  high:         LIFECYCLE.filter(l=>l.priority==='High').length,
  eolNext3:     LIFECYCLE.filter(l=>l.rul<=3).length,
  avgRul:       +(LIFECYCLE.reduce((s,l)=>s+l.rul,0)/LIFECYCLE.length).toFixed(1),
  totalReplace: LIFECYCLE.reduce((s,l)=>s+l.replaceCost,0),
  totalMaint5yr:LIFECYCLE.reduce((s,l)=>s+l.maintCost*5,0),
}

export function generateBudgetForecast(years=5, assets=LIFECYCLE) {
  const list = assets || LIFECYCLE
  const curYear = new Date().getFullYear()
  return Array.from({length:years},(_,i)=>{
    const yr      = curYear+1+i
    const replace = list.filter(l=>l.eol===yr).reduce((s,l)=>s+l.replaceCost,0)
    const maint   = list.reduce((s,l)=>s+l.maintCost*(1+i*0.03),0)
    const capex   = replace
    const opex    = Math.round(maint)
    return { year:yr, replacement:capex, maintenance:opex, total:capex+opex,
             cumulativeCapex: capex, contingency:Math.round((capex+opex)*0.1) }
  })
}

// ── Live alerts (12) ──────────────────────────────────────────────────────────
export const LIVE_ALERTS = [
  { id:1,  severity:'critical', asset:'RTR-KKN-01',  msg:'CPU 97.1% — เกินเกณฑ์วิกฤต',           time:'5 นาทีที่แล้ว'    },
  { id:2,  severity:'critical', asset:'DWDM-KKN-01', msg:'Error rate 11% — เกินเกณฑ์วิกฤต',      time:'18 นาทีที่แล้ว'   },
  { id:3,  severity:'critical', asset:'SDH-BKK-01',  msg:'Packet loss 3.1% — เกินเกณฑ์วิกฤต',    time:'22 นาทีที่แล้ว'   },
  { id:4,  severity:'critical', asset:'RTR-BKK-03',  msg:'CPU 94.3% — Memory ใกล้เต็ม',          time:'35 นาทีที่แล้ว'   },
  { id:5,  severity:'warning',  asset:'RTR-BKK-01',  msg:'Latency 95ms — เกินเกณฑ์เตือน',        time:'1 ชั่วโมงที่แล้ว' },
  { id:6,  severity:'warning',  asset:'MW-PLK-01',   msg:'BW utilisation 88% — ใกล้ขีดจำกัด',    time:'2 ชั่วโมงที่แล้ว' },
  { id:7,  severity:'warning',  asset:'SDH-PLK-01',  msg:'CPU 79% + Packet loss 2.1%',            time:'2 ชั่วโมงที่แล้ว' },
  { id:8,  severity:'warning',  asset:'MW-BKK-01',   msg:'CPU 75% — เกินเกณฑ์เตือน',             time:'3 ชั่วโมงที่แล้ว' },
  { id:9,  severity:'watch',    asset:'SDH-RYG-01',  msg:'Error rate 2.8% — ควรตรวจสอบ',         time:'4 ชั่วโมงที่แล้ว' },
  { id:10, severity:'watch',    asset:'DWDM-HYI-01', msg:'BW utilisation 72% — ติดตาม',           time:'5 ชั่วโมงที่แล้ว' },
  { id:11, severity:'info',     asset:'DWDM-BKK-01', msg:'บำรุงรักษาตามกำหนด — 10 วันข้างหน้า', time:'6 ชั่วโมงที่แล้ว' },
  { id:12, severity:'healthy',  asset:'DWDM-PKT-01', msg:'Health score กลับสู่ปกติ (95.1)',       time:'8 ชั่วโมงที่แล้ว' },
]

// ── Inventory Optimization (M5) ───────────────────────────────────────────────
export const INVENTORY_PARTS = [
  { part:'STM-16 Line Card (Ericsson)', category:'SDH', currentStock:2, reorderPoint:3, unitCost:420000, lead:'14 days', recommendation:'สั่งซื้อเพิ่ม 2 ชิ้น — สต๊อกต่ำกว่า Reorder Point' },
  { part:'DWDM Amplifier Module (EDFA)', category:'DWDM', currentStock:1, reorderPoint:2, unitCost:380000, lead:'21 days', recommendation:'สั่งซื้อเพิ่ม 2 ชิ้น — อุปกรณ์ใกล้หมดอายุสูง' },
  { part:'OLP Module (Huawei)', category:'DWDM', currentStock:3, reorderPoint:2, unitCost:185000, lead:'10 days', recommendation:'สต๊อกเพียงพอ — ตรวจสอบอีกครั้งใน 60 วัน' },
  { part:'Cisco ASR1001-X Router', category:'Router', currentStock:0, reorderPoint:1, unitCost:1250000, lead:'30 days', recommendation:'⚠️ สต๊อกเป็นศูนย์ — สั่งซื้อทันที (RTR-KKN-01 critical)' },
  { part:'Nokia MW Radio Unit 18GHz', category:'MW', currentStock:2, reorderPoint:2, unitCost:320000, lead:'28 days', recommendation:'สั่งซื้อ 1 ชิ้น — ระดับสต๊อกขั้นต่ำ' },
  { part:'Power Supply 48VDC (Universal)', category:'Common', currentStock:8, reorderPoint:5, unitCost:45000, lead:'7 days', recommendation:'สต๊อกเพียงพอ — ระดับดี' },
  { part:'Optical Fiber Patch Cord (LC/LC)', category:'Fiber', currentStock:50, reorderPoint:20, unitCost:1200, lead:'3 days', recommendation:'สต๊อกเพียงพอ' },
  { part:'SFP+ 10GbE (Cisco Compatible)', category:'Router', currentStock:6, reorderPoint:8, unitCost:18000, lead:'7 days', recommendation:'สั่งซื้อเพิ่ม 4 ชิ้น — สต๊อกต่ำกว่าเกณฑ์' },
  { part:'UPS Battery (200Ah)', category:'Power', currentStock:4, reorderPoint:3, unitCost:85000, lead:'14 days', recommendation:'สต๊อกเพียงพอ' },
  { part:'Nokia Flexi Line System Card', category:'SDH', currentStock:1, reorderPoint:2, unitCost:295000, lead:'21 days', recommendation:'สั่งซื้อเพิ่ม 1 ชิ้น — ต่ำกว่า Reorder Point' },
  { part:'Fan Module (Ericsson MINI-LINK)', category:'MW', currentStock:5, reorderPoint:3, unitCost:22000, lead:'10 days', recommendation:'สต๊อกเพียงพอ' },
  { part:'Chassis (Huawei OSN 9800)', category:'DWDM', currentStock:0, reorderPoint:1, unitCost:2800000, lead:'45 days', recommendation:'⚠️ สต๊อกเป็นศูนย์ — ตรวจสอบสัญญาความพร้อม' },
]

// ── Life Cycle Cost Breakdown (M5) ────────────────────────────────────────────
export const LIFECYCLE_COST = {
  acquisition: LIFECYCLE.reduce((s,l) => s + l.replaceCost * (l.age<=1 ? 1 : 0.05), 0),
  maintenance:  LIFECYCLE.reduce((s,l) => s + l.maintCost * l.age, 0),
  disposal:     LIFECYCLE.reduce((s,l) => s + l.replaceCost * 0.06, 0),
  operational:  LIFECYCLE.reduce((s,l) => s + l.maintCost * 1.2, 0),
}

// Quarterly replacement forecast
export function generateQuarterlyForecast(assets) {
  const source = assets ?? LIFECYCLE
  const padDummy = assets == null
  const dummyCount = [2, 3, 1, 4, 2, 1, 3, 1]
  const dummyBudget = [6400000, 14400000, 3200000, 8400000, 4800000, 2100000, 9600000, 1800000]
  const yr = new Date().getFullYear()
  const quarters = []
  for (let q = 1; q <= 8; q++) {
    const qYr  = yr + Math.floor((q-1)/4)
    const qNum = ((q-1)%4)+1
    const due = source.filter(l => {
      const yrDiff = l.eol - qYr
      return yrDiff === 0 && (l.priority === 'Immediate' || l.priority === 'High')
        || (yrDiff === 1 && qNum >= 3 && l.priority === 'Medium')
    })
    quarters.push({
      quarter:`Q${qNum} ${qYr}`,
      count: due.length + (padDummy ? dummyCount[q - 1] : 0),
      budget: due.reduce((s,a)=>s+a.replaceCost,0) + (padDummy ? dummyBudget[q - 1] : 0),
      types: ['SDH','DWDM','Router','MW'].map(t => ({
        type:t,
        count: padDummy
          ? Math.max(0, dummyCount[q-1] > 1 ? Math.floor(dummyCount[q-1]/4) : (t==='SDH'&&q%3===0?1:t==='DWDM'&&q%4===0?1:t==='Router'&&q%2===0?1:t==='MW'&&q%3===1?1:0))
          : due.filter(l => l.type === t).length
      }))
    })
  }
  return quarters
}

// ── RCA Category distribution (M3) ────────────────────────────────────────────
export const RCA_CATEGORY_DIST = [
  { category:'Hardware Failure', count:4, pct:44, color:'#C53030' },
  { category:'Software Bug',     count:2, pct:22, color:'#7C3AED' },
  { category:'Configuration Error', count:1, pct:11, color:'#C05621' },
  { category:'External/Environmental', count:2, pct:22, color:'#1A56DB' },
]

// ── Module meta ────────────────────────────────────────────────────────────────
export const MODULES = [
  { id:'anomaly',    label:'Anomaly Detection',     pts:20, path:'/dashboard/anomaly',    color:'#1A56DB', status:'Online' },
  { id:'predictive', label:'Predictive Maintenance', pts:25, path:'/dashboard/predictive', color:'#1A7F4B', status:'Online' },
  { id:'rca',        label:'Root Cause Analysis',    pts:40, path:'/dashboard/rca',        color:'#7C3AED', status:'Online' },
  { id:'health',     label:'Health Score',           pts:40, path:'/dashboard/health',     color:'#E8960C', status:'Online' },
  { id:'lifecycle',  label:'Asset Lifecycle',        pts:25, path:'/dashboard/lifecycle',  color:'#C05621', status:'Online' },
]
