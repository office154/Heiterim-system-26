'use client'

import Image from 'next/image'
import { useState, useMemo } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import type { UserRole } from '@/types/database'
import { createClient } from '@/lib/supabase/client'
import { useProjects } from '@/lib/hooks/use-projects'

interface NavItem {
  label: string
  href: string
  activePrefix?: string
  adminOnly?: boolean
}

const navItems: NavItem[] = [
  { label: 'דשבורד', href: '/' },
  { label: 'פרויקטים', href: '/projects' },
  { label: 'לקוחות', href: '/clients' },
  { label: 'תשלומים', href: '/payments', adminOnly: true },
  { label: 'דוחות', href: '/reports', adminOnly: true },
  { label: 'הגדרות', href: '/settings/users', activePrefix: '/settings', adminOnly: true },
]

interface SidebarProps {
  role: UserRole
  fullName: string
}

function ProjectsSubNav({ pathname }: { pathname: string }) {
  const { data: projects = [] } = useProjects()
  const [search, setSearch] = useState('')
  const [open, setOpen] = useState(pathname.startsWith('/projects'))

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return projects
    return projects.filter((p) => p.title.toLowerCase().includes(q))
  }, [projects, search])

  const isProjectsActive = pathname.startsWith('/projects')

  return (
    <div>
      {/* "פרויקטים" row with toggle arrow */}
      <div
        className="flex items-center justify-between rounded-[2px] cursor-pointer"
        style={isProjectsActive ? {
          background: '#d8d8d8',
          borderRight: '3px solid #E8C420',
        } : {}}
        onClick={() => setOpen((v) => !v)}
      >
        <Link
          href="/projects"
          onClick={(e) => e.stopPropagation()}
          className={cn(
            'flex-1 px-3 py-2 text-[13px]',
            isProjectsActive ? 'font-bold text-[#1a1a1a]' : 'font-medium text-[#888888]'
          )}
          style={isProjectsActive ? { paddingRight: 9 } : {}}
        >
          פרויקטים
        </Link>
        <button
          className="px-2 py-2 text-[10px] text-[#aaa] hover:text-[#666] select-none transition-transform"
          tabIndex={-1}
          style={{ transform: open ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}
        >
          ▶
        </button>
      </div>

      {/* Expanded list */}
      {open && (
        <div style={{ background: '#dcdcdc', borderTop: '1px solid #d0d0d0' }}>
          {/* Search */}
          <div className="px-3 py-1.5">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="חיפוש פרויקט..."
              className="w-full rounded-[2px] border border-[#ccc] bg-[#e8e8e8] px-2 py-1 text-[10px] text-[#555] placeholder:text-[#aaa] focus:outline-none focus:border-[#bbb]"
            />
          </div>

          {/* Project list */}
          <div style={{ maxHeight: 220, overflowY: 'auto' }}>
            {filtered.length === 0 && (
              <p className="px-3 py-2 text-[10px] text-[#aaa] italic">לא נמצאו פרויקטים</p>
            )}
            {filtered.map((project) => {
              const isCur = pathname === `/projects/${project.id}` || pathname.startsWith(`/projects/${project.id}/`)
              return (
                <Link
                  key={project.id}
                  href={`/projects/${project.id}`}
                  className="flex items-center gap-2 px-3 py-1.5 text-[11px] truncate"
                  style={{
                    color: isCur ? '#1a1a1a' : '#666',
                    fontWeight: isCur ? 600 : 400,
                    background: isCur ? '#cacaca' : 'transparent',
                  }}
                  onMouseEnter={(e) => {
                    if (!isCur) (e.currentTarget as HTMLElement).style.background = '#d4d4d4'
                  }}
                  onMouseLeave={(e) => {
                    if (!isCur) (e.currentTarget as HTMLElement).style.background = 'transparent'
                  }}
                >
                  <span
                    style={{
                      width: 5, height: 5, borderRadius: '50%', flexShrink: 0,
                      background: isCur ? '#E8C420' : '#c0c0c0',
                    }}
                  />
                  <span className="truncate">{project.title}</span>
                </Link>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
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
          if (item.href === '/projects') {
            return <ProjectsSubNav key="/projects" pathname={pathname} />
          }

          const prefix = item.activePrefix ?? item.href
          const isActive = prefix === '/'
            ? pathname === '/'
            : pathname.startsWith(prefix)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center px-3 py-2 rounded-[2px] text-[13px] transition-colors relative',
                isActive ? 'font-bold' : 'font-medium'
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
