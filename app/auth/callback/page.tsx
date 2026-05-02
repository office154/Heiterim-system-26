'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function AuthCallbackPage() {
  const router = useRouter()
  const [info, setInfo] = useState('מאמת...')

  useEffect(() => {
    const supabase = createClient()

    async function handleCallback() {
      const hash = window.location.hash
      const searchParams = new URLSearchParams(window.location.search)
      const code = searchParams.get('code')
      const tokenHash = searchParams.get('token_hash')
      const type = searchParams.get('type')

      setInfo(`hash: ${hash ? 'כן' : 'לא'} | code: ${code ? 'כן' : 'לא'} | token_hash: ${tokenHash ? 'כן' : 'לא'} | type: ${type ?? '-'}`)

      // 1. Implicit flow
      if (hash) {
        const hashParams = new URLSearchParams(hash.substring(1))
        const accessToken = hashParams.get('access_token')
        const refreshToken = hashParams.get('refresh_token')
        if (accessToken && refreshToken) {
          const { error } = await supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken })
          if (!error) { router.replace('/auth/set-password'); return }
          setInfo(`שגיאה ב-setSession: ${error.message}`)
          return
        }
      }

      // 2. Token hash flow
      if (tokenHash && type) {
        const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type: type as 'recovery' | 'invite' | 'email' })
        if (!error) { router.replace('/auth/set-password'); return }
        setInfo(`שגיאה ב-verifyOtp: ${error.message}`)
        return
      }

      // 3. PKCE code flow
      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code)
        if (!error) { router.replace('/auth/set-password'); return }
        setInfo(`שגיאה ב-exchangeCode: ${error.message}`)
        return
      }

      setInfo(`לא נמצאו פרמטרי אימות בכתובת`)
    }

    handleCallback()
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#F0F2F5' }}>
      <p className="text-[13px] text-center px-8" style={{ color: '#6B7280', maxWidth: 400 }}>{info}</p>
    </div>
  )
}
