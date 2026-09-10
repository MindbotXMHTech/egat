'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { LayoutDashboard, Activity, Wrench, GitBranch, Heart, BarChart3, ChevronRight, BookOpen, UserCog, User, LogOut, ChevronLeft } from 'lucide-react'
import { useAuth } from './AuthContext'
import { displayName } from '../lib/authAccounts'

const NAV = [
  { href: '/dashboard',            icon: LayoutDashboard, label: 'Fleet Overview',        feature: 'overview' },
  { href: '/dashboard/anomaly',    icon: Activity,        label: 'Anomaly Detection',      feature: 'anomaly' },
  { href: '/dashboard/predictive', icon: Wrench,          label: 'Predictive Maintenance', feature: 'predictive' },
  { href: '/dashboard/rca',        icon: GitBranch,       label: 'Root Cause Analysis',    feature: 'rca' },
  { href: '/dashboard/health',     icon: Heart,           label: 'Health Score',           feature: 'health' },
  { href: '/dashboard/lifecycle',  icon: BarChart3,       label: 'Asset Lifecycle',        feature: 'lifecycle' },
]

export default function Sidebar() {
  const path = usePathname()
  const { features, isAdmin, currentUser, logout, ready } = useAuth()
  const [collapsed, setCollapsed] = useState(false)
  const w = collapsed ? 64 : 232
  const open = new Set(features || [])

  const navItems = NAV.filter(item => open.has(item.feature))
  const utilItems = [
    isAdmin
      ? { href: '/dashboard/profile', icon: UserCog, label: 'Account Management' }
      : { href: '/dashboard/profile', icon: User, label: 'Profile' },
    ...(open.has('api') ? [{ href: '/dashboard/api-library', icon: BookOpen, label: 'API Library' }] : []),
  ]

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return undefined
    const mq = window.matchMedia('(max-width: 1023px)')
    function apply() {
      setCollapsed(mq.matches)
    }
    apply()
    if (typeof mq.addEventListener === 'function') mq.addEventListener('change', apply)
    else mq.addListener(apply)
    return () => {
      if (typeof mq.removeEventListener === 'function') mq.removeEventListener('change', apply)
      else mq.removeListener(apply)
    }
  }, [])

  return (
    <aside
      style={{ width: w, minWidth: w, background:'#0D2240', boxShadow:'2px 0 20px rgba(0,0,0,0.22)', transition:'width 0.25s ease' }}
      className="flex-shrink-0 h-screen sticky top-0 flex flex-col overflow-hidden">

      <div
        className={`border-b shrink-0 ${collapsed ? 'flex flex-col items-center gap-2 px-1.5 pt-4 pb-3' : 'flex items-center gap-3 px-3 pt-5 pb-4'}`}
        style={{ borderColor:'#1E3A5F' }}
      >
        <div className="w-9 h-9 rounded-lg flex items-center justify-center text-xl flex-shrink-0"
             style={{ background:'#E8960C' }}>
          ⚡
        </div>
        {!collapsed && (
          <div className="flex-1 min-w-0">
            <div className="text-white font-bold text-[14px] leading-tight tracking-wide">IHAMS</div>
            <div className="text-[10px] leading-tight truncate" style={{ color:'#64748B' }}>Health of Assets</div>
          </div>
        )}
        <button
          type="button"
          onClick={() => setCollapsed(c => !c)}
          className={`flex-shrink-0 w-8 h-8 rounded-md flex items-center justify-center hover:bg-white/10 transition-colors ${collapsed ? '' : 'ml-auto'}`}
          aria-expanded={!collapsed}
          title={collapsed ? 'ขยายแถบเมนู' : 'ย่อแถบเมนู'}>
          {collapsed
            ? <ChevronRight size={16} style={{ color:'#94A3B8' }} />
            : <ChevronLeft  size={14} style={{ color:'#94A3B8' }} />}
        </button>
      </div>

      {!collapsed && (
        <div className="px-3 pt-2 pb-0">
          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold tracking-widest uppercase"
               style={{ background:'#E8960C', color:'#0D2240' }}>
            EGAT · อรส.
          </div>
        </div>
      )}

      <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
        {!collapsed && (
          <div className="mb-1 px-2">
            <span className="text-[10px] font-semibold uppercase tracking-[0.12em]" style={{ color:'#475569' }}>เมนูหลัก</span>
          </div>
        )}
        {navItems.map(({ href, icon: Icon, label }) => {
          const active = path === href || (href !== '/dashboard' && path.startsWith(href))
          return (
            <Link key={href} href={href} title={collapsed ? label : undefined}
              className={`flex items-center gap-3 px-2.5 py-2.5 rounded-lg transition-all duration-150 group ${
                active ? 'text-white' : 'text-slate-400 hover:text-white hover:bg-white/8'
              }`}
              style={active ? { background:'rgba(255,255,255,0.12)' } : {}}>
              <Icon size={16} className="flex-shrink-0"
                   style={active ? { color:'#E8960C' } : { color:'#475569' }} />
              {!collapsed && (
                <div className="flex-1 min-w-0">
                  <div className={`text-[12px] leading-tight truncate ${active ? 'font-semibold' : 'font-medium'}`}>{label}</div>
                </div>
              )}
              {!collapsed && active && <ChevronRight size={11} style={{ color:'#E8960C', flexShrink:0 }} />}
            </Link>
          )
        })}

        {!collapsed && (
          <div className="mt-4 mb-1 px-2">
            <span className="text-[10px] font-semibold uppercase tracking-[0.12em]" style={{ color:'#475569' }}>เครื่องมือ</span>
          </div>
        )}
        {collapsed && <div className="my-2 mx-1 border-t" style={{ borderColor:'#1E3A5F' }} />}
        {utilItems.map(({ href, icon: Icon, label }) => {
          const active = path.startsWith(href)
          return (
            <Link key={href} href={href} title={collapsed ? label : undefined}
              className={`flex items-center gap-3 px-2.5 py-2.5 rounded-lg transition-all duration-150 group ${
                active ? 'text-white' : 'text-slate-400 hover:text-white hover:bg-white/8'
              }`}
              style={active ? { background:'rgba(255,255,255,0.12)' } : {}}>
              <Icon size={16} className="flex-shrink-0"
                   style={active ? { color:'#E8960C' } : { color:'#475569' }} />
              {!collapsed && (
                <div className="flex-1 min-w-0">
                  <div className="text-[12px] font-500 leading-tight truncate">{label}</div>
                </div>
              )}
            </Link>
          )
        })}
      </nav>

      <div className="px-3 py-3 border-t" style={{ borderColor:'#1E3A5F' }}>
        {!collapsed ? (
          <>
            {ready && currentUser && (
              <div className="mb-2 px-2.5 py-1.5 rounded-lg" style={{ background: 'rgba(255,255,255,0.06)' }}>
                <div className="text-[11px] text-white truncate">{displayName(currentUser)}</div>
                <div className="text-[10px]" style={{ color: '#94A3B8' }}>{currentUser.role}</div>
              </div>
            )}
            <div className="flex items-center gap-2 mb-2">
              <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background:'#1A7F4B' }} />
              <span className="text-[10px]" style={{ color:'#475569' }}>System Online</span>
              <span className="ml-auto text-[10px]" style={{ color:'#334155' }}>v2.1.0</span>
            </div>
            <Link href="/login" onClick={() => logout()}
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/8 transition-colors w-full">
              <LogOut size={14} style={{ color:'#475569' }} />
              <span className="text-[11px]">ออกจากระบบ</span>
            </Link>
          </>
        ) : (
          <Link href="/login" title="ออกจากระบบ" onClick={() => logout()}
            className="flex items-center justify-center p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/8 transition-colors">
            <LogOut size={15} style={{ color:'#475569' }} />
          </Link>
        )}
      </div>
    </aside>
  )
}
