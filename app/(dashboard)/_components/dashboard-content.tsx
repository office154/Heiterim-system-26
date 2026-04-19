'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  useDashboardData,
  type AlertStageItem,
  type InactiveProjectItem,
  type ProjectProgress,
} from '@/lib/hooks/use-dashboard'
import { CreateClientModal } from '@/components/create-client-modal'
import { Breadcrumb } from '@/components/shared/Breadcrumb'
import { useTodos, useUpdateTodo } from '@/lib/hooks/use-todos'
import type { Todo } from '@/types/database'
import { useResizableColumns } from '@/lib/hooks/use-resizable-columns'
import { ResizableTh } from '@/components/ui/resizable-th'

interface DashboardContentProps {
  role: 'admin' | 'employee'
  fullName: string
}

function fmt(n: number) {
  return '₪' + n.toLocaleString('he-IL')
}

function hebrewDate() {
  return new Date().toLocaleDateString('he-IL', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

// ─── Alert Modal ──────────────────────────────────────────────────────────────
function AlertModal({
  title,
  items,
  onClose,
}: {
  title: string
  items: AlertStageItem[]
  onClose: () => void
}) {
  const { widths, startResize } = useResizableColumns([200, 160, 160, 120])
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-white mx-4 overflow-hidden"
        style={{ borderRadius: '10px', border: '1px solid #E5E7EB', boxShadow: '0 8px 40px rgba(0,0,0,0.15)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#dddddd]">
          <h2 className="text-[15px] font-bold text-[#1a1a1a] tracking-tight">{title}</h2>
          <button
            onClick={onClose}
            className="h-8 w-8 flex items-center justify-center rounded-lg text-[#aaaaaa] hover:text-[#1a1a1a] hover:bg-[#F0F2F5] transition-colors text-lg"
          >
            ✕
          </button>
        </div>
        <div className="max-h-[60vh] overflow-y-auto">
          <table className="w-full text-[13px]" style={{ tableLayout: 'fixed' }}>
            <thead className="sticky top-0 bg-[#f8f8f8] border-b border-[#dddddd]">
              <tr>
                <ResizableTh width={widths[0]} onResizeStart={startResize(0)} className="px-5 py-3 text-right text-[10px] font-bold uppercase tracking-[0.08em] text-[#aaaaaa]">פרויקט</ResizableTh>
                <ResizableTh width={widths[1]} onResizeStart={startResize(1)} className="px-5 py-3 text-right text-[10px] font-bold uppercase tracking-[0.08em] text-[#aaaaaa]">לקוח</ResizableTh>
                <ResizableTh width={widths[2]} onResizeStart={startResize(2)} className="px-5 py-3 text-right text-[10px] font-bold uppercase tracking-[0.08em] text-[#aaaaaa]">שלב</ResizableTh>
                <ResizableTh width={widths[3]} onResizeStart={startResize(3)} className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-[0.08em] text-[#aaaaaa]">סכום</ResizableTh>
              </tr>
            </thead>
            <tbody>
              {items.map((item, i) => (
                <tr key={i} className="border-b border-[#f0f0f0] hover:bg-[#f8f8f8] transition-colors">
                  <td className="px-5 py-3">
                    <Link
                      href={`/projects/${item.projectId}`}
                      onClick={onClose}
                      className="font-semibold text-[#3D6A9E] hover:underline"
                    >
                      {item.projectTitle}
                    </Link>
                  </td>
                  <td className="px-5 py-3 text-[#666666]">{item.clientName}</td>
                  <td className="px-5 py-3 text-[#1a1a1a]">{item.stageName}</td>
                  <td className="px-5 py-3 font-black text-[#1a1a1a] text-left" dir="ltr">
                    {fmt(item.amount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

// ─── KPI Card ─────────────────────────────────────────────────────────────────
function KpiCard({
  label,
  value,
  subtitle,
  valueColor = 'text-[#1a1a1a]',
  bg = 'bg-white',
  borderColor = '#dddddd',
  loading,
  onClick,
  href,
  featuredTop,
}: {
  label: string
  value: string | number
  subtitle?: string
  valueColor?: string
  bg?: string
  borderColor?: string
  loading?: boolean
  onClick?: () => void
  href?: string
  featuredTop?: boolean
}) {
  const isInteractive = !!(onClick || href)

  const body = (
    <div
      className={`${bg} p-5 h-full transition-all duration-150 ${
        isInteractive ? 'cursor-pointer' : ''
      }`}
      style={{
        border: `1px solid ${borderColor}`,
        borderRadius: '10px',
        borderTop: featuredTop ? `3px solid #3D6A9E` : undefined,
        boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
      }}
      onMouseEnter={(e) => {
        if (!isInteractive) return
        const el = e.currentTarget as HTMLElement
        el.style.borderColor = '#3D6A9E'
        el.style.boxShadow = '0 1px 4px rgba(0,0,0,0.08)'
        el.style.transform = 'scale(1.01)'
      }}
      onMouseLeave={(e) => {
        if (!isInteractive) return
        const el = e.currentTarget as HTMLElement
        el.style.borderColor = borderColor
        el.style.boxShadow = '0 2px 0 #cccccc, 0 4px 14px rgba(0,0,0,0.06)'
        el.style.transform = 'scale(1)'
      }}
    >
      <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-[#aaaaaa] mb-2">{label}</p>
      {loading ? (
        <div className="space-y-2 animate-pulse">
          <div className="h-8 w-24 rounded-lg bg-[#e8e8e8]" />
          {subtitle !== undefined && <div className="h-3 w-32 rounded-lg bg-[#e8e8e8]" />}
        </div>
      ) : (
        <>
          <p className={`text-3xl font-black tracking-tight ${valueColor}`}>{value}</p>
          {subtitle && <p className="text-[12px] text-[#aaaaaa] mt-1">{subtitle}</p>}
        </>
      )}
    </div>
  )

  if (href) {
    return <Link href={href} className="block h-full">{body}</Link>
  }
  if (onClick) {
    return <button className="block w-full text-right h-full" onClick={onClick}>{body}</button>
  }
  return body
}

// ─── Alert Row ────────────────────────────────────────────────────────────────
function AlertRow({
  href,
  borderColor,
  children,
}: {
  href: string
  borderColor: string
  children: React.ReactNode
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-4 px-4 py-3 bg-white hover:bg-[#f8f8f8] transition-colors group"
      style={{
        border: '1px solid #E5E7EB',
        borderRight: `3px solid ${borderColor}`,
        borderRadius: '10px',
        boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
      }}
    >
      {children}
    </Link>
  )
}

// ─── Project Card ─────────────────────────────────────────────────────────────
function ProjectCard({ proj }: { proj: ProjectProgress }) {
  const statusStyle: Record<string, string> = {
    active:    'bg-[#EBF1F9] text-[#3D6A9E] border border-[#5C7A92]',
    on_hold:   'bg-[#fef3e0] text-[#D4820A] border border-[#f5d080]',
    completed: 'bg-[#f4f4f4] text-[#888888] border border-[#cccccc]',
  }
  const statusLabel: Record<string, string> = {
    active: 'פעיל', on_hold: 'מושהה', completed: 'הושלם',
  }

  return (
    <Link
      href={`/projects/${proj.id}`}
      className="block bg-white p-5 transition-all duration-150 group"
      style={{
        border: '1px solid #E5E7EB',
        borderRadius: '10px',
        boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget as HTMLAnchorElement
        el.style.borderColor = '#3D6A9E'
        el.style.boxShadow = '0 1px 4px rgba(0,0,0,0.08)'
        el.style.transform = 'scale(1.01)'
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget as HTMLAnchorElement
        el.style.borderColor = '#dddddd'
        el.style.boxShadow = '0 2px 0 #cccccc, 0 4px 14px rgba(0,0,0,0.06)'
        el.style.transform = 'scale(1)'
      }}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-[#1a1a1a] text-[14px] truncate tracking-tight">
            {proj.title}
          </h3>
          <p className="text-[12px] text-[#aaaaaa] mt-0.5 truncate">{proj.clientName}</p>
        </div>
        <span className={`text-[11px] font-semibold px-2.5 py-1 shrink-0 mr-2 rounded-lg ${statusStyle[proj.status] ?? statusStyle.completed}`}>
          {statusLabel[proj.status] ?? proj.status}
        </span>
      </div>

      {proj.currentStageName !== '—' && (
        <p className="text-[12px] text-[#666666] mb-3 truncate">
          <span className="text-[#aaaaaa]">שלב נוכחי: </span>{proj.currentStageName}
        </p>
      )}

      {/* Progress bar */}
      {proj.totalStages > 0 ? (
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] text-[#666666]">
              {proj.completedStages}/{proj.totalStages} שלבים
            </span>
            <span className="text-[11px] font-bold text-[#3D6A9E]">
              {proj.progressPercent}%
            </span>
          </div>
          <div className="w-full overflow-hidden" style={{ height: '3px', backgroundColor: '#eeeeee', borderRadius: '1px' }}>
            <div
              style={{
                height: '3px',
                width: `${proj.progressPercent}%`,
                backgroundColor: '#3D6A9E',
                borderRadius: '1px',
                transition: 'width 0.4s ease',
                minWidth: proj.progressPercent > 0 ? '3px' : '0px',
              }}
            />
          </div>
        </div>
      ) : (
        <p className="text-[11px] text-[#aaaaaa] italic">אין שלבים מוגדרים</p>
      )}
    </Link>
  )
}

// ─── Todo Widget ─────────────────────────────────────────────────────────────
function TodoWidget() {
  const { data: todos, isLoading } = useTodos()
  const updateTodo = useUpdateTodo()
  const [pendingDoneIds, setPendingDoneIds] = useState<Map<string, ReturnType<typeof setTimeout>>>(new Map())
  const [undoQueue, setUndoQueue] = useState<Todo[]>([])

  function markDone(todo: Todo) {
    setUndoQueue((prev) => [...prev, todo])
    const timer = setTimeout(() => {
      updateTodo.mutate({ id: todo.id, done: true })
      setPendingDoneIds((prev) => { const m = new Map(prev); m.delete(todo.id); return m })
      setUndoQueue((prev) => prev.filter((t) => t.id !== todo.id))
    }, 4000)
    setPendingDoneIds((prev) => new Map(prev).set(todo.id, timer))
  }

  function undoDone(todo: Todo) {
    const timer = pendingDoneIds.get(todo.id)
    if (timer) clearTimeout(timer)
    setPendingDoneIds((prev) => { const m = new Map(prev); m.delete(todo.id); return m })
    setUndoQueue((prev) => prev.filter((t) => t.id !== todo.id))
  }

  const allPending = (todos ?? []).filter((t) => !t.done && !pendingDoneIds.has(t.id))
  const pending = allPending.slice(0, 6)

  const groups = pending.reduce<Record<string, { projectId: string | null; items: Todo[] }>>((acc, t) => {
    const key = t.project_title || 'כללי'
    if (!acc[key]) acc[key] = { projectId: t.project_id ?? null, items: [] }
    acc[key].items.push(t)
    return acc
  }, {})

  const totalCount = allPending.length

  function formatDate(dateStr: string) {
    const d = new Date(dateStr)
    return d.toLocaleDateString('he-IL', { day: '2-digit', month: '2-digit' })
  }

  if (isLoading) {
    return (
      <div
        className="animate-pulse"
        style={{
          background: 'white',
          border: '1px solid #E5E7EB',
          borderRadius: '10px',
          boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
          padding: '16px 20px',
          height: 120,
        }}
      />
    )
  }

  return (
    <div
      style={{
        background: 'white',
        border: '1px solid #E5E7EB',
        borderRadius: '10px',
        boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-5 py-3"
        style={{ borderBottom: '1px solid #E5E7EB' }}
      >
        <div className="flex items-center gap-2">
          <span className="text-[13px] font-bold text-[#1a1a1a]">משימות</span>
          {totalCount > 0 && (
            <span
              className="text-[11px] font-bold px-2 py-0.5 rounded-full"
              style={{ background: '#EBF1F9', color: '#3D6A9E' }}
            >
              {totalCount}
            </span>
          )}
        </div>
        <Link
          href="/todos"
          className="text-[12px] font-semibold"
          style={{ color: '#3D6A9E', textDecoration: 'none' }}
        >
          לכל הרשימה →
        </Link>
      </div>

      {/* Body */}
      {pending.length === 0 && undoQueue.length === 0 ? (
        <div className="px-5 py-6 text-center text-[13px]" style={{ color: '#aaaaaa' }}>
          אין משימות פתוחות
        </div>
      ) : (
        <>
          <div className="py-2 px-3 space-y-1" style={{ maxHeight: 220, overflowY: 'auto' }}>
            {Object.entries(groups).map(([project, { projectId, items }]) => (
              <div key={project}>
                <div className="flex items-center gap-1.5 px-2 pt-2 pb-1">
                  <p className="text-[10px] font-bold uppercase tracking-[0.07em]" style={{ color: '#aaaaaa' }}>
                    {project}
                  </p>
                  {projectId && (
                    <Link
                      href={`/projects/${projectId}`}
                      className="text-[10px] transition-colors"
                      style={{ color: '#c8d8e8' }}
                      title="עבור לפרויקט"
                      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = '#3D6A9E' }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = '#c8d8e8' }}
                    >
                      ↗
                    </Link>
                  )}
                </div>
                {items.map((todo) => (
                  <div
                    key={todo.id}
                    className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-[#f8f8f8] transition-colors group"
                    style={{ borderRight: '3px solid #3D6A9E' }}
                  >
                    <button
                      onClick={() => markDone(todo)}
                      className="w-4 h-4 rounded-full border-2 flex-shrink-0 transition-colors hover:border-[#3D6A9E]"
                      style={{ borderColor: '#cccccc' }}
                      title="סמן כבוצע"
                    />
                    <span className="flex-1 text-[12px] text-[#1a1a1a] truncate">{todo.task}</span>
                    {todo.project_id && (
                      <Link
                        href={`/projects/${todo.project_id}`}
                        className="opacity-0 group-hover:opacity-100 flex-shrink-0 text-[11px] transition-all"
                        style={{ color: '#3D6A9E' }}
                        title="עבור לפרויקט"
                      >
                        ↗
                      </Link>
                    )}
                    <span
                      className="text-[10px] px-1.5 py-0.5 rounded-full flex-shrink-0"
                      style={{ background: '#c8d8e8', color: 'white', fontWeight: 600 }}
                    >
                      {formatDate(todo.created_at)}
                    </span>
                  </div>
                ))}
              </div>
            ))}
          </div>

          {/* Undo bar */}
          {undoQueue.length > 0 && (
            <div
              className="px-4 py-2.5 flex flex-col gap-1"
              style={{ borderTop: '1px solid #E5E7EB', background: '#f8fbff' }}
            >
              {undoQueue.map((todo) => (
                <div key={todo.id} className="flex items-center justify-between gap-3">
                  <span className="text-[11px] text-[#6B7280] truncate">
                    ✓ &nbsp;{todo.task}
                  </span>
                  <button
                    onClick={() => undoDone(todo)}
                    className="text-[11px] font-semibold flex-shrink-0 transition-colors"
                    style={{ color: '#3D6A9E' }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = '#C0392B' }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = '#3D6A9E' }}
                  >
                    ביטול
                  </button>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}

// ─── Light Sidebar Widget ───────────────────────────────────────────────────────
function SidebarWidget({
  activeProjects,
  loading,
  onNewClient,
}: {
  activeProjects: { id: string; title: string }[]
  loading: boolean
  onNewClient: () => void
}) {
  const router = useRouter()

  return (
    <aside className="w-[220px] shrink-0 bg-[#F0F2F5] flex flex-col">
      {/* Quick actions */}
      <div className="p-5 border-b border-[#d4d4d4]">
        <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-[#aaaaaa] mb-3">
          פעולות מהירות
        </p>
        <div className="space-y-2">
          <button
            onClick={() => router.push('/projects/new')}
            className="w-full rounded-lg bg-[#3D6A9E] hover:bg-[#2F5A8A] text-white text-[13px] font-extrabold px-3 py-2.5 transition-colors text-right"
          >
            + פרויקט חדש
          </button>
          <button
            onClick={onNewClient}
            className="w-full rounded-lg border border-[#E5E7EB] hover:border-[#5C7A92] hover:bg-[#ECF0F4] text-[#6B7280] hover:text-[#1a1a1a] text-[13px] font-medium px-3 py-2.5 transition-colors text-right"
          >
            + לקוח חדש
          </button>
        </div>
      </div>

      {/* Active projects list */}
      <div className="flex-1 flex flex-col min-h-0">
        <div className="px-5 py-4 flex items-center justify-between">
          <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-[#aaaaaa]">
            פרויקטים פעילים
          </p>
          {!loading && (
            <span className="text-[11px] font-bold text-[#3D6A9E]">{activeProjects.length}</span>
          )}
        </div>

        <div className="flex-1 overflow-y-auto px-3 pb-5 space-y-0.5">
          {loading ? (
            <div className="space-y-2 px-2 animate-pulse">
              {[1, 2, 3, 4].map((n) => (
                <div key={n} className="h-8 rounded-lg bg-[#F0F2F5]" />
              ))}
            </div>
          ) : activeProjects.length === 0 ? (
            <p className="text-[12px] text-[#cccccc] italic px-2">אין פרויקטים פעילים</p>
          ) : (
            activeProjects.map((proj) => (
              <Link
                key={proj.id}
                href={`/projects/${proj.id}`}
                className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-[#EBF1F9] transition-colors group"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#3D6A9E] shrink-0" />
                <span className="text-[12px] text-[#666666] group-hover:text-[#1a1a1a] truncate transition-colors">
                  {proj.title}
                </span>
              </Link>
            ))
          )}
        </div>
      </div>
    </aside>
  )
}

// ─── Main Dashboard Component ─────────────────────────────────────────────────
export function DashboardContent({ role, fullName }: DashboardContentProps) {
  const isAdmin = role === 'admin'
  const { data, isLoading } = useDashboardData()
  const [clientModalOpen, setClientModalOpen] = useState(false)
  const [openModal, setOpenModal] = useState<'payment' | 'invoice' | null>(null)
  const [showAllAlerts, setShowAllAlerts] = useState(false)

  const loading = isLoading || !data

  const allAlertsEmpty =
    !loading &&
    data.notInvoicedStages.length === 0 &&
    data.notPaidStages.length === 0 &&
    data.inactiveProjects.length === 0

  return (
    <div className="flex -m-8 min-h-screen">

      {/* ── MAIN CONTENT (right in RTL) ── */}
      <div className="flex-1 bg-[#F0F2F5] p-8 overflow-y-auto min-w-0">
        <Breadcrumb items={[{ label: 'דשבורד' }]} />
        <div className="space-y-7">

        {/* Greeting */}
        <div>
          <h1 className="text-[22px] font-black text-[#1a1a1a] tracking-tight">
            שלום, {fullName} 👋
          </h1>
          <p className="text-[13px] text-[#aaaaaa] mt-1">{hebrewDate()}</p>
        </div>

        {/* ── KPI CARDS ── */}
        <div className="space-y-3">
          {/* Row 1 */}
          <div className={`grid gap-3 ${isAdmin ? 'grid-cols-3' : 'grid-cols-2'}`}>
            <KpiCard
              label="פרויקטים פעילים"
              value={loading ? '—' : data.activeProjectsCount}
              valueColor="text-[#3D6A9E]"
              loading={loading}
              href="/projects?status=active"
              featuredTop
            />
            {isAdmin && (
              <KpiCard
                label='סה"כ גבייה'
                value={loading ? '—' : fmt(data.totalPaid)}
                subtitle={loading ? undefined : `מתוך ${fmt(data.totalContract)} חוזים`}
                valueColor="text-[#3D6A9E]"
                loading={loading}
                href="/reports"
              />
            )}
            <KpiCard
              label="לקוחות פעילים"
              value={loading ? '—' : data.activeClientsCount}
              loading={loading}
              href="/clients?filter=active"
            />
          </div>

          {/* Row 2 — admin only */}
          {isAdmin && (
            <div className="grid grid-cols-3 gap-3">
              <KpiCard
                label="יתרה לגבייה"
                value={loading ? '—' : fmt(data.totalPendingCollection)}
                valueColor="text-[#C0392B]"
                loading={loading}
                href="/reports#outstanding"
              />
              <KpiCard
                label="ממתינים לתשלום"
                value={loading ? '—' : data.waitingPaymentCount}
                valueColor="text-[#F59E0B]"
                bg="bg-white"
                borderColor="#dddddd"
                loading={loading}
                onClick={
                  !loading && data.waitingPaymentCount > 0
                    ? () => setOpenModal('payment')
                    : undefined
                }
                subtitle={
                  !loading && data.waitingPaymentCount > 0 ? 'לחץ לפרטים ←' : undefined
                }
              />
              <KpiCard
                label="ממתינים לחשבונית"
                value={loading ? '—' : data.waitingInvoiceCount}
                valueColor="text-[#C62828]"
                bg="bg-white"
                borderColor="#dddddd"
                loading={loading}
                onClick={
                  !loading && data.waitingInvoiceCount > 0
                    ? () => setOpenModal('invoice')
                    : undefined
                }
                subtitle={
                  !loading && data.waitingInvoiceCount > 0 ? 'לחץ לפרטים ←' : undefined
                }
              />
            </div>
          )}
        </div>

        {/* ── ALERTS — admin only ── */}
        {isAdmin && (
          <div>
            <h2 className="text-[10px] font-bold text-[#aaaaaa] uppercase tracking-[0.08em] mb-3">
              דורש טיפול עכשיו
            </h2>

            {loading ? (
              <div className="space-y-2 animate-pulse">
                {[1, 2, 3].map((n) => (
                  <div key={n} className="h-12 rounded-lg bg-[#e8e8e8] border border-[#dddddd]" />
                ))}
              </div>
            ) : allAlertsEmpty ? (
              <div
                className="flex items-center gap-3 px-4 py-3"
                style={{ background: '#EBF1F9', borderRadius: '10px', border: '0.5px solid #5C7A92' }}
              >
                <span className="text-[#3D6A9E] text-base">✓</span>
                <span className="text-[13px] font-semibold text-[#3D6A9E]">אין פריטים דחופים</span>
              </div>
            ) : (() => {
              type AlertEntry =
                | { kind: 'inv';   days: number; data: AlertStageItem }
                | { kind: 'pay';   days: number; data: AlertStageItem }
                | { kind: 'inact'; days: number; data: InactiveProjectItem }

              const allAlerts: AlertEntry[] = [
                ...data.notInvoicedStages.map((s) => ({ kind: 'inv'   as const, days: s.daysSince ?? 0, data: s })),
                ...data.notPaidStages.map(    (s) => ({ kind: 'pay'   as const, days: s.daysSince ?? 0, data: s })),
                ...data.inactiveProjects.map( (p) => ({ kind: 'inact' as const, days: p.daysSinceActivity,   data: p })),
              ].sort((a, b) => b.days - a.days)

              const LIMIT = 4
              const visible = showAllAlerts ? allAlerts : allAlerts.slice(0, LIMIT)
              const hiddenCount = allAlerts.length - LIMIT

              return (
                <div className="space-y-2">
                  {visible.map((entry, i) => {
                    if (entry.kind === 'inv') {
                      const s = entry.data as AlertStageItem
                      return (
                        <AlertRow key={`inv-${i}`} href={`/projects/${s.projectId}`} borderColor="#C62828">
                          <span className="text-[10px] font-bold text-[#C62828] uppercase tracking-[0.08em] shrink-0">לא חויב</span>
                          <span className="font-semibold text-[#1a1a1a] text-[13px] truncate">{s.projectTitle}</span>
                          <span className="text-[#666666] text-[13px] truncate">{s.stageName}</span>
                          <span className="font-black text-[#C62828] text-[13px] mr-auto shrink-0" dir="ltr">{fmt(s.amount)}</span>
                        </AlertRow>
                      )
                    }
                    if (entry.kind === 'pay') {
                      const s = entry.data as AlertStageItem
                      return (
                        <AlertRow key={`pay-${i}`} href={`/projects/${s.projectId}`} borderColor="#F59E0B">
                          <span className="text-[10px] font-bold text-[#F59E0B] uppercase tracking-[0.08em] shrink-0">לא שולם</span>
                          <span className="font-semibold text-[#1a1a1a] text-[13px] truncate">{s.projectTitle}</span>
                          <span className="text-[#666666] text-[13px] truncate">{s.stageName}</span>
                          {s.daysSince !== undefined && (
                            <span className="text-[12px] text-[#F59E0B] shrink-0">{s.daysSince} ימים</span>
                          )}
                          <span className="font-black text-[#F59E0B] text-[13px] mr-auto shrink-0" dir="ltr">{fmt(s.amount)}</span>
                        </AlertRow>
                      )
                    }
                    const p = entry.data as InactiveProjectItem
                    return (
                      <AlertRow key={`inact-${i}`} href={`/projects/${p.projectId}`} borderColor="#aaaaaa">
                        <span className="text-[10px] font-bold text-[#aaaaaa] uppercase tracking-[0.08em] shrink-0">לא פעיל</span>
                        <span className="font-semibold text-[#1a1a1a] text-[13px] truncate">{p.projectTitle}</span>
                        <span className="text-[#666666] text-[13px] truncate">{p.clientName}</span>
                        <span className="text-[12px] text-[#aaaaaa] mr-auto shrink-0">{p.daysSinceActivity} ימים ללא פעילות</span>
                      </AlertRow>
                    )
                  })}

                  {hiddenCount > 0 && (
                    <button
                      onClick={() => setShowAllAlerts((v) => !v)}
                      className="w-full flex items-center justify-center gap-1.5 py-2.5 text-[12px] font-semibold transition-colors"
                      style={{
                        border: '1px dashed #cccccc',
                        borderRadius: '10px',
                        background: 'white',
                        color: showAllAlerts ? '#3D6A9E' : '#aaaaaa',
                      }}
                      onMouseEnter={(e) => {
                        const el = e.currentTarget as HTMLButtonElement
                        el.style.borderColor = '#3D6A9E'
                        el.style.color = '#3D6A9E'
                        el.style.background = '#EBF1F9'
                      }}
                      onMouseLeave={(e) => {
                        const el = e.currentTarget as HTMLButtonElement
                        el.style.borderColor = '#cccccc'
                        el.style.color = showAllAlerts ? '#3D6A9E' : '#aaaaaa'
                        el.style.background = 'white'
                      }}
                    >
                      <span style={{ fontSize: '10px', transition: 'transform 0.2s', transform: showAllAlerts ? 'rotate(180deg)' : 'rotate(0deg)', display: 'inline-block' }}>▼</span>
                      {showAllAlerts ? 'הסתר' : `הצג עוד (${hiddenCount} נוספים)`}
                    </button>
                  )}
                </div>
              )
            })()}
          </div>
        )}

        {/* ── TODO WIDGET ── */}
        <div>
          <h2 className="text-[10px] font-bold text-[#aaaaaa] uppercase tracking-[0.08em] mb-3">
            משימות
          </h2>
          <TodoWidget />
        </div>

        {/* ── ACTIVE PROJECTS GRID ── */}
        <div>
          <h2 className="text-[10px] font-bold text-[#aaaaaa] uppercase tracking-[0.08em] mb-3">
            פרויקטים פעילים
          </h2>

          {loading ? (
            <div className="grid grid-cols-2 gap-3">
              {[1, 2, 3, 4].map((n) => (
                <div key={n} className="h-36 rounded-lg bg-[#e8e8e8] animate-pulse border border-[#dddddd]" />
              ))}
            </div>
          ) : data.projectsWithProgress.length === 0 ? (
            <div
              className="px-5 py-8 text-center bg-white"
              style={{ borderRadius: '10px', border: '0.5px solid #E5E7EB' }}
            >
              <p className="text-[13px] text-[#aaaaaa]">אין פרויקטים פעילים כרגע</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {data.projectsWithProgress.map((proj) => (
                <ProjectCard key={proj.id} proj={proj} />
              ))}
            </div>
          )}
        </div>
        </div>{/* end space-y-7 */}
      </div>

      {/* ── LIGHT SIDEBAR (left in RTL) ── */}
      <SidebarWidget
        activeProjects={loading ? [] : data.activeProjects}
        loading={loading}
        onNewClient={() => setClientModalOpen(true)}
      />

      {/* ── Modals ── */}
      {openModal === 'payment' && data && (
        <AlertModal
          title="ממתינים לתשלום"
          items={data.waitingPaymentItems}
          onClose={() => setOpenModal(null)}
        />
      )}
      {openModal === 'invoice' && data && (
        <AlertModal
          title="ממתינים לחשבונית"
          items={data.waitingInvoiceItems}
          onClose={() => setOpenModal(null)}
        />
      )}

      <CreateClientModal open={clientModalOpen} onOpenChange={setClientModalOpen} />
    </div>
  )
}
