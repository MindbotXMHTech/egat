'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ShieldOff } from 'lucide-react'
import { useAuth } from './AuthContext'
import { canAccessPath } from '../lib/authAccounts'

export default function FeatureGate({ children }) {
  const pathname = usePathname()
  const { currentUser, ready } = useAuth()

  if (!ready) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center text-sm" style={{ color: '#8896A4' }}>
        กำลังโหลด...
      </div>
    )
  }

  if (!canAccessPath(currentUser, pathname)) {
    return (
      <div className="animate-fade-in max-w-lg mx-auto mt-16 bg-white rounded-xl border border-egat-border p-8 text-center">
        <div
          className="w-12 h-12 rounded-xl mx-auto mb-4 flex items-center justify-center"
          style={{ background: '#0D2240' }}
        >
          <ShieldOff size={22} color="#E8960C" />
        </div>
        <h1 className="text-xl font-bold mb-2" style={{ color: '#034EA2' }}>ไม่มีสิทธิ์เข้าถึง</h1>
        <p className="text-sm mb-6" style={{ color: '#64748B' }}>
          บัญชีนี้ยังไม่ได้เปิดใช้งานโมดูลนี้ กรุณาติดต่อผู้ดูแลระบบ
        </p>
        <Link
          href="/dashboard"
          className="inline-flex items-center justify-center h-[51px] rounded-lg px-6 text-base font-bold"
          style={{ background: '#FFCB05', color: '#034EA2' }}
        >
          กลับ Fleet Overview
        </Link>
      </div>
    )
  }

  return children
}
