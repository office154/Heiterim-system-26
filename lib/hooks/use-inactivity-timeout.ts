'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const INACTIVITY_MS = 10 * 60 * 1000
const WARNING_BEFORE_MS = 60 * 1000

export function useInactivityTimeout() {
  const [showWarning, setShowWarning] = useState(false)
  const [secondsLeft, setSecondsLeft] = useState(60)
  const logoutTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const warningTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const countdown = useRef<ReturnType<typeof setInterval> | null>(null)
  const router = useRouter()

  const clear = useCallback(() => {
    if (logoutTimer.current) clearTimeout(logoutTimer.current)
    if (warningTimer.current) clearTimeout(warningTimer.current)
    if (countdown.current) clearInterval(countdown.current)
  }, [])

  const signOut = useCallback(async () => {
    clear()
    setShowWarning(false)
    await createClient().auth.signOut()
    router.push('/login')
  }, [clear, router])

  const reset = useCallback(() => {
    clear()
    setShowWarning(false)
    setSecondsLeft(60)

    warningTimer.current = setTimeout(() => {
      let secs = 60
      setShowWarning(true)
      setSecondsLeft(secs)
      countdown.current = setInterval(() => {
        secs -= 1
        setSecondsLeft(secs)
        if (secs <= 0) clearInterval(countdown.current!)
      }, 1000)
    }, INACTIVITY_MS - WARNING_BEFORE_MS)

    logoutTimer.current = setTimeout(signOut, INACTIVITY_MS)
  }, [clear, signOut])

  useEffect(() => {
    const events = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll', 'click']
    events.forEach(e => window.addEventListener(e, reset, { passive: true }))
    reset()
    return () => {
      events.forEach(e => window.removeEventListener(e, reset))
      clear()
    }
  }, [reset, clear])

  return { showWarning, secondsLeft, reset }
}
