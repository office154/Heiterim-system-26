'use client'

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
    <aside className="w-56 bg-[#2B2B2B] text-white min-h-screen flex flex-col shrink-0 print:hidden">
      {/* Logo */}
      <div className="px-[18px] py-4 border-b border-white/10">
        {logoError ? (
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-[#E8C420] rounded-[2px] flex-shrink-0" />
            <span className="text-[13px] font-extrabold tracking-tight text-white">Heiterim</span>
          </div>
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src="/logo.png"
            alt="Heiterim Architects"
            style={{ maxWidth: 160, display: 'block' }}
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
                'flex items-center px-3 py-2 rounded-[2px] text-[13px] font-medium transition-colors relative',
                isActive
                  ? 'text-white font-semibold bg-[#383634]'
                  : 'text-[#6A6660] hover:text-[#dddddd] hover:bg-[#323030]'
              )}
            >
              {isActive && (
                <span className="absolute right-0 top-1 bottom-1 w-[3px] bg-[#E8C420] rounded-l-full" />
              )}
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="px-4 py-4 border-t border-white/10 space-y-2">
        <div className="px-3">
          <p className="text-[13px] font-semibold text-white truncate">{fullName}</p>
          <p className="text-[11px] text-[#6A6660]">
            {role === 'admin' ? 'מנהל' : 'עובד'}
          </p>
        </div>
        <button
          onClick={handleLogout}
          className="w-full text-right px-3 py-1.5 rounded-[2px] text-[12px] text-[#6A6660] hover:text-white hover:bg-[#323030] transition-colors"
        >
          התנתקות
        </button>
      </div>
    </aside>
  )
}
