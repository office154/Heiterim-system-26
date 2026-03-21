'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useProjects } from '@/lib/hooks/use-projects'
import { useAlerts, type ProjectAlert } from '@/lib/hooks/use-reports'
import { useCurrentRole } from '@/lib/hooks/use-profile'
import { useProjectStages, useUpdateStage } from '@/lib/hooks/use-stages'
import { TRACK_LABELS } from '@/lib/constants/tracks'
import { Input } from '@/components/ui/input'
import type { ProjectStatus, TrackValue, ProjectWithClient } from '@/types/database'

function daysSince(dateStr: string | null): string | null {
  if (!dateStr) return null
  const days = Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000)
  if (days === 0) return 'היום'
  if (days === 1) return 'אתמול'
  return `לפני ${days} ימים`
}

function NoteEdit({ stageId, projectId, note }: { stageId: string; projectId: string; note: string | null }) {
  const [editing, setEditing] = useState(false)
  const [value, setValue] = useState(note ?? '')
  const { mutate: update } = useUpdateStage()

  function handleBlur() {
    setEditing(false)
    const trimmed = value.trim()
    if (trimmed !== (note ?? '')) {
      update({ id: stageId, projectId, note: trimmed || null })
    }
  }

  if (editing) {
    return (
      <textarea
        autoFocus
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={(e) => { if (e.key === 'Escape') { setValue(note ?? ''); setEditing(false) } }}
        rows={2}
        className="w-full mt-1 text-[11px] text-[#2B2B2B] border border-[#E8C420] rounded-[2px] px-2 py-1 resize-none focus:outline-none bg-white"
        placeholder="הוסף הערה..."
      />
    )
  }

  if (note) {
    return (
      <p
        onClick={(e) => { e.stopPropagation(); setEditing(true) }}
        className="mt-1 text-[11px] text-[#6A6660] cursor-pointer hover:text-[#2B2B2B] transition-colors leading-relaxed"
        title="לחץ לעריכה"
      >
        {note}
      </p>
    )
  }

  return (
    <button
      onClick={(e) => { e.stopPropagation(); setEditing(true) }}
      className="mt-1 text-[10px] text-[#9A9690] hover:text-[#E8C420] transition-colors"
    >
      + הוסף הערה
    </button>
  )
}

// ─── Status config ────────────────────────────────────────────────────────────
const STATUS_CONFIG: Record<ProjectStatus, { dot: string; label: string; text: string }> = {
  active:    { dot: 'bg-[#1A7A6E]', label: 'פעיל',  text: 'text-[#1A7A6E]' },
  completed: { dot: 'bg-[#6A6660]', label: 'הושלם', text: 'text-[#6A6660]' },
  on_hold:   { dot: 'bg-[#D4820A]', label: 'מושהה', text: 'text-[#D4820A]' },
}

