'use client'

import { useState, useMemo, useEffect, useRef, useCallback } from 'react'
import { useProject, useUpdateProject } from '@/lib/hooks/use-projects'
import { useProjectContacts, useCreateContact, useUpdateContact, useDeleteContact } from '@/lib/hooks/use-contacts'
import { useStatusRequirements, useCreateRequirement, useUpdateRequirement, useDeleteRequirement } from '@/lib/hooks/use-requirements'
import { useRequirementSteps, useCreateStep, useUpdateStep, useDeleteStep } from '@/lib/hooks/use-requirement-steps'
import { useCreateTodo } from '@/lib/hooks/use-todos'
import { InlineEdit } from '@/components/inline-edit'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import type { RequirementStatus, ProjectContact, StatusRequirement, RequirementStep } from '@/types/database'
import { ProjectTimeline } from '@/components/features/projects/ProjectTimeline'

interface StatusTabProps {
  projectId: string
}

const REQUIREMENT_STATUSES: RequirementStatus[] = [
  'ממתין', 'בטיפול', 'הוגש', 'התקבל', 'חזרו הערות',
]

const STATUS_STYLES: Record<RequirementStatus, string> = {
  'ממתין': 'bg-[#f4f4f4] text-[#666666]',
  'בטיפול': 'bg-[#fef3e0] text-[#D4820A]',
  'הוגש': 'bg-[#EBF1F9] text-[#3D6A9E]',
  'התקבל': 'bg-[#EBF1F9] text-[#3D6A9E]',
  'חזרו הערות': 'bg-[#fdf0ef] text-[#C0392B]',
}

const PREDEFINED_SECTIONS = ['תיק מידע', 'בקשה להיתר', 'הערות ועדה', 'בדיקת תכן', 'אחר']

function today(): string {
  return new Date().toISOString().split('T')[0]
}

function formatDate(d: string | null): string {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('he-IL')
}

// Inline date picker cell
function DateCell({
  value,
  onSave,
}: {
  value: string | null
  onSave: (v: string) => Promise<void>
}) {
  const [editing, setEditing] = useState(false)
  const [local, setLocal] = useState(value ?? '')
  const ref = useRef<HTMLInputElement>(null)

  useEffect(() => { setLocal(value ?? '') }, [value])
  useEffect(() => { if (editing) ref.current?.focus() }, [editing])

  if (editing) {
    return (
      <input
        ref={ref}
        type="date"
        value={local}
        onChange={(e) => setLocal(e.target.value)}
        onBlur={async () => { await onSave(local); setEditing(false) }}
        onKeyDown={(e) => { if (e.key === 'Escape') setEditing(false) }}
        dir="ltr"
        className="rounded-lg border border-[#3D6A9E] px-1 py-0.5 text-xs focus:outline-none focus:ring-2 focus:ring-[#3D6A9E]/20"
      />
    )
  }

  return (
    <button
      onClick={() => setEditing(true)}
      className="rounded-lg px-1 py-0.5 text-xs transition-all hover:bg-[#F0F2F5] hover:ring-1 hover:ring-[#dddddd] print:cursor-default"
    >
      {value ? formatDate(value) : <span className="italic text-[#aaaaaa]">—</span>}
    </button>
  )
}

// Status dropdown cell
function StatusCell({
  value,
  onSave,
}: {
  value: RequirementStatus
  onSave: (status: RequirementStatus, date: string) => Promise<void>
}) {
  async function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    await onSave(e.target.value as RequirementStatus, today())
  }

  return (
    <select
      value={value}
      onChange={handleChange}
      className={`rounded-lg px-2 py-1 text-xs font-medium focus:outline-none ${STATUS_STYLES[value]} print:border-none print:bg-transparent`}
    >
      {REQUIREMENT_STATUSES.map((s) => (
        <option key={s} value={s}>{s}</option>
      ))}
    </select>
  )
}

