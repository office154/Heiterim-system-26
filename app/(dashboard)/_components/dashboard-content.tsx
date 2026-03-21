'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  useDashboardData,
  type AlertStageItem,
  type InactiveProjectItem,
} from '@/lib/hooks/use-dashboard'
import { CreateClientModal } from '@/components/create-client-modal'

interface DashboardContentProps {
  role: 'admin' | 'employee'
  fullName: string
}

function formatCurrency(n: number) {
  return '₪' + n.toLocaleString('he-IL')
}

// ─── Skeleton card ────────────────────────────────────────────────────────────
function SkeletonCard({ wide }: { wide?: boolean }) {
  return (
    <div className={`bg-white rounded-xl border border-[#E5E7EB] p-5 animate-pulse ${wide ? '' : ''}`}>
      <div className="h-3 w-28 rounded bg-[#E5E7EB] mb-3" />
      <div className="h-8 w-20 rounded bg-[#F6F7F9]" />
    </div>
  )
}

// ─── KPI Card ─────────────────────────────────────────────────────────────────
function KpiCard({
  label,
  value,
  accent,
  redTint,
  amberTint,
  loading,
  onClick,
  clickHint,
}: {
  label: string
  value: string | number
  accent?: boolean
  redTint?: boolean
  amberTint?: boolean
  loading?: boolean
  onClick?: () => void
  clickHint?: string
}) {
  const base = 'rounded-xl border p-5 text-right transition-colors'
  const style = redTint
    ? 'bg-red-50 border-red-200 hover:bg-red-100'
    : amberTint
    ? 'bg-amber-50 border-amber-200 hover:bg-amber-100'
    : 'bg-white border-[#E5E7EB]'

  const labelStyle = redTint
    ? 'text-red-500'
    : amberTint
    ? 'text-amber-600'
    : 'text-[#64748B]'

  const valueStyle = accent
    ? 'text-[#6366F1]'
    : redTint
    ? 'text-red-600'
    : amberTint
    ? 'text-amber-700'
    : 'text-[#0F172A]'

  if (loading) return <SkeletonCard />

  const inner = (
    <>
      <p className={`text-[11px] font-semibold uppercase tracking-widest mb-2 ${labelStyle}`}>
        {label}
      </p>
      <p className={`text-3xl font-bold tracking-tight ${valueStyle}`}>{value}</p>
      {clickHint && (
        <p className={`text-[11px] mt-2 ${redTint ? 'text-red-400' : 'text-amber-400'}`}>
          {clickHint}
        </p>
      )}
    </>
  )

  if (onClick) {
    return (
      <button className={`${base} ${style} w-full group`} onClick={onClick}>
        {inner}
      </button>
    )
  }

  return <div className={`${base} ${style}`}>{inner}</div>
}

