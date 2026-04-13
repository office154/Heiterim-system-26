'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useMemo } from 'react'
import Link from 'next/link'
import { useCurrentRole } from '@/lib/hooks/use-profile'
import { usePayments } from '@/lib/hooks/use-payments'
import { useProjects } from '@/lib/hooks/use-projects'
import { useClients } from '@/lib/hooks/use-clients'
import { useDashboardData } from '@/lib/hooks/use-dashboard'
import { useResizableColumns } from '@/lib/hooks/use-resizable-columns'
import { TRACK_LABELS, TRACK_OPTIONS } from '@/lib/constants/tracks'
import { Breadcrumb } from '@/components/shared/Breadcrumb'
import type { TrackValue } from '@/types/database'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmt(n: number) {
  return '₪' + n.toLocaleString('he-IL')
}

// ─── Shared UI primitives ─────────────────────────────────────────────────────

function SectionHeader({ number, title, adminOnly }: { number: string; title: string; adminOnly?: boolean }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18, paddingBottom: 10, borderBottom: '1px solid #d8d8d8' }}>
      <span style={{ fontSize: 11, fontWeight: 700, color: '#bbb', letterSpacing: 1, textTransform: 'uppercase' }}>{number}</span>
      <span style={{ fontSize: 15, fontWeight: 700, color: '#1a1a1a' }}>{title}</span>
      {adminOnly && (
        <span style={{ fontSize: 10, fontWeight: 700, background: '#1a1a1a', color: '#fff', padding: '2px 8px', borderRadius: 2, letterSpacing: 0.3 }}>
          admin בלבד
        </span>
      )}
    </div>
  )
}

function Card({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{
      background: '#fff',
      borderRadius: 2,
      boxShadow: '0 1px 3px rgba(0,0,0,0.08), 0 0 0 1px rgba(0,0,0,0.05)',
      padding: '18px 22px',
      marginBottom: 14,
      ...style,
    }}>
      {children}
    </div>
  )
}

function CardTitle({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontSize: 11, fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 14 }}>
      {children}
    </div>
  )
}

