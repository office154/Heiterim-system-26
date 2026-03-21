'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

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

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F0EDE4]">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo.png"
            alt="Heiterim Architects"
            style={{ maxWidth: 240 }}
            onError={(e) => {
              const el = e.currentTarget
              el.style.display = 'none'
              const fallback = el.nextSibling as HTMLElement
              if (fallback) fallback.style.display = 'flex'
            }}
          />
          <div style={{ display: 'none' }} className="items-center gap-3">
            <div className="w-8 h-8 bg-[#E8C420] rounded-[2px]" />
            <span className="text-[22px] font-black tracking-tight text-[#2B2B2B]">Heiterim Architects</span>
          </div>
        </div>

        {/* Card */}
        <div
          className="bg-white rounded-[4px] p-8"
          style={{ boxShadow: '0 3px 0 #C8C4BC, 0 5px 18px rgba(43,43,43,.08)', border: '1px solid #E0DDD4' }}
        >
          <h1 className="text-[20px] font-black tracking-tight text-[#2B2B2B] mb-1">התחברות</h1>
          <p className="text-[13px] text-[#9A9690] mb-6">היכנס לחשבון שלך</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="email" className="block text-[10px] font-bold uppercase tracking-[0.08em] text-[#9A9690]">
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
                className="w-full rounded-[2px] border border-[#E0DDD4] bg-white px-3 py-2 text-[13px] text-[#2B2B2B] placeholder:text-[#9A9690] focus:border-[#1A7A6E] focus:outline-none focus:ring-2 focus:ring-[#1A7A6E]/12"
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="password" className="block text-[10px] font-bold uppercase tracking-[0.08em] text-[#9A9690]">
                סיסמה
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                dir="ltr"
                className="w-full rounded-[2px] border border-[#E0DDD4] bg-white px-3 py-2 text-[13px] text-[#2B2B2B] focus:border-[#1A7A6E] focus:outline-none focus:ring-2 focus:ring-[#1A7A6E]/12"
              />
            </div>
            {error && (
              <p className="text-[13px] text-[#C0392B] text-center">{error}</p>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-[2px] bg-[#E8C420] px-4 py-2.5 text-[14px] font-extrabold text-[#2B2B2B] hover:bg-[#D4B010] disabled:opacity-50 transition-colors mt-2"
            >
              {loading ? 'מתחבר...' : 'התחברות'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
