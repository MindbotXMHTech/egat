export const STORAGE_ACCOUNTS = 'ihams-accounts'
export const STORAGE_SESSION = 'ihams-session'

export const ROLE_ADMIN = 'Admin'
export const ROLE_SUPER_ADMIN = 'Super Admin'
export const ROLE_EMPLOYEE = 'Employee'

export const ROLES = [ROLE_SUPER_ADMIN, ROLE_ADMIN, ROLE_EMPLOYEE]

export const MODULE_FEATURES = [
  { id: 'overview', label: 'Fleet Overview', href: '/dashboard' },
  { id: 'anomaly', label: 'Anomaly Detection', href: '/dashboard/anomaly' },
  { id: 'predictive', label: 'Predictive Maintenance', href: '/dashboard/predictive' },
  { id: 'rca', label: 'Root Cause Analysis', href: '/dashboard/rca' },
  { id: 'health', label: 'Health Score', href: '/dashboard/health' },
  { id: 'lifecycle', label: 'Asset Lifecycle', href: '/dashboard/lifecycle' },
  { id: 'api', label: 'API Library', href: '/dashboard/api-library' },
]

export const ALL_MODULE_IDS = MODULE_FEATURES.map(f => f.id)

export const ACCESSIBILITY_PRESETS = [
  { id: 'all', label: 'ทุกโมดูล', features: ALL_MODULE_IDS },
  { id: 'ops', label: 'Operations (Anomaly · Predictive · RCA)', features: ['overview', 'anomaly', 'predictive', 'rca'] },
  { id: 'health', label: 'Health & Lifecycle', features: ['overview', 'health', 'lifecycle'] },
  { id: 'anomaly', label: 'Anomaly Detection เท่านั้น', features: ['overview', 'anomaly'] },
  { id: 'view', label: 'ดูได้อย่างเดียว — ทุกโมดูล', features: ALL_MODULE_IDS },
]

export function isAdminRole(role) {
  return role === ROLE_ADMIN || role === ROLE_SUPER_ADMIN
}

export function accessibilityLabel(id) {
  return ACCESSIBILITY_PRESETS.find(p => p.id === id)?.label || id || '—'
}

export function featuresForPreset(presetId) {
  return ACCESSIBILITY_PRESETS.find(p => p.id === presetId)?.features || ['overview']
}

export function featuresForAccount(account) {
  if (!account) return []
  if (isAdminRole(account.role)) return [...ALL_MODULE_IDS, 'accounts']
  const assigned = Array.isArray(account.features) && account.features.length
    ? account.features
    : featuresForPreset(account.accessibility)
  return [...new Set(['overview', ...assigned.filter(id => id !== 'accounts')])]
}

export function accessibilityDisplay(account) {
  if (!account) return '—'
  if (isAdminRole(account.role)) return 'Can Edit'
  return accessibilityLabel(account.accessibility)
}

export function modulesForAccount(account) {
  const open = new Set(featuresForAccount(account))
  const modules = MODULE_FEATURES.filter(m => open.has(m.id))
  if (open.has('accounts')) {
    return [...modules, { id: 'accounts', label: 'Account Management', href: '/dashboard/profile' }]
  }
  return modules
}

export function canManageAccounts(account) {
  return isAdminRole(account?.role)
}

export function normalizeSites(sites) {
  if (!Array.isArray(sites)) return []
  return [...new Set(sites.map(s => String(s || '').trim()).filter(Boolean))]
}

/** Empty / missing `sites` means every site (legacy accounts). */
export function hasAllSites(account) {
  return !normalizeSites(account?.sites).length
}

export function sitesForAccount(account, catalog = []) {
  if (hasAllSites(account)) return catalog
  const allowed = new Set(normalizeSites(account.sites))
  return catalog.filter(site => allowed.has(site))
}

export function canViewSite(account, site) {
  if (hasAllSites(account)) return true
  return normalizeSites(account.sites).includes(site)
}

