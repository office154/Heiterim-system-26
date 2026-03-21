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

// ─── Utilities ────────────────────────────────────────────────────────────────

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
        className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl mx-4 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-[15px] font-bold text-gray-900">{title}</h2>
          <button
            onClick={onClose}
            className="h-8 w-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors text-lg"
          >
            ✕
          </button>
        </div>
        <div className="max-h-[60vh] overflow-y-auto">
          <table className="w-full text-[13px]">
            <thead className="sticky top-0 bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-5 py-3 text-right font-semibold text-gray-500 text-[11px] uppercase tracking-wide">פרויקט</th>
                <th className="px-5 py-3 text-right font-semibold text-gray-500 text-[11px] uppercase tracking-wide">לקוח</th>
                <th className="px-5 py-3 text-right font-semibold text-gray-500 text-[11px] uppercase tracking-wide">שלב</th>
                <th className="px-5 py-3 text-left font-semibold text-gray-500 text-[11px] uppercase tracking-wide">סכום</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, i) => (
                <tr key={i} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3">
                    <Link
                      href={`/projects/${item.projectId}`}
                      onClick={onClose}
                      className="font-semibold text-[#6366f1] hover:underline"
                    >
                      {item.projectTitle}
                    </Link>
                  </td>
                  <td className="px-5 py-3 text-gray-500">{item.clientName}</td>
                  <td className="px-5 py-3 text-gray-700">{item.stageName}</td>
                  <td className="px-5 py-3 font-semibold text-gray-900 text-left" dir="ltr">
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
  valueColor = 'text-gray-900',
  bg = 'bg-white',
  border = 'border-gray-200',
  loading,
  onClick,
}: {
  label: string
  value: string | number
  subtitle?: string
  valueColor?: string
  bg?: string
  border?: string
  loading?: boolean
  onClick?: () => void
}) {
  const body = (
    <div className={`rounded-xl border p-5 h-full ${bg} ${border} ${onClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}`}
      style={{ borderWidth: '0.5px' }}
    >
      <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400 mb-2">{label}</p>
      {loading ? (
        <div className="space-y-2 animate-pulse">
          <div className="h-8 w-24 rounded-lg bg-gray-100" />
          {subtitle !== undefined && <div className="h-3 w-32 rounded bg-gray-100" />}
        </div>
      ) : (
        <>
          <p className={`text-3xl font-bold tracking-tight ${valueColor}`}>{value}</p>
          {subtitle && <p className="text-[12px] text-gray-400 mt-1">{subtitle}</p>}
        </>
      )}
    </div>
  )

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
      className={`flex items-center gap-4 px-4 py-3 bg-white rounded-lg border-l-4 border-r-0 border-t border-b border-gray-100 hover:bg-gray-50 transition-colors group ${borderColor}`}
      style={{ borderTopWidth: '0.5px', borderBottomWidth: '0.5px', borderRightWidth: '0.5px' }}
    >
      {children}
    </Link>
  )
}

// ─── Project Card ─────────────────────────────────────────────────────────────