// Always-visible text input for requirement field
function RequirementInput({
  value,
  onSave,
}: {
  value: string
  onSave: (v: string) => Promise<void>
}) {
  const [local, setLocal] = useState(value)
  useEffect(() => { setLocal(value) }, [value])

  const handleBlur = useCallback(async () => {
    if (local !== value) await onSave(local)
  }, [local, value, onSave])

  return (
    <input
      type="text"
      value={local}
      onChange={(e) => setLocal(e.target.value)}
      onBlur={handleBlur}
      onKeyDown={(e) => { if (e.key === 'Enter') e.currentTarget.blur() }}
      placeholder="הקלד פירוט..."
      className="w-full rounded-lg border border-[#cccccc] bg-[#f8f8f8] px-2 py-1.5 text-[13px] text-[#1a1a1a] placeholder:text-[#aaaaaa] focus:border-[#3D6A9E] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6A9E]/12"
    />
  )
}

// Contacts table
function ContactsTable({ projectId }: { projectId: string }) {
  const { data: contacts } = useProjectContacts(projectId)
  const createContact = useCreateContact()
  const updateContact = useUpdateContact()
  const deleteContact = useDeleteContact()

  async function handleAdd() {
    await createContact.mutateAsync({ project_id: projectId, role: 'תפקיד' })
  }

  async function saveContact(contact: ProjectContact, field: string, value: string | boolean) {
    await updateContact.mutateAsync({ id: contact.id, projectId, [field]: value })
  }

  return (
    <div className="print:hidden">
      <h2 className="mb-3 text-base font-semibold text-[#1a1a1a]">אנשי קשר</h2>
      <div className="overflow-hidden rounded-lg border border-[#dddddd] bg-white">
        <table className="w-full text-sm">
          <thead className="bg-[#f8f8f8] text-[10px] text-[#aaaaaa]">
            <tr>
              <th className="px-3 py-2 text-right font-bold uppercase tracking-[0.08em]">תפקיד</th>
              <th className="px-3 py-2 text-center font-bold uppercase tracking-[0.08em]">מינוי</th>
              <th className="px-3 py-2 text-right font-bold uppercase tracking-[0.08em]">שם</th>
              <th className="px-3 py-2 text-right font-bold uppercase tracking-[0.08em]">טלפון</th>
              <th className="px-3 py-2 text-right font-bold uppercase tracking-[0.08em]">מייל</th>
              <th className="w-8 px-3 py-2" />
            </tr>
          </thead>
          <tbody className="divide-y divide-[#f4f4f4]">
            {(contacts ?? []).map((c) => (
              <tr key={c.id} className="group hover:bg-[#f8f8f8]">
                <td className="px-3 py-1.5">
                  <InlineEdit value={c.role} onSave={(v) => saveContact(c, 'role', v)} />
                </td>
                <td className="px-3 py-1.5 text-center">
                  <div className="flex justify-center">
                    <Checkbox
                      checked={c.appointed}
                      onCheckedChange={(v) => saveContact(c, 'appointed', !!v)}
                    />
                  </div>
                </td>
                <td className="px-3 py-1.5">
                  <InlineEdit value={c.name} onSave={(v) => saveContact(c, 'name', v)} emptyText="—" />
                </td>
                <td className="px-3 py-1.5">
                  <InlineEdit value={c.phone} onSave={(v) => saveContact(c, 'phone', v)} emptyText="—" />
                </td>
                <td className="px-3 py-1.5">
                  <InlineEdit value={c.email} onSave={(v) => saveContact(c, 'email', v)} emptyText="—" />
                </td>
                <td className="px-3 py-1.5">
                  <button
                    onClick={() => deleteContact.mutate({ id: c.id, projectId })}
                    className="hidden text-[#aaaaaa] hover:text-[#C0392B] group-hover:block"
                  >
                    ✕
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="border-t border-[#f4f4f4] p-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleAdd}
            disabled={createContact.isPending}
            className="text-xs text-[#666666]"
          >
            + הוסף איש קשר
          </Button>
        </div>
      </div>
    </div>
  )
}

function TrashIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14H6L5 6" />
      <path d="M10 11v6M14 11v6" />
      <path d="M9 6V4h6v2" />
    </svg>
  )
}

// Step rows for a single requirement
function StepRows({ requirementId, projectId }: { requirementId: string; projectId: string }) {
  const { data: steps } = useRequirementSteps(requirementId)
  const createStep = useCreateStep()
  const updateStep = useUpdateStep()
  const deleteStep = useDeleteStep()

  const [addingStep, setAddingStep] = useState(false)
  const [newStepDetail, setNewStepDetail] = useState('')
  const addInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (addingStep) addInputRef.current?.focus()
  }, [addingStep])

  async function handleConfirmAdd() {
    const detail = newStepDetail.trim()
    if (!detail) return
    const maxIndex = steps && steps.length > 0
      ? Math.max(...steps.map((s) => s.order_index))
      : 0
    await createStep.mutateAsync({
      requirement_id: requirementId,
      project_id: projectId,
      detail,
      order_index: maxIndex + 1,
      step_date: null,
    })
    setNewStepDetail('')
    setAddingStep(false)
  }

  return (
    <>
      {(steps ?? []).map((step) => (
        <StepRow
          key={step.id}
          step={step}
          onToggleDone={() =>
            updateStep.mutate({ id: step.id, requirementId, done: !step.done })
          }
          onSaveDetail={async (detail) => {
            if (detail !== step.detail) {
              await updateStep.mutateAsync({ id: step.id, requirementId, detail })
            }
          }}
          onDelete={() => deleteStep.mutate({ id: step.id, requirementId })}
        />
      ))}

      {/* Add step row */}
      <tr className="bg-[#f5fdf8] border-b border-[#f0f9f4]">
        <td className="print:hidden" />
        <td />
        <td />
        <td colSpan={4} className="px-3 py-1.5">
          {addingStep ? (
            <div className="flex items-center gap-2">
              <input
                ref={addInputRef}
                type="text"
                value={newStepDetail}
                onChange={(e) => setNewStepDetail(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleConfirmAdd()
                  if (e.key === 'Escape') { setAddingStep(false); setNewStepDetail('') }
                }}
                placeholder="פירוט שלב..."
                className="flex-1 rounded-lg border border-[#3D6A9E] bg-white px-2 py-1 text-[12px] text-[#1a1a1a] placeholder:text-[#aaaaaa] focus:outline-none focus:ring-2 focus:ring-[#3D6A9E]/20"
              />
              <button
                onClick={handleConfirmAdd}
                disabled={createStep.isPending}
                className="rounded-lg bg-[#3D6A9E] px-2 py-1 text-[11px] font-bold text-white hover:bg-[#1e5a3f] disabled:opacity-50"
              >
                הוסף
              </button>
              <button
                onClick={() => { setAddingStep(false); setNewStepDetail('') }}
                className="text-[11px] text-[#aaaaaa] hover:text-[#666]"
              >
                ביטול
              </button>
            </div>
          ) : (
            <button
              onClick={() => setAddingStep(true)}
              className="text-[11px] text-[#3D6A9E] hover:underline"
            >
              + הוסף שלב מעקב
            </button>
          )}
        </td>
        <td className="print:hidden" />
      </tr>
    </>
  )
}