function Table({ headers, rows, emptyLabel = 'אין נתונים' }: {
  headers: string[]
  rows: (string | number | React.ReactNode)[][]
  emptyLabel?: string
}) {
  const { widths, startResize } = useResizableColumns(headers.map(() => 150))

  if (rows.length === 0) {
    return (
      <div style={{ padding: '20px 0', textAlign: 'center', color: '#aaa', fontSize: 13 }}>{emptyLabel}</div>
    )
  }
  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, tableLayout: 'fixed' }}>
        <thead>
          <tr>
            {headers.map((h, i) => (
              <th
                key={i}
                style={{
                  textAlign: 'right', padding: '7px 10px', fontSize: 11, fontWeight: 600,
                  color: '#999', textTransform: 'uppercase', letterSpacing: 0.4,
                  borderBottom: '1px solid #ebebeb', whiteSpace: 'nowrap',
                  width: widths[i], minWidth: widths[i], position: 'relative', userSelect: 'none', overflow: 'hidden',
                }}
              >
                {h}
                <div
                  onMouseDown={(e) => { e.preventDefault(); startResize(i)(e) }}
                  style={{
                    position: 'absolute', left: 0, top: 0, height: '100%', width: 8, zIndex: 2,
                    cursor: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20'%3E%3Cpath d='M1 10 L5 6 L5 8.5 L8 8.5 L8 11.5 L5 11.5 L5 14 Z M19 10 L15 6 L15 8.5 L12 8.5 L12 11.5 L15 11.5 L15 14 Z' fill='white' stroke='%23999' stroke-width='0.8' stroke-linejoin='round'/%3E%3C/svg%3E\") 10 10, ew-resize",
                    display: 'flex', alignItems: 'stretch', justifyContent: 'center',
                  }}
                  className="group/handle"
                >
                  <div
                    style={{ width: 2, background: '#3D6A9E', borderRadius: 1, transition: 'opacity 0.15s' }}
                    className="opacity-0 group-hover/handle:opacity-100"
                  />
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr key={ri} style={{ background: ri % 2 === 1 ? '#fafafa' : '#fff' }}>
              {row.map((cell, ci) => (
                <td key={ci} style={{ padding: '9px 10px', borderBottom: '1px solid #f2f2f2', color: '#222', verticalAlign: 'middle' }}>
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function AmountCell({ value, variant = 'neutral' }: { value: number; variant?: 'red' | 'green' | 'neutral' }) {
  const color = variant === 'red' ? '#b94040' : variant === 'green' ? '#2d6a4f' : '#1a1a1a'
  return (
    <span style={{ fontWeight: 600, color, fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}>
      {fmt(value)}
    </span>
  )
}

function KpiCard({ label, value, sub, valueColor = '#1a1a1a' }: { label: string; value: string; sub?: string; valueColor?: string }) {
  return (
    <div style={{ background: '#fff', borderRadius: 2, boxShadow: '0 1px 3px rgba(0,0,0,0.08), 0 0 0 1px rgba(0,0,0,0.05)', padding: '18px 22px' }}>
      <div style={{ fontSize: 11, fontWeight: 600, color: '#999', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>{label}</div>
      <div style={{ fontSize: 26, fontWeight: 800, color: valueColor, letterSpacing: -1, lineHeight: 1 }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: '#bbb', marginTop: 6 }}>{sub}</div>}
    </div>
  )
}

function ProgressBar({ pct }: { pct: number }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{ flex: 1, height: 4, background: '#e8e8e8', borderRadius: 2, overflow: 'hidden', minWidth: 70 }}>
        <div style={{ height: '100%', width: `${pct}%`, background: '#1a1a1a', borderRadius: 2 }} />
      </div>
      <span style={{ fontSize: 12, fontWeight: 600, color: '#555', minWidth: 32, textAlign: 'left' }}>{pct}%</span>
    </div>
  )
}

// ─── Export helpers ────────────────────────────────────────────────────────────

type SheetRow = (string | number)[]

async function exportExcel(sheets: { name: string; headers: string[]; rows: SheetRow[] }[]) {
  const XLSX = await import('xlsx')
  const wb = XLSX.utils.book_new()
  for (const sheet of sheets) {
    const ws = XLSX.utils.aoa_to_sheet([sheet.headers, ...sheet.rows])
    XLSX.utils.book_append_sheet(wb, ws, sheet.name)
  }
  XLSX.writeFile(wb, 'דוחות.xlsx')
}

async function exportPDF(sections: { title: string; headers: string[]; rows: SheetRow[] }[]) {
  const { default: jsPDF } = await import('jspdf')
  const { default: autoTable } = await import('jspdf-autotable')
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' })

  let y = 15
  for (const section of sections) {
    if (y > 170) { doc.addPage(); y = 15 }
    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.text(section.title, 14, y)
    y += 5
    autoTable(doc, {
      startY: y,
      head: [section.headers],
      body: section.rows.map(r => r.map(String)),
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [26, 26, 26] },
      margin: { left: 14, right: 14 },
    })
    y = (doc as InstanceType<typeof jsPDF> & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10
  }
  doc.save('דוחות.pdf')
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ReportsPage() {
  const router = useRouter()
  const { data: role, isLoading: roleLoading } = useCurrentRole()
  const { data: payments, isLoading: paymentsLoading } = usePayments()
  const { data: projects, isLoading: projectsLoading } = useProjects()
  const { data: clients, isLoading: clientsLoading } = useClients()
  const { data: dashboard, isLoading: dashboardLoading } = useDashboardData()

  const isAdmin = role === 'admin'

  useEffect(() => {
    if (!roleLoading && role === 'employee') router.replace('/')
  }, [role, roleLoading, router])

  if (roleLoading || role !== 'admin') return null

  const loading = paymentsLoading || projectsLoading || clientsLoading || dashboardLoading

  // ── Derived financial data from usePayments ──────────────────────────────

  const openDebt = useMemo(() => {
    if (!payments) return []
    const rows: { clientName: string; projectTitle: string; stageName: string; amount: number; projectId: string }[] = []
    for (const proj of payments.projects) {
      for (const stage of proj.stages) {
        if (stage.completed && stage.price > 0 && !stage.paid) {
          rows.push({ clientName: proj.clientName ?? '—', projectTitle: proj.title, stageName: stage.name, amount: stage.price, projectId: proj.id })
        }
      }
    }
    return rows
  }, [payments])

  const unpaidInvoices = useMemo(() => {
    if (!payments) return []
    const rows: { clientName: string; projectTitle: string; stageName: string; amount: number; projectId: string }[] = []
    for (const proj of payments.projects) {
      for (const stage of proj.stages) {
        if (stage.completed && stage.price > 0 && stage.invoice_sent && !stage.paid) {
          rows.push({ clientName: proj.clientName ?? '—', projectTitle: proj.title, stageName: stage.name, amount: stage.price, projectId: proj.id })
        }
      }
    }
    return rows
  }, [payments])

  const incomeByClient = useMemo(() => {
    if (!payments) return []
    const map = new Map<string, { contract: number; paid: number }>()
    for (const proj of payments.projects) {
      const key = proj.clientName ?? '—'
      const cur = map.get(key) ?? { contract: 0, paid: 0 }
      cur.contract += proj.totalContract
      cur.paid += proj.totalPaid
      map.set(key, cur)
    }
    return Array.from(map.entries())
      .map(([name, v]) => ({ name, contract: v.contract, paid: v.paid, balance: v.contract - v.paid }))
      .sort((a, b) => b.balance - a.balance)
  }, [payments])

  const expectedIncome = useMemo(() => {
    if (!payments || !projects) return []
    const trackMap = new Map<string, string>()
    for (const p of projects) {
      for (const t of p.tracks) trackMap.set(p.id, t)
    }
    const rows: { projectTitle: string; stageName: string; track: string; amount: number; projectId: string }[] = []
    for (const proj of payments.projects) {
      for (const stage of proj.stages) {
        if (!stage.completed && stage.price > 0) {
          const trackVal = trackMap.get(proj.id) as TrackValue | undefined
          rows.push({
            projectTitle: proj.title,
            stageName: stage.name,
            track: trackVal ? (TRACK_LABELS[trackVal] ?? trackVal) : '—',
            amount: stage.price,
            projectId: proj.id,
          })
        }
      }
    }
    return rows.sort((a, b) => b.amount - a.amount)
  }, [payments, projects])

  // ── Track distribution from projects ─────────────────────────────────────

  const trackDistribution = useMemo(() => {
    if (!projects) return []
    const map = new Map<TrackValue, number>()
    for (const p of projects) {
      if (p.status !== 'active') continue
      for (const t of p.tracks) map.set(t, (map.get(t) ?? 0) + 1)
    }
    return TRACK_OPTIONS.map(opt => ({ value: opt.value, label: opt.label, count: map.get(opt.value) ?? 0 }))
      .filter(t => t.count > 0)
  }, [projects])

  // ── Client table: active projects + open debt ─────────────────────────────

  const clientSummary = useMemo(() => {
    if (!clients || !projects || !payments) return []
    const debtByClient = new Map<string, number>()
    for (const proj of payments.projects) {
      const key = proj.clientName ?? ''
      for (const stage of proj.stages) {
        if (stage.completed && stage.price > 0 && !stage.paid) {
          debtByClient.set(key, (debtByClient.get(key) ?? 0) + stage.price)
        }
      }
    }
    const activeByClient = new Map<string, number>()
    for (const p of projects) {
      if (p.status === 'active' && p.client) {
        const name = p.client.name
        activeByClient.set(name, (activeByClient.get(name) ?? 0) + 1)
      }
    }
    return clients
      .map(c => ({
        id: c.id,
        name: c.name,
        activeProjects: activeByClient.get(c.name) ?? 0,
        openDebt: debtByClient.get(c.name) ?? 0,
      }))
      .filter(c => c.activeProjects > 0)
      .sort((a, b) => b.openDebt - a.openDebt)
  }, [clients, projects, payments])

  // ── Lead source breakdown ─────────────────────────────────────────────────

  const leadSources = useMemo(() => {
    if (!clients) return []
    const map = new Map<string, number>()
    for (const c of clients) {
      const src = c.lead_source ?? 'אחר'
      map.set(src, (map.get(src) ?? 0) + 1)
    }
    return Array.from(map.entries()).sort((a, b) => b[1] - a[1])
  }, [clients])

  // ── Export data builders ──────────────────────────────────────────────────

  function handleExcelExport() {
    if (!payments) return
    exportExcel([
      {
        name: 'חוב פתוח',
        headers: ['לקוח', 'פרויקט', 'שלב', 'סכום'],
        rows: openDebt.map(r => [r.clientName, r.projectTitle, r.stageName, r.amount]),
      },
      {
        name: 'חשבוניות לא שולמו',
        headers: ['לקוח', 'פרויקט', 'שלב', 'סכום'],
        rows: unpaidInvoices.map(r => [r.clientName, r.projectTitle, r.stageName, r.amount]),
      },
      {
        name: 'הכנסה לפי לקוח',
        headers: ['לקוח', 'חוזה', 'שולם', 'יתרה'],
        rows: incomeByClient.map(r => [r.name, r.contract, r.paid, r.balance]),
      },
      {
        name: 'הכנסה צפויה',
        headers: ['פרויקט', 'שלב', 'מסלול', 'סכום'],
        rows: expectedIncome.map(r => [r.projectTitle, r.stageName, r.track, r.amount]),
      },
      {
        name: 'לקוחות',
        headers: ['לקוח', 'פרויקטים פעילים', 'חוב פתוח'],
        rows: clientSummary.map(r => [r.name, r.activeProjects, r.openDebt]),
      },
    ])
  }

  function handlePdfExport() {
    if (!payments) return
    exportPDF([
      {
        title: 'חוב פתוח — שלבים שהושלמו ולא שולמו',
        headers: ['לקוח', 'פרויקט', 'שלב', 'סכום'],
        rows: openDebt.map(r => [r.clientName, r.projectTitle, r.stageName, fmt(r.amount)]),
      },
      {
        title: 'חשבוניות יצאו ולא שולמו',
        headers: ['לקוח', 'פרויקט', 'שלב', 'סכום'],
        rows: unpaidInvoices.map(r => [r.clientName, r.projectTitle, r.stageName, fmt(r.amount)]),
      },
      {
        title: 'הכנסה לפי לקוח',
        headers: ['לקוח', 'חוזה', 'שולם', 'יתרה'],
        rows: incomeByClient.map(r => [r.name, fmt(r.contract), fmt(r.paid), fmt(r.balance)]),
      },
      {
        title: 'הכנסה צפויה',
        headers: ['פרויקט', 'שלב', 'מסלול', 'סכום'],
        rows: expectedIncome.map(r => [r.projectTitle, r.stageName, r.track, fmt(r.amount)]),
      },
      {
        title: 'לקוחות — פרויקטים פעילים וחוב פתוח',
        headers: ['לקוח', 'פרויקטים פעילים', 'חוב פתוח'],
        rows: clientSummary.map(r => [r.name, String(r.activeProjects), fmt(r.openDebt)]),
      },
    ])
  }

  // ─── Render ──────────────────────────────────────────────────────────────

  return (
    <div dir="rtl" style={{ maxWidth: 1060, margin: '0 auto' }}>
      <Breadcrumb items={[{ label: 'דשבורד', href: '/' }, { label: 'דוחות' }]} />

      {/* Page header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32, paddingBottom: 18, borderBottom: '2px solid #1a1a1a' }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: '#1a1a1a', letterSpacing: -0.5, margin: 0 }}>דוחות</h1>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={handleExcelExport}
            disabled={loading || !payments}
            style={{ padding: '7px 16px', fontSize: 13, fontWeight: 500, background: '#fff', border: '1px solid #c8c8c8', borderRadius: 2, cursor: 'pointer', fontFamily: 'inherit', color: '#333' }}
          >
            ייצא Excel
          </button>
          <button
            onClick={handlePdfExport}
            disabled={loading || !payments}
            style={{ padding: '7px 16px', fontSize: 13, fontWeight: 500, background: '#1a1a1a', border: '1px solid #1a1a1a', borderRadius: 2, cursor: 'pointer', fontFamily: 'inherit', color: '#fff' }}
          >
            ייצא PDF
          </button>
        </div>
      </div>

      {loading && (
        <div style={{ color: '#aaa', fontSize: 13, textAlign: 'center', padding: '40px 0' }}>טוען נתונים...</div>
      )}

      {!loading && (
        <>
          {/* ══════════════════════════════════════════════════════════ */}
          {/* 01 כספי                                                   */}
          {/* ══════════════════════════════════════════════════════════ */}
          <section style={{ marginBottom: 48 }}>
            <SectionHeader number="01" title="כספי" adminOnly />

            {/* KPI row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 14 }}>
              <KpiCard
                label='סה"כ חוזה'
                value={fmt(payments?.totalContract ?? 0)}
                sub="פרויקטים פעילים"
              />
              <KpiCard
                label="שולם"
                value={fmt(payments?.totalPaid ?? 0)}
                valueColor="#2d6a4f"
                sub={payments?.totalContract ? `${Math.round((payments.totalPaid / payments.totalContract) * 100)}% מסה"כ` : undefined}
              />
              <KpiCard
                label="יתרה לגביה"
                value={fmt((payments?.totalRequired ?? 0) + (payments?.totalInvoiced ?? 0))}
                valueColor="#b94040"
              />
            </div>

            {/* חוב פתוח */}
            <Card>
              <CardTitle>חוב פתוח — שלבים שהושלמו ולא שולמו</CardTitle>
              <Table
                headers={['לקוח', 'פרויקט', 'שלב', 'סכום']}
                rows={openDebt.map(r => [
                  r.clientName,
                  <Link key={r.projectId} href={`/projects/${r.projectId}`} style={{ color: '#1a1a1a', textDecoration: 'underline', textUnderlineOffset: 2 }}>{r.projectTitle}</Link>,
                  r.stageName,
                  <AmountCell key="a" value={r.amount} variant="red" />,
                ])}
                emptyLabel="אין חוב פתוח"
              />
            </Card>

            {/* חשבוניות */}
            <Card>
              <CardTitle>חשבוניות יצאו ולא שולמו</CardTitle>
              <Table
                headers={['לקוח', 'פרויקט', 'שלב', 'סכום']}
                rows={unpaidInvoices.map(r => [
                  r.clientName,
                  <Link key={r.projectId} href={`/projects/${r.projectId}`} style={{ color: '#1a1a1a', textDecoration: 'underline', textUnderlineOffset: 2 }}>{r.projectTitle}</Link>,
                  r.stageName,
                  <AmountCell key="a" value={r.amount} variant="red" />,
                ])}
                emptyLabel="אין חשבוניות פתוחות"
              />
            </Card>

            {/* הכנסה לפי לקוח */}
            <Card>
              <CardTitle>הכנסה לפי לקוח</CardTitle>
              <Table
                headers={['לקוח', 'חוזה', 'שולם', 'יתרה']}
                rows={incomeByClient.map(r => [
                  r.name,
                  <AmountCell key="c" value={r.contract} />,
                  <AmountCell key="p" value={r.paid} variant="green" />,
                  <AmountCell key="b" value={r.balance} variant={r.balance > 0 ? 'red' : 'neutral'} />,
                ])}
                emptyLabel="אין נתונים"
              />
            </Card>

            {/* הכנסה צפויה */}
            <Card>
              <CardTitle>הכנסה צפויה — שלבים עם מחיר שטרם הושלמו</CardTitle>
              <Table
                headers={['פרויקט', 'שלב', 'מסלול', 'סכום']}
                rows={expectedIncome.map(r => [
                  <Link key={r.projectId} href={`/projects/${r.projectId}`} style={{ color: '#1a1a1a', textDecoration: 'underline', textUnderlineOffset: 2 }}>{r.projectTitle}</Link>,
                  r.stageName,
                  <span key="t" style={{ fontSize: 12, color: '#888' }}>{r.track}</span>,
                  <AmountCell key="a" value={r.amount} />,
                ])}
                emptyLabel="אין שלבים ממתינים עם מחיר"
              />
            </Card>
          </section>

          {/* ══════════════════════════════════════════════════════════ */}
          {/* 02 תפעולי                                                 */}
          {/* ══════════════════════════════════════════════════════════ */}
          <section style={{ marginBottom: 48 }}>
            <SectionHeader number="02" title="תפעולי" />

            {/* סטטוס פרויקטים */}
            <Card>
              <CardTitle>סטטוס פרויקטים פעילים</CardTitle>
              <Table
                headers={['פרויקט', 'לקוח', 'שלב נוכחי', 'התקדמות']}
                rows={(dashboard?.projectsWithProgress ?? []).map(p => [
                  <Link key={p.id} href={`/projects/${p.id}`} style={{ color: '#1a1a1a', fontWeight: 600, textDecoration: 'underline', textUnderlineOffset: 2 }}>{p.title}</Link>,
                  <span key="c" style={{ color: '#888', fontSize: 12 }}>{p.clientName}</span>,
                  <span key="s" style={{ fontSize: 12 }}>{p.currentStageName}</span>,
                  <ProgressBar key="pb" pct={p.progressPercent} />,
                ])}
                emptyLabel="אין פרויקטים פעילים"
              />
            </Card>

            {/* התפלגות מסלולים */}
            <Card>
              <CardTitle>התפלגות לפי מסלול</CardTitle>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                {trackDistribution.length === 0 && (
                  <span style={{ color: '#aaa', fontSize: 13 }}>אין נתונים</span>
                )}
                {trackDistribution.map(t => (
                  <div key={t.value} style={{ background: '#f7f7f7', border: '1px solid #e8e8e8', borderRadius: 2, padding: '14px 20px', minWidth: 110 }}>
                    <div style={{ fontSize: 11, fontWeight: 600, color: '#888', textTransform: 'uppercase', letterSpacing: 0.4, marginBottom: 8 }}>{t.label}</div>
                    <div style={{ fontSize: 30, fontWeight: 800, color: '#1a1a1a', letterSpacing: -1.5, lineHeight: 1 }}>{t.count}</div>
                    <div style={{ fontSize: 11, color: '#bbb', marginTop: 5 }}>פרויקטים פעילים</div>
                  </div>
                ))}
              </div>
            </Card>
          </section>

          {/* ══════════════════════════════════════════════════════════ */}
          {/* 03 לקוחות                                                 */}
          {/* ══════════════════════════════════════════════════════════ */}
          <section style={{ marginBottom: 48 }}>
            <SectionHeader number="03" title="לקוחות" />

            {/* לקוחות + חוב */}
            <Card>
              <CardTitle>לקוחות — פרויקטים פעילים וחוב פתוח</CardTitle>
              <Table
                headers={['לקוח', 'פרויקטים פעילים', 'חוב פתוח']}
                rows={clientSummary.map(c => [
                  <Link key={c.id} href={`/clients/${c.id}`} style={{ color: '#1a1a1a', textDecoration: 'underline', textUnderlineOffset: 2 }}>{c.name}</Link>,
                  <span key="ap" style={{ fontWeight: 600 }}>{c.activeProjects}</span>,
                  c.openDebt > 0
                    ? <AmountCell key="d" value={c.openDebt} variant="red" />
                    : <span key="d0" style={{ color: '#aaa', fontSize: 12 }}>—</span>,
                ])}
                emptyLabel="אין לקוחות עם פרויקטים פעילים"
              />
            </Card>

            {/* מקור ליד */}
            <Card>
              <CardTitle>לקוחות לפי מקור ליד</CardTitle>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                {leadSources.length === 0 && <span style={{ color: '#aaa', fontSize: 13 }}>אין נתונים</span>}
                {leadSources.map(([src, count]) => (
                  <div key={src} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 16px', background: '#fff', border: '1px solid #e8e8e8', borderRadius: 2, boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                    <span style={{ color: '#555', fontWeight: 500, fontSize: 13 }}>{src}</span>
                    <div style={{ width: 1, height: 14, background: '#e0e0e0' }} />
                    <span style={{ fontWeight: 800, color: '#1a1a1a', fontSize: 15 }}>{count}</span>
                  </div>
                ))}
              </div>
            </Card>
          </section>
        </>
      )}
    </div>
  )
}
