'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export function SessionGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [verified, setVerified] = useState(false)

  useEffect(() => {
    if (sessionStorage.getItem('tab_session')) {
      setVerified(true)
      return
    }
    // No active tab session — sign out and force re-login
    createClient().auth.signOut().then(() => {
      router.replace('/login')
    })
  }, [router])

  if (!verified) return null

  return <>{children}</>
}
