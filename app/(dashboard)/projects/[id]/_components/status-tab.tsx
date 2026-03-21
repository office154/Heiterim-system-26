'use client'

import { useState, useMemo, useEffect, useRef, useCallback } from 'react'
import { useProject, useUpdateProject } from '@/lib/hooks/use-projects'
import { useProjectContacts, useCreateContact, useUpdateContact, useDeleteContact } from '@/lib/hooks/use-contacts'
import { useStatusRequirements, useCreateRequirement, useUpdateRequirement, useDeleteRequirement } from '@/lib/hooks/use-requirements'
import { InlineEdit } from '@/components/inline-edit'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import type { RequirementStatus, ProjectContact, StatusRequirement } from '@/types/database'

interface StatusTabProps {
  projectId: string
}

const REQUIREMENT_STATUSES: RequirementStatus[] = [
  'ממתין', 'בטיפול', 'הוגש', 'התקבל', 'חזרו הערות',
]

const STATUS_STYLES: Record<RequirementStatus, string> = {
  'ממתין': 'bg-[#f4f4f4] text-[#666666]',
  'בטיפול': 'bg-[#fef3e0] text-[#D4820A]',
  'הוגש': 'bg-[#E8F5F3] text-[#1A7A6E]',
  'התקבל': 'bg-[#E8F5F3] text-[#1A7A6E]',
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
        className="rounded-[2px] border border-[#1A7A6E] px-1 py-0.5 text-xs focus:outline-none focus:ring-2 focus:ring-[#1A7A6E]/20"
      />
    )
  }

  return (
    <button
      onClick={() => setEditing(true)}
      className="rounded-[2px] px-1 py-0.5 text-xs transition-all hover:bg-[#f0f0f0] hover:ring-1 hover:ring-[#dddddd] print:cursor-default"
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
      className={`rounded-[2px] px-2 py-1 text-xs font-medium focus:outline-none ${STATUS_STYLES[value]} print:border-none print:bg-transparent`}
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
      className="w-full rounded-[2px] border border-[#cccccc] bg-[#f8f8f8] px-2 py-1.5 text-[13px] text-[#1a1a1a] placeholder:text-[#aaaaaa] focus:border-[#1A7A6E] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1A7A6E]/12"
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
      <div className="overflow-hidden rounded-[2px] border border-[#dddddd] bg-white">
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

// Requirements section
function RequirementsSection({
  section,
  requirements,
  projectId,
  sectionIndex,
}: {
  section: string
  requirements: StatusRequirement[]
  projectId: string
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
    <div className="overflow-hidden rounded-[2px] border border-[#dddddd] bg-white print:break-inside-avoid">
      {/* Section header */}
      <div className="border-b border-[#dddddd] bg-[#1a1a1a] px-4 py-2">
        <span className="text-[11px] font-bold uppercase tracking-[0.1em] text-[#E8C420]">{section}</span>
      </div>

      <table className="w-full text-sm">
        <thead className="bg-[#f8f8f8] text-[10px] text-[#aaaaaa]">
          <tr>
            <th className="w-8 px-3 py-2 text-center font-bold uppercase tracking-[0.08em]">#</th>
            <th className="w-20 px-3 py-2 text-center font-bold uppercase tracking-[0.08em]">עלה למערכת</th>
            <th className="px-3 py-2 text-right font-bold uppercase tracking-[0.08em]">פירוט</th>
            <th className="w-32 px-3 py-2 text-center font-bold uppercase tracking-[0.08em]">סטטוס</th>
            <th className="w-24 px-3 py-2 text-center font-bold uppercase tracking-[0.08em]">תאריך</th>
            <th className="px-3 py-2 text-right font-bold uppercase tracking-[0.08em]">הערות</th>
            <th className="print:hidden w-8 px-3 py-2" />
          </tr>
        </thead>
        <tbody className="divide-y divide-[#f4f4f4]">
          {requirements.map((req, idx) => (
            <tr key={req.id} className="group hover:bg-[#f8f8f8]">
              <td className="px-3 py-1.5 text-center text-xs text-[#aaaaaa]">
                {sectionIndex > 0 ? `${sectionIndex}.${idx + 1}` : idx + 1}
              </td>
              <td className="px-3 py-1.5 text-center">
                <div className="flex justify-center">
                  <Checkbox
                    checked={req.uploaded}
                    onCheckedChange={(v) => saveReq(req, 'uploaded', !!v)}
                  />
                </div>
              </td>
              <td className="px-3 py-1.5">
                <RequirementInput
                  value={req.requirement}
                  onSave={(v) => saveReq(req, 'requirement', v)}
                />
              </td>
              <td className="px-3 py-1.5 text-center">
                <StatusCell
                  value={req.status}
                  onSave={(status, date) => handleStatusChange(req, status, date)}
                />
              </td>
              <td className="px-3 py-1.5 text-center">
                <DateCell
                  value={req.status_date}
                  onSave={(v) => saveReq(req, 'status_date', v)}
                />
              </td>
              <td className="px-3 py-1.5">
                <InlineEdit
                  value={req.notes}
                  onSave={(v) => saveReq(req, 'notes', v)}
                  emptyText="—"
                />
              </td>
              <td className="print:hidden px-3 py-1.5">
                <button
                  onClick={() => deleteReq.mutate({ id: req.id, projectId })}
                  className="hidden text-[#aaaaaa] hover:text-[#C0392B] group-hover:block"
                >
                  ✕
                </button>
              </td>
            </tr>
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
          className="border-[#cccccc] text-[#666666] hover:bg-[#f0f0f0] rounded-[2px]"
        >
          🖨️ הורד דוח PDF
        </Button>
      </div>

      {/* Report header */}
      <div
        className="rounded-[2px] border border-[#dddddd] bg-white p-5"
        style={{ boxShadow: '0 2px 0 #cccccc, 0 4px 14px rgba(0,0,0,0.06)' }}
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

      {/* Contacts table */}
      <ContactsTable projectId={projectId} />

      {/* Requirements sections */}
      <div className="space-y-4">
        <h2 className="text-base font-semibold text-[#1a1a1a] print:hidden">דרישות</h2>

        {allSections.map((section, idx) => (
          <RequirementsSection
            key={section}
            section={section}
            requirements={(requirements ?? []).filter((r) => r.section === section)}
            projectId={projectId}
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
            <div className="flex flex-wrap items-center gap-2 rounded-[2px] border border-dashed border-[#dddddd] p-3">
              {availablePredefined.map((s) => (
                <button
                  key={s}
                  onClick={() => handleAddPredefined(s)}
                  className="rounded-[2px] border border-[#dddddd] bg-white px-3 py-1 text-sm hover:bg-[#f0f0f0]"
                >
                  {s}
                </button>
              ))}

              {!showCustomInput ? (
                <button
                  onClick={() => setShowCustomInput(true)}
                  className="rounded-[2px] border border-[#1A7A6E] bg-[#E8F5F3] px-3 py-1 text-sm text-[#1A7A6E] hover:bg-[#a8d4d0]/30"
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
                    className="rounded-[2px] border border-[#1A7A6E] px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A7A6E]/20"
                  />
                  <button
                    onClick={handleAddCustom}
                    className="rounded-[2px] bg-[#1a1a1a] px-3 py-1 text-sm text-white hover:bg-[#333]"
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
  )
}
