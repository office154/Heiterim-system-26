'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function AuthConfirmPage() {
  const router = useRouter()
  const [info, setInfo] = useState('מאמת...')

  useEffect(() => {
    const supabase = createClient()

    async function handleHash() {
      const hash = window.location.hash
      if (!hash) {
        router.replace('/login?error=invalid_link')
        return
      }

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
        setInfo(`שגיאה: ${error.message}`)
        return
      }

      router.replace('/login?error=invalid_link')
    }

    handleHash()
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#F0F2F5' }}>
      <p className="text-[13px]" style={{ color: '#6B7280' }}>{info}</p>
    </div>
  )
}
