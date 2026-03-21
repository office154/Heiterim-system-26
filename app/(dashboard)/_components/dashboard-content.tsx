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
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-white mx-4 overflow-hidden"
        style={{ borderRadius: '4px', border: '1px solid #E0DDD4', boxShadow: '0 8px 40px rgba(43,43,43,.2)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E0DDD4]">
          <h2 className="text-[15px] font-bold text-[#2B2B2B] tracking-tight">{title}</h2>
          <button
            onClick={onClose}
            className="h-8 w-8 flex items-center justify-center rounded-[2px] text-[#9A9690] hover:text-[#2B2B2B] hover:bg-[#F0EDE4] transition-colors text-lg"
          >
            ✕
          </button>
        </div>
        <div className="max-h-[60vh] overflow-y-auto">
          <table className="w-full text-[13px]">
            <thead className="sticky top-0 bg-[#F8F6F2] border-b border-[#E0DDD4]">
              <tr>
                <th className="px-5 py-3 text-right text-[10px] font-bold uppercase tracking-[0.08em] text-[#9A9690]">פרויקט</th>
                <th className="px-5 py-3 text-right text-[10px] font-bold uppercase tracking-[0.08em] text-[#9A9690]">לקוח</th>
                <th className="px-5 py-3 text-right text-[10px] font-bold uppercase tracking-[0.08em] text-[#9A9690]">שלב</th>
                <th className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-[0.08em] text-[#9A9690]">סכום</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, i) => (
                <tr key={i} className="border-b border-[#F0EDE4] hover:bg-[#F8F6F2] transition-colors">
                  <td className="px-5 py-3">
                    <Link
                      href={`/projects/${item.projectId}`}
                      onClick={onClose}
                      className="font-semibold text-[#E8C420] hover:underline"
                    >
                      {item.projectTitle}
                    </Link>
                  </td>
                  <td className="px-5 py-3 text-[#6A6660]">{item.clientName}</td>
                  <td className="px-5 py-3 text-[#2B2B2B]">{item.stageName}</td>
                  <td className="px-5 py-3 font-black text-[#2B2B2B] text-left" dir="ltr">
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
  valueColor = 'text-[#2B2B2B]',
  bg = 'bg-white',
  borderColor = '#E0DDD4',
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
        borderRadius: '2px',
        borderTop: featuredTop ? `3px solid #E8C420` : undefined,
        boxShadow: '0 3px 0 #C8C4BC, 0 5px 18px rgba(43,43,43,.08)',
      }}
      onMouseEnter={(e) => {
        if (!isInteractive) return
        const el = e.currentTarget as HTMLElement
        el.style.borderColor = '#E8C420'
        el.style.boxShadow = '0 3px 0 #C8C4BC, 0 5px 18px rgba(232,196,32,.1)'
        el.style.transform = 'scale(1.01)'
      }}
      onMouseLeave={(e) => {
        if (!isInteractive) return
        const el = e.currentTarget as HTMLElement
        el.style.borderColor = borderColor
        el.style.boxShadow = '0 3px 0 #C8C4BC, 0 5px 18px rgba(43,43,43,.08)'
        el.style.transform = 'scale(1)'
      }}
    >
      <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-[#9A9690] mb-2">{label}</p>
      {loading ? (
        <div className="space-y-2 animate-pulse">
          <div className="h-8 w-24 rounded-[2px] bg-[#E8E4DC]" />
          {subtitle !== undefined && <div className="h-3 w-32 rounded-[2px] bg-[#E8E4DC]" />}
        </div>
      ) : (
        <>
          <p className={`text-3xl font-black tracking-tight ${valueColor}`}>{value}</p>
          {subtitle && <p className="text-[12px] text-[#9A9690] mt-1">{subtitle}</p>}
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
      className="flex items-center gap-4 px-4 py-3 bg-white hover:bg-[#F8F6F2] transition-colors group"
      style={{
        borderRight: `3px solid ${borderColor}`,
        borderTop: '0.5px solid #E0DDD4',
        borderBottom: '0.5px solid #E0DDD4',
        borderLeft: '0.5px solid #E0DDD4',
        borderRadius: '2px',
      }}
    >
      {children}
    </Link>
  )
}

// ─── Project Card ─────────────────────────────────────────────────────────────
function ProjectCard({ proj }: { proj: ProjectProgress }) {
  const statusStyle: Record<string, string> = {
    active:    'bg-[#E8F5F3] text-[#1A7A6E] border border-[#A8D4D0]',
    on_hold:   'bg-[#FEF9E7] text-[#D4820A] border border-[#F0D070]',
    completed: 'bg-[#F0EDE4] text-[#6A6660] border border-[#C8C4BC]',
  }
  const statusLabel: Record<string, string> = {
    active: 'פעיל', on_hold: 'מושהה', completed: 'הושלם',
  }

  return (
    <Link
      href={`/projects/${proj.id}`}
      className="block bg-white p-5 transition-all duration-150 group"
      style={{
        border: '1px solid #E0DDD4',
        borderRadius: '2px',
        boxShadow: '0 3px 0 #C8C4BC, 0 5px 18px rgba(43,43,43,.08)',
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget as HTMLAnchorElement
        el.style.borderColor = '#E8C420'
        el.style.boxShadow = '0 3px 0 #C8C4BC, 0 5px 18px rgba(232,196,32,.1)'
        el.style.transform = 'scale(1.01)'
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget as HTMLAnchorElement
        el.style.borderColor = '#E0DDD4'
        el.style.boxShadow = '0 3px 0 #C8C4BC, 0 5px 18px rgba(43,43,43,.08)'
        el.style.transform = 'scale(1)'
      }}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-[#2B2B2B] text-[14px] truncate tracking-tight">
            {proj.title}
          </h3>
          <p className="text-[12px] text-[#9A9690] mt-0.5 truncate">{proj.clientName}</p>
        </div>
        <span className={`text-[11px] font-semibold px-2.5 py-1 shrink-0 mr-2 rounded-[2px] ${statusStyle[proj.status] ?? statusStyle.completed}`}>
          {statusLabel[proj.status] ?? proj.status}
        </span>
      </div>

      {proj.currentStageName !== '—' && (
        <p className="text-[12px] text-[#6A6660] mb-3 truncate">
          <span className="text-[#9A9690]">שלב נוכחי: </span>{proj.currentStageName}
        </p>
      )}

      {/* Progress bar */}
      {proj.totalStages > 0 ? (
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] text-[#6A6660]">
              {proj.completedStages}/{proj.totalStages} שלבים
            </span>
            <span className="text-[11px] font-bold text-[#E8C420]">
              {proj.progressPercent}%
            </span>
          </div>
          <div className="w-full overflow-hidden" style={{ height: '3px', backgroundColor: '#E8E4DC', borderRadius: '1px' }}>
            <div
              style={{
                height: '3px',
                width: `${proj.progressPercent}%`,
                backgroundColor: '#E8C420',
                borderRadius: '1px',
                transition: 'width 0.4s ease',
                minWidth: proj.progressPercent > 0 ? '3px' : '0px',
              }}
            />
          </div>
        </div>
      ) : (
        <p className="text-[11px] text-[#9A9690] italic">אין שלבים מוגדרים</p>
      )}
    </Link>
  )
}

// ─── Dark Sidebar Widget ───────────────────────────────────────────────────────
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
    <aside className="w-[220px] shrink-0 bg-[#2B2B2B] flex flex-col">
      {/* Quick actions */}
      <div className="p-5 border-b border-white/10">
        <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-white/40 mb-3">
          פעולות מהירות
        </p>
        <div className="space-y-2">
          <button
            onClick={() => router.push('/projects/new')}
            className="w-full rounded-[2px] bg-[#E8C420] hover:bg-[#D4B010] text-[#2B2B2B] text-[13px] font-extrabold px-3 py-2.5 transition-colors text-right"
          >
            + פרויקט חדש
          </button>
          <button
            onClick={onNewClient}
            className="w-full rounded-[2px] border border-white/20 hover:border-white/40 hover:bg-white/5 text-white/80 hover:text-white text-[13px] font-medium px-3 py-2.5 transition-colors text-right"
          >
            + לקוח חדש
          </button>
        </div>
      </div>

      {/* Active projects list */}
      <div className="flex-1 flex flex-col min-h-0">
        <div className="px-5 py-4 flex items-center justify-between">
          <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-white/40">
            פרויקטים פעילים
          </p>
          {!loading && (
            <span className="text-[11px] font-bold text-[#E8C420]">{activeProjects.length}</span>
          )}
        </div>

        <div className="flex-1 overflow-y-auto px-3 pb-5 space-y-0.5">
          {loading ? (
            <div className="space-y-2 px-2 animate-pulse">
              {[1, 2, 3, 4].map((n) => (
                <div key={n} className="h-8 rounded-[2px] bg-white/5" />
              ))}
            </div>
          ) : activeProjects.length === 0 ? (
            <p className="text-[12px] text-white/30 italic px-2">אין פרויקטים פעילים</p>
          ) : (
            activeProjects.map((proj) => (
              <Link
                key={proj.id}
                href={`/projects/${proj.id}`}
                className="flex items-center gap-2.5 px-3 py-2 rounded-[2px] hover:bg-white/10 transition-colors group"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#E8C420] shrink-0" />
                <span className="text-[12px] text-white/70 group-hover:text-white truncate transition-colors">
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

  const loading = isLoading || !data

  const allAlertsEmpty =
    !loading &&
    data.notInvoicedStages.length === 0 &&
    data.notPaidStages.length === 0 &&
    data.inactiveProjects.length === 0

  return (
    <div className="flex -m-8 min-h-screen">

      {/* ── MAIN CONTENT (right in RTL) ── */}
      <div className="flex-1 bg-[#F0EDE4] p-8 overflow-y-auto space-y-7 min-w-0">

        {/* Greeting */}
        <div>
          <h1 className="text-[22px] font-black text-[#2B2B2B] tracking-tight">
            שלום, {fullName} 👋
          </h1>
          <p className="text-[13px] text-[#9A9690] mt-1">{hebrewDate()}</p>
        </div>

        {/* ── KPI CARDS ── */}
        <div className="space-y-3">
          {/* Row 1 */}
          <div className={`grid gap-3 ${isAdmin ? 'grid-cols-3' : 'grid-cols-2'}`}>
            <KpiCard
              label="פרויקטים פעילים"
              value={loading ? '—' : data.activeProjectsCount}
              valueColor="text-[#E8C420]"
              loading={loading}
              href="/projects?status=active"
              featuredTop
            />
            {isAdmin && (
              <KpiCard
                label='סה"כ גבייה'
                value={loading ? '—' : fmt(data.totalPaid)}
                subtitle={loading ? undefined : `מתוך ${fmt(data.totalContract)} חוזים`}
                valueColor="text-[#1A7A6E]"
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
                valueColor="text-[#C0392B]"
                bg="bg-white"
                borderColor="#fecaca"
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
                valueColor="text-[#D4820A]"
                bg="bg-white"
                borderColor="#fed7aa"
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
            <h2 className="text-[10px] font-bold text-[#9A9690] uppercase tracking-[0.08em] mb-3">
              דורש טיפול עכשיו
            </h2>

            {loading ? (
              <div className="space-y-2 animate-pulse">
                {[1, 2, 3].map((n) => (
                  <div key={n} className="h-12 rounded-[2px] bg-white border border-[#E0DDD4]" />
                ))}
              </div>
            ) : allAlertsEmpty ? (
              <div
                className="flex items-center gap-3 px-4 py-3"
                style={{ background: '#E8F5F3', borderRadius: '2px', border: '0.5px solid #A8D4D0' }}
              >
                <span className="text-[#1A7A6E] text-base">✓</span>
                <span className="text-[13px] font-semibold text-[#1A7A6E]">אין פריטים דחופים</span>
              </div>
            ) : (
              <div className="space-y-2">
                {/* לא חויב */}
                {data.notInvoicedStages.map((s, i) => (
                  <AlertRow key={`inv-${i}`} href={`/projects/${s.projectId}`} borderColor="#C0392B">
                    <span className="text-[10px] font-bold text-[#C0392B] uppercase tracking-[0.08em] shrink-0">לא חויב</span>
                    <span className="font-semibold text-[#2B2B2B] text-[13px] truncate">{s.projectTitle}</span>
                    <span className="text-[#6A6660] text-[13px] truncate">{s.stageName}</span>
                    <span className="font-black text-[#C0392B] text-[13px] mr-auto shrink-0" dir="ltr">{fmt(s.amount)}</span>
                  </AlertRow>
                ))}

                {/* לא שולם */}
                {data.notPaidStages.map((s, i) => (
                  <AlertRow key={`pay-${i}`} href={`/projects/${s.projectId}`} borderColor="#D4820A">
                    <span className="text-[10px] font-bold text-[#D4820A] uppercase tracking-[0.08em] shrink-0">לא שולם</span>
                    <span className="font-semibold text-[#2B2B2B] text-[13px] truncate">{s.projectTitle}</span>
                    <span className="text-[#6A6660] text-[13px] truncate">{s.stageName}</span>
                    {s.daysSince !== undefined && (
                      <span className="text-[12px] text-[#D4820A] shrink-0">{s.daysSince} ימים</span>
                    )}
                    <span className="font-black text-[#D4820A] text-[13px] mr-auto shrink-0" dir="ltr">{fmt(s.amount)}</span>
                  </AlertRow>
                ))}

                {/* ללא פעילות */}
                {data.inactiveProjects.map((p, i) => (
                  <AlertRow key={`inact-${i}`} href={`/projects/${p.projectId}`} borderColor="#9A9690">
                    <span className="text-[10px] font-bold text-[#9A9690] uppercase tracking-[0.08em] shrink-0">לא פעיל</span>
                    <span className="font-semibold text-[#2B2B2B] text-[13px] truncate">{p.projectTitle}</span>
                    <span className="text-[#6A6660] text-[13px] truncate">{p.clientName}</span>
                    <span className="text-[12px] text-[#9A9690] mr-auto shrink-0">{p.daysSinceActivity} ימים ללא פעילות</span>
                  </AlertRow>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── ACTIVE PROJECTS GRID ── */}
        <div>
          <h2 className="text-[10px] font-bold text-[#9A9690] uppercase tracking-[0.08em] mb-3">
            פרויקטים פעילים
          </h2>

          {loading ? (
            <div className="grid grid-cols-2 gap-3">
              {[1, 2, 3, 4].map((n) => (
                <div key={n} className="h-36 rounded-[2px] bg-white animate-pulse border border-[#E0DDD4]" />
              ))}
            </div>
          ) : data.projectsWithProgress.length === 0 ? (
            <div
              className="px-5 py-8 text-center bg-white"
              style={{ borderRadius: '2px', border: '0.5px solid #E0DDD4' }}
            >
              <p className="text-[13px] text-[#9A9690]">אין פרויקטים פעילים כרגע</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {data.projectsWithProgress.map((proj) => (
                <ProjectCard key={proj.id} proj={proj} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── DARK SIDEBAR (left in RTL) ── */}
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
