'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useProjects, useDeleteProject } from '@/lib/hooks/use-projects'
import { useAlerts, type ProjectAlert } from '@/lib/hooks/use-reports'
import { useCurrentRole } from '@/lib/hooks/use-profile'
import { useProjectStages, useUpdateStage } from '@/lib/hooks/use-stages'
import { TRACK_LABELS } from '@/lib/constants/tracks'
import { Input } from '@/components/ui/input'
import type { ProjectStatus, TrackValue, ProjectWithClient } from '@/types/database'
import { Breadcrumb } from '@/components/shared/Breadcrumb'

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
        className="w-full mt-1 text-[11px] text-[#1a1a1a] border border-[#3D6A9E] rounded-lg px-2 py-1 resize-none focus:outline-none bg-white"
        placeholder="הוסף הערה..."
      />
    )
  }

  if (note) {
    return (
      <p
        onClick={(e) => { e.stopPropagation(); setEditing(true) }}
        className="mt-1 text-[11px] text-[#666666] cursor-pointer hover:text-[#1a1a1a] transition-colors leading-relaxed"
        title="לחץ לעריכה"
      >
        {note}
      </p>
    )
  }

  return (
    <button
      onClick={(e) => { e.stopPropagation(); setEditing(true) }}
      className="mt-1 text-[10px] text-[#aaaaaa] hover:text-[#3D6A9E] transition-colors"
    >
      + הוסף הערה
    </button>
  )
}

