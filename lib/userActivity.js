import { MODULE_FEATURES, displayName, featuresForAccount } from './authAccounts'

export const ACTIVITY_LOOKBACK_DAYS = 90

export const ACTIVITY_KIND = {
  login: { label: 'เข้าสู่ระบบ', color: '#1A7F4B', bg: '#ECFDF3' },
  logout: { label: 'ออกจากระบบ', color: '#475569', bg: '#F1F5F9' },
  view: { label: 'เปิดโมดูล', color: '#034EA2', bg: '#E8F0FA' },
  create: { label: 'สร้างบัญชี', color: '#0D2240', bg: '#E8EEF5' },
  edit: { label: 'แก้ไขบัญชี', color: '#B45309', bg: '#FFF7E6' },
  delete: { label: 'ลบบัญชี', color: '#C53030', bg: '#FEF2F2' },
  denied: { label: 'ถูกปฏิเสธ', color: '#C53030', bg: '#FEF2F2' },
}

const KIND_FILTER = {
  login: 'session',
  logout: 'session',
  view: 'module',
  create: 'account',
  edit: 'account',
  delete: 'account',
  denied: 'denied',
}

export const ACTIVITY_FILTERS = [
  { id: 'all', label: 'ทั้งหมด' },
  { id: 'session', label: 'เข้าสู่ระบบ' },
  { id: 'module', label: 'โมดูล' },
  { id: 'account', label: 'บัญชี' },
  { id: 'denied', label: 'ถูกปฏิเสธ' },
]

const TH_MONTHS = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.']

function pad(n) {
  return String(n).padStart(2, '0')
}

