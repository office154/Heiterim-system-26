'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function SetPasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [logoError, setLogoError] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (password.length < 6) {
      setError('הסיסמה חייבת להכיל לפחות 6 תווים')
      return
    }
    if (password !== confirm) {
      setError('הסיסמאות אינן תואמות')
      return
    }

    setLoading(true)
    const supabase = createClient()
    const { error: updateError } = await supabase.auth.updateUser({ password })

    if (updateError) {
      setError('שגיאה בהגדרת הסיסמה. נסי שוב.')
      setLoading(false)
      return
    }

    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const inputStyle = {
    background: '#ffffff',
    border: '1px solid #E5E7EB',
    borderRadius: '10px',
    color: '#1a1a1a',
  }

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#F0F2F5' }}>
      <div className="w-full max-w-md">
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
            הגדרת סיסמה
          </h1>
          <p className="text-[13px] mb-6" style={{ color: '#aaaaaa' }}>
            בחרי סיסמה לחשבון שלך
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-[10px] font-bold uppercase tracking-[0.08em]" style={{ color: '#aaaaaa' }}>
                סיסמה חדשה
              </label>
              <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                dir="ltr"
                placeholder="לפחות 6 תווים"
                className="w-full px-3 py-2 text-[13px] transition-all outline-none"
                style={inputStyle}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = '#3D6A9E'
                  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(61,106,158,0.12)'
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = '#E5E7EB'
                  e.currentTarget.style.boxShadow = ''
                }}
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

            <div className="space-y-1.5">
              <label className="block text-[10px] font-bold uppercase tracking-[0.08em]" style={{ color: '#aaaaaa' }}>
                אימות סיסמה
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
                dir="ltr"
                placeholder="חזרי על הסיסמה"
                className="w-full px-3 py-2 text-[13px] transition-all outline-none"
                style={inputStyle}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = '#3D6A9E'
                  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(61,106,158,0.12)'
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = '#E5E7EB'
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
              style={{ background: '#3D6A9E', color: 'white', borderRadius: '10px', border: 'none' }}
              onMouseEnter={(e) => { if (!loading) (e.currentTarget as HTMLElement).style.background = '#2F5A8A' }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = '#3D6A9E' }}
            >
              {loading ? 'שומר...' : 'שמור סיסמה'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