// ─── Status config ────────────────────────────────────────────────────────────
const STATUS_CONFIG: Record<ProjectStatus, { dot: string; label: string; text: string }> = {
  active:    { dot: 'bg-[#3D6A9E]', label: 'פעיל',  text: 'text-[#3D6A9E]' },
  completed: { dot: 'bg-[#aaaaaa]', label: 'הושלם', text: 'text-[#aaaaaa]' },
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

  if (isLoading) return <p className="text-[12px] text-[#666666]">טוען...</p>
  if (!stages?.length) return <p className="text-[12px] text-[#666666]">אין שלבים</p>

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
            <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-[#666666] mb-2">
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
                    <div className="absolute right-[5px] top-3.5 bottom-0 w-px bg-[#dddddd]" />
                  )}
                  <div className="flex-shrink-0 mt-0.5 z-10">
                    {state === 'done' ? (
                      <div className="w-3 h-3 rounded-full bg-[#3D6A9E] flex items-center justify-center">
                        <svg width="7" height="6" viewBox="0 0 7 6" fill="none">
                          <polyline points="1,3 2.8,5 6,1" stroke="white" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                    ) : state === 'active' ? (
                      <div className="w-3 h-3 rounded-full border-2 border-[#3D6A9E] bg-white" />
                    ) : (
                      <div className="w-3 h-3 rounded-full border border-[#dddddd] bg-white" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    {/* Stage name + days elapsed */}
                    <div className="flex items-baseline justify-between gap-2">
                      <span className={`text-[12px] leading-tight ${
                        state === 'done'   ? 'text-[#aaaaaa] line-through' :
                        state === 'active' ? 'text-[#1a1a1a] font-semibold' :
                                            'text-[#aaaaaa]'
                      }`}>
                        {stage.name}
                      </span>
                      {state === 'done' && stage.completed_at && (
                        <span className="text-[10px] text-[#aaaaaa] flex-shrink-0 whitespace-nowrap">
                          {daysSince(stage.completed_at)}
                        </span>
                      )}
                    </div>

                    {/* Financial hint */}
                    {stage.price > 0 && (stage.completed || stage.invoice_sent) && (
                      <span className={`block text-[10px] mt-0.5 ${
                        stage.completed && !stage.invoice_sent ? 'text-[#D4820A]' :
                        stage.invoice_sent && !stage.paid      ? 'text-[#C0392B]' :
                        stage.paid                             ? 'text-[#3D6A9E]' : ''
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
      <div className="flex-shrink-0 w-8 bg-white border-r border-[#dddddd] flex flex-col items-center pt-4">
        <button
          onClick={onToggleCollapse}
          title="פתח ציר זמן"
          className="text-[#666666] hover:text-[#1a1a1a] transition-colors text-[15px] rotate-180"
        >
          ›
        </button>
      </div>
    )
  }

  return (
    <div className="flex-shrink-0 w-72 bg-white border-r border-[#dddddd] flex flex-col overflow-hidden rounded-lg border border-[#dddddd]">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#dddddd] flex-shrink-0">
        <span className="text-[11px] font-bold uppercase tracking-[0.08em] text-[#666666]">ציר זמן</span>
        <button
          onClick={onToggleCollapse}
          title="צמצם"
          className="text-[#666666] hover:text-[#1a1a1a] transition-colors text-[15px] leading-none"
        >
          ›
        </button>
      </div>

      {project && cfg ? (
        <>
          {/* Project identity */}
          <div className="px-4 py-3 border-b border-[#dddddd] flex-shrink-0">
            <p className="text-[13px] font-semibold text-[#1a1a1a] leading-snug">{project.title}</p>
            {project.client?.name && (
              <p className="text-[11px] text-[#666666] mt-0.5">{project.client.name}</p>
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
          <div className="px-4 py-3 border-t border-[#dddddd] flex-shrink-0">
            <Link
              href={`/projects/${project.id}`}
              className="flex items-center justify-center w-full py-2 bg-[#3D6A9E] text-[#1a1a1a] text-[12px] font-extrabold rounded-lg hover:bg-[#D4B010] transition-colors"
            >
              פתח פרויקט מלא
            </Link>
          </div>
        </>
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-[12px] text-[#666666]">העבר עכבר על פרויקט</p>
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
  dragHandleProps,
  isDragging,
}: {
  project: ProjectWithClient
  isHovered: boolean
  onMouseEnter: () => void
  onMouseLeave: () => void
  hasAlert: boolean
  dragHandleProps?: React.HTMLAttributes<HTMLDivElement>
  isDragging?: boolean
}) {
  const router = useRouter()
  const deleteProject = useDeleteProject()
  const [confirm, setConfirm] = useState(false)
  const cfg = STATUS_CONFIG[project.status]
  const trackLabels = project.tracks.map((t) => TRACK_LABELS[t as TrackValue]).join(' · ')

  async function handleDelete(e: React.MouseEvent) {
    e.stopPropagation()
    try {
      await deleteProject.mutateAsync(project.id)
    } catch {
      alert('שגיאה במחיקה. ודא שאין נתונים תלויים בפרויקט.')
    }
  }

  return (
    <div
      onClick={() => !confirm && router.push(`/projects/${project.id}`)}
      onMouseEnter={onMouseEnter}
      onMouseLeave={() => { onMouseLeave(); setConfirm(false) }}
      className={`flex items-center px-3 py-4 border-b border-[#f4f4f4] last:border-0 cursor-pointer transition-colors relative group ${
        isDragging ? 'opacity-40 bg-[#EBF1F9]' : isHovered ? 'bg-[#f8f8f8]' : 'hover:bg-[#f8f8f8]'
      }`}
    >
      {/* Alert stripe */}
      {hasAlert && (
        <span className="absolute right-0 top-2.5 bottom-2.5 w-[3px] bg-[#D4820A] rounded-l-full" />
      )}
      {/* Hover indicator */}
      {isHovered && (
        <span className="absolute left-0 top-2.5 bottom-2.5 w-[3px] bg-[#3D6A9E] rounded-r-full" />
      )}

      {/* Drag handle */}
      <div
        {...dragHandleProps}
        onClick={(e) => e.stopPropagation()}
        className="flex-shrink-0 w-5 text-center text-[#cccccc] cursor-grab opacity-0 group-hover:opacity-100 transition-opacity hover:text-[#3D6A9E] ml-1 select-none text-[14px]"
        title="גרור להזזה"
      >
        ⠿
      </div>

      <div className="flex-1 min-w-0 mr-1">
        <div className="text-[13px] font-semibold text-[#1a1a1a] truncate">{project.title}</div>
        <div className="text-[11px] text-[#666666] mt-0.5 truncate">
          {trackLabels}{project.location ? ` · ${project.location}` : ''}
        </div>
      </div>

      <div className="hidden md:block text-[12px] text-[#666666] mx-5 flex-shrink-0 w-24 truncate">
        {project.client?.name ?? '—'}
      </div>

      <div className="flex items-center gap-1.5 flex-shrink-0">
        <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${cfg.dot}`} />
        <span className={`text-[12px] font-medium ${cfg.text}`}>{cfg.label}</span>
      </div>

      {/* Delete */}
      <div className="mr-4 flex-shrink-0 flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
        {confirm ? (
          <>
            <button
              onClick={handleDelete}
              disabled={deleteProject.isPending}
              className="rounded px-1.5 py-0.5 text-[10px] font-bold bg-[#C0392B] text-white hover:bg-[#a93226] disabled:opacity-50"
            >
              {deleteProject.isPending ? '...' : 'מחק'}
            </button>
            <button
              onClick={() => setConfirm(false)}
              className="rounded px-1.5 py-0.5 text-[10px] text-[#888] border border-[#E5E7EB] hover:bg-[#f4f4f4]"
            >
              ביטול
            </button>
          </>
        ) : (
          <button
            onClick={() => setConfirm(true)}
            className="text-[11px] text-[#cccccc] hover:text-[#C0392B] opacity-0 group-hover:opacity-100 transition-opacity px-1 rounded hover:bg-[#fdf0ef]"
            title="מחק פרויקט"
          >
            מחק
          </button>
        )}
      </div>
    </div>
  )
}

// ─── Sortable project list ────────────────────────────────────────────────────
type SortField = 'title' | 'status' | 'client' | null
type SortDir = 'asc' | 'desc'

function SortableProjectList({
  projects,
  hovered,
  setHovered,
  alertSet,
}: {
  projects: ProjectWithClient[]
  hovered: ProjectWithClient | null
  setHovered: (p: ProjectWithClient | null) => void
  alertSet: Set<string>
}) {
  const [order, setOrder] = useState<string[]>(() => projects.map((p) => p.id))
  const [sortField, setSortField] = useState<SortField>(null)
  const [sortDir, setSortDir] = useState<SortDir>('asc')
  const [dragId, setDragId] = useState<string | null>(null)
  const [dropTargetId, setDropTargetId] = useState<string | null>(null)
  const [dropPosition, setDropPosition] = useState<'above' | 'below'>('below')

  // Sync order when projects list changes (new project added etc.)
  useEffect(() => {
    setOrder((prev) => {
      const newIds = projects.map((p) => p.id)
      const kept = prev.filter((id) => newIds.includes(id))
      const added = newIds.filter((id) => !kept.includes(id))
      return [...kept, ...added]
    })
  }, [projects])

  function handleSort(field: SortField) {
    if (sortField === field) {
      setSortDir((d) => d === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDir('asc')
    }
  }

  function sortIcon(field: SortField) {
    if (sortField !== field) return <span className="text-[#cccccc] text-[9px]">⇅</span>
    return <span className="text-[#3D6A9E] text-[9px]">{sortDir === 'asc' ? '▲' : '▼'}</span>
  }

  // Build displayed list: apply sort or manual order
  let displayed = [...projects]
  if (sortField) {
    displayed.sort((a, b) => {
      let av = '', bv = ''
      if (sortField === 'title')  { av = a.title; bv = b.title }
      if (sortField === 'status') { av = a.status; bv = b.status }
      if (sortField === 'client') { av = a.client?.name ?? ''; bv = b.client?.name ?? '' }
      const cmp = av.localeCompare(bv, 'he')
      return sortDir === 'asc' ? cmp : -cmp
    })
  } else {
    displayed.sort((a, b) => order.indexOf(a.id) - order.indexOf(b.id))
  }

  // Drag handlers
  function onDragStart(id: string) { setDragId(id) }
  function onDragEnd() { setDragId(null); setDropTargetId(null) }

  function onDragOver(e: React.DragEvent, targetId: string) {
    e.preventDefault()
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
    setDropPosition(e.clientY < rect.top + rect.height / 2 ? 'above' : 'below')
    setDropTargetId(targetId)
  }

  function onDrop(targetId: string) {
    if (!dragId || dragId === targetId) { setDragId(null); setDropTargetId(null); return }
    setSortField(null) // clear sort when manually dragging
    setOrder((prev) => {
      const list = [...prev]
      const fromIdx = list.indexOf(dragId)
      const toIdx = list.indexOf(targetId)
      list.splice(fromIdx, 1)
      const newTo = list.indexOf(targetId)
      list.splice(dropPosition === 'above' ? newTo : newTo + 1, 0, dragId)
      return list
    })
    setDragId(null)
    setDropTargetId(null)
  }

  return (
    <div>
      {/* Sort bar */}
      <div className="flex items-center gap-3 mb-2 px-1">
        <span className="text-[10px] font-bold uppercase tracking-[0.06em] text-[#aaaaaa]">מיון:</span>
        {([['title', 'שם'], ['status', 'סטטוס'], ['client', 'לקוח']] as [SortField, string][]).map(([f, label]) => (
          <button
            key={f!}
            onClick={() => handleSort(f)}
            className={`flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded transition-colors ${
              sortField === f ? 'text-[#3D6A9E] bg-[#EBF1F9]' : 'text-[#666666] hover:text-[#3D6A9E] hover:bg-[#f4f4f4]'
            }`}
          >
            {label} {sortIcon(f)}
          </button>
        ))}
        {sortField && (
          <button
            onClick={() => setSortField(null)}
            className="text-[10px] text-[#aaaaaa] hover:text-[#C0392B] mr-1"
          >
            ✕ נקה מיון
          </button>
        )}
      </div>

      {/* List */}
      <div
        className="bg-white border border-[#dddddd] rounded-lg overflow-hidden"
        style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}
      >
        {displayed.map((p) => {
          const isDropTarget = dropTargetId === p.id
          return (
            <div
              key={p.id}
              draggable
              onDragStart={() => onDragStart(p.id)}
              onDragEnd={onDragEnd}
              onDragOver={(e) => onDragOver(e, p.id)}
              onDrop={() => onDrop(p.id)}
              style={{
                borderTop: isDropTarget && dropPosition === 'above' ? '2px solid #3D6A9E' : undefined,
                borderBottom: isDropTarget && dropPosition === 'below' ? '2px solid #3D6A9E' : undefined,
              }}
            >
              <ProjectRow
                project={p}
                isHovered={hovered?.id === p.id}
                onMouseEnter={() => setHovered(p)}
                onMouseLeave={() => setHovered(null)}
                hasAlert={alertSet.has(p.id)}
                isDragging={dragId === p.id}
              />
            </div>
          )
        })}
      </div>
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

  const timelineProject = hovered ?? defaultProject

  return (
    <div className="flex flex-col h-full space-y-5">
      <Breadcrumb items={[{ label: 'דשבורד', href: '/' }, { label: 'פרויקטים' }]} />
      <div className="flex items-center justify-between">
        <h1 className="text-[20px] font-black text-[#1a1a1a] tracking-tight">פרויקטים</h1>
        <Link
          href="/projects/new"
          className="inline-flex items-center px-4 py-2 bg-[#3D6A9E] text-white text-[13px] font-extrabold rounded-lg hover:bg-[#2F5A8A] transition-colors"
        >
          + פרויקט חדש
        </Link>
      </div>

      {/* Alert banner */}
      {role === 'admin' && (alerts?.length ?? 0) > 0 && (
        <div className="flex items-center gap-3 px-4 py-3 bg-white border border-[#dddddd] rounded-lg border-r-[3px] border-r-[#D4820A]">
          <span className="w-2 h-2 rounded-full bg-[#D4820A] flex-shrink-0" />
          <span className="text-[13px] text-[#1a1a1a] font-medium">
            {alerts!.length} {alerts!.length === 1 ? 'פרויקט דורש' : 'פרויקטים דורשים'} טיפול
          </span>
          <Link href="/reports" className="mr-auto text-[12px] font-medium text-[#3D6A9E] hover:underline">
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
          className="max-w-xs h-9 text-[13px] border-[#dddddd] bg-white text-[#1a1a1a] placeholder:text-[#aaaaaa] focus-visible:ring-[#3D6A9E]"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as ProjectStatus | 'all')}
          className="h-9 px-3 text-[13px] border border-[#dddddd] rounded-lg bg-white text-[#1a1a1a] focus:outline-none focus:ring-1 focus:ring-[#3D6A9E]"
        >
          <option value="all">כל הסטטוסים</option>
          <option value="active">פעיל</option>
          <option value="completed">הושלם</option>
          <option value="on_hold">מושהה</option>
        </select>
      </div>

      {/* Two-panel layout */}
      <div className="flex gap-4 flex-1 min-h-0">
        <div className="flex-1 min-w-0 overflow-y-auto">
          {isLoading ? (
            <div className="py-16 text-center text-[13px] text-[#666666]">טוען...</div>
          ) : filtered.length === 0 ? (
            <div className="py-16 text-center text-[13px] text-[#666666]">
              {projects?.length === 0 ? 'אין פרויקטים עדיין' : 'לא נמצאו תוצאות'}
            </div>
          ) : (
            <SortableProjectList
              projects={filtered}
              hovered={hovered}
              setHovered={setHovered}
              alertSet={alertSet}
            />
          )}
        </div>

        <TimelinePanel
          project={timelineProject}
          collapsed={panelCollapsed}
          onToggleCollapse={() => setPanelCollapsed((v) => !v)}
        />
      </div>
    </div>
  )
}
