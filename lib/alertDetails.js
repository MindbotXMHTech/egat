import { FLEET } from './data'

const MOCK_DETAILS = {
  1: 'RTR-KKN-01',
  2: 'DWDM-KKN-01',
}

const MOCK_BY_ASSET = {
  'RTR-KKN-01': {
    kpi: 'CPU Utilisation',
    value: '97.1%',
    threshold: '90%',
    zscore: 4.2,
    detectedAt: '2026-03-23 08:14',
    duration: '12 นาที',
    algorithm: 'Ensemble (Z-Score + IQR + LSTM)',
    action: 'ส่งซ่อมฉุกเฉิน — ตรวจสอบ process ที่กิน CPU และเตรียม failover',
    timeline: [
      { time: '08:02', event: 'CPU spike ตรวจพบ (91%)' },
      { time: '08:09', event: 'CPU 97.1% — เกินเกณฑ์วิกฤต' },
    ],
  },
  'DWDM-KKN-01': {
    kpi: 'Error Rate',
    value: '11.0%',
    threshold: '5%',
    zscore: 4.0,
    detectedAt: '2026-03-23 07:40',
    duration: '18 นาที',
    algorithm: 'LSTM AutoEncoder',
    action: 'ส่งซ่อมฉุกเฉิน — ตรวจสอบ optical path และ amplifier',
    timeline: [
      { time: '07:22', event: 'Error rate เริ่มสูงกว่าเกณฑ์' },
      { time: '07:40', event: 'Error rate 11% — เกินเกณฑ์วิกฤต' },
    ],
  },
}

export function getAlertPopupDetails(alert) {
  const fleet = FLEET.find(f => f.id === alert?.asset) || {}
  const assetKey = MOCK_DETAILS[alert?.id] || alert?.asset
  const mock = MOCK_BY_ASSET[assetKey] || {}
  return {
    asset: alert?.asset || '-',
    severity: alert?.severity || 'info',
    msg: alert?.msg || '-',
    time: alert?.time || '-',
    site: fleet.site || '-',
    type: fleet.type || '-',
    health: fleet.health ?? '-',
    rul: fleet.rul != null ? `${fleet.rul} yr` : '-',
    status: fleet.status || '-',
    kpi: mock.kpi || '',
    value: mock.value || '',
    threshold: mock.threshold || '',
    zscore: mock.zscore,
    detectedAt: mock.detectedAt || '',
    duration: mock.duration || '',
    algorithm: mock.algorithm || '',
    action: mock.action || '',
    timeline: mock.timeline || [],
    hasMock: Boolean(MOCK_BY_ASSET[assetKey]),
  }
}