function StepRow({
  step,
  onToggleDone,
  onSaveDetail,
  onDelete,
}: {
  step: RequirementStep
  onToggleDone: () => void
  onSaveDetail: (detail: string) => Promise<void>
  onDelete: () => void
}) {
  const [localDetail, setLocalDetail] = useState(step.detail)
  useEffect(() => { setLocalDetail(step.detail) }, [step.detail])

  return (
    <tr className="bg-[#f5fdf8] border-b border-[#f0f9f4] group">
      {/* toggle column placeholder */}
      <td className="print:hidden" />
      {/* # column placeholder */}
      <td />
      {/* uploaded column placeholder */}
      <td />
      {/* detail with circle check */}
      <td colSpan={4} className="px-3 py-1.5">
        <div className="flex items-center gap-2 pr-4">
          {/* circle check */}
          <button
            onClick={onToggleDone}
            className="flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors"
            style={{
              backgroundColor: step.done ? '#3D6A9E' : 'white',
              borderColor: step.done ? '#3D6A9E' : '#ccc',
              color: step.done ? 'white' : 'transparent',
            }}
            title={step.done ? 'סמן כלא בוצע' : 'סמן כבוצע'}
          >
            {step.done && (
              <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="2 6 5 9 10 3" />
              </svg>
            )}
          </button>
          {/* detail input */}
          <input
            type="text"
            value={localDetail}
            onChange={(e) => setLocalDetail(e.target.value)}
            onBlur={() => onSaveDetail(localDetail)}
            onKeyDown={(e) => { if (e.key === 'Enter') e.currentTarget.blur() }}
            className="flex-1 rounded-lg border border-transparent bg-transparent px-1 py-0.5 text-[12px] text-[#444] focus:border-[#3D6A9E] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#3D6A9E]/20"
            style={{ textDecoration: step.done ? 'line-through' : 'none', color: step.done ? '#aaa' : '#444' }}
          />
        </div>
      </td>
      {/* delete */}
      <td className="print:hidden px-2 py-1.5">
        <button
          onClick={onDelete}
          className="hidden text-[#ccc] hover:text-[#C0392B] group-hover:block rounded-lg p-0.5 transition-colors"
          title="מחק שלב"
        >
          <TrashIcon />
        </button>
      </td>
    </tr>
  )
}

