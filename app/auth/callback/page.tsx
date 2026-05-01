'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function AuthCallbackPage() {
  const router = useRouter()

  useEffect(() => {
    const supabase = createClient()

    async function handleCallback() {
      const hash = window.location.hash
      const searchParams = new URLSearchParams(window.location.search)

      // 1. Implicit flow — Supabase invite/recovery emails redirect with hash fragment
      if (hash) {
        const hashParams = new URLSearchParams(hash.substring(1))
        const accessToken = hashParams.get('access_token')
        const refreshToken = hashParams.get('refresh_token')
        if (accessToken && refreshToken) {
          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          })
          if (!error) {
            router.replace('/auth/set-password')
            return
          }
        }
      }

      // 2. Token hash flow — newer Supabase format (?token_hash=...&type=...)
      const tokenHash = searchParams.get('token_hash')
      const type = searchParams.get('type') as 'invite' | 'recovery' | 'email' | null
      if (tokenHash && type) {
        const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type })
        if (!error) {
          router.replace('/auth/set-password')
          return
        }
      }

      // 3. PKCE code flow
      const code = searchParams.get('code')
      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code)
        if (!error) {
          router.replace('/auth/set-password')
          return
        }
      }

      router.replace('/login?error=invalid_link')
    }

    handleCallback()
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#F0F2F5' }}>
      <p className="text-[14px]" style={{ color: '#6B7280' }}>מאמת...</p>
    </div>
  )
}