// ─── Timeline content ─────────────────────────────────────────────────────────
function TimelineContent({
  projectId,
  projectTracks,
}: {
  projectId: string
  projectTracks: TrackValue[]
}) {
  const { data: stages, isLoading } = useProjectStages(projectId)

  if (isLoading) return <p className="text-[12px] text-[#6A6660]">טוען...</p>
  if (!stages?.length) return <p className="text-[12px] text-[#6A6660]">אין שלבים</p>

  // Only keep stages whose track was selected for this project
  const filtered = stages.filter((s) => projectTracks.includes(s.track as TrackValue))

  // Group by track — preserving selection order
  const byTrack: Record<string, typeof stages> = {}
  for (const track of projectTracks) {
    const trackStages = filtered.filter((s) => s.track === track)
    if (trackStages.length > 0) byTrack[track] = trackStages
  }
  const trackOrder = projectTracks.filter((t) => byTrack[t])
  const showHeader = trackOrder.length > 1

  return (
    <div className="space-y-5">
      {trackOrder.map((track) => (
        <div key={track}>
          {showHeader && (
            <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-[#6A6660] mb-2">
              {TRACK_LABELS[track] ?? track}
            </p>
          )}
          <div>
            {byTrack[track].map((stage, i) => {
              const isLast = i === byTrack[track].length - 1
              const prevDone = i === 0 || byTrack[track][i - 1].completed
              const state: 'done' | 'active' | 'future' =
                stage.completed ? 'done' : prevDone ? 'active' : 'future'

              return (
                <div key={stage.id} className="flex gap-3 relative pb-3 last:pb-0">
                  {!isLast && (
                    <div className="absolute right-[5px] top-3.5 bottom-0 w-px bg-[#E0DDD4]" />
                  )}
                  <div className="flex-shrink-0 mt-0.5 z-10">
                    {state === 'done' ? (
                      <div className="w-3 h-3 rounded-full bg-[#2B2B2B] flex items-center justify-center">
                        <svg width="7" height="6" viewBox="0 0 7 6" fill="none">
                          <polyline points="1,3 2.8,5 6,1" stroke="white" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                    ) : state === 'active' ? (
                      <div className="w-3 h-3 rounded-full border-2 border-[#E8C420] bg-white" />
                    ) : (
                      <div className="w-3 h-3 rounded-full border border-[#E0DDD4] bg-white" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    {/* Stage name + days elapsed */}
                    <div className="flex items-baseline justify-between gap-2">
                      <span className={`text-[12px] leading-tight ${
                        state === 'done'   ? 'text-[#9A9690] line-through' :
                        state === 'active' ? 'text-[#2B2B2B] font-semibold' :
                                            'text-[#9A9690]'
                      }`}>
                        {stage.name}
                      </span>
                      {state === 'done' && stage.completed_at && (
                        <span className="text-[10px] text-[#9A9690] flex-shrink-0 whitespace-nowrap">
                          {daysSince(stage.completed_at)}
                        </span>
                      )}
                    </div>

                    {/* Financial hint */}
                    {stage.price > 0 && (stage.completed || stage.invoice_sent) && (
                      <span className={`block text-[10px] mt-0.5 ${
                        stage.completed && !stage.invoice_sent ? 'text-[#D4820A]' :
                        stage.invoice_sent && !stage.paid      ? 'text-[#C0392B]' :
                        stage.paid                             ? 'text-[#1A7A6E]' : ''
                      }`}>
                        {stage.completed && !stage.invoice_sent ? '⚠ חשבונית לא נשלחה' :
                         stage.invoice_sent && !stage.paid      ? '⚠ לא שולם' :
                         stage.paid                             ? '✓ שולם' : ''}
                      </span>
                    )}

                    {/* Note — editable, shown for done + active stages */}
                    {state !== 'future' && (
                      <NoteEdit
                        stageId={stage.id}
                        projectId={stage.project_id}
                        note={stage.note}
                      />
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── Right panel ──────────────────────────────────────────────────────────────
function TimelinePanel({
  project,
  collapsed,
  onToggleCollapse,
}: {
  project: ProjectWithClient | null
  collapsed: boolean
  onToggleCollapse: () => void
}) {
  const cfg = project ? STATUS_CONFIG[project.status] : null

  if (collapsed) {
    return (
      <div className="flex-shrink-0 w-8 bg-white border-r border-[#E0DDD4] flex flex-col items-center pt-4">
        <button
          onClick={onToggleCollapse}
          title="פתח ציר זמן"
          className="text-[#6A6660] hover:text-[#2B2B2B] transition-colors text-[15px] rotate-180"
        >
          ›
        </button>
      </div>
    )
  }

  return (
    <div className="flex-shrink-0 w-72 bg-white border-r border-[#E0DDD4] flex flex-col overflow-hidden rounded-[2px] border">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#E0DDD4] flex-shrink-0">
        <span className="text-[11px] font-bold uppercase tracking-[0.08em] text-[#6A6660]">ציר זמן</span>
        <button
          onClick={onToggleCollapse}
          title="צמצם"
          className="text-[#6A6660] hover:text-[#2B2B2B] transition-colors text-[15px] leading-none"
        >
          ›
        </button>
      </div>

      {project && cfg ? (
        <>
          {/* Project identity */}
          <div className="px-4 py-3 border-b border-[#E0DDD4] flex-shrink-0">
            <p className="text-[13px] font-semibold text-[#2B2B2B] leading-snug">{project.title}</p>
            {project.client?.name && (
              <p className="text-[11px] text-[#6A6660] mt-0.5">{project.client.name}</p>
            )}
            <div className="flex items-center gap-1.5 mt-1.5">
              <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${cfg.dot}`} />
              <span className={`text-[11px] font-medium ${cfg.text}`}>{cfg.label}</span>
            </div>
          </div>

          {/* Timeline */}
          <div className="flex-1 overflow-y-auto px-4 py-4">
            <TimelineContent
              projectId={project.id}
              projectTracks={project.tracks as TrackValue[]}
            />
          </div>

          {/* Footer */}
          <div className="px-4 py-3 border-t border-[#E0DDD4] flex-shrink-0">
            <Link
              href={`/projects/${project.id}`}
              className="flex items-center justify-center w-full py-2 bg-[#E8C420] text-[#2B2B2B] text-[12px] font-extrabold rounded-[2px] hover:bg-[#D4B010] transition-colors"
            >
              פתח פרויקט מלא
            </Link>
          </div>
        </>
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-[12px] text-[#6A6660]">העבר עכבר על פרויקט</p>
        </div>
      )}
    </div>
  )
}

// ─── Project row ──────────────────────────────────────────────────────────────
function ProjectRow({
  project,
  isHovered,
  onMouseEnter,
  onMouseLeave,
  hasAlert,
}: {
  project: ProjectWithClient
  isHovered: boolean
  onMouseEnter: () => void
  onMouseLeave: () => void
  hasAlert: boolean
}) {
  const router = useRouter()
  const cfg = STATUS_CONFIG[project.status]
  const trackLabels = project.tracks.map((t) => TRACK_LABELS[t as TrackValue]).join(' · ')

  return (
    <div
      onClick={() => router.push(`/projects/${project.id}`)}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className={`flex items-center px-5 py-4 border-b border-[#F0EDE4] last:border-0 cursor-pointer transition-colors relative ${
        isHovered ? 'bg-[#F8F6F2]' : 'hover:bg-[#F8F6F2]'
      }`}
    >
      {/* Alert stripe */}
      {hasAlert && (
        <span className="absolute right-0 top-2.5 bottom-2.5 w-[3px] bg-[#D4820A] rounded-l-full" />
      )}
      {/* Hover indicator */}
      {isHovered && (
        <span className="absolute left-0 top-2.5 bottom-2.5 w-[3px] bg-[#E8C420] rounded-r-full" />
      )}

      <div className="flex-1 min-w-0">
        <div className="text-[13px] font-semibold text-[#2B2B2B] truncate">{project.title}</div>
        <div className="text-[11px] text-[#6A6660] mt-0.5 truncate">
          {trackLabels}{project.location ? ` · ${project.location}` : ''}
        </div>
      </div>

      <div className="hidden md:block text-[12px] text-[#6A6660] mx-5 flex-shrink-0 w-24 truncate">
        {project.client?.name ?? '—'}
      </div>

      <div className="flex items-center gap-1.5 flex-shrink-0">
        <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${cfg.dot}`} />
        <span className={`text-[12px] font-medium ${cfg.text}`}>{cfg.label}</span>
      </div>

      <span className="mr-4 text-[#6A6660] text-[13px] flex-shrink-0">←</span>
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function ProjectsPage() {
  const { data: projects, isLoading } = useProjects()
  const { data: alerts } = useAlerts()
  const { data: role } = useCurrentRole()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | 'all'>('all')
  const [hovered, setHovered] = useState<ProjectWithClient | null>(null)
  const [defaultProject, setDefaultProject] = useState<ProjectWithClient | null>(null)
  const [panelCollapsed, setPanelCollapsed] = useState(false)

  // Auto-select first project for timeline on load
  useEffect(() => {
    if (projects && projects.length > 0 && !defaultProject) {
      setDefaultProject(projects[0])
    }
  }, [projects, defaultProject])

  const alertSet = new Set((alerts ?? []).map((a: ProjectAlert) => a.projectId))

  const filtered = (projects ?? []).filter((p) => {
    const matchSearch = p.title.toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === 'all' || p.status === statusFilter
    return matchSearch && matchStatus
  })

  const active = filtered.filter((p) => p.status === 'active')
  const others = filtered.filter((p) => p.status !== 'active')

  // Timeline shows hovered project, or falls back to default (first)
  const timelineProject = hovered ?? defaultProject

  return (
    <div className="flex flex-col h-full space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-[20px] font-black text-[#2B2B2B] tracking-tight">פרויקטים</h1>
        <Link
          href="/projects/new"
          className="inline-flex items-center px-4 py-2 bg-[#E8C420] text-[#2B2B2B] text-[13px] font-extrabold rounded-[2px] hover:bg-[#D4B010] transition-colors"
        >
          + פרויקט חדש
        </Link>
      </div>

      {/* Alert banner */}
      {role === 'admin' && (alerts?.length ?? 0) > 0 && (
        <div className="flex items-center gap-3 px-4 py-3 bg-white border border-[#E0DDD4] rounded-[2px] border-r-[3px] border-r-[#D4820A]">
          <span className="w-2 h-2 rounded-full bg-[#D4820A] flex-shrink-0" />
          <span className="text-[13px] text-[#2B2B2B] font-medium">
            {alerts!.length} {alerts!.length === 1 ? 'פרויקט דורש' : 'פרויקטים דורשים'} טיפול
          </span>
          <Link href="/reports" className="mr-auto text-[12px] font-medium text-[#E8C420] hover:underline">
            לדוחות
          </Link>
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-2">
        <Input
          placeholder="חיפוש לפי שם..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs h-9 text-[13px] border-[#E0DDD4] bg-white text-[#2B2B2B] placeholder:text-[#6A6660] focus-visible:ring-[#1A7A6E]"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as ProjectStatus | 'all')}
          className="h-9 px-3 text-[13px] border border-[#E0DDD4] rounded-[2px] bg-white text-[#2B2B2B] focus:outline-none focus:ring-1 focus:ring-[#1A7A6E]"
        >
          <option value="all">כל הסטטוסים</option>
          <option value="active">פעיל</option>
          <option value="completed">הושלם</option>
          <option value="on_hold">מושהה</option>
        </select>
      </div>

      {/* Two-panel layout */}
      <div className="flex gap-4 flex-1 min-h-0">

        {/* Left — project list */}
        <div className="flex-1 min-w-0 space-y-4 overflow-y-auto">
          {isLoading ? (
            <div className="py-16 text-center text-[13px] text-[#6A6660]">טוען...</div>
          ) : filtered.length === 0 ? (
            <div className="py-16 text-center text-[13px] text-[#6A6660]">
              {projects?.length === 0 ? 'אין פרויקטים עדיין' : 'לא נמצאו תוצאות'}
            </div>
          ) : (
            <>
              {active.length > 0 && (
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-[#6A6660] mb-2">פעילים</p>
                  <div className="bg-white border border-[#E0DDD4] rounded-[2px] overflow-hidden">
                    {active.map((p) => (
                      <ProjectRow
                        key={p.id}
                        project={p}
                        isHovered={hovered?.id === p.id}
                        onMouseEnter={() => setHovered(p)}
                        onMouseLeave={() => setHovered(null)}
                        hasAlert={alertSet.has(p.id)}
                      />
                    ))}
                  </div>
                </div>
              )}
              {others.length > 0 && (
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-[#6A6660] mb-2">
                    {active.length > 0 ? 'אחרים' : 'פרויקטים'}
                  </p>
                  <div className="bg-white border border-[#E0DDD4] rounded-[2px] overflow-hidden">
                    {others.map((p) => (
                      <ProjectRow
                        key={p.id}
                        project={p}
                        isHovered={hovered?.id === p.id}
                        onMouseEnter={() => setHovered(p)}
                        onMouseLeave={() => setHovered(null)}
                        hasAlert={alertSet.has(p.id)}
                      />
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Right — timeline panel */}
        <TimelinePanel
          project={timelineProject}
          collapsed={panelCollapsed}
          onToggleCollapse={() => setPanelCollapsed((v) => !v)}
        />
      </div>
    </div>
  )
}
