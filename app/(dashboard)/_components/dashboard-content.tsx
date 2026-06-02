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
        className="w-full max-w-2xl bg-[var(--bg-card)] mx-4 overflow-hidden rounded-[var(--radius-xl)] border border-[var(--border)] shadow-[var(--shadow-lg)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)]">
          <h2 className="text-[15px] font-bold text-[var(--text-primary)] tracking-tight">{title}</h2>
          <button
            onClick={onClose}
            className="h-8 w-8 flex items-center justify-center rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-base)] transition-colors text-lg"
          >
            ✕
          </button>
        </div>
        <div className="max-h-[60vh] overflow-y-auto">
          <table className="w-full text-[13px]" style={{ tableLayout: 'fixed' }}>
            <thead className="sticky top-0 bg-[var(--bg-elevated)] border-b border-[var(--border)]">
              <tr>
                <ResizableTh width={widths[0]} onResizeStart={startResize(0)} className="px-5 py-3 text-right text-[10px] font-bold uppercase tracking-[0.08em] text-[var(--text-muted)]">פרויקט</ResizableTh>
                <ResizableTh width={widths[1]} onResizeStart={startResize(1)} className="px-5 py-3 text-right text-[10px] font-bold uppercase tracking-[0.08em] text-[var(--text-muted)]">לקוח</ResizableTh>
                <ResizableTh width={widths[2]} onResizeStart={startResize(2)} className="px-5 py-3 text-right text-[10px] font-bold uppercase tracking-[0.08em] text-[var(--text-muted)]">שלב</ResizableTh>
                <ResizableTh width={widths[3]} onResizeStart={startResize(3)} className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-[0.08em] text-[var(--text-muted)]">סכום</ResizableTh>
              </tr>
            </thead>
            <tbody>
              {items.map((item, i) => (
                <tr key={i} className="border-b border-[var(--border)] hover:bg-[var(--bg-hover)] transition-colors">
                  <td className="px-5 py-3">
                    <Link
                      href={`/projects/${item.projectId}`}
                      onClick={onClose}
                      className="font-semibold text-[var(--accent-primary)] hover:underline"
                    >
                      {item.projectTitle}
                    </Link>
                  </td>
                  <td className="px-5 py-3 text-[var(--text-secondary)]">{item.clientName}</td>
                  <td className="px-5 py-3 text-[var(--text-primary)]">{item.stageName}</td>
                  <td className="px-5 py-3 font-black text-[var(--text-primary)] text-left" dir="ltr">
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
  valueColor = 'text-[var(--text-primary)]',
  bg = 'bg-[var(--bg-card)]',
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
      className={[
        bg,
        'p-5 h-full transition-all duration-150',
        'border border-[var(--border)] rounded-[var(--radius)] shadow-[var(--shadow-card)]',
        featuredTop ? 'border-t-2 border-t-[var(--accent-primary)]' : '',
        isInteractive
          ? 'cursor-pointer group hover:border-[var(--accent-primary)] hover:scale-[1.01]'
          : '',
      ].filter(Boolean).join(' ')}
    >
      <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-[var(--text-muted)] mb-2">{label}</p>
      {loading ? (
        <div className="space-y-2 animate-pulse">
          <div className="h-8 w-24 rounded-lg bg-[var(--bg-elevated)]" />
          {subtitle !== undefined && <div className="h-3 w-32 rounded-lg bg-[var(--bg-elevated)]" />}
        </div>
      ) : (
        <>
          <p className={`text-3xl font-black tracking-tight ${valueColor}`}>{value}</p>
          {subtitle && <p className="text-[12px] text-[var(--text-muted)] mt-1">{subtitle}</p>}
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
      className="flex items-center gap-4 px-4 py-3 bg-[var(--bg-card)] hover:bg-[var(--bg-hover)] border border-[var(--border)] rounded-[var(--radius-lg)] shadow-[var(--shadow-card)] transition-colors group"
      style={{ borderInlineStart: `3px solid ${borderColor}` }}
    >
      {children}
    </Link>
  )
}

// ─── Project Card ─────────────────────────────────────────────────────────────
function ProjectCard({ proj }: { proj: ProjectProgress }) {
  const statusStyle: Record<string, string> = {
    active:    'bg-[var(--accent-primary-light)] text-[var(--accent-primary)] border border-[var(--accent-secondary)]',
    on_hold:   'bg-[var(--warning-bg)] text-[var(--warning-text)] border border-[var(--warning-border)]',
    completed: 'bg-[var(--status-neutral-bg)] text-[var(--status-neutral-text)] border border-[var(--status-neutral-border)]',
  }
  const statusLabel: Record<string, string> = {
    active: 'פעיל', on_hold: 'מושהה', completed: 'הושלם',
  }

  return (
    <Link
      href={`/projects/${proj.id}`}
      className="block bg-[var(--bg-card)] p-5 border border-[var(--border)] rounded-[var(--radius-lg)] shadow-[var(--shadow-card)] hover:border-[var(--accent-primary)] hover:scale-[1.01] transition-all duration-150 group"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-[var(--text-primary)] text-[14px] truncate tracking-tight">
            {proj.title}
          </h3>
          <p className="text-[12px] text-[var(--text-muted)] mt-0.5 truncate">{proj.clientName}</p>
        </div>
        <span className={`text-[11px] font-semibold px-2.5 py-1 shrink-0 mr-2 rounded-lg ${statusStyle[proj.status] ?? statusStyle.completed}`}>
          {statusLabel[proj.status] ?? proj.status}
        </span>
      </div>

      {proj.currentStageName !== '—' && (
        <p className="text-[12px] text-[var(--text-secondary)] mb-3 truncate">
          <span className="text-[var(--text-muted)]">שלב נוכחי: </span>{proj.currentStageName}
        </p>
      )}

      {/* Progress bar */}
      {proj.totalStages > 0 ? (
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] text-[var(--text-secondary)]">
              {proj.completedStages}/{proj.totalStages} שלבים
            </span>
            <span className="text-[11px] font-bold text-[var(--accent-primary)]">
              {proj.progressPercent}%
            </span>
          </div>
          <div className="w-full overflow-hidden" style={{ height: '3px', backgroundColor: 'var(--bg-elevated)', borderRadius: '1px' }}>
            <div
              style={{
                height: '3px',
                width: `${proj.progressPercent}%`,
                backgroundColor: 'var(--accent-primary)',
                borderRadius: '1px',
                transition: 'width 0.4s ease',
                minWidth: proj.progressPercent > 0 ? '3px' : '0px',
              }}
            />
          </div>
        </div>
      ) : (
        <p className="text-[11px] text-[var(--text-muted)] italic">אין שלבים מוגדרים</p>
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
  const [showCompleted, setShowCompleted] = useState(false)

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
  const completed = (todos ?? []).filter((t) => t.done)

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
        className="animate-pulse bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius)] shadow-[var(--shadow-card)]"
        style={{ padding: '16px 20px', height: 120 }}
      />
    )
  }

  return (
    <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius)] shadow-[var(--shadow-card)] overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-[var(--border)]">
        <div className="flex items-center gap-2">
          <span className="text-[13px] font-bold text-[var(--text-primary)]">משימות</span>
          {totalCount > 0 && (
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[var(--accent-primary-light)] text-[var(--accent-primary)]">
              {totalCount}
            </span>
          )}
        </div>
        <Link
          href="/todos"
          className="text-[12px] font-semibold text-[var(--accent-primary)]"
          style={{ textDecoration: 'none' }}
        >
          לכל הרשימה →
        </Link>
      </div>

      {/* Body — open todos */}
      {pending.length === 0 && undoQueue.length === 0 ? (
        <div className="px-5 py-6 text-center text-[13px] text-[var(--text-muted)]">
          אין משימות פתוחות
        </div>
      ) : (
        <>
          <div className="py-2 px-3 space-y-1" style={{ maxHeight: 220, overflowY: 'auto' }}>
            {Object.entries(groups).map(([project, { projectId, items }]) => (
              <div key={project}>
                {/* Project group header — clickable link to status tab */}
                <div className="px-2 pt-2 pb-1">
                  {projectId ? (
                    <Link
                      href={`/projects/${projectId}?tab=status`}
                      className="text-[10px] font-bold uppercase tracking-[0.07em] hover:underline"
                      style={{ color: 'var(--text-muted)' }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = 'var(--accent-primary)' }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)' }}
                    >
                      {project}
                    </Link>
                  ) : (
                    <p className="text-[10px] font-bold uppercase tracking-[0.07em] text-[var(--text-muted)]">
                      {project}
                    </p>
                  )}
                </div>
                {items.map((todo) => (
                  <div
                    key={todo.id}
                    className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-[var(--bg-hover)] transition-colors"
                    style={{ borderInlineStart: '3px solid var(--accent-primary)' }}
                  >
                    <button
                      onClick={() => markDone(todo)}
                      className="w-4 h-4 rounded-full border-2 flex-shrink-0 transition-colors hover:border-[var(--accent-primary)]"
                      style={{ borderColor: 'var(--border-strong)' }}
                      title="סמן כבוצע"
                    />
                    <span className="flex-1 text-[12px] text-[var(--text-primary)] truncate">{todo.task}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full flex-shrink-0 bg-[var(--accent-secondary-light)] text-white font-semibold">
                      {formatDate(todo.created_at)}
                    </span>
                  </div>
                ))}
              </div>
            ))}
          </div>

          {/* Undo bar */}
          {undoQueue.length > 0 && (
            <div className="px-4 py-2.5 flex flex-col gap-1 border-t border-[var(--border)] bg-[var(--bg-elevated)]">
              {undoQueue.map((todo) => (
                <div key={todo.id} className="flex items-center justify-between gap-3">
                  <span className="text-[11px] text-[var(--text-secondary)] truncate">✓ &nbsp;{todo.task}</span>
                  <button
                    onClick={() => undoDone(todo)}
                    className="text-[11px] font-semibold flex-shrink-0 transition-colors"
                    style={{ color: 'var(--accent-primary)' }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = 'var(--danger)' }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = 'var(--accent-primary)' }}
                  >
                    ביטול
                  </button>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Completed todos toggle */}
      {completed.length > 0 && (
        <div className="border-t border-[var(--border)]">
          <button
            onClick={() => setShowCompleted((v) => !v)}
            className="w-full flex items-center justify-between px-5 py-2.5 text-[11px] font-semibold transition-colors hover:bg-[var(--bg-hover)] text-[var(--text-muted)]"
          >
            <span>הצג משימות שהושלמו ({completed.length})</span>
            <span style={{ fontSize: '9px', transition: 'transform 0.2s', transform: showCompleted ? 'rotate(180deg)' : 'none', display: 'inline-block' }}>▼</span>
          </button>

          {showCompleted && (
            <div className="py-2 px-3 space-y-1 border-t border-[var(--border)]" style={{ maxHeight: 200, overflowY: 'auto' }}>
              {completed.map((todo) => (
                <div
                  key={todo.id}
                  className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-[var(--bg-hover)] transition-colors"
                  style={{ borderInlineStart: '3px solid var(--border-strong)' }}
                >
                  <span
                    className="w-4 h-4 rounded-full flex-shrink-0 flex items-center justify-center text-white bg-[var(--border-strong)]"
                    style={{ fontSize: '9px' }}
                  >
                    ✓
                  </span>
                  <span className="flex-1 text-[12px] truncate text-[var(--text-muted)]" style={{ textDecoration: 'line-through' }}>
                    {todo.task}
                  </span>
                  {todo.project_id && (
                    <Link
                      href={`/projects/${todo.project_id}?tab=status`}
                      className="text-[10px] flex-shrink-0 transition-colors"
                      style={{ color: 'var(--accent-secondary-light)' }}
                      title="עבור לפרויקט"
                      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = 'var(--accent-primary)' }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = 'var(--accent-secondary-light)' }}
                    >
                      ↗
                    </Link>
                  )}
                  <span className="text-[10px] flex-shrink-0 text-[var(--border-strong)]">
                    {formatDate(todo.created_at)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ─── Light Sidebar Widget ───────────────────────────────────────────────────────
function SidebarWidget({
  activeProjects,
  loading,
  onNewClient,
  isAdmin,
}: {
  activeProjects: { id: string; title: string }[]
  loading: boolean
  onNewClient: () => void
  isAdmin: boolean
}) {
  const router = useRouter()

  return (
    <aside className="w-[220px] shrink-0 bg-[var(--bg-base)] flex flex-col">
      {/* Quick actions — admin only */}
      {isAdmin && (
        <div className="p-5 border-b border-[var(--border-strong)]">
          <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-[var(--text-muted)] mb-3">
            פעולות מהירות
          </p>
          <div className="space-y-2">
            <button
              onClick={() => router.push('/projects/new')}
              className="w-full rounded-lg bg-[var(--accent-primary)] hover:bg-[var(--accent-primary-hover)] text-white text-[13px] font-extrabold px-3 py-2.5 transition-colors text-right"
            >
              + פרויקט חדש
            </button>
            <button
              onClick={onNewClient}
              className="w-full rounded-lg border border-[var(--border)] hover:border-[var(--accent-secondary)] hover:bg-[var(--accent-secondary-light)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-[13px] font-medium px-3 py-2.5 transition-colors text-right"
            >
              + לקוח חדש
            </button>
          </div>
        </div>
      )}

      {/* Active projects list */}
      <div className="flex-1 flex flex-col min-h-0">
        <div className="px-5 py-4 flex items-center justify-between">
          <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-[var(--text-muted)]">
            פרויקטים פעילים
          </p>
          {!loading && (
            <span className="text-[11px] font-bold text-[var(--accent-primary)]">{activeProjects.length}</span>
          )}
        </div>

        <div className="flex-1 overflow-y-auto px-3 pb-5 space-y-0.5">
          {loading ? (
            <div className="space-y-2 px-2 animate-pulse">
              {[1, 2, 3, 4].map((n) => (
                <div key={n} className="h-8 rounded-lg bg-[var(--bg-base)]" />
              ))}
            </div>
          ) : activeProjects.length === 0 ? (
            <p className="text-[12px] text-[var(--text-muted)] italic px-2">אין פרויקטים פעילים</p>
          ) : (
            activeProjects.map((proj) => (
              <Link
                key={proj.id}
                href={`/projects/${proj.id}`}
                className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-[var(--accent-primary-light)] transition-colors group"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-primary)] shrink-0" />
                <span className="text-[12px] text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] truncate transition-colors">
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
      <div className="flex-1 bg-[var(--bg-base)] p-8 overflow-y-auto min-w-0">
        <Breadcrumb items={[{ label: 'דשבורד' }]} />
        <div className="space-y-7">

        {/* Greeting */}
        <div>
          <h1 className="text-[22px] font-black text-[var(--text-primary)] tracking-tight">
            שלום, {fullName} 👋
          </h1>
          <p className="text-[13px] text-[var(--text-muted)] mt-1">{hebrewDate()}</p>
        </div>

        {/* ── KPI CARDS ── */}
        <div className="space-y-3">
          {/* Row 1 */}
          <div className={`grid gap-3 ${isAdmin ? 'grid-cols-3' : 'grid-cols-2'}`}>
            <KpiCard
              label="פרויקטים פעילים"
              value={loading ? '—' : data.activeProjectsCount}
              valueColor="text-[var(--accent-primary)]"
              loading={loading}
              href="/projects?status=active"
              featuredTop
            />
            {isAdmin && (
              <KpiCard
                label='סה"כ גבייה'
                value={loading ? '—' : fmt(data.totalPaid)}
                subtitle={loading ? undefined : `מתוך ${fmt(data.totalContract)} חוזים`}
                valueColor="text-[var(--accent-primary)]"
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
                valueColor="text-[var(--danger-text)]"
                loading={loading}
                href="/reports#outstanding"
              />
              <KpiCard
                label="ממתינים לתשלום"
                value={loading ? '—' : data.waitingPaymentCount}
                valueColor="text-[var(--warning-text)]"
                bg="bg-[var(--bg-card)]"
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
                valueColor="text-[var(--danger-text)]"
                bg="bg-[var(--bg-card)]"
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
            <h2 className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-[0.08em] mb-3">
              דורש טיפול עכשיו
            </h2>

            {loading ? (
              <div className="space-y-2 animate-pulse">
                {[1, 2, 3].map((n) => (
                  <div key={n} className="h-12 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border)]" />
                ))}
              </div>
            ) : allAlertsEmpty ? (
              <div
                className="flex items-center gap-3 px-4 py-3 bg-[var(--accent-primary-light)]"
                style={{ borderRadius: '10px', border: '0.5px solid var(--accent-secondary)' }}
              >
                <span className="text-[var(--accent-primary)] text-base">✓</span>
                <span className="text-[13px] font-semibold text-[var(--accent-primary)]">אין פריטים דחופים</span>
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
                        <AlertRow key={`inv-${i}`} href={`/projects/${s.projectId}`} borderColor="var(--danger-dot)">
                          <span className="text-[10px] font-bold text-[var(--danger-text)] uppercase tracking-[0.08em] shrink-0">לא חויב</span>
                          <span className="font-semibold text-[var(--text-primary)] text-[13px] truncate">{s.projectTitle}</span>
                          <span className="text-[var(--text-secondary)] text-[13px] truncate">{s.stageName}</span>
                          <span className="font-black text-[var(--danger-text)] text-[13px] mr-auto shrink-0" dir="ltr">{fmt(s.amount)}</span>
                        </AlertRow>
                      )
                    }
                    if (entry.kind === 'pay') {
                      const s = entry.data as AlertStageItem
                      return (
                        <AlertRow key={`pay-${i}`} href={`/projects/${s.projectId}`} borderColor="var(--warning-dot)">
                          <span className="text-[10px] font-bold text-[var(--warning-text)] uppercase tracking-[0.08em] shrink-0">לא שולם</span>
                          <span className="font-semibold text-[var(--text-primary)] text-[13px] truncate">{s.projectTitle}</span>
                          <span className="text-[var(--text-secondary)] text-[13px] truncate">{s.stageName}</span>
                          {s.daysSince !== undefined && (
                            <span className="text-[12px] text-[var(--warning-text)] shrink-0">{s.daysSince} ימים</span>
                          )}
                          <span className="font-black text-[var(--warning-text)] text-[13px] mr-auto shrink-0" dir="ltr">{fmt(s.amount)}</span>
                        </AlertRow>
                      )
                    }
                    const p = entry.data as InactiveProjectItem
                    return (
                      <AlertRow key={`inact-${i}`} href={`/projects/${p.projectId}`} borderColor="var(--border-strong)">
                        <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-[0.08em] shrink-0">לא פעיל</span>
                        <span className="font-semibold text-[var(--text-primary)] text-[13px] truncate">{p.projectTitle}</span>
                        <span className="text-[var(--text-secondary)] text-[13px] truncate">{p.clientName}</span>
                        <span className="text-[12px] text-[var(--text-muted)] mr-auto shrink-0">{p.daysSinceActivity} ימים ללא פעילות</span>
                      </AlertRow>
                    )
                  })}

                  {hiddenCount > 0 && (
                    <button
                      onClick={() => setShowAllAlerts((v) => !v)}
                      className="w-full flex items-center justify-center gap-1.5 py-2.5 text-[12px] font-semibold transition-colors rounded-[10px] border border-[var(--border-strong)] [border-style:dashed] bg-[var(--bg-card)] hover:border-[var(--accent-primary)] hover:text-[var(--accent-primary)] hover:bg-[var(--accent-primary-light)]"
                      style={{
                        color: showAllAlerts ? 'var(--accent-primary)' : 'var(--text-muted)',
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
          <h2 className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-[0.08em] mb-3">
            משימות
          </h2>
          <TodoWidget />
        </div>

        {/* ── ACTIVE PROJECTS GRID ── */}
        <div>
          <h2 className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-[0.08em] mb-3">
            פרויקטים פעילים
          </h2>

          {loading ? (
            <div className="grid grid-cols-2 gap-3">
              {[1, 2, 3, 4].map((n) => (
                <div key={n} className="h-36 rounded-lg bg-[var(--bg-elevated)] animate-pulse border border-[var(--border)]" />
              ))}
            </div>
          ) : data.projectsWithProgress.length === 0 ? (
            <div className="px-5 py-8 text-center bg-[var(--bg-card)] rounded-[var(--radius)] border border-[var(--border)]">
              <p className="text-[13px] text-[var(--text-muted)]">אין פרויקטים פעילים כרגע</p>
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
        isAdmin={isAdmin}
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
