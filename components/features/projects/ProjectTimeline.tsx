'use client'

import { useProjectStages } from '@/lib/hooks/use-stages'
import type { ProjectStage } from '@/types/database'

interface ProjectTimelineProps {
  projectId: string
}

// ─── Payment status colors ────────────────────────────────────────────────────
const DOT_COLORS = {
  paid:     { bg: '#2E7D5B', border: '#2E7D5B', line: '#2E7D5B' },
  invoiced: { bg: '#F59E0B', border: '#F59E0B', line: '#eeeeee' },
  pending:  { bg: '#C62828', border: '#C62828', line: '#eeeeee' },
  none:     { bg: '#ffffff', border: '#E0E0E0', line: '#eeeeee' },
}

type DotState = 'paid' | 'invoiced' | 'pending' | 'none'

function getDotState(stage: ProjectStage): DotState {
  if (stage.paid)                                    return 'paid'
  if (stage.invoice_sent && !stage.paid)             return 'invoiced'
  if (stage.completed && !stage.invoice_sent)        return 'pending'
  return 'none'
}

function CheckmarkIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
      <path
        d="M1.5 5L3.8 7.5L8.5 2.5"
        stroke="white"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function ProjectTimeline({ projectId }: ProjectTimelineProps) {
  const { data: stages, isLoading } = useProjectStages(projectId)

  if (isLoading) {
    return (
      <div
        style={{
          background: '#ffffff',
          border: '1px solid #dddddd',
          borderRadius: 2,
          padding: '14px 16px',
          boxShadow: '0 2px 0 #cccccc, 0 3px 8px rgba(0,0,0,0.05)',
          position: 'sticky',
          top: 20,
        }}
      >
        <p style={{ fontSize: 11, color: '#aaaaaa', textAlign: 'center' }}>טוען...</p>
      </div>
    )
  }

  if (!stages || stages.length === 0) return null

  // "Current" stage = first stage where completed === false
  const currentIndex = stages.findIndex((s) => !s.completed)

  return (
    <div
      dir="rtl"
      style={{
        background: '#ffffff',
        border: '1px solid #dddddd',
        borderRadius: 2,
        padding: '14px 16px',
        boxShadow: '0 2px 0 #cccccc, 0 3px 8px rgba(0,0,0,0.05)',
        position: 'sticky',
        top: 20,
      }}
    >
      {/* Title */}
      <div
        style={{
          fontSize: 10,
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          color: '#aaaaaa',
          marginBottom: 14,
        }}
      >
        ציר זמן
      </div>

      {/* Stage list */}
      <div>
        {stages.map((stage, idx) => {
          const dotState  = getDotState(stage)
          const isCurrent = idx === currentIndex
          const isLast    = idx === stages.length - 1
          const colors    = DOT_COLORS[dotState]

          // Name styling: completed stages bold, current boldest, future muted
          const nameFontWeight = stage.completed ? 700 : isCurrent ? 800 : 500
          const nameColor      = (!stage.completed && !isCurrent) ? '#aaaaaa' : '#1a1a1a'

          return (
            <div key={stage.id} style={{ display: 'flex', flexDirection: 'row', gap: 10 }}>
              {/* Text side (left) */}
              <div style={{ flex: 1, paddingBottom: isLast ? 0 : 12 }}>
                {/* Stage name */}
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: nameFontWeight,
                    color: nameColor,
                    lineHeight: '18px',
                  }}
                >
                  {stage.name}
                </div>

                {/* "שלב נוכחי" badge — for first incomplete stage */}
                {isCurrent && (
                  <div
                    style={{
                      display: 'inline-block',
                      marginTop: 4,
                      background: '#fff4e0',
                      color: '#c07000',
                      border: '1px solid #E8C420',
                      borderRadius: 2,
                      fontSize: 9,
                      fontWeight: 700,
                      padding: '1px 5px',
                    }}
                  >
                    שלב נוכחי
                  </div>
                )}

                {/* Notes — current stage only */}
                {isCurrent && stage.note && (
                  <div
                    style={{
                      marginTop: 5,
                      fontSize: 10,
                      color: '#888888',
                      background: '#f8f8f8',
                      padding: '4px 6px',
                      borderRadius: 2,
                      borderRight: '2px solid #E8C420',
                    }}
                  >
                    {stage.note}
                  </div>
                )}
              </div>

              {/* Dot + vertical line (right column) */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  width: 18,
                  flexShrink: 0,
                }}
              >
                {/* Dot */}
                <div
                  style={{
                    width: 18,
                    height: 18,
                    borderRadius: '50%',
                    flexShrink: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: colors.bg,
                    border: `2px solid ${colors.border}`,
                    boxSizing: 'border-box',
                  }}
                >
                  {dotState === 'paid' && <CheckmarkIcon />}
                </div>

                {/* Vertical line below dot */}
                {!isLast && (
                  <div
                    style={{
                      flex: 1,
                      width: 2,
                      minHeight: 12,
                      background: colors.line,
                      marginTop: 2,
                    }}
                  />
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
