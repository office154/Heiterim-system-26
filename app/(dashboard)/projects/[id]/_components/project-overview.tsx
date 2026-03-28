'use client'

import { useState, useRef, useEffect } from 'react'
import { useProjectStages } from '@/lib/hooks/use-stages'
import { useStatusRequirements, useUpdateRequirement, useCreateRequirement, useDeleteRequirement } from '@/lib/hooks/use-requirements'
import { useProjectFiles, getSignedUrl } from '@/lib/hooks/use-files'
import { useCurrentRole } from '@/lib/hooks/use-profile'
import type { RequirementStatus, StatusRequirement } from '@/types/database'

const PREDEFINED_SECTIONS = ['תיק מידע', 'בקשה להיתר', 'הערות ועדה', 'בדיקת תכן', 'אחר']

interface ProjectOverviewProps {
  projectId: string
  onNavigate: (tab: string) => void
}

function formatPrice(n: number) {
  return `₪${n.toLocaleString('he-IL')}`
}

const REQUIREMENT_STATUSES: RequirementStatus[] = [
  'ממתין', 'בטיפול', 'הוגש', 'התקבל', 'חזרו הערות',
]

const STATUS_STYLES: Record<RequirementStatus, string> = {
  'ממתין':       'bg-[#f4f4f4] text-[#666666]',
  'בטיפול':     'bg-[#fef3e0] text-[#D4820A]',
  'הוגש':       'bg-[#E8F5F3] text-[#1A7A6E]',
  'התקבל':      'bg-[#E8F5F3] text-[#1A7A6E]',
  'חזרו הערות': 'bg-[#fdf0ef] text-[#C0392B]',
}

function StageBadge({ stage }: { stage: { paid: boolean; invoice_sent: boolean; completed: boolean } }) {
  if (stage.paid)
    return <span style={{ background: '#dcfce7', color: '#166534' }} className="rounded-[2px] px-2 py-0.5 text-[10px] font-semibold whitespace-nowrap">שולם</span>
  if (stage.invoice_sent)
    return <span style={{ background: '#fef9c3', color: '#854d0e' }} className="rounded-[2px] px-2 py-0.5 text-[10px] font-semibold whitespace-nowrap">חשבונית</span>
  if (stage.completed)
    return <span style={{ background: '#dbeafe', color: '#1e40af' }} className="rounded-[2px] px-2 py-0.5 text-[10px] font-semibold whitespace-nowrap">בוצע</span>
  return <span style={{ background: '#f3f4f6', color: '#6b7280' }} className="rounded-[2px] px-2 py-0.5 text-[10px] font-semibold whitespace-nowrap">ממתין</span>
}

function InlineStatusSelect({ req, projectId }: { req: StatusRequirement; projectId: string }) {
  const updateReq = useUpdateRequirement()

  async function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    await updateReq.mutateAsync({
      id: req.id,
      projectId,
      status: e.target.value as RequirementStatus,
      status_date: new Date().toISOString().split('T')[0],
    })
  }

  return (
    <select
      value={req.status}
      onChange={handleChange}
      onClick={(e) => e.stopPropagation()}
      className={`rounded-[2px] px-1.5 py-0.5 text-[10px] font-semibold focus:outline-none cursor-pointer ${STATUS_STYLES[req.status]}`}
    >
      {REQUIREMENT_STATUSES.map((s) => (
        <option key={s} value={s}>{s}</option>
      ))}
    </select>
  )
}

function ReqRow({ req, projectId }: { req: StatusRequirement; projectId: string }) {
  const deleteReq = useDeleteRequirement()
  return (
    <div className="group flex items-center justify-between py-1.5 border-b border-[#f5f5f5] last:border-0">
      <span className="text-[11px] text-[#333] truncate ml-2">
        <span className="text-[9px] text-[#bbb] font-medium">{req.section} / </span>
        {req.requirement}
      </span>
      <div className="flex items-center gap-1.5 shrink-0">
        <InlineStatusSelect req={req} projectId={projectId} />
        <button
          onClick={() => deleteReq.mutate({ id: req.id, projectId })}
          className="opacity-0 group-hover:opacity-100 text-[#ccc] hover:text-[#C0392B] transition-opacity text-[11px] leading-none"
          title="מחק"
        >
          ✕
        </button>
      </div>
    </div>
  )
}