function ProjectCard({ proj }: { proj: ProjectProgress }) {
  return (
    <Link
      href={`/projects/${proj.id}`}
      className="block bg-white rounded-xl p-5 hover:border-[#6366f1] hover:shadow-[0_0_0_2px_#6366f1] transition-all group"
      style={{ border: '0.5px solid #e5e7eb' }}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-gray-900 text-[14px] truncate group-hover:text-[#6366f1] transition-colors">
            {proj.title}
          </h3>
          <p className="text-[12px] text-gray-400 mt-0.5 truncate">{proj.clientName}</p>
        </div>
        <span
          className={`text-[11px] font-semibold px-2.5 py-1 rounded-full shrink-0 mr-2 ${
            proj.status === 'active'
              ? 'bg-green-100 text-green-700'
              : 'bg-yellow-100 text-yellow-700'
          }`}
        >
          {proj.status === 'active' ? 'פעיל' : 'מושהה'}
        </span>
      </div>

      {proj.currentStageName !== '—' && (
        <p className="text-[12px] text-gray-500 mb-3 truncate">
          <span className="text-gray-400">שלב נוכחי: </span>{proj.currentStageName}
        </p>
      )}

      {/* Progress bar */}
      {proj.totalStages > 0 ? (
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] text-gray-500">
              {proj.completedStages}/{proj.totalStages} שלבים
            </span>
            <span className="text-[11px] font-bold text-[#6366f1]">
              {proj.progressPercent}%
            </span>
          </div>
          {/* Track: always visible, fill grows with progress */}
          <div
            className="w-full overflow-hidden"
            style={{ height: '6px', backgroundColor: '#e5e7eb', borderRadius: '3px' }}
          >
            <div
              style={{
                height: '6px',
                width: `${proj.progressPercent}%`,
                backgroundColor: '#6366f1',
                borderRadius: '3px',
                transition: 'width 0.4s ease',
                minWidth: proj.progressPercent > 0 ? '6px' : '0px',
              }}
            />
          </div>
        </div>
      ) : (
        <p className="text-[11px] text-gray-400 italic">אין שלבים מוגדרים</p>
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
    <aside className="w-[220px] shrink-0 bg-[#1a1a2e] flex flex-col">
      {/* Quick actions */}
      <div className="p-5 border-b border-white/10">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-white/40 mb-3">
          פעולות מהירות
        </p>
        <div className="space-y-2">
          <button
            onClick={() => router.push('/projects/new')}
            className="w-full bg-[#6366f1] hover:bg-[#4f46e5] text-white text-[13px] font-semibold px-3 py-2.5 rounded-lg transition-colors text-right"
          >
            + פרויקט חדש
          </button>
          <button
            onClick={onNewClient}
            className="w-full border border-white/20 hover:border-white/40 hover:bg-white/5 text-white/80 hover:text-white text-[13px] font-medium px-3 py-2.5 rounded-lg transition-colors text-right"
          >
            + לקוח חדש
          </button>
        </div>
      </div>

      {/* Active projects list */}
      <div className="flex-1 flex flex-col min-h-0">
        <div className="px-5 py-4 flex items-center justify-between">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-white/40">
            פרויקטים פעילים
          </p>
          {!loading && (
            <span className="text-[11px] font-bold text-[#6366f1]">{activeProjects.length}</span>
          )}
        </div>

        <div className="flex-1 overflow-y-auto px-3 pb-5 space-y-0.5">
          {loading ? (
            <div className="space-y-2 px-2 animate-pulse">
              {[1, 2, 3, 4].map((n) => (
                <div key={n} className="h-8 rounded-lg bg-white/5" />
              ))}
            </div>
          ) : activeProjects.length === 0 ? (
            <p className="text-[12px] text-white/30 italic px-2">אין פרויקטים פעילים</p>
          ) : (
            activeProjects.map((proj) => (
              <Link
                key={proj.id}
                href={`/projects/${proj.id}`}
                className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-white/10 transition-colors group"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 shrink-0" />
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
    /* -m-8 escapes the layout's p-8, giving us full-bleed control */
    <div className="flex -m-8 min-h-screen">

      {/* ── MAIN CONTENT (right in RTL) ── */}
      <div className="flex-1 bg-[#f5f4f0] p-8 overflow-y-auto space-y-7 min-w-0">

        {/* Greeting */}
        <div>
          <h1 className="text-[22px] font-bold text-gray-900 tracking-tight">
            שלום, {fullName} 👋
          </h1>
          <p className="text-[13px] text-gray-400 mt-1">{hebrewDate()}</p>
        </div>

        {/* ── KPI CARDS ── */}
        <div className="space-y-3">
          {/* Row 1 */}
          <div className={`grid gap-3 ${isAdmin ? 'grid-cols-3' : 'grid-cols-2'}`}>
            <KpiCard
              label='פרויקטים פעילים'
              value={loading ? '—' : data.activeProjectsCount}
              valueColor="text-[#6366f1]"
              loading={loading}
            />
            {isAdmin && (
              <KpiCard
                label='סה"כ גבייה'
                value={loading ? '—' : fmt(data.totalPaid)}
                subtitle={loading ? undefined : `מתוך ${fmt(data.totalContract)} חוזים`}
                valueColor="text-green-600"
                loading={loading}
              />
            )}
            <KpiCard
              label="לקוחות פעילים"
              value={loading ? '—' : data.activeClientsCount}
              loading={loading}
            />
          </div>

          {/* Row 2 — admin only */}
          {isAdmin && (
            <div className="grid grid-cols-3 gap-3">
              <KpiCard
                label="יתרה לגבייה"
                value={loading ? '—' : fmt(data.totalPendingCollection)}
                loading={loading}
              />
              <KpiCard
                label="ממתינים לתשלום"
                value={loading ? '—' : data.waitingPaymentCount}
                valueColor="text-red-600"
                bg="bg-[#fff5f5]"
                border="border-[#fecaca]"
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
                valueColor="text-orange-600"
                bg="bg-[#fffbeb]"
                border="border-[#fed7aa]"
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
            <h2 className="text-[13px] font-bold text-gray-500 uppercase tracking-widest mb-3">
              דורש טיפול עכשיו
            </h2>

            {loading ? (
              <div className="space-y-2 animate-pulse">
                {[1, 2, 3].map((n) => (
                  <div key={n} className="h-12 rounded-lg bg-white border border-gray-100" />
                ))}
              </div>
            ) : allAlertsEmpty ? (
              <div className="flex items-center gap-3 px-4 py-3 bg-green-50 rounded-lg border border-green-100"
                style={{ borderWidth: '0.5px' }}>
                <span className="text-green-600 text-base">✓</span>
                <span className="text-[13px] font-semibold text-green-700">אין פריטים דחופים</span>
              </div>
            ) : (
              <div className="space-y-2">
                {/* 🔴 בוצע ולא חויב */}
                {data.notInvoicedStages.map((s, i) => (
                  <AlertRow key={`inv-${i}`} href={`/projects/${s.projectId}`} borderColor="border-l-red-500">
                    <span className="text-[11px] font-bold text-red-500 uppercase tracking-wide shrink-0">
                      לא חויב
                    </span>
                    <span className="font-semibold text-gray-800 text-[13px] truncate">
                      {s.projectTitle}
                    </span>
                    <span className="text-gray-400 text-[13px] truncate">{s.stageName}</span>
                    <span className="font-bold text-red-600 text-[13px] mr-auto shrink-0" dir="ltr">
                      {fmt(s.amount)}
                    </span>
                  </AlertRow>
                ))}

                {/* 🟠 חויב ולא שולם */}
                {data.notPaidStages.map((s, i) => (
                  <AlertRow key={`pay-${i}`} href={`/projects/${s.projectId}`} borderColor="border-l-orange-500">
                    <span className="text-[11px] font-bold text-orange-500 uppercase tracking-wide shrink-0">
                      לא שולם
                    </span>
                    <span className="font-semibold text-gray-800 text-[13px] truncate">
                      {s.projectTitle}
                    </span>
                    <span className="text-gray-400 text-[13px] truncate">{s.stageName}</span>
                    {s.daysSince !== undefined && (
                      <span className="text-[12px] text-orange-400 shrink-0">
                        {s.daysSince} ימים
                      </span>
                    )}
                    <span className="font-bold text-orange-600 text-[13px] mr-auto shrink-0" dir="ltr">
                      {fmt(s.amount)}
                    </span>
                  </AlertRow>
                ))}

                {/* ⚫ ללא פעילות */}
                {data.inactiveProjects.map((p, i) => (
                  <AlertRow key={`inact-${i}`} href={`/projects/${p.projectId}`} borderColor="border-l-gray-400">
                    <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wide shrink-0">
                      לא פעיל
                    </span>
                    <span className="font-semibold text-gray-800 text-[13px] truncate">
                      {p.projectTitle}
                    </span>
                    <span className="text-gray-400 text-[13px] truncate">{p.clientName}</span>
                    <span className="text-[12px] text-gray-400 mr-auto shrink-0">
                      {p.daysSinceActivity} ימים ללא פעילות
                    </span>
                  </AlertRow>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── ACTIVE PROJECTS GRID ── */}
        <div>
          <h2 className="text-[13px] font-bold text-gray-500 uppercase tracking-widest mb-3">
            פרויקטים פעילים
          </h2>

          {loading ? (
            <div className="grid grid-cols-2 gap-3">
              {[1, 2, 3, 4].map((n) => (
                <div key={n} className="h-36 rounded-xl bg-white animate-pulse border border-gray-100" />
              ))}
            </div>
          ) : data.projectsWithProgress.length === 0 ? (
            <div className="rounded-xl bg-white border border-gray-100 px-5 py-8 text-center"
              style={{ borderWidth: '0.5px' }}>
              <p className="text-[13px] text-gray-400">אין פרויקטים פעילים כרגע</p>
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
