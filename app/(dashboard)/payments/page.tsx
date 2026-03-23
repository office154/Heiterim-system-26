'use client'

import { useRouter } from 'next/navigation'
import { Breadcrumb } from '@/components/shared/Breadcrumb'
import {
  usePayments,
  getPaymentStatus,
  type PaymentProject,
  type PaymentStage,
  type PaymentStatus,
} from '@/lib/hooks/use-payments'

// ─── Constants ────────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<
  PaymentStatus,
  { color: string; bg: string; border: string; label: string }
> = {
  paid:     { color: '#2E7D5B', bg: '#E8F5EF', border: '#A8D4BC', label: 'שולם' },
  invoiced: { color: '#B45309', bg: '#FEF3C7', border: '#FCD34D', label: 'יצאה חשבונית' },
  required: { color: '#C62828', bg: '#FDEAEA', border: '#F5A8A8', label: 'נדרש לתשלום' },
  pending:  { color: '#9CA3AF', bg: '#F4F4F4', border: '#E0E0E0', label: 'טרם טופל' },
}

const DOT_BG: Record<PaymentStatus, string> = {
  paid:     '#2E7D5B',
  invoiced: '#F59E0B',
  required: '#C62828',
  pending:  '#ffffff',
}

function fmt(n: number) {
  return '₪' + n.toLocaleString('he-IL')
}

// ─── Summary Card ─────────────────────────────────────────────────────────────

function SummaryCard({
  label,
  value,
  topColor,
  valueColor = '#1a1a1a',
  loading,
}: {
  label: string
  value: string
  topColor: string
  valueColor?: string
  loading?: boolean
}) {
  return (
    <div
      style={{
        background: '#ffffff',
        border: '1px solid #dddddd',
        borderTop: `3px solid ${topColor}`,
        borderRadius: '2px',
        boxShadow: '0 2px 0 #cccccc, 0 3px 8px rgba(0,0,0,0.04)',
        padding: '14px 16px',
      }}
    >
      <p
        style={{
          fontSize: 10,
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          color: '#aaaaaa',
          marginBottom: 8,
        }}
      >
        {label}
      </p>
      {loading ? (
        <div style={{ height: 32, width: 80, background: '#eeeeee', borderRadius: 2 }} />
      ) : (
        <p style={{ fontSize: 24, fontWeight: 900, color: valueColor, letterSpacing: '-0.02em' }}>
          {value}
        </p>
      )}
    </div>
  )
}

// ─── Checkmark SVG ────────────────────────────────────────────────────────────

