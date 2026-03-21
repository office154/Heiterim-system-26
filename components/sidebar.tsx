'use client'

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
    <aside className="w-56 bg-white text-[#0F172A] min-h-screen flex flex-col shrink-0 border-l border-[#E5E7EB] print:hidden">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-[#E5E7EB]">
        <div className="flex items-center gap-2.5">
          <div className="w-5 h-5 bg-[#0F172A] rounded-[4px] flex-shrink-0" />
          <span className="text-[13px] font-bold tracking-tight text-[#0F172A]">
            Heiterim
          </span>
        </div>
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
                'flex items-center px-3 py-2 rounded-md text-[13px] font-medium transition-colors relative',
                isActive
                  ? 'text-[#0F172A] font-semibold bg-[#F6F7F9]'
                  : 'text-[#64748B] hover:text-[#0F172A] hover:bg-[#F6F7F9]'
              )}
            >
              {isActive && (
                <span className="absolute right-0 top-1 bottom-1 w-[3px] bg-[#6366F1] rounded-l-full" />
              )}
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="px-4 py-4 border-t border-[#E5E7EB] space-y-2">
        <div className="px-3">
          <p className="text-[13px] font-semibold text-[#0F172A] truncate">{fullName}</p>
          <p className="text-[11px] text-[#64748B]">
            {role === 'admin' ? 'מנהל' : 'עובד'}
          </p>
        </div>
        <button
          onClick={handleLogout}
          className="w-full text-right px-3 py-1.5 rounded-md text-[12px] text-[#64748B] hover:text-[#0F172A] hover:bg-[#F6F7F9] transition-colors"
        >
          התנתקות
        </button>
      </div>
    </aside>
  )
}