function ReqTableRow({
  req, idx, sectionIndex, projectId, projectTitle, onSave, onStatusChange, onDelete, isDeleting,
}: {
  req: StatusRequirement
  idx: number
  sectionIndex: number
  projectId: string
  projectTitle: string
  onSave: (req: StatusRequirement, field: string, value: string | boolean | null) => Promise<void>
  onStatusChange: (req: StatusRequirement, status: RequirementStatus, date: string) => Promise<void>
  onDelete: () => Promise<void>
  isDeleting: boolean
}) {
  const [confirm, setConfirm] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const [todoAdded, setTodoAdded] = useState(false)
  const createTodo = useCreateTodo()

  async function handleAddTodo() {
    if (todoAdded || createTodo.isPending) return
    try {
      await createTodo.mutateAsync({
        task: req.requirement || `דרישה ${idx + 1}`,
        project_id: projectId,
        project_title: projectTitle,
        source_requirement_id: req.id,
      })
      setTodoAdded(true)
    } catch (err) {
      console.error('Failed to add todo:', err)
    }
  }

  return (
    <>
      <tr className="group hover:bg-[#f8f8f8]">
        <td className="px-2 py-1.5 text-center print:hidden">
          <button
            onClick={() => setExpanded((v) => !v)}
            className="text-[11px] text-[#999] hover:text-[#3D6A9E] hover:bg-[#edf7f1] rounded-lg px-1 py-0.5 inline-block transition-colors"
            style={{ transform: expanded ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.15s, color 0.15s, background-color 0.15s' }}
            title="פרט שלבי מעקב"
          >
            ▶
          </button>
        </td>
        <td className="px-3 py-1.5 text-center text-xs text-[#aaaaaa]">
          {sectionIndex > 0 ? `${sectionIndex}.${idx + 1}` : idx + 1}
        </td>
        <td className="px-3 py-1.5 text-center">
          <div className="flex justify-center">
            <Checkbox
              checked={req.uploaded}
              onCheckedChange={(v) => onSave(req, 'uploaded', !!v)}
            />
          </div>
        </td>
        <td className="px-3 py-1.5">
          <RequirementInput
            value={req.requirement}
            onSave={(v) => onSave(req, 'requirement', v)}
          />
        </td>
        <td className="px-3 py-1.5 text-center">
          <StatusCell
            value={req.status}
            onSave={(status, date) => onStatusChange(req, status, date)}
          />
        </td>
        <td className="px-3 py-1.5 text-center">
          <DateCell
            value={req.status_date}
            onSave={(v) => onSave(req, 'status_date', v)}
          />
        </td>
        <td className="px-3 py-1.5">
          <InlineEdit
            value={req.notes}
            onSave={(v) => onSave(req, 'notes', v)}
            emptyText="—"
          />
        </td>
        <td className="print:hidden px-2 py-1.5 text-left whitespace-nowrap">
          <button
            onClick={handleAddTodo}
            disabled={todoAdded || createTodo.isPending}
            className={`text-[11px] font-semibold transition-colors ${
              todoAdded
                ? 'text-[#27AE60]'
                : 'hidden group-hover:inline text-[#3D6A9E] hover:underline'
            }`}
          >
            {todoAdded ? '✓ נוסף' : '+ הוסף למשימות'}
          </button>
        </td>
        <td className="print:hidden px-3 py-1.5">
          {confirm ? (
            <div className="flex items-center gap-1">
              <button
                onClick={onDelete}
                disabled={isDeleting}
                className="rounded-lg bg-[#C0392B] px-1.5 py-0.5 text-[9px] font-bold text-white hover:bg-[#a93226] disabled:opacity-50"
              >
                {isDeleting ? '...' : 'מחק'}
              </button>
              <button
                onClick={() => setConfirm(false)}
                className="rounded-lg px-1.5 py-0.5 text-[9px] text-[#888] hover:text-[#333]"
              >
                ביטול
              </button>
            </div>
          ) : (
            <button
              onClick={() => setConfirm(true)}
              className="text-[#ccc] hover:text-[#C0392B] hover:bg-[#fdf0ef] rounded-lg p-0.5 transition-colors"
              title="מחק שורה"
            >
              <TrashIcon />
            </button>
          )}
        </td>
      </tr>
      {expanded && <StepRows requirementId={req.id} projectId={projectId} />}
    </>
  )
}

// Requirements section
function RequirementsSection({
  section,
  requirements,
  projectId,
  projectTitle,
  sectionIndex,
}: {
  section: string
  requirements: StatusRequirement[]
  projectId: string
  projectTitle: string
  sectionIndex: number
}) {
  const createReq = useCreateRequirement()
  const updateReq = useUpdateRequirement()
  const deleteReq = useDeleteRequirement()

  async function handleAddRow(allReqs: StatusRequirement[]) {
    const nextIndex = allReqs.length > 0
      ? Math.max(...allReqs.map((r) => r.order_index)) + 1
      : 1
    await createReq.mutateAsync({
      project_id: projectId,
      section,
      requirement: '',
      order_index: nextIndex,
    })
  }

  async function saveReq(req: StatusRequirement, field: string, value: string | boolean | null) {
    await updateReq.mutateAsync({ id: req.id, projectId, [field]: value })
  }

  async function handleStatusChange(req: StatusRequirement, status: RequirementStatus, date: string) {
    await updateReq.mutateAsync({ id: req.id, projectId, status, status_date: date })
  }

  return (
    <div className="overflow-hidden rounded-xl border border-[#E5E7EB] bg-white print:break-inside-avoid shadow-card">
      {/* Section header */}
      <div className="border-b border-[#E5E7EB] px-4 py-2" style={{ background: '#EBF1F9', borderRight: '4px solid #3D6A9E' }}>
        <span className="text-[11px] font-bold uppercase tracking-[0.1em] text-[#3D6A9E]">{section}</span>
      </div>

      <table className="w-full text-sm">
        <thead className="bg-[#f8f8f8] text-[10px] text-[#aaaaaa]">
          <tr>
            <th className="w-8 px-2 py-2 print:hidden" />
            <th className="w-8 px-3 py-2 text-center font-bold uppercase tracking-[0.08em]">#</th>
            <th className="w-20 px-3 py-2 text-center font-bold uppercase tracking-[0.08em]">עלה למערכת</th>
            <th className="px-3 py-2 text-right font-bold uppercase tracking-[0.08em]">פירוט</th>
            <th className="w-32 px-3 py-2 text-center font-bold uppercase tracking-[0.08em]">סטטוס</th>
            <th className="w-24 px-3 py-2 text-center font-bold uppercase tracking-[0.08em]">תאריך</th>
            <th className="px-3 py-2 text-right font-bold uppercase tracking-[0.08em]">הערות</th>
            <th className="print:hidden px-2 py-2" />
            <th className="print:hidden w-8 px-3 py-2" />
          </tr>
        </thead>
        <tbody className="divide-y divide-[#f4f4f4]">
          {requirements.map((req, idx) => (
            <ReqTableRow
              key={req.id}
              req={req}
              idx={idx}
              sectionIndex={sectionIndex}
              projectId={projectId}
              projectTitle={projectTitle}
              onSave={saveReq}
              onStatusChange={handleStatusChange}
              onDelete={async () => {
                try {
                  await deleteReq.mutateAsync({ id: req.id, projectId })
                } catch (err) {
                  console.error('Delete failed:', err)
                  alert('שגיאה במחיקה. נסה שוב.')
                }
              }}
              isDeleting={deleteReq.isPending}
            />
          ))}
        </tbody>
      </table>

      <div className="print:hidden border-t border-[#f4f4f4] p-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleAddRow(requirements)}
          disabled={createReq.isPending}
          className="text-xs text-[#666666]"
        >
          + הוסף פירוט
        </Button>
      </div>
    </div>
  )
}

export function StatusTab({ projectId }: StatusTabProps) {
  const { data: project } = useProject(projectId)
  const { data: requirements, isLoading } = useStatusRequirements(projectId)
  const updateProject = useUpdateProject()
  const [extraSections, setExtraSections] = useState<string[]>([])
  const [addingSectionMode, setAddingSectionMode] = useState(false)
  const [customSectionInput, setCustomSectionInput] = useState('')
  const [showCustomInput, setShowCustomInput] = useState(false)

  // Sections derived from DB requirements (in insertion order)
  const dbSections = useMemo(() => {
    if (!requirements) return []
    const seen = new Set<string>()
    const result: string[] = []
    for (const r of requirements) {
      if (!seen.has(r.section)) {
        seen.add(r.section)
        result.push(r.section)
      }
    }
    return result
  }, [requirements])

  // All sections to show = DB sections + locally added empty ones
  const allSections = useMemo(() => {
    const combined = [...dbSections]
    for (const s of extraSections) {
      if (!combined.includes(s)) combined.push(s)
    }
    return combined
  }, [dbSections, extraSections])

  // Predefined sections not yet shown
  const availablePredefined = PREDEFINED_SECTIONS.filter((s) => !allSections.includes(s))

  function handleAddPredefined(section: string) {
    setExtraSections((prev) => [...prev, section])
    setAddingSectionMode(false)
  }

  function handleAddCustom() {
    const name = customSectionInput.trim()
    if (!name) return
    setExtraSections((prev) => [...prev, name])
    setCustomSectionInput('')
    setShowCustomInput(false)
    setAddingSectionMode(false)
  }

  async function saveProjectField(field: string, value: string) {
    await updateProject.mutateAsync({ id: projectId, [field]: value || null })
  }

  if (isLoading || !project) {
    return <div className="py-8 text-center text-[#aaaaaa]">טוען...</div>
  }

  const todayFormatted = new Date().toLocaleDateString('he-IL')

  return (
    <div dir="rtl" style={{ display: 'grid', gridTemplateColumns: '1fr 220px', gap: 16, alignItems: 'start' }}>
      {/* ── Main content (right ~75%) ── */}
      <div className="space-y-6">
        {/* Print-only header */}
        <div className="hidden print:block print:mb-6">
          <h1 className="text-xl font-bold">
            דוח סטטוס — {project.title} — {todayFormatted}
          </h1>
          {project.location && <p className="text-sm text-[#666666]">{project.location}</p>}
        </div>

        {/* PDF button */}
        <div className="flex justify-end print:hidden">
          <Button
            variant="outline"
            onClick={() => window.print()}
            className="border-[#cccccc] text-[#666666] hover:bg-[#F0F2F5] rounded-lg"
          >
            🖨️ הורד דוח PDF
          </Button>
        </div>

        {/* Report header */}
        <div
          className="rounded-lg border border-[#dddddd] bg-white p-5"
          style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}
        >
          <h2 className="mb-4 text-base font-semibold text-[#1a1a1a] print:hidden">פרטי דוח</h2>
          <dl className="grid grid-cols-2 gap-x-8 gap-y-2">
            <div className="flex items-center gap-2">
              <dt className="text-sm font-medium text-[#666666] whitespace-nowrap">שם פרויקט:</dt>
              <dd className="text-sm text-[#1a1a1a]">
                <InlineEdit value={project.title} onSave={(v) => saveProjectField('title', v)} />
              </dd>
            </div>
            <div className="flex items-center gap-2">
              <dt className="text-sm font-medium text-[#666666] whitespace-nowrap">מיקום:</dt>
              <dd className="text-sm text-[#1a1a1a]">
                <InlineEdit value={project.location} onSave={(v) => saveProjectField('location', v)} emptyText="לחץ להוספה" />
              </dd>
            </div>
            <div className="flex items-center gap-2">
              <dt className="text-sm font-medium text-[#666666] whitespace-nowrap">מס׳ תיק מידע:</dt>
              <dd className="text-sm text-[#1a1a1a]">
                <InlineEdit value={project.info_file_number} onSave={(v) => saveProjectField('info_file_number', v)} emptyText="לחץ להוספה" />
              </dd>
            </div>
            <div className="flex items-center gap-2">
              <dt className="text-sm font-medium text-[#666666] whitespace-nowrap">מס׳ הגשה להיתר:</dt>
              <dd className="text-sm text-[#1a1a1a]">
                <InlineEdit value={project.permit_submission_number} onSave={(v) => saveProjectField('permit_submission_number', v)} emptyText="לחץ להוספה" />
              </dd>
            </div>
            <div className="flex items-center gap-2">
              <dt className="text-sm font-medium text-[#666666] whitespace-nowrap">תאריך עדכון:</dt>
              <dd className="text-sm text-[#666666]">{todayFormatted}</dd>
            </div>
          </dl>
        </div>

        {/* Requirements sections */}
        <div className="space-y-4">
          <h2 className="text-base font-semibold text-[#1a1a1a] print:hidden">דרישות</h2>

          {allSections.map((section, idx) => (
            <RequirementsSection
              key={section}
              section={section}
              requirements={(requirements ?? []).filter((r) => r.section === section)}
              projectId={projectId}
              projectTitle={project.title}
              sectionIndex={allSections.length > 1 ? idx + 1 : 0}
            />
          ))}

          {allSections.length === 0 && (
            <p className="py-4 text-center text-sm italic text-[#aaaaaa]">
              אין דרישות עדיין — הוסף שלב כדי להתחיל
            </p>
          )}

          {/* Add section controls */}
          <div className="print:hidden">
            {!addingSectionMode ? (
              <Button variant="outline" size="sm" onClick={() => setAddingSectionMode(true)}>
                + הוסף שלב
              </Button>
            ) : (
              <div className="flex flex-wrap items-center gap-2 rounded-lg border border-dashed border-[#dddddd] p-3">
                {availablePredefined.map((s) => (
                  <button
                    key={s}
                    onClick={() => handleAddPredefined(s)}
                    className="rounded-lg border border-[#dddddd] bg-white px-3 py-1 text-sm hover:bg-[#F0F2F5]"
                  >
                    {s}
                  </button>
                ))}

                {!showCustomInput ? (
                  <button
                    onClick={() => setShowCustomInput(true)}
                    className="rounded-lg border border-[#3D6A9E] bg-[#EBF1F9] px-3 py-1 text-sm text-[#3D6A9E] hover:bg-[#a8d4d0]/30"
                  >
                    + מותאם אישית
                  </button>
                ) : (
                  <div className="flex items-center gap-2">
                    <input
                      autoFocus
                      type="text"
                      value={customSectionInput}
                      onChange={(e) => setCustomSectionInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleAddCustom()
                        if (e.key === 'Escape') {
                          setShowCustomInput(false)
                          setCustomSectionInput('')
                        }
                      }}
                      placeholder="שם השלב..."
                      className="rounded-lg border border-[#3D6A9E] px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-[#3D6A9E]/20"
                    />
                    <button
                      onClick={handleAddCustom}
                      className="rounded-lg bg-[#3D6A9E] px-3 py-1 text-sm text-white hover:bg-[#2F5A8A]"
                    >
                      הוסף
                    </button>
                  </div>
                )}

                <button
                  onClick={() => {
                    setAddingSectionMode(false)
                    setShowCustomInput(false)
                    setCustomSectionInput('')
                  }}
                  className="text-sm text-[#aaaaaa] hover:text-[#666666]"
                >
                  ביטול
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Timeline sidebar (left ~25%) ── */}
      <ProjectTimeline projectId={projectId} />
    </div>
  )
}