export function formatActivityTime(iso) {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '—'
  return `${d.getDate()} ${TH_MONTHS[d.getMonth()]} ${d.getFullYear() + 543} · ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export function filterActivities(rows, filterId) {
  if (!filterId || filterId === 'all') return rows
  return rows.filter(row => KIND_FILTER[row.kind] === filterId)
}

export function filtersForActivities(rows) {
  const present = new Set(rows.map(row => KIND_FILTER[row.kind]).filter(Boolean))
  return ACTIVITY_FILTERS.filter(f => f.id === 'all' || present.has(f.id))
}

function row(partial) {
  return {
    result: 'success',
    module: 'IHAMS Web',
    ip: '10.12.8.21',
    device: 'Chrome · macOS',
    location: 'กรุงเทพฯ',
    ...partial,
  }
}

const BY_ID = {
  'acc-admin': [
    row({
      id: 'admin-1',
      at: '2026-09-09T09:32:00+07:00',
      kind: 'create',
      title: 'สร้างบัญชี',
      detail: 'สร้างบัญชีพนักงาน Kanya Wongsa (44444444)',
      module: 'Account Management',
    }),
    row({
      id: 'admin-2',
      at: '2026-09-09T09:18:00+07:00',
      kind: 'view',
      title: 'เปิดโมดูล',
      detail: 'ดูภาพรวม Fleet Overview — สถานีทั้งหมด',
      module: 'Fleet Overview',
    }),
    row({
      id: 'admin-3',
      at: '2026-09-09T09:14:00+07:00',
      kind: 'login',
      title: 'เข้าสู่ระบบ',
      detail: 'เข้าสู่ระบบด้วยรหัสพนักงาน 12345678',
    }),
    row({
      id: 'admin-4',
      at: '2026-09-08T16:40:00+07:00',
      kind: 'edit',
      title: 'แก้ไขบัญชี',
      detail: 'ปรับ Accessibility ของ Somsak Chaiyaporn เป็น Operations',
      module: 'Account Management',
    }),
    row({
      id: 'admin-5',
      at: '2026-09-08T14:12:00+07:00',
      kind: 'view',
      title: 'เปิดโมดูล',
      detail: 'เปิด Anomaly Detection — กรองความรุนแรง Critical',
      module: 'Anomaly Detection',
    }),
    row({
      id: 'admin-6',
      at: '2026-09-05T11:02:00+07:00',
      kind: 'view',
      title: 'เปิดโมดูล',
      detail: 'เรียกดู API Library ย้อนหลัง 90 วัน',
      module: 'API Library',
    }),
    row({
      id: 'admin-7',
      at: '2026-09-02T17:48:00+07:00',
      kind: 'logout',
      title: 'ออกจากระบบ',
      detail: 'ออกจากระบบตามปกติ',
    }),
    row({
      id: 'admin-8',
      at: '2026-09-02T08:55:00+07:00',
      kind: 'login',
      title: 'เข้าสู่ระบบ',
      detail: 'เข้าสู่ระบบด้วยรหัสพนักงาน 12345678',
    }),
    row({
      id: 'admin-9',
      at: '2026-08-21T10:22:00+07:00',
      kind: 'view',
      title: 'เปิดโมดูล',
      detail: 'รัน Root Cause Analysis สำหรับ RTR-KKN-01',
      module: 'Root Cause Analysis',
    }),
    row({
      id: 'admin-10',
      at: '2026-08-03T22:11:00+07:00',
      kind: 'denied',
      title: 'ถูกปฏิเสธ',
      detail: 'พยายามเข้าสู่ระบบจาก IP นอกเครือข่าย กฟผ.',
      ip: '203.154.12.88',
      device: 'Safari · iPhone',
      location: 'ไม่ทราบที่อยู่',
      result: 'denied',
    }),
    row({
      id: 'admin-11',
      at: '2026-07-15T09:08:00+07:00',
      kind: 'view',
      title: 'เปิดโมดูล',
      detail: 'เปิด Health Score ทั้งกองสินทรัพย์',
      module: 'Health Score',
    }),
    row({
      id: 'admin-12',
      at: '2026-06-20T08:41:00+07:00',
      kind: 'login',
      title: 'เข้าสู่ระบบ',
      detail: 'เข้าสู่ระบบด้วยรหัสพนักงาน 12345678',
    }),
  ],
  'acc-emp': [
    row({
      id: 'emp-1',
      at: '2026-09-09T10:05:00+07:00',
      kind: 'denied',
      title: 'ถูกปฏิเสธ',
      detail: 'พยายามเปิด Health Score — ไม่มีสิทธิ์ตาม Accessibility',
      module: 'Health Score',
      ip: '10.12.18.44',
      result: 'denied',
    }),
    row({
      id: 'emp-2',
      at: '2026-09-09T09:48:00+07:00',
      kind: 'view',
      title: 'เปิดโมดูล',
      detail: 'ดู Predictive Maintenance — สินทรัพย์ครบกำหนดบำรุง',
      module: 'Predictive Maintenance',
      ip: '10.12.18.44',
    }),
    row({
      id: 'emp-3',
      at: '2026-09-09T09:21:00+07:00',
      kind: 'view',
      title: 'เปิดโมดูล',
      detail: 'เปิด Anomaly Detection — สถานีขอนแก่น',
      module: 'Anomaly Detection',
      ip: '10.12.18.44',
    }),
    row({
      id: 'emp-4',
      at: '2026-09-09T09:04:00+07:00',
      kind: 'login',
      title: 'เข้าสู่ระบบ',
      detail: 'เข้าสู่ระบบด้วยรหัสพนักงาน 11111111',
      ip: '10.12.18.44',
    }),
    row({
      id: 'emp-5',
      at: '2026-09-08T16:55:00+07:00',
      kind: 'logout',
      title: 'ออกจากระบบ',
      detail: 'ออกจากระบบตามปกติ',
      ip: '10.12.18.44',
    }),
    row({
      id: 'emp-6',
      at: '2026-09-08T08:12:00+07:00',
      kind: 'login',
      title: 'เข้าสู่ระบบ',
      detail: 'เข้าสู่ระบบด้วยรหัสพนักงาน 11111111',
      ip: '10.12.18.44',
    }),
    row({
      id: 'emp-7',
      at: '2026-08-19T13:30:00+07:00',
      kind: 'view',
      title: 'เปิดโมดูล',
      detail: 'เปิด Root Cause Analysis สำหรับ EVT-8841',
      module: 'Root Cause Analysis',
      ip: '10.12.18.44',
    }),
    row({
      id: 'emp-8',
      at: '2026-07-02T09:00:00+07:00',
      kind: 'view',
      title: 'เปิดโมดูล',
      detail: 'ดู Fleet Overview',
      module: 'Fleet Overview',
      ip: '10.12.18.44',
    }),
  ],
  'acc-3': [
    row({
      id: 'a3-1',
      at: '2026-09-08T15:20:00+07:00',
      kind: 'edit',
      title: 'แก้ไขบัญชี',
      detail: 'อัปเดตเบอร์โทรของ Anan Mekchai',
      module: 'Account Management',
      ip: '10.12.4.10',
    }),
    row({
      id: 'a3-2',
      at: '2026-09-08T14:55:00+07:00',
      kind: 'view',
      title: 'เปิดโมดูล',
      detail: 'เปิด Account Management — ค้นหาหน่วยงาน EGAT',
      module: 'Account Management',
      ip: '10.12.4.10',
    }),
    row({
      id: 'a3-3',
      at: '2026-09-08T08:30:00+07:00',
      kind: 'login',
      title: 'เข้าสู่ระบบ',
      detail: 'เข้าสู่ระบบด้วยรหัสพนักงาน 22222222',
      ip: '10.12.4.10',
    }),
    row({
      id: 'a3-4',
      at: '2026-08-28T11:16:00+07:00',
      kind: 'create',
      title: 'สร้างบัญชี',
      detail: 'สร้างบัญชีพนักงาน Anan Mekchai (33333333)',
      module: 'Account Management',
      ip: '10.12.4.10',
    }),
    row({
      id: 'a3-5',
      at: '2026-08-12T10:05:00+07:00',
      kind: 'view',
      title: 'เปิดโมดูล',
      detail: 'เปิด Asset Lifecycle — LCC ทั้งกอง',
      module: 'Asset Lifecycle',
      ip: '10.12.4.10',
    }),
    row({
      id: 'a3-6',
      at: '2026-07-09T17:02:00+07:00',
      kind: 'logout',
      title: 'ออกจากระบบ',
      detail: 'ออกจากระบบตามปกติ',
      ip: '10.12.4.10',
    }),
  ],
  'acc-4': [
    row({
      id: 'a4-1',
      at: '2026-09-07T13:44:00+07:00',
      kind: 'view',
      title: 'เปิดโมดูล',
      detail: 'เปิด Asset Lifecycle — สรุปต้นทุนบำรุงรักษา',
      module: 'Asset Lifecycle',
      ip: '10.14.2.73',
      device: 'Edge · Windows',
    }),
    row({
      id: 'a4-2',
      at: '2026-09-07T11:08:00+07:00',
      kind: 'view',
      title: 'เปิดโมดูล',
      detail: 'ดู Health Score ของ RTR-BKK-04',
      module: 'Health Score',
      ip: '10.14.2.73',
      device: 'Edge · Windows',
    }),
    row({
      id: 'a4-3',
      at: '2026-09-07T10:50:00+07:00',
      kind: 'denied',
      title: 'ถูกปฏิเสธ',
      detail: 'พยายามเปิด Anomaly Detection — ไม่มีสิทธิ์',
      module: 'Anomaly Detection',
      ip: '10.14.2.73',
      device: 'Edge · Windows',
      result: 'denied',
    }),
    row({
      id: 'a4-4',
      at: '2026-09-07T10:41:00+07:00',
      kind: 'login',
      title: 'เข้าสู่ระบบ',
      detail: 'เข้าสู่ระบบด้วยรหัสพนักงาน 33333333',
      ip: '10.14.2.73',
      device: 'Edge · Windows',
    }),
    row({
      id: 'a4-5',
      at: '2026-08-01T09:15:00+07:00',
      kind: 'view',
      title: 'เปิดโมดูล',
      detail: 'ดู Fleet Overview',
      module: 'Fleet Overview',
      ip: '10.14.2.73',
      device: 'Edge · Windows',
    }),
  ],
  'acc-5': [
    row({
      id: 'a5-1',
      at: '2026-09-06T16:12:00+07:00',
      kind: 'view',
      title: 'เปิดโมดูล',
      detail: 'เปิด Anomaly Detection — filter Packet Loss',
      module: 'Anomaly Detection',
      ip: '10.18.9.5',
    }),
    row({
      id: 'a5-2',
      at: '2026-09-06T15:58:00+07:00',
      kind: 'denied',
      title: 'ถูกปฏิเสธ',
      detail: 'พยายามเปิด Predictive Maintenance — ไม่มีสิทธิ์',
      module: 'Predictive Maintenance',
      ip: '10.18.9.5',
      result: 'denied',
    }),
    row({
      id: 'a5-3',
      at: '2026-09-06T15:40:00+07:00',
      kind: 'view',
      title: 'เปิดโมดูล',
      detail: 'ดู Fleet Overview',
      module: 'Fleet Overview',
      ip: '10.18.9.5',
    }),
    row({
      id: 'a5-4',
      at: '2026-09-06T15:31:00+07:00',
      kind: 'login',
      title: 'เข้าสู่ระบบ',
      detail: 'เข้าสู่ระบบด้วยรหัสพนักงาน 44444444',
      ip: '10.18.9.5',
    }),
    row({
      id: 'a5-5',
      at: '2026-07-22T08:20:00+07:00',
      kind: 'login',
      title: 'เข้าสู่ระบบ',
      detail: 'เข้าสู่ระบบด้วยรหัสพนักงาน 44444444',
      ip: '10.18.9.5',
    }),
  ],
}

function fallbackActivities(account) {
  const name = displayName(account) || account.empId || 'ผู้ใช้'
  const open = new Set(featuresForAccount(account))
  const firstModule = MODULE_FEATURES.find(m => open.has(m.id))
  const rows = [
    row({
      id: `${account.id}-view`,
      at: '2026-09-09T08:52:00+07:00',
      kind: 'view',
      title: 'เปิดโมดูล',
      detail: firstModule ? `เปิด ${firstModule.label}` : 'เปิด IHAMS Web',
      module: firstModule?.label || 'IHAMS Web',
    }),
    row({
      id: `${account.id}-login`,
      at: '2026-09-09T08:41:00+07:00',
      kind: 'login',
      title: 'เข้าสู่ระบบ',
      detail: account.empId ? `เข้าสู่ระบบด้วยรหัสพนักงาน ${account.empId}` : 'เข้าสู่ระบบครั้งแรก',
    }),
    row({
      id: `${account.id}-create`,
      at: '2026-09-09T08:30:00+07:00',
      kind: 'create',
      title: 'สร้างบัญชี',
      detail: `บัญชี ${name} ถูกสร้างในระบบ`,
      module: 'Account Management',
    }),
  ]
  return rows.sort((a, b) => String(b.at).localeCompare(String(a.at)))
}

export function activitiesForAccount(account) {
  if (!account?.id) return []
  const catalog = BY_ID[account.id]
  if (catalog) {
    return [...catalog].sort((a, b) => String(b.at).localeCompare(String(a.at)))
  }
  return fallbackActivities(account)
}
