'use client'
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import {
  ALL_MODULE_IDS,
  STORAGE_ACCOUNTS,
  STORAGE_SESSION,
  canManageAccounts,
  featuresForAccount,
  featuresForPreset,
  isAdminRole,
  nextEmpId,
  persistAccountSites,
  seedAccounts,
} from '../lib/authAccounts'

const AuthContext = createContext(null)

function readJson(key, fallback) {
  if (typeof window === 'undefined') return fallback
  try {
    const raw = window.localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

export function AuthProvider({ children }) {
  const [ready, setReady] = useState(false)
  const [accounts, setAccounts] = useState(seedAccounts)
  const [sessionId, setSessionId] = useState('acc-admin')

  useEffect(() => {
    const storedAccounts = readJson(STORAGE_ACCOUNTS, null)
    const storedSession = readJson(STORAGE_SESSION, null)
    if (Array.isArray(storedAccounts) && storedAccounts.length) setAccounts(storedAccounts)
    if (storedSession?.accountId) setSessionId(storedSession.accountId)
    setReady(true)
  }, [])

  useEffect(() => {
    if (!ready) return
    window.localStorage.setItem(STORAGE_ACCOUNTS, JSON.stringify(accounts))
  }, [accounts, ready])

  useEffect(() => {
    if (!ready) return
    window.localStorage.setItem(STORAGE_SESSION, JSON.stringify({ accountId: sessionId }))
  }, [sessionId, ready])

  const currentUser = useMemo(() => {
    const hit = accounts.find(a => a.id === sessionId)
    if (hit) return hit
    return accounts.find(a => a.id === 'acc-admin') || accounts[0] || null
  }, [accounts, sessionId])

  const login = useCallback((empId) => {
    const id = String(empId || '').trim()
    const hit = accounts.find(a => a.empId === id || a.email === id)
    if (!hit) return { ok: false, error: 'รหัสพนักงานหรือรหัสผ่านไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง' }
    setSessionId(hit.id)
    window.localStorage.setItem(STORAGE_SESSION, JSON.stringify({ accountId: hit.id }))
    return { ok: true, user: hit }
  }, [accounts])

  const logout = useCallback(() => {
    setSessionId('acc-admin')
    window.localStorage.setItem(STORAGE_SESSION, JSON.stringify({ accountId: 'acc-admin' }))
  }, [])

  const createAccount = useCallback((draft) => {
    const admin = isAdminRole(draft.role)
    let created = null
    setAccounts(list => {
      created = {
        id: `acc-${Date.now()}`,
        empId: nextEmpId(list),
        name: draft.name.trim(),
        lastname: draft.lastname.trim(),
        email: draft.email.trim(),
        tel: (draft.tel || '').trim(),
        role: draft.role,
        accessibility: admin ? (draft.accessibility || 'all') : draft.accessibility,
        sites: persistAccountSites(draft.sitesAll, draft.sites),
        agency: draft.agency || 'EGAT',
        position: admin ? draft.role : 'พนักงาน',
        features: admin ? [...ALL_MODULE_IDS] : featuresForPreset(draft.accessibility),
      }
      return [...list, created]
    })
    return created
  }, [])

  const updateAccount = useCallback((id, patch) => {
    setAccounts(list => list.map(a => (a.id === id ? { ...a, ...patch } : a)))
  }, [])

  const deleteAccount = useCallback((id) => {
    setAccounts(list => list.filter(a => a.id !== id))
  }, [])

  const getAccount = useCallback((id) => accounts.find(a => a.id === id) || null, [accounts])

  const value = useMemo(() => ({
    ready,
    accounts,
    currentUser,
    features: featuresForAccount(currentUser),
    isAdmin: canManageAccounts(currentUser),
    login,
    logout,
    createAccount,
    updateAccount,
    deleteAccount,
    getAccount,
  }), [ready, accounts, currentUser, login, logout, createAccount, updateAccount, deleteAccount, getAccount])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    const fallback = seedAccounts()[0]
    return {
      ready: true,
      accounts: seedAccounts(),
      currentUser: fallback,
      features: featuresForAccount(fallback),
      isAdmin: true,
      login() { return { ok: false } },
      logout() {},
      createAccount() { return null },
      updateAccount() {},
      deleteAccount() {},
      getAccount() { return null },
    }
  }
  return ctx
}
