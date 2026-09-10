'use client'
import { useState } from 'react'
import Link from 'next/link'
import { Zap, Lock, User, ShieldCheck, Activity, BarChart3, ChevronRight } from 'lucide-react'
import { useAuth } from '../../components/AuthContext'

export default function LoginPage() {
  const { login } = useAuth()
  const [empId, setEmpId] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function handleLogin(e) {
    e.preventDefault()
    if (!empId || !password) {
      setError('กรุณากรอกรหัสพนักงานและรหัสผ่าน')
      return
    }
    setError('')
    setLoading(true)
    setTimeout(() => {
      const result = login(empId)
      setLoading(false)
      if (result.ok) {
        window.location.href = '/dashboard'
      } else {
        setError(result.error || 'รหัสพนักงานหรือรหัสผ่านไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง')
      }
    }, 400)
  }

  const highlights = [
    { icon: Activity, label: 'ตรวจสุขภาพสินทรัพย์แบบเรียลไทม์' },
    { icon: BarChart3, label: 'วิเคราะห์และรายงานแบบครบวงจร' },
    { icon: ShieldCheck, label: 'มาตรฐานความปลอดภัยระดับองค์กร' },
  ]

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* ── Brand panel (desktop) ───────────────────────── */}
      <div
        className="relative lg:w-[46%] min-h-[220px] lg:min-h-screen overflow-hidden flex flex-col justify-between p-8 lg:p-12 text-white"
        style={{
          background: 'linear-gradient(155deg, #061428 0%, #0D2240 35%, #1B3A6B 78%, #143a72 100%)',
        }}
      >
        {/* Decorative blobs */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div
            className="absolute -top-24 -left-24 w-[420px] h-[420px] rounded-full opacity-30 blur-3xl"
            style={{ background: 'radial-gradient(circle, #E8960C 0%, transparent 65%)' }}
          />
          <div
            className="absolute bottom-0 right-0 w-[380px] h-[380px] rounded-full opacity-25 blur-3xl translate-x-1/4 translate-y-1/4"
            style={{ background: 'radial-gradient(circle, #2A5298 0%, transparent 70%)' }}
          />
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
              backgroundSize: '28px 28px',
            }}
          />
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-10">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg"
              style={{
                background: 'linear-gradient(145deg, #F5B942 0%, #E8960C 100%)',
                boxShadow: '0 12px 40px rgba(232, 150, 12, 0.35)',
              }}
            >
              <Zap className="w-8 h-8 text-egat-navy-dark" strokeWidth={2.2} />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight">IHAMS</h1>
              <p className="text-xs text-blue-200/90 font-medium tracking-wide">
                Integrated Health of Assets Management System
              </p>
            </div>
          </div>

          <p className="text-lg lg:text-xl font-semibold leading-snug max-w-md text-blue-50/95 mb-8">
            แพลตฟอร์มบริหารจัดการสุขภาพสินทรัพย์
            <span className="text-egat-gold-lt"> แบบครบวงจร</span>
            <br className="hidden sm:block" />
            สำหรับองค์กรพลังงานยุคใหม่
          </p>

          <ul className="space-y-4 hidden sm:block max-w-md">
            {highlights.map(({ icon: Icon, label }) => (
              <li
                key={label}
                className="flex items-center gap-3 text-sm text-blue-100/90"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/10 border border-white/10 backdrop-blur-sm">
                  <Icon className="w-4 h-4 text-egat-gold-lt" strokeWidth={2} />
                </span>
                {label}
              </li>
            ))}
          </ul>
        </div>

        <div className="relative z-10 mt-8 lg:mt-0">
          <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-[11px] font-bold tracking-wider border border-amber-400/30"
            style={{ background: 'rgba(232, 150, 12, 0.12)', color: '#F5D08A' }}
          >
            กฟผ. ฝ่ายระบบสื่อสาร (อรส.)
          </div>
          <p className="mt-4 text-[11px] text-blue-200/50">
            © 2026 Electricity Generating Authority of Thailand
          </p>
        </div>
      </div>

      {/* ── Form panel ───────────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10 lg:p-14 bg-[#F0F4F8] relative">
        <div
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            background:
              'radial-gradient(ellipse 80% 50% at 80% 20%, rgba(27, 58, 107, 0.08), transparent), radial-gradient(ellipse 60% 40% at 10% 90%, rgba(232, 150, 12, 0.06), transparent)',
          }}
        />

        <div className="relative w-full max-w-[420px] animate-fade-in">
          <div className="bg-white rounded-3xl shadow-[0_25px_50px_-12px_rgba(13,34,64,0.15),0_0_0_1px_rgba(13,34,64,0.04)] border border-white/80 overflow-hidden">
            <div className="h-1.5 w-full gradient-navy" />

            <div className="px-8 py-9 sm:px-10 sm:py-10">
              <div className="mb-8">
                <h2 className="text-egat-navy text-xl font-bold tracking-tight">เข้าสู่ระบบ</h2>
                <p className="text-egat-text-muted text-sm mt-1.5">
                  ใช้รหัสพนักงาน กฟผ. เพื่อเข้าใช้งานระบบ IHAMS
                </p>
              </div>

              {error && (
                <div
                  role="alert"
                  className="mb-5 p-3.5 rounded-2xl text-xs text-red-800 bg-red-50 border border-red-100 flex items-start gap-2.5"
                >
                  <span className="text-base leading-none mt-0.5" aria-hidden>
                    ⚠️
                  </span>
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-5">
                <div>
                  <label
                    htmlFor="emp-id"
                    className="block text-[11px] font-semibold uppercase tracking-wider text-egat-text-muted mb-2"
                  >
                    รหัสพนักงาน (Employee ID)
                  </label>
                  <div className="relative group">
                    <User
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-egat-text-muted group-focus-within:text-egat-navy transition-colors"
                      strokeWidth={2}
                    />
                    <input
                      id="emp-id"
                      type="text"
                      autoComplete="username"
                      value={empId}
                      onChange={(e) => setEmpId(e.target.value)}
                      placeholder="เช่น 12345678 หรือ EGAT-1234"
                      className="w-full pl-11 pr-4 py-3.5 rounded-2xl text-sm bg-egat-surface-alt border border-egat-border text-egat-text placeholder:text-egat-text-muted/70 focus:outline-none focus:border-egat-navy focus:ring-4 focus:ring-egat-navy/[0.08] transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="password"
                    className="block text-[11px] font-semibold uppercase tracking-wider text-egat-text-muted mb-2"
                  >
                    รหัสผ่าน (Password)
                  </label>
                  <div className="relative group">
                    <Lock
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-egat-text-muted group-focus-within:text-egat-navy transition-colors"
                      strokeWidth={2}
                    />
                    <input
                      id="password"
                      type="password"
                      autoComplete="current-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-11 pr-4 py-3.5 rounded-2xl text-sm bg-egat-surface-alt border border-egat-border text-egat-text placeholder:text-egat-text-muted/70 focus:outline-none focus:border-egat-navy focus:ring-4 focus:ring-egat-navy/[0.08] transition-all"
                    />
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                  <label className="flex items-center gap-2 cursor-pointer select-none group">
                    <input
                      type="checkbox"
                      className="w-3.5 h-3.5 rounded border-egat-border text-egat-navy focus:ring-egat-navy/20"
                    />
                    <span className="text-egat-text-sub group-hover:text-egat-text transition-colors">
                      จดจำการเข้าสู่ระบบ
                    </span>
                  </label>
                  <button
                    type="button"
                    className="text-egat-navy font-semibold hover:text-egat-navy-mid transition-colors"
                  >
                    ลืมรหัสผ่าน?
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="group w-full py-3.5 rounded-2xl text-sm font-bold text-white transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-egat-navy/25 hover:shadow-xl hover:shadow-egat-navy/30 hover:-translate-y-0.5 active:translate-y-0"
                  style={{
                    background: loading
                      ? '#64748B'
                      : 'linear-gradient(135deg, #1B3A6B 0%, #0D2240 100%)',
                  }}
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none" aria-hidden>
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8v4l3-3-3-3V4a10 10 0 100 20v-4l-3 3 3 3v-2a8 8 0 01-8-8z"
                        />
                      </svg>
                      กำลังเข้าสู่ระบบ...
                    </>
                  ) : (
                    <>
                      เข้าสู่ระบบ
                      <ChevronRight
                        className="w-4 h-4 opacity-80 group-hover:translate-x-0.5 transition-transform"
                        strokeWidth={2.5}
                      />
                    </>
                  )}
                </button>
              </form>

              <div className="mt-8 p-4 rounded-2xl bg-gradient-to-br from-egat-surface-alt to-white border border-egat-border-lt">
                <div className="flex items-center gap-2 text-[11px] font-semibold text-egat-text-sub mb-2">
                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-lg bg-egat-blue-bg text-egat-blue">
                    ℹ
                  </span>
                  สำหรับการ Demo
                </div>
                <p className="text-[11px] text-egat-text-muted leading-relaxed">
                  แอดมิน:{' '}
                  <code className="font-mono text-egat-navy bg-white px-1.5 py-0.5 rounded-md border border-egat-border-lt text-[10px]">
                    12345678
                  </code>
                  {' '}· พนักงาน:{' '}
                  <code className="font-mono text-egat-navy bg-white px-1.5 py-0.5 rounded-md border border-egat-border-lt text-[10px]">
                    11111111
                  </code>
                  <br />
                  รหัสผ่านใดก็ได้ — แอดมินเห็นทุกโมดูล + Account Management, พนักงานเห็นเฉพาะโมดูลที่เปิดให้
                </p>
              </div>
            </div>
          </div>

          <p className="text-center mt-8 text-[11px] text-egat-text-muted">
            IHAMS v2.1.0 ·{' '}
            <Link href="/" className="text-egat-navy font-medium hover:underline">
              กลับหน้าหลัก
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