export function matchesAllowedSites(site, allowedSites) {
  if (!Array.isArray(allowedSites)) return true
  return allowedSites.includes(site)
}

export function persistAccountSites(allSites, selected) {
  if (allSites !== false) return []
  return normalizeSites(selected)
}

export function sitesDisplay(account) {
  if (!account || hasAllSites(account)) return 'ทุกไซต์'
  return normalizeSites(account.sites).join(', ')
}

export function featureIdForPath(pathname = '') {
  const path = String(pathname || '')
  if (path === '/dashboard' || path === '/dashboard/') return 'overview'
  if (path.startsWith('/dashboard/anomaly')) return 'anomaly'
  if (path.startsWith('/dashboard/predictive')) return 'predictive'
  if (path.startsWith('/dashboard/rca')) return 'rca'
  if (path.startsWith('/dashboard/health')) return 'health'
  if (path.startsWith('/dashboard/lifecycle')) return 'lifecycle'
  if (path.startsWith('/dashboard/api-library')) return 'api'
  if (path.startsWith('/dashboard/profile')) return 'profile'
  return null
}

export function canAccessPath(account, pathname = '') {
  const feature = featureIdForPath(pathname)
  if (!feature) return true
  if (feature === 'profile') {
    if (canManageAccounts(account)) return true
    return String(pathname || '').replace(/\/$/, '') === '/dashboard/profile'
  }
  return featuresForAccount(account).includes(feature)
}

export function displayName(account) {
  if (!account) return ''
  return [account.name, account.lastname].filter(Boolean).join(' ')
}

export function seedAccounts() {
  return [
    {
      id: 'acc-admin',
      empId: '12345678',
      name: 'Niran',
      lastname: 'Phongtong',
      email: 'niran.egat@gmail.com',
      tel: '0987654321',
      role: ROLE_SUPER_ADMIN,
      accessibility: 'all',
      agency: 'EGAT',
      position: 'Super Admin',
    },
    {
      id: 'acc-emp',
      empId: '11111111',
      name: 'Somsak',
      lastname: 'Chaiyaporn',
      email: 'somsak.egat@gmail.com',
      tel: '0812345678',
      role: ROLE_EMPLOYEE,
      accessibility: 'ops',
      agency: 'EGAT',
      position: 'พนักงาน',
    },
    {
      id: 'acc-3',
      empId: '22222222',
      name: 'Wilaiporn',
      lastname: 'Srisuk',
      email: 'wilaiporn.egat@gmail.com',
      tel: '0891112233',
      role: ROLE_ADMIN,
      accessibility: 'all',
      agency: 'EGAT',
      position: 'Admin',
    },
    {
      id: 'acc-4',
      empId: '33333333',
      name: 'Anan',
      lastname: 'Mekchai',
      email: 'anan.egat@gmail.com',
      tel: '0865557788',
      role: ROLE_EMPLOYEE,
      accessibility: 'health',
      agency: 'EGAT',
      position: 'พนักงาน',
    },
    {
      id: 'acc-5',
      empId: '44444444',
      name: 'Kanya',
      lastname: 'Wongsa',
      email: 'kanya.egat@gmail.com',
      tel: '0829990011',
      role: ROLE_EMPLOYEE,
      accessibility: 'anomaly',
      agency: 'EGAT',
      position: 'พนักงาน',
    },
  ]
}

export function emptyAccountDraft() {
  return {
    name: '',
    lastname: '',
    email: '',
    tel: '',
    role: '',
    accessibility: '',
    sitesAll: true,
    sites: [],
    agency: 'EGAT',
    sendInvite: false,
    setTempPassword: false,
    tempPassword: '',
  }
}

export function nextEmpId(accounts) {
  const nums = (accounts || [])
    .map(a => parseInt(a.empId, 10))
    .filter(n => Number.isFinite(n))
  const max = nums.length ? Math.max(...nums) : 10000000
  return String(max + 1)
}
