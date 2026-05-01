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
  const [forgotMode, setForgotMode] = useState(false)
  const [resetSent, setResetSent] = useState(false)
  const [resetLoading, setResetLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const supabase = createClient()
    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (authError) {
      setError('אימייל או סיסמה שגויים')
      setLoading(false)
      return
    }

    router.push('/')
    router.refresh()
  }

  async function handleForgotPassword(e: React.FormEvent) {
    e.preventDefault()
    if (!email) { setError('הכניסי אימייל'); return }
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
          {forgotMode ? (
            <>
              <h1 className="text-[20px] font-black tracking-tight mb-1" style={{ color: '#1a1a1a' }}>
                איפוס סיסמה
              </h1>
              <p className="text-[13px] mb-6" style={{ color: '#aaaaaa' }}>נשלח אליך קישור לאיפוס במייל</p>

              {resetSent ? (
                <div className="text-center space-y-4">
                  <p className="text-[14px] font-semibold" style={{ color: '#1a1a1a' }}>המייל נשלח ✓</p>
                  <p className="text-[13px]" style={{ color: '#aaaaaa' }}>בדקי את תיבת הדואר שלך ולחצי על הקישור</p>
                  <button
                    onClick={() => { setForgotMode(false); setResetSent(false); setError('') }}
                    className="text-[13px]" style={{ color: '#3D6A9E' }}
                  >
                    חזרה להתחברות
                  </button>
                </div>
              ) : (
                <form onSubmit={handleForgotPassword} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-bold uppercase tracking-[0.08em]" style={{ color: '#aaaaaa' }}>
                      אימייל
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your@email.com"
                      required
                      dir="ltr"
                      className="w-full px-3 py-2 text-[13px] transition-all outline-none"
                      style={{ background: '#ffffff', border: '1px solid #E5E7EB', borderRadius: '10px', color: '#1a1a1a' }}
                      onFocus={(e) => { e.currentTarget.style.borderColor = '#3D6A9E'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(61,106,158,0.12)' }}
                      onBlur={(e) => { e.currentTarget.style.borderColor = '#E5E7EB'; e.currentTarget.style.boxShadow = '' }}
                    />
                  </div>
                  {error && <p className="text-[13px] text-center" style={{ color: '#C0392B' }}>{error}</p>}
                  <button
                    type="submit"
                    disabled={resetLoading}
                    className="w-full px-4 py-2.5 text-[14px] font-extrabold transition-colors"
                    style={{ background: '#3D6A9E', color: 'white', borderRadius: '10px', border: 'none' }}
                    onMouseEnter={(e) => { if (!resetLoading) (e.currentTarget as HTMLElement).style.background = '#2F5A8A' }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = '#3D6A9E' }}
                  >
                    {resetLoading ? 'שולח...' : 'שלח קישור איפוס'}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setForgotMode(false); setError('') }}
                    className="w-full text-[13px] text-center pt-1"
                    style={{ color: '#aaaaaa' }}
                  >
                    חזרה להתחברות
                  </button>
                </form>
              )}
            </>
          ) : (
            <>
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
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                dir="ltr"
                className="w-full px-3 py-2 text-[13px] transition-all outline-none"
                style={{
                  background: '#ffffff',
                  border: '1px solid #E5E7EB',
                  borderRadius: '10px',
                  color: '#1a1a1a',
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = '#3D6A9E'
                  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(26,122,110,0.12)'
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = '#dddddd'
                  e.currentTarget.style.boxShadow = ''
                }}
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
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                dir="ltr"
                className="w-full px-3 py-2 text-[13px] transition-all outline-none"
                style={{
                  background: '#ffffff',
                  border: '1px solid #E5E7EB',
                  borderRadius: '10px',
                  color: '#1a1a1a',
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = '#3D6A9E'
                  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(26,122,110,0.12)'
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = '#dddddd'
                  e.currentTarget.style.boxShadow = ''
                }}
              />
            </div>
            {error && (
              <p className="text-[13px] text-center" style={{ color: '#C0392B' }}>{error}</p>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-2.5 text-[14px] font-extrabold transition-colors mt-2"
              style={{
                background: '#3D6A9E',
                color: '#1a1a1a',
                borderRadius: '10px',
                border: 'none',
              }}
              onMouseEnter={(e) => { if (!loading) (e.currentTarget as HTMLElement).style.background = '#2F5A8A' }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = '#3D6A9E' }}
            >
              {loading ? 'מתחבר...' : 'התחברות'}
            </button>
            <button
              type="button"
              onClick={() => { setForgotMode(true); setError('') }}
              className="w-full text-[13px] text-center pt-2"
              style={{ color: '#aaaaaa' }}
            >
              שכחתי סיסמה
            </button>
          </form>
          </>
          )}
        </div>
      </div>
    </div>
  )
}
