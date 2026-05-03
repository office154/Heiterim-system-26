'use client'

import { useInactivityTimeout } from '@/lib/hooks/use-inactivity-timeout'

export function InactivityGuard() {
  const { showWarning, secondsLeft, reset } = useInactivityTimeout()

  if (!showWarning) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div
        className="bg-white rounded-lg p-8 max-w-sm w-full text-center border border-border"
        style={{ boxShadow: 'var(--shadow-card)' }}
      >
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4"
          style={{ backgroundColor: 'var(--danger-light)' }}
        >
          <span className="text-3xl font-bold" style={{ color: 'var(--danger)' }}>
            {secondsLeft}
          </span>
        </div>
        <h2 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
          עומד להתנתק
        </h2>
        <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
          לא זוהתה פעילות. תנותק אוטומטית בעוד {secondsLeft} שניות.
        </p>
        <button
          onClick={reset}
          className="w-full text-white font-medium py-2.5 px-6 rounded-md transition-colors hover:opacity-90"
          style={{ backgroundColor: 'var(--accent-primary)' }}
        >
          המשך עבודה
        </button>
      </div>
    </div>
  )
}