function AddRequirementRow({ projectId, requirements }: { projectId: string; requirements: StatusRequirement[] }) {
  const createReq = useCreateRequirement()
  const [section, setSection] = useState(PREDEFINED_SECTIONS[0])
  const [text, setText] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  async function handleAdd() {
    const trimmed = text.trim()
    if (!trimmed) return
    const nextIndex = requirements.length > 0
      ? Math.max(...requirements.map((r) => r.order_index)) + 1
      : 1
    await createReq.mutateAsync({ project_id: projectId, section, requirement: trimmed, order_index: nextIndex })
    setText('')
    inputRef.current?.focus()
  }

  return (
    <div className="mt-3 rounded-[2px] border border-[#e8e8e8] bg-[#fafafa] p-2.5">
      <p className="text-[9px] font-semibold text-[#bbb] uppercase tracking-[0.07em] mb-2">הוסף לדוח סטטוס</p>
      <div className="flex gap-1.5 items-center">
        <select
          value={section}
          onChange={(e) => setSection(e.target.value)}
          className="rounded-[2px] border border-[#e0e0e0] bg-white px-1.5 py-1 text-[10px] text-[#555] focus:outline-none focus:border-[#ccc] shrink-0"
          style={{ maxWidth: 90 }}
        >
          {PREDEFINED_SECTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <input
          ref={inputRef}
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') handleAdd() }}
          placeholder="פירוט הדרישה..."
          className="flex-1 min-w-0 rounded-[2px] border border-[#e0e0e0] bg-white px-2 py-1 text-[11px] text-[#1a1a1a] placeholder:text-[#bbb] focus:outline-none focus:border-[#ccc]"
        />
        <button
          onClick={handleAdd}
          disabled={createReq.isPending || !text.trim()}
          className="shrink-0 rounded-[2px] bg-[#1a1a1a] px-2.5 py-1 text-[10px] font-semibold text-white hover:bg-[#333] disabled:opacity-30 transition-colors"
        >
          {createReq.isPending ? '...' : '+ הוסף'}
        </button>
      </div>
    </div>
  )
}

function FileRow({ file }: { file: { id: string; file_name: string; file_size: number | null; file_path: string } }) {
  async function handleOpen() {
    try {
      const url = await getSignedUrl(file.file_path)
      window.open(url, '_blank')
    } catch {
      alert('שגיאה בפתיחת הקובץ')
    }
  }

  return (
    <div className="flex items-center justify-between py-1.5 border-b border-[#f5f5f5] last:border-0 group/file">
      <span className="text-[11px] text-[#333] truncate ml-2">{file.file_name}</span>
      <div className="flex items-center gap-2 shrink-0">
        <span className="text-[10px] text-[#aaa]">
          {file.file_size ? `${(file.file_size / 1024).toFixed(0)}KB` : ''}
        </span>
        <button
          onClick={handleOpen}
          className="text-[10px] text-[#E8C420] font-semibold opacity-0 group-hover/file:opacity-100 hover:underline transition-opacity"
        >
          פתח
        </button>
      </div>
    </div>
  )
}

export function ProjectOverview({ projectId, onNavigate }: ProjectOverviewProps) {
  const { data: stages = [] } = useProjectStages(projectId)
  const { data: requirements = [] } = useStatusRequirements(projectId)
  const { data: files = [] } = useProjectFiles(projectId)
  const { data: role } = useCurrentRole()
  const isAdmin = role === 'admin'

  const totalContract = stages.reduce((sum, s) => sum + s.price + (s.extra_payment || 0), 0)
  const totalPaid = stages.filter((s) => s.paid).reduce((sum, s) => sum + s.price + (s.extra_payment || 0), 0)
  const balance = totalContract - totalPaid
  const paidPct = totalContract > 0 ? Math.round((totalPaid / totalContract) * 100) : 0

  const completedReqs = requirements.filter((r) => r.status === 'התקבל').length
  const reqPct = requirements.length > 0 ? Math.round((completedReqs / requirements.length) * 100) : 0

  const previewStages = stages.slice(0, 4)
  const previewReqs = requirements.slice(0, 4)
  const previewFiles = files.slice(0, 4)

  return (
    <div className="space-y-4 mb-6">
      {/* ── KPI Strip ── */}
      <div className={`grid gap-3 ${isAdmin ? 'grid-cols-2 sm:grid-cols-4' : 'grid-cols-2'}`}>
        {isAdmin && (
          <>
            <button
              onClick={() => onNavigate('stages')}
              className="rounded-[2px] border border-[#dddddd] bg-white p-3 text-center transition-shadow hover:shadow-md"
              style={{ boxShadow: '0 2px 0 #cccccc, 0 4px 12px rgba(0,0,0,0.05)' }}
            >
              <div className="text-xl font-black text-[#2E7D5B]">{formatPrice(totalPaid)}</div>
              <div className="text-[10px] text-[#888] mt-1">שולם</div>
            </button>
            <button
              onClick={() => onNavigate('stages')}
              className="rounded-[2px] border border-[#dddddd] bg-white p-3 text-center transition-shadow hover:shadow-md"
              style={{ boxShadow: '0 2px 0 #cccccc, 0 4px 12px rgba(0,0,0,0.05)' }}
            >
              <div className={`text-xl font-black ${balance > 0 ? 'text-[#C62828]' : 'text-[#2E7D5B]'}`}>
                {formatPrice(balance)}
              </div>
              <div className="text-[10px] text-[#888] mt-1">יתרה לגביה</div>
            </button>
          </>
        )}
        <button
          onClick={() => onNavigate('status')}
          className="rounded-[2px] border border-[#dddddd] bg-white p-3 text-center transition-shadow hover:shadow-md"
          style={{ boxShadow: '0 2px 0 #cccccc, 0 4px 12px rgba(0,0,0,0.05)' }}
        >
          <div className="text-xl font-black text-[#1a1a1a]">
            {completedReqs} / {requirements.length}
          </div>
          <div className="text-[10px] text-[#888] mt-1">דרישות הושלמו</div>
        </button>
        <button
          onClick={() => onNavigate('files')}
          className="rounded-[2px] border border-[#dddddd] bg-white p-3 text-center transition-shadow hover:shadow-md"
          style={{ boxShadow: '0 2px 0 #cccccc, 0 4px 12px rgba(0,0,0,0.05)' }}
        >
          <div className="text-xl font-black text-[#1a1a1a]">{files.length}</div>
          <div className="text-[10px] text-[#888] mt-1">קבצים</div>
        </button>
      </div>

      {/* ── Panels ── */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">

        {/* Status — interactive, no panel-click */}
        <div
          className="rounded-[2px] border border-[#dddddd] bg-white overflow-hidden"
          style={{ boxShadow: '0 2px 0 #cccccc, 0 4px 12px rgba(0,0,0,0.05)' }}
        >
          <div className="flex items-center justify-between px-4 py-3 border-b border-[#f0f0f0]">
            <span className="text-[12px] font-bold text-[#1a1a1a]">דוח סטטוס</span>
            <button
              onClick={() => onNavigate('status')}
              className="text-[11px] text-[#E8C420] font-semibold hover:underline cursor-pointer"
            >
              לדוח המלא ←
            </button>
          </div>
          {requirements.length > 0 && (
            <div className="px-4 pt-3 pb-1">
              <div className="h-1.5 rounded-full bg-[#f0f0f0] overflow-hidden">
                <div
                  className="h-full bg-[#E8C420] rounded-full transition-all"
                  style={{ width: `${reqPct}%` }}
                />
              </div>
              <p className="text-[10px] text-[#888] mt-1">{reqPct}% הושלמו</p>
            </div>
          )}
          <div className="px-4 py-2">
            {previewReqs.length === 0 ? (
              <p className="text-[11px] text-[#aaa] italic py-2">אין דרישות</p>
            ) : (
              previewReqs.map((req) => (
                <ReqRow key={req.id} req={req} projectId={projectId} />
              ))
            )}
            {requirements.length > 4 && (
              <p className="text-[10px] text-[#aaa] pt-1">+ {requirements.length - 4} דרישות נוספות</p>
            )}
            <AddRequirementRow projectId={projectId} requirements={requirements} />
          </div>
        </div>

        {/* Payments — no cursor-pointer on panel, only on link */}
        <div
          className="rounded-[2px] border border-[#dddddd] bg-white overflow-hidden"
          style={{ boxShadow: '0 2px 0 #cccccc, 0 4px 12px rgba(0,0,0,0.05)' }}
        >
          <div className="flex items-center justify-between px-4 py-3 border-b border-[#f0f0f0]">
            <span className="text-[12px] font-bold text-[#1a1a1a]">תשלומים</span>
            <button
              onClick={() => onNavigate('stages')}
              className="text-[11px] text-[#E8C420] font-semibold hover:underline cursor-pointer"
            >
              לכל התשלומים ←
            </button>
          </div>
          {isAdmin && totalContract > 0 && (
            <div className="px-4 pt-3 pb-1">
              <div className="h-1.5 rounded-full bg-[#f0f0f0] overflow-hidden">
                <div
                  className="h-full bg-[#E8C420] rounded-full transition-all"
                  style={{ width: `${paidPct}%` }}
                />
              </div>
              <p className="text-[10px] text-[#888] mt-1">{paidPct}% שולם</p>
            </div>
          )}
          <div className="px-4 py-2">
            {previewStages.length === 0 ? (
              <p className="text-[11px] text-[#aaa] italic py-2">אין שלבים</p>
            ) : (
              previewStages.map((stage) => (
                <div
                  key={stage.id}
                  className="flex items-center justify-between py-1.5 border-b border-[#f5f5f5] last:border-0"
                >
                  <span className="text-[11px] text-[#333] truncate ml-2">{stage.name}</span>
                  <StageBadge stage={stage} />
                </div>
              ))
            )}
            {stages.length > 4 && (
              <p className="text-[10px] text-[#aaa] pt-1">+ {stages.length - 4} שלבים נוספים</p>
            )}
          </div>
        </div>

        {/* Files — open directly */}
        <div
          className="rounded-[2px] border border-[#dddddd] bg-white overflow-hidden"
          style={{ boxShadow: '0 2px 0 #cccccc, 0 4px 12px rgba(0,0,0,0.05)' }}
        >
          <div className="flex items-center justify-between px-4 py-3 border-b border-[#f0f0f0]">
            <span className="text-[12px] font-bold text-[#1a1a1a]">קבצים</span>
            <button
              onClick={() => onNavigate('files')}
              className="text-[11px] text-[#E8C420] font-semibold hover:underline cursor-pointer"
            >
              לכל הקבצים ←
            </button>
          </div>
          <div className="px-4 py-2">
            {previewFiles.length === 0 ? (
              <p className="text-[11px] text-[#aaa] italic py-2">אין קבצים</p>
            ) : (
              previewFiles.map((file) => (
                <FileRow key={file.id} file={file} />
              ))
            )}
            {files.length > 4 && (
              <p className="text-[10px] text-[#aaa] pt-1">+ {files.length - 4} קבצים נוספים</p>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}
