'use client'

import Image from 'next/image'
import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import type { UserRole } from '@/types/database'
import { createClient } from '@/lib/supabase/client'

interface NavItem {
  label: string
  href: string
  adminOnly?: boolean
}

const navItems: NavItem[] = [
  { label: 'דשבורד', href: '/' },
  { label: 'פרויקטים', href: '/projects' },
  { label: 'לקוחות', href: '/clients' },
  { label: 'תשלומים', href: '/payments', adminOnly: true },
  { label: 'דוחות', href: '/reports', adminOnly: true },
  { label: 'הגדרות', href: '/settings/users', adminOnly: true },
]

interface SidebarProps {
  role: UserRole
  fullName: string
}

export default function Sidebar({ role, fullName }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [logoError, setLogoError] = useState(false)

  const visibleItems = navItems.filter(
    (item) => !item.adminOnly || role === 'admin'
  )

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <aside
      className="w-56 min-h-screen flex flex-col shrink-0 print:hidden"
      style={{ background: '#e4e4e4', borderLeft: '1px solid #d4d4d4' }}
    >
      {/* Logo */}
      <div className="px-[18px] py-4" style={{ borderBottom: '1px solid #d4d4d4' }}>
        {logoError ? (
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-[2px] flex-shrink-0" style={{ background: '#E8C420' }} />
            <span className="text-[13px] font-bold tracking-tight" style={{ color: '#1a1a1a' }}>
              Heiterim
            </span>
          </div>
        ) : (
          <Image
            src="/logo.png"
            alt="Heiterim Architects"
            width={160}
            height={60}
            style={{ objectFit: 'contain', display: 'block' }}
            onError={() => setLogoError(true)}
          />
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-3 space-y-0.5">
        {visibleItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center px-3 py-2 rounded-[2px] text-[13px] transition-colors relative',
                isActive
                  ? 'font-bold'
                  : 'font-medium'
              )}
              style={isActive ? {
                color: '#1a1a1a',
                background: '#d8d8d8',
                borderRight: '3px solid #E8C420',
              } : {
                color: '#888888',
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  (e.currentTarget as HTMLElement).style.background = '#dcdcdc'
                  ;(e.currentTarget as HTMLElement).style.color = '#1a1a1a'
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  (e.currentTarget as HTMLElement).style.background = ''
                  ;(e.currentTarget as HTMLElement).style.color = '#888888'
                }
              }}
            >
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="px-4 py-4 space-y-2" style={{ borderTop: '1px solid #d4d4d4' }}>
        <div className="px-3">
          <p className="text-[13px] font-semibold truncate" style={{ color: '#1a1a1a' }}>{fullName}</p>
          <p className="text-[11px]" style={{ color: '#888888' }}>
            {role === 'admin' ? 'מנהל' : 'עובד'}
          </p>
        </div>
        <button
          onClick={handleLogout}
          className="w-full text-right px-3 py-1.5 rounded-[2px] text-[12px] transition-colors"
          style={{ color: '#888888' }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.background = '#dcdcdc'
            ;(e.currentTarget as HTMLElement).style.color = '#1a1a1a'
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.background = ''
            ;(e.currentTarget as HTMLElement).style.color = '#888888'
          }}
        >
          התנתקות
        </button>
      </div>
    </aside>
  )
}
