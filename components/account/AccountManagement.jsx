'use client'
import { useMemo, useState } from 'react'
import Link from 'next/link'
import { ChevronRight, Pencil, Trash2 } from 'lucide-react'
import { useAuth } from '../AuthContext'
import { displayName, isAdminRole, ROLE_ADMIN, ROLE_EMPLOYEE, ROLE_SUPER_ADMIN } from '../../lib/authAccounts'
import { GoldButton, Icon, IconAction, OutlineButton } from './AccountUi'

const POSITION_OPTIONS = [
  { value: '', label: 'All' },
  { value: ROLE_SUPER_ADMIN, label: ROLE_SUPER_ADMIN },
  { value: ROLE_ADMIN, label: ROLE_ADMIN },
  { value: ROLE_EMPLOYEE, label: ROLE_EMPLOYEE },
]

export default function AccountManagement() {
  const { accounts, currentUser, deleteAccount } = useAuth()
  const [query, setQuery] = useState('')
  const [agency, setAgency] = useState('')
  const [position, setPosition] = useState('')

  const agencies = useMemo(() => {
    const set = new Set(accounts.map(a => a.agency).filter(Boolean))
    return [...set]
  }, [accounts])

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase()
    return accounts.filter(a => {
      if (q && !displayName(a).toLowerCase().includes(q) && !(a.empId || '').includes(q)) return false
      if (agency && a.agency !== agency) return false
      if (position && a.role !== position) return false
      return true
    })
  }, [accounts, query, agency, position])

  function resetFilters() {
    setQuery('')
    setAgency('')
    setPosition('')
  }

  function handleDelete(row) {
    if (row.id === currentUser?.id) {
      window.alert('ไม่สามารถลบบัญชีที่กำลังใช้งานอยู่')
      return
    }
    const admins = accounts.filter(a => isAdminRole(a.role))
    if (isAdminRole(row.role) && admins.length <= 1) {
      window.alert('ต้องเหลือบัญชีแอดมินอย่างน้อย 1 บัญชี')
      return
    }
    if (!window.confirm(`ลบบัญชี ${displayName(row)} ?`)) return
    deleteAccount(row.id)
  }

  return (
    <div className="animate-fade-in flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl sm:text-[32px] font-bold leading-none" style={{ color: '#034EA2' }}>
          Account Management
        </h1>
        <p className="text-base max-w-3xl" style={{ color: '#034EA2' }}>
          จัดการบัญชีผู้ใช้แอดมินและพนักงาน รวมถึงสิทธิ์การเข้าถึงโมดูลในระบบ IHAMS
        </p>
      </div>

      <div className="bg-white rounded-lg p-6 flex flex-col gap-2">
        <div
          className="hidden md:flex items-center gap-4 px-4 py-4 text-white text-base font-bold"
          style={{ background: '#034EA2' }}
        >
          <span className="flex-1 min-w-0">Name - Lastname</span>
          <span className="w-[160px] text-center shrink-0">Agency</span>
          <span className="w-[200px] text-center shrink-0">Position</span>
          <span className="w-[140px] shrink-0" />
        </div>

        <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center">
          <div
            className="flex items-center gap-2 px-2.5 h-[51px] rounded-lg flex-1 min-w-0"
            style={{ border: '1px solid #034EA2' }}
          >
            <Icon src="/icons/gg-search.svg" className="size-3.5" />
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search Name"
              className="flex-1 min-w-0 bg-transparent outline-none text-sm"
              style={{ color: '#034EA2' }}
            />
          </div>
          <select
            value={agency}
            onChange={e => setAgency(e.target.value)}
            className="h-[51px] rounded-lg px-3 text-sm bg-white min-w-[140px]"
            style={{ border: '1px solid #034EA2', color: '#034EA2' }}
          >
            <option value="">Agency</option>
            {agencies.map(a => <option key={a} value={a}>{a}</option>)}
          </select>
          <div className="relative min-w-[160px] flex-1">
            <select
              value={position}
              onChange={e => setPosition(e.target.value)}
              className="w-full appearance-none h-[51px] rounded-lg px-6 pr-8 text-sm bg-white"
              style={{ border: '1px solid #034EA2', color: '#034EA2' }}
            >
              {POSITION_OPTIONS.map(opt => (
                <option key={opt.value || 'all'} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
              <Icon src="/icons/arrow-drop-down.svg" className="size-4" />
            </span>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <OutlineButton onClick={resetFilters}>Reset</OutlineButton>
            <GoldButton icon="plus" href="/dashboard/profile/new">
              Create
            </GoldButton>
          </div>
        </div>

        <div className="flex flex-col">
          {rows.length === 0 && (
            <p className="px-4 py-8 text-sm text-center" style={{ color: '#64748B' }}>ไม่พบบัญชีตามเงื่อนไขที่ค้นหา</p>
          )}
          {rows.map(row => (
            <div
              key={row.id}
              className="flex items-center gap-4 px-4 py-3 border-b last:border-b-0"
              style={{ borderColor: '#EEF2F7' }}
            >
              <div className="flex-1 min-w-0">
                <p className="text-base truncate" style={{ color: '#222' }}>{displayName(row)}</p>
                <p className="text-xs md:hidden mt-0.5" style={{ color: '#64748B' }}>
                  {row.agency || 'EGAT'} · {row.position || row.role}
                </p>
              </div>
              <p className="w-[160px] text-base text-center hidden md:block shrink-0" style={{ color: '#222' }}>{row.agency || 'EGAT'}</p>
              <p className="w-[200px] text-base text-center hidden md:block shrink-0" style={{ color: '#222' }}>{row.position || row.role}</p>
              <div className="w-[140px] flex items-center justify-center gap-2.5 shrink-0">
                <IconAction label="Edit" href={`/dashboard/profile/${row.id}/edit`}>
                  <Pencil size={12} strokeWidth={2} />
                </IconAction>
                <IconAction label="Delete" onClick={() => handleDelete(row)}>
                  <Trash2 size={12} strokeWidth={2} />
                </IconAction>
                <Link
                  href={`/dashboard/profile/${row.id}`}
                  aria-label="View profile"
                  title="View profile"
                  className="size-6 rounded flex items-center justify-center shrink-0 hover:opacity-80"
                  style={{ color: '#034EA2' }}
                >
                  <ChevronRight size={18} strokeWidth={2} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