function Checkmark() {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
      <path
        d="M2 5l2.5 2.5L8 3"
        stroke="#fff"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

// ─── Horizontal Timeline ──────────────────────────────────────────────────────

function HorizontalTimeline({ stages }: { stages: PaymentStage[] }) {
  if (stages.length === 0) return null

  const completedCount = stages.filter((s) => s.completed).length
  const progressPct = stages.length > 0 ? (completedCount / stages.length) * 100 : 0

  return (
    <div style={{ padding: '12px 16px 8px', borderTop: '1px solid #f4f4f4' }}>
      <div style={{ position: 'relative' }}>
        {/* Gray base line */}
        <div
          style={{
            position: 'absolute',
            top: 9,
            right: 10,
            left: 10,
            height: 2,
            background: '#eeeeee',
            zIndex: 0,
          }}
        />
        {/* Colored progress fill */}
        <div
          style={{
            position: 'absolute',
            top: 9,
            right: 10,
            height: 2,
            width: `calc(${progressPct}% - 20px)`,
            background: '#1a1a1a',
            zIndex: 1,
            transition: 'width 0.4s ease',
          }}
        />

        {/* Stage items */}
        <div style={{ display: 'flex', position: 'relative', zIndex: 2 }}>
          {stages.map((stage) => {
            const status = getPaymentStatus(stage)
            const dotBg  = DOT_BG[status]
            const cfg    = STATUS_CONFIG[status]
            const showAmount = stage.price > 0 && status !== 'pending'

            return (
              <div
                key={stage.id}
                style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                }}
              >
                {/* Dot */}
                <div
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: '50%',
                    background: dotBg,
                    border: status === 'pending' ? '2px solid #dddddd' : 'none',
                    boxSizing: 'border-box',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 5,
                    flexShrink: 0,
                  }}
                >
                  {status === 'paid' && <Checkmark />}
                </div>

                {/* Stage name */}
                <div
                  style={{
                    fontSize: 9,
                    fontWeight: 600,
                    maxWidth: 65,
                    textAlign: 'center',
                    lineHeight: 1.3,
                    color: cfg.color,
                    wordBreak: 'break-word',
                  }}
                >
                  {stage.name}
                </div>

                {/* Amount */}
                <div
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    textAlign: 'center',
                    color: showAmount ? cfg.color : '#cccccc',
                    marginTop: 2,
                  }}
                >
                  {showAmount ? fmt(stage.price) : '—'}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// ─── Project Card ─────────────────────────────────────────────────────────────

function ProjectCard({ proj }: { proj: PaymentProject }) {
  const router = useRouter()

  return (
    <div
      onClick={() => router.push(`/projects/${proj.id}`)}
      style={{
        background: '#ffffff',
        border: '1px solid #dddddd',
        borderRadius: '2px',
        boxShadow: '0 2px 0 #cccccc, 0 3px 8px rgba(0,0,0,0.04)',
        cursor: 'pointer',
        transition: 'border-color 0.15s, box-shadow 0.15s',
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget as HTMLDivElement
        el.style.borderColor = '#E8C420'
        el.style.boxShadow   = '0 2px 0 #cccccc, 0 4px 12px rgba(232,196,32,0.12)'
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget as HTMLDivElement
        el.style.borderColor = '#dddddd'
        el.style.boxShadow   = '0 2px 0 #cccccc, 0 3px 8px rgba(0,0,0,0.04)'
      }}
    >
      {/* Card header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          padding: '12px 16px 8px',
          gap: 12,
        }}
      >
        {/* Right: title + client */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <p
            style={{
              fontSize: 14,
              fontWeight: 800,
              color: '#1a1a1a',
              letterSpacing: '-0.01em',
              marginBottom: 2,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {proj.title}
          </p>
          {proj.clientName && (
            <p style={{ fontSize: 11, color: '#888888' }}>{proj.clientName}</p>
          )}
        </div>

        {/* Left: total + status amounts */}
        <div style={{ textAlign: 'left', flexShrink: 0 }}>
          {proj.totalContract > 0 && (
            <p
              style={{
                fontSize: 14,
                fontWeight: 900,
                color: '#1a1a1a',
                letterSpacing: '-0.02em',
                marginBottom: 4,
              }}
              dir="ltr"
            >
              {fmt(proj.totalContract)}
            </p>
          )}
          {/* Non-zero amounts only */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2, alignItems: 'flex-end' }}>
            {proj.totalPaid > 0 && (
              <span style={{ fontSize: 11, fontWeight: 700, color: '#2E7D5B' }} dir="ltr">
                שולם: {fmt(proj.totalPaid)}
              </span>
            )}
            {proj.totalInvoiced > 0 && (
              <span style={{ fontSize: 11, fontWeight: 700, color: '#B45309' }} dir="ltr">
                ממתין: {fmt(proj.totalInvoiced)}
              </span>
            )}
            {proj.totalRequired > 0 && (
              <span style={{ fontSize: 11, fontWeight: 700, color: '#C62828' }} dir="ltr">
                לא חויב: {fmt(proj.totalRequired)}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Horizontal timeline */}
      <HorizontalTimeline stages={proj.stages} />
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function PaymentsPage() {
  const { data, isLoading } = usePayments()

  const noProjects   = !isLoading && data && data.projects.length === 0
  const allPaid      =
    !isLoading &&
    data &&
    data.projects.length > 0 &&
    data.totalRequired === 0 &&
    data.totalInvoiced === 0 &&
    data.totalPaid > 0

  return (
    <div dir="rtl" style={{ maxWidth: 960, margin: '0 auto' }}>
      <Breadcrumb items={[{ label: 'דשבורד', href: '/' }, { label: 'תשלומים' }]} />

      {/* Page title */}
      <div style={{ marginBottom: 24, marginTop: 8 }}>
        <h1
          style={{
            fontSize: 22,
            fontWeight: 900,
            color: '#1a1a1a',
            letterSpacing: '-0.02em',
          }}
        >
          תשלומים
        </h1>
      </div>

      {/* ── Summary cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 24 }}>
        <SummaryCard
          label='סה"כ חוזים'
          value={isLoading ? '—' : fmt(data?.totalContract ?? 0)}
          topColor="#E8C420"
          loading={isLoading}
        />
        <SummaryCard
          label='סה"כ שולם'
          value={isLoading ? '—' : fmt(data?.totalPaid ?? 0)}
          topColor="#2E7D5B"
          valueColor="#2E7D5B"
          loading={isLoading}
        />
        <SummaryCard
          label="נדרש לתשלום"
          value={isLoading ? '—' : fmt(data?.totalRequired ?? 0)}
          topColor="#C62828"
          valueColor="#C62828"
          loading={isLoading}
        />
        <SummaryCard
          label="יצאה חשבונית"
          value={isLoading ? '—' : fmt(data?.totalInvoiced ?? 0)}
          topColor="#F59E0B"
          valueColor="#B45309"
          loading={isLoading}
        />
      </div>

      {/* ── All paid banner ── */}
      {allPaid && (
        <div
          style={{
            background: '#E8F5EF',
            color: '#2E7D5B',
            border: '1px solid #A8D4BC',
            borderRadius: '2px',
            padding: '12px 16px',
            fontWeight: 700,
            textAlign: 'center',
            marginBottom: 20,
            fontSize: 14,
          }}
        >
          כל התשלומים מסודרים ✓
        </div>
      )}

      {/* ── No projects ── */}
      {noProjects && (
        <div
          style={{
            background: '#ffffff',
            border: '1px solid #dddddd',
            borderRadius: '2px',
            padding: '40px 16px',
            textAlign: 'center',
            color: '#aaaaaa',
            fontSize: 14,
          }}
        >
          אין פרויקטים פעילים להצגה
        </div>
      )}

      {/* ── Loading skeleton ── */}
      {isLoading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              style={{
                height: 120,
                background: '#e8e8e8',
                borderRadius: '2px',
                border: '1px solid #dddddd',
                animation: 'pulse 1.5s ease-in-out infinite',
              }}
            />
          ))}
        </div>
      )}

      {/* ── Project cards ── */}
      {!isLoading && data && data.projects.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {data.projects.map((proj) => (
            <ProjectCard key={proj.id} proj={proj} />
          ))}
        </div>
      )}
    </div>
  )
}
