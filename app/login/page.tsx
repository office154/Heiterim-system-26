'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [logoError, setLogoError] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [resetSent, setResetSent] = useState(false)
  const [resetLoading, setResetLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const supabase = createClient()
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password })

    if (authError) {
      setError('אימייל או סיסמה שגויים')
      setLoading(false)
      return
    }

    router.push('/')
    router.refresh()
  }

  async function handleForgotPassword() {
    if (!email) { setError('הכניסי קודם את כתובת האימייל'); return }
    setResetLoading(true)
    setError('')
    const supabase = createClient()
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback`,
    })
    setResetLoading(false)
    if (resetError) { setError('שגיאה בשליחת המייל'); return }
    setResetSent(true)
  }

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#F0F2F5' }}>
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          {logoError ? (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg" style={{ background: '#3D6A9E' }} />
              <span className="text-[22px] font-black tracking-tight" style={{ color: '#1a1a1a' }}>
                Heiterim Architects
              </span>
            </div>
          ) : (
            <Image
              src="/logo.png"
              alt="Heiterim Architects"
              width={200}
              height={80}
              style={{ objectFit: 'contain' }}
              onError={() => setLogoError(true)}
            />
          )}
        </div>

        {/* Card */}
        <div
          className="p-8"
          style={{
            background: '#ffffff',
            borderRadius: '10px',
            border: '1px solid #E5E7EB',
            boxShadow: '0 8px 40px rgba(0,0,0,0.15)',
          }}
        >
          <h1 className="text-[20px] font-black tracking-tight mb-1" style={{ color: '#1a1a1a' }}>
            התחברות
          </h1>
          <p className="text-[13px] mb-6" style={{ color: '#aaaaaa' }}>היכנסי לחשבון שלך</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label
                htmlFor="email"
                className="block text-[10px] font-bold uppercase tracking-[0.08em]"
                style={{ color: '#aaaaaa' }}
              >
                אימייל
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setResetSent(false) }}
                placeholder="your@email.com"
                required
                dir="ltr"
                className="w-full px-3 py-2 text-[13px] transition-all outline-none"
                style={{ background: '#ffffff', border: '1px solid #E5E7EB', borderRadius: '10px', color: '#1a1a1a' }}
                onFocus={(e) => { e.currentTarget.style.borderColor = '#3D6A9E'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(61,106,158,0.12)' }}
                onBlur={(e) => { e.currentTarget.style.borderColor = '#dddddd'; e.currentTarget.style.boxShadow = '' }}
              />
            </div>
            <div className="space-y-1.5">
              <label
                htmlFor="password"
                className="block text-[10px] font-bold uppercase tracking-[0.08em]"
                style={{ color: '#aaaaaa' }}
              >
                סיסמה
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  dir="ltr"
                  className="w-full pl-10 pr-3 py-2 text-[13px] transition-all outline-none"
                  style={{ background: '#ffffff', border: '1px solid #E5E7EB', borderRadius: '10px', color: '#1a1a1a' }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = '#3D6A9E'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(61,106,158,0.12)' }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = '#dddddd'; e.currentTarget.style.boxShadow = '' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#64748B] text-[13px]"
                  tabIndex={-1}
                >
                  {showPassword ? '🙈' : '👁'}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-[13px] text-center" style={{ color: '#C0392B' }}>{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-2.5 text-[14px] font-extrabold transition-colors mt-2"
              style={{ background: '#3D6A9E', color: 'white', borderRadius: '10px', border: 'none', cursor: loading ? 'default' : 'pointer' }}
              onMouseEnter={(e) => { if (!loading) (e.currentTarget as HTMLElement).style.background = '#2F5A8A' }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = '#3D6A9E' }}
            >
              {loading ? 'מתחבר...' : 'התחברות'}
            </button>

            <button
              type="button"
              onClick={handleForgotPassword}
              disabled={resetLoading}
              className="w-full text-[13px] text-center pt-2 transition-colors"
              style={{
                color: resetSent ? '#16A34A' : '#3D6A9E',
                cursor: resetLoading ? 'default' : 'pointer',
                textDecoration: 'underline',
                background: 'none',
                border: 'none',
              }}
            >
              {resetLoading ? 'שולח...' : resetSent ? `קישור נשלח אל ${email} ✓` : 'שכחתי סיסמה'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
