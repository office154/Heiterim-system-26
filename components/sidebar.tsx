'use client'

import Image from 'next/image'
import { useState, useMemo, useRef, useEffect, useCallback } from 'react'
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
  { label: 'לקוחות', href: '/clients', adminOnly: true },
  { label: 'תשלומים', href: '/payments', adminOnly: true },
  { label: 'דוחות', href: '/reports', adminOnly: true },
  { label: 'משימות', href: '/todos' },
  { label: 'הגדרות', href: '/settings/users', activePrefix: '/settings', adminOnly: true },
]

interface SidebarProps {
  role: UserRole
  fullName: string
}

const MIN_LIST_HEIGHT = 80
const MAX_LIST_HEIGHT = 520
const DEFAULT_LIST_HEIGHT = 220

function ProjectsSubNav({ pathname }: { pathname: string }) {
  const { data: projects = [] } = useProjects()
  const [search, setSearch] = useState('')
  const [open, setOpen] = useState(pathname.startsWith('/projects'))
  const [listHeight, setListHeight] = useState(DEFAULT_LIST_HEIGHT)
  const isResizing = useRef(false)
  const startY = useRef(0)
  const startHeight = useRef(0)

  const handleResizeMouseDown = useCallback((e: React.MouseEvent) => {
    isResizing.current = true
    startY.current = e.clientY
    startHeight.current = listHeight
    e.preventDefault()
  }, [listHeight])

  useEffect(() => {
    function onMouseMove(e: MouseEvent) {
      if (!isResizing.current) return
      const delta = e.clientY - startY.current
      const newHeight = Math.min(MAX_LIST_HEIGHT, Math.max(MIN_LIST_HEIGHT, startHeight.current + delta))
      setListHeight(newHeight)
    }
    function onMouseUp() {
      isResizing.current = false
    }
    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseup', onMouseUp)
    return () => {
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseup', onMouseUp)
    }
  }, [])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return projects
    return projects.filter((p) => p.title.toLowerCase().includes(q))
  }, [projects, search])

  const isProjectsActive = pathname.startsWith('/projects')

  return (
    <div>
      <div
        className="flex items-center justify-between rounded-lg cursor-pointer"
        style={isProjectsActive ? {
          background: '#EBF1F9',
          borderRight: '3px solid #3D6A9E',
        } : {}}
        onClick={() => setOpen((v) => !v)}
      >
        <Link
          href="/projects"
          onClick={(e) => e.stopPropagation()}
          className={cn(
            'flex-1 px-3 py-2 text-[13px]',
            isProjectsActive ? 'font-bold text-[#3D6A9E]' : 'font-medium text-[#6B7280]'
          )}
          style={isProjectsActive ? { paddingRight: 9 } : {}}
        >
          פרויקטים
        </Link>
        <button
          className="px-2 py-2 text-[10px] text-[#9CA3AF] hover:text-[#5C7A92] select-none"
          tabIndex={-1}
          style={{ transform: open ? 'rotate(90deg)' : 'rotate(180deg)', transition: 'transform 0.2s' }}
        >
          ▶
        </button>
      </div>

      {open && (
        <div style={{ background: '#f4f6f9', borderTop: '1px solid #E5E7EB', borderRadius: '0 0 8px 8px' }}>
          <div className="px-3 py-1.5">
            <div className="relative">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="חיפוש פרויקט..."
                className="w-full rounded-lg border border-[#E5E7EB] bg-white px-2 py-1 text-[11px] text-[#1a1a1a] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#3D6A9E]"
                style={{ paddingLeft: search ? 18 : undefined }}
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#6B7280] leading-none"
                  style={{ left: 5 }}
                  tabIndex={-1}
                >
                  ✕
                </button>
              )}
            </div>
          </div>
          <div style={{ maxHeight: listHeight, overflowY: 'auto' }}>
            {filtered.length === 0 && (
              <p className="px-3 py-2 text-[11px] text-[#9CA3AF] italic">לא נמצאו פרויקטים</p>
            )}
            {filtered.map((project) => {
              const isCur = pathname === `/projects/${project.id}` || pathname.startsWith(`/projects/${project.id}/`)
              return (
                <Link
                  key={project.id}
                  href={`/projects/${project.id}`}
                  className="flex items-center gap-2 px-3 py-1.5 text-[12px] truncate rounded-lg mx-1 my-0.5"
                  style={{
                    color: isCur ? '#3D6A9E' : '#6B7280',
                    fontWeight: isCur ? 600 : 400,
                    background: isCur ? '#EBF1F9' : 'transparent',
                  }}
                  onMouseEnter={(e) => {
                    if (!isCur) (e.currentTarget as HTMLElement).style.background = '#ECF0F4'
                  }}
                  onMouseLeave={(e) => {
                    if (!isCur) (e.currentTarget as HTMLElement).style.background = 'transparent'
                  }}
                >
                  <span
                    style={{
                      width: 5, height: 5, borderRadius: '50%', flexShrink: 0,
                      background: isCur ? '#3D6A9E' : '#D1D5DB',
                    }}
                  />
                  <span className="truncate">{project.title}</span>
                </Link>
              )
            })}
          </div>
          {/* Resize handle */}
          <div
            onMouseDown={handleResizeMouseDown}
            className="group flex items-center justify-center"
            style={{ height: 8, cursor: 'row-resize', background: '#eef0f3' }}
            title="גרור להגדלה/הקטנה"
          >
            <div
              className="rounded-full transition-colors group-hover:bg-[#3D6A9E]/40"
              style={{ width: 28, height: 3, background: '#D1D5DB' }}
            />
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
      className="w-full min-h-screen flex flex-col print:hidden"
      style={{ background: '#ffffff', borderLeft: '1px solid #E5E7EB' }}
    >
      {/* Logo */}
      <div className="px-4 py-4" style={{ borderBottom: '1px solid #E5E7EB' }}>
        {logoError ? (
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg flex-shrink-0 flex items-center justify-center" style={{ background: '#3D6A9E' }}>
              <span style={{ color: 'white', fontSize: 11, fontWeight: 700 }}>H</span>
            </div>
            <span className="text-[14px] font-bold tracking-tight" style={{ color: '#3D6A9E' }}>
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
                'flex items-center px-3 py-2 rounded-lg text-[13px] transition-colors relative',
                isActive ? 'font-bold' : 'font-medium'
              )}
              style={isActive ? {
                color: '#3D6A9E',
                background: '#EBF1F9',
                borderRight: '3px solid #3D6A9E',
              } : {
                color: '#6B7280',
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  (e.currentTarget as HTMLElement).style.background = '#ECF0F4'
                  ;(e.currentTarget as HTMLElement).style.color = '#5C7A92'
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  (e.currentTarget as HTMLElement).style.background = ''
                  ;(e.currentTarget as HTMLElement).style.color = '#6B7280'
                }
              }}
            >
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="px-4 py-4 space-y-2" style={{ borderTop: '1px solid #E5E7EB' }}>
        <div className="px-1">
          <p className="text-[13px] font-semibold truncate" style={{ color: '#1a1a1a' }}>{fullName}</p>
          <p className="text-[11px]" style={{ color: '#6B7280' }}>
            {role === 'admin' ? 'מנהל' : 'עובד'}
          </p>
        </div>
        <button
          onClick={handleLogout}
          className="w-full text-right px-3 py-1.5 rounded-lg text-[12px] transition-colors"
          style={{ color: '#6B7280' }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.background = '#ECF0F4'
            ;(e.currentTarget as HTMLElement).style.color = '#5C7A92'
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.background = ''
            ;(e.currentTarget as HTMLElement).style.color = '#6B7280'
          }}
        >
          התנתקות
        </button>
      </div>
    </aside>
  )
}