// ─── Alert modal (cards 5 & 6) ────────────────────────────────────────────────
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl rounded-xl bg-white shadow-2xl mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-[#E5E7EB] px-6 py-4">
          <h2 className="text-[15px] font-semibold text-[#0F172A]">{title}</h2>
          <button
            onClick={onClose}
            className="h-7 w-7 flex items-center justify-center rounded-md text-[#64748B] hover:text-[#0F172A] hover:bg-[#F6F7F9] transition-colors text-lg leading-none"
          >
            ✕
          </button>
        </div>
        <div className="max-h-[60vh] overflow-y-auto">
          <table className="w-full text-[13px]">
            <thead className="sticky top-0 bg-white border-b border-[#E5E7EB]">
              <tr>
                <th className="px-5 py-3 text-right text-[11px] font-semibold text-[#64748B] uppercase tracking-wide">
                  פרויקט
                </th>
                <th className="px-5 py-3 text-right text-[11px] font-semibold text-[#64748B] uppercase tracking-wide">
                  לקוח
                </th>
                <th className="px-5 py-3 text-right text-[11px] font-semibold text-[#64748B] uppercase tracking-wide">
                  שלב
                </th>
                <th className="px-5 py-3 text-[11px] font-semibold text-[#64748B] uppercase tracking-wide text-left">
                  סכום
                </th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, i) => (
                <tr
                  key={i}
                  className="border-b border-[#F6F7F9] last:border-0 hover:bg-[#F6F7F9] transition-colors"
                >
                  <td className="px-5 py-3">
                    <Link
                      href={`/projects/${item.projectId}`}
                      onClick={onClose}
                      className="font-medium text-[#6366F1] hover:underline"
                    >
                      {item.projectTitle}
                    </Link>
                  </td>
                  <td className="px-5 py-3 text-[#64748B]">{item.clientName}</td>
                  <td className="px-5 py-3 text-[#0F172A]">{item.stageName}</td>
                  <td className="px-5 py-3 font-medium text-[#0F172A] text-left" dir="ltr">
                    {formatCurrency(item.amount)}
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

// ─── Collapsible alert group ──────────────────────────────────────────────────
function AlertGroup<T>({
  icon,
  title,
  badgeBg,
  items,
  renderRow,
}: {
  icon: string
  title: string
  badgeBg: string
  items: T[]
  renderRow: (item: T, i: number) => React.ReactNode
}) {
  const [open, setOpen] = useState(false)
  if (items.length === 0) return null

  return (
    <div className="rounded-xl border border-[#E5E7EB] bg-white overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-3 px-5 py-3.5 hover:bg-[#F6F7F9] transition-colors"
      >
        <span className="text-base leading-none">{icon}</span>
        <span className="text-[13px] font-semibold text-[#0F172A] flex-1 text-right">{title}</span>
        <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${badgeBg}`}>
          {items.length}
        </span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`text-[#64748B] transition-transform ${open ? 'rotate-180' : ''}`}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {open && (
        <div className="border-t border-[#E5E7EB]">
          <table className="w-full text-[13px]">
            <tbody>{items.map((item, i) => renderRow(item, i))}</tbody>
          </table>
        </div>
      )}
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────
export function DashboardContent({ role, fullName }: DashboardContentProps) {
  const isAdmin = role === 'admin'
  const { data, isLoading } = useDashboardData()
  const router = useRouter()
  const [clientModalOpen, setClientModalOpen] = useState(false)
  const [openModal, setOpenModal] = useState<'payment' | 'invoice' | null>(null)

  const loading = isLoading || !data

  const allAlertsEmpty =
    !loading &&
    data.notInvoicedStages.length === 0 &&
    data.notPaidStages.length === 0 &&
    data.inactiveProjects.length === 0

  return (
    <div className="flex gap-6 items-start min-h-0">
      {/* ══════════════════════════════════════════
          MAIN CONTENT — appears on right in RTL
         ══════════════════════════════════════════ */}
      <div className="flex-1 min-w-0 space-y-6">
        {/* Greeting */}
        <div>
          <h1 className="text-[20px] font-bold text-[#0F172A] tracking-tight">
            שלום, {fullName} 👋
          </h1>
          <p className="text-[13px] text-[#64748B] mt-1">ברוך הבא למערכת ניהול המשימות</p>
        </div>

        {/* ── SUMMARY CARDS ── */}
        <div className="space-y-3">
          {/* ── Row 1 ── */}
          {isAdmin ? (
            <div className="grid grid-cols-3 gap-3">
              <KpiCard
                label='סה"כ פרויקטים פעילים'
                value={loading ? '—' : data.activeProjectsCount}
                accent
                loading={loading}
              />
              <KpiCard
                label='סה"כ גבייה'
                value={loading ? '—' : formatCurrency(data.totalPaid)}
                loading={loading}
              />
              <KpiCard
                label="לקוחות פעילים"
                value={loading ? '—' : data.activeClientsCount}
                loading={loading}
              />
            </div>
          ) : (
            /* Employee sees only cards 1 and 3 */
            <div className="grid grid-cols-2 gap-3">
              <KpiCard
                label='סה"כ פרויקטים פעילים'
                value={loading ? '—' : data.activeProjectsCount}
                accent
                loading={loading}
              />
              <KpiCard
                label="לקוחות פעילים"
                value={loading ? '—' : data.activeClientsCount}
                loading={loading}
              />
            </div>
          )}

          {/* ── Row 2 — admin only ── */}
          {isAdmin && (
            <div className="grid grid-cols-3 gap-3">
              <KpiCard
                label="יתרה לגבייה"
                value={loading ? '—' : formatCurrency(data.totalPendingCollection)}
                loading={loading}
              />
              <KpiCard
                label="🔴 ממתינים לתשלום"
                value={loading ? '—' : data.waitingPaymentCount}
                redTint
                loading={loading}
                onClick={
                  !loading && data.waitingPaymentCount > 0
                    ? () => setOpenModal('payment')
                    : undefined
                }
                clickHint={
                  !loading && data.waitingPaymentCount > 0 ? 'לחץ לפרטים ←' : undefined
                }
              />
              <KpiCard
                label="🔶 ממתינים לחשבונית"
                value={loading ? '—' : data.waitingInvoiceCount}
                amberTint
                loading={loading}
                onClick={
                  !loading && data.waitingInvoiceCount > 0
                    ? () => setOpenModal('invoice')
                    : undefined
                }
                clickHint={
                  !loading && data.waitingInvoiceCount > 0 ? 'לחץ לפרטים ←' : undefined
                }
              />
            </div>
          )}
        </div>

        {/* ── ALERTS SECTION — admin only ── */}
        {isAdmin && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <h2 className="text-[13px] font-semibold text-[#0F172A]">דורש טיפול</h2>
              {!loading && !allAlertsEmpty && (
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#FEE2E2] text-red-600">
                  {(data.notInvoicedStages.length +
                    data.notPaidStages.length +
                    data.inactiveProjects.length)}
                </span>
              )}
            </div>

            {loading ? (
              <div className="rounded-xl border border-[#E5E7EB] bg-white px-5 py-4 animate-pulse">
                <div className="h-4 w-40 rounded bg-[#E5E7EB]" />
              </div>
            ) : allAlertsEmpty ? (
              <div className="rounded-xl border border-[#D1FAE5] bg-[#F0FDF4] px-5 py-4">
                <p className="text-[13px] font-medium text-green-700">אין פריטים דחופים ✓</p>
              </div>
            ) : (
              <div className="space-y-2">
                {/* Group 1: בוצע ולא חויב */}
                <AlertGroup<AlertStageItem>
                  icon="🔴"
                  title="בוצע ולא חויב"
                  badgeBg="bg-red-100 text-red-700"
                  items={data.notInvoicedStages}
                  renderRow={(s, i) => (
                    <tr
                      key={i}
                      className="border-b border-[#F6F7F9] last:border-0 hover:bg-[#F6F7F9] transition-colors"
                    >
                      <td className="px-5 py-2.5 w-[35%]">
                        <Link
                          href={`/projects/${s.projectId}`}
                          className="font-medium text-[#6366F1] hover:underline"
                        >
                          {s.projectTitle}
                        </Link>
                      </td>
                      <td className="px-5 py-2.5 text-[#64748B] w-[25%]">{s.clientName}</td>
                      <td className="px-5 py-2.5 text-[#0F172A] w-[25%]">{s.stageName}</td>
                      <td className="px-5 py-2.5 font-medium text-[#0F172A] text-left w-[15%]" dir="ltr">
                        {formatCurrency(s.amount)}
                      </td>
                    </tr>
                  )}
                />

                {/* Group 2: חויב ולא שולם */}
                <AlertGroup<AlertStageItem>
                  icon="🟠"
                  title="חויב ולא שולם"
                  badgeBg="bg-orange-100 text-orange-700"
                  items={data.notPaidStages}
                  renderRow={(s, i) => (
                    <tr
                      key={i}
                      className="border-b border-[#F6F7F9] last:border-0 hover:bg-[#F6F7F9] transition-colors"
                    >
                      <td className="px-5 py-2.5 w-[35%]">
                        <Link
                          href={`/projects/${s.projectId}`}
                          className="font-medium text-[#6366F1] hover:underline"
                        >
                          {s.projectTitle}
                        </Link>
                      </td>
                      <td className="px-5 py-2.5 text-[#64748B] w-[25%]">{s.clientName}</td>
                      <td className="px-5 py-2.5 text-[#0F172A] w-[25%]">{s.stageName}</td>
                      <td className="px-5 py-2.5 font-medium text-[#0F172A] text-left w-[15%]" dir="ltr">
                        {formatCurrency(s.amount)}
                      </td>
                    </tr>
                  )}
                />

                {/* Group 3: ללא פעילות מעל 30 יום */}
                <AlertGroup<InactiveProjectItem>
                  icon="⚫"
                  title="ללא פעילות מעל 30 יום"
                  badgeBg="bg-gray-100 text-gray-600"
                  items={data.inactiveProjects}
                  renderRow={(p, i) => (
                    <tr
                      key={i}
                      className="border-b border-[#F6F7F9] last:border-0 hover:bg-[#F6F7F9] transition-colors"
                    >
                      <td className="px-5 py-2.5 w-[40%]">
                        <Link
                          href={`/projects/${p.projectId}`}
                          className="font-medium text-[#6366F1] hover:underline"
                        >
                          {p.projectTitle}
                        </Link>
                      </td>
                      <td className="px-5 py-2.5 text-[#64748B] w-[30%]">{p.clientName}</td>
                      <td className="px-5 py-2.5 text-[#94A3B8] w-[30%] text-left" dir="ltr">
                        {p.daysSinceActivity} ימים ללא עדכון
                      </td>
                    </tr>
                  )}
                />
              </div>
            )}
          </div>
        )}
      </div>

      {/* ══════════════════════════════════════════
          SIDEBAR WIDGET — appears on left in RTL
         ══════════════════════════════════════════ */}
      <div className="w-64 shrink-0 space-y-4">
        {/* Shortcuts */}
        <div className="bg-white rounded-xl border border-[#E5E7EB] p-4">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-[#64748B] mb-3">
            קיצורי דרך
          </p>
          <div className="space-y-2">
            <button
              onClick={() => router.push('/projects/new')}
              className="w-full flex items-center justify-center gap-2 rounded-lg bg-[#6366F1] px-3 py-2 text-[13px] font-semibold text-white hover:bg-[#4F46E5] transition-colors"
            >
              <span>+</span> פרויקט חדש
            </button>
            <button
              onClick={() => setClientModalOpen(true)}
              className="w-full flex items-center justify-center gap-2 rounded-lg border border-[#E5E7EB] px-3 py-2 text-[13px] font-semibold text-[#0F172A] hover:bg-[#F6F7F9] transition-colors"
            >
              <span>+</span> לקוח חדש
            </button>
          </div>
        </div>

        {/* Active projects list */}
        <div className="bg-white rounded-xl border border-[#E5E7EB] overflow-hidden">
          <div className="px-4 py-3 border-b border-[#F6F7F9] flex items-center justify-between">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-[#64748B]">
              פרויקטים פעילים
            </p>
            {!loading && (
              <span className="text-[11px] font-bold text-[#6366F1]">
                {data.activeProjectsCount}
              </span>
            )}
          </div>

          <div className="max-h-[500px] overflow-y-auto">
            {loading ? (
              <div className="space-y-0">
                {[1, 2, 3, 4].map((n) => (
                  <div key={n} className="flex items-center gap-3 px-4 py-3 border-b border-[#F6F7F9] animate-pulse">
                    <div className="w-2 h-2 rounded-full bg-[#E5E7EB] shrink-0" />
                    <div className="h-3 flex-1 rounded bg-[#E5E7EB]" />
                  </div>
                ))}
              </div>
            ) : data.activeProjects.length === 0 ? (
              <div className="px-4 py-6 text-center">
                <p className="text-[12px] text-[#94A3B8] italic">אין פרויקטים פעילים</p>
              </div>
            ) : (
              data.activeProjects.map((proj) => (
                <Link
                  key={proj.id}
                  href={`/projects/${proj.id}`}
                  className="flex items-center gap-3 px-4 py-2.5 hover:bg-[#F6F7F9] border-b border-[#F6F7F9] last:border-0 transition-colors group"
                >
                  <span className="w-2 h-2 rounded-full bg-[#6366F1] shrink-0" />
                  <span className="text-[13px] text-[#0F172A] group-hover:text-[#6366F1] truncate transition-colors">
                    {proj.title}
                  </span>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>

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
