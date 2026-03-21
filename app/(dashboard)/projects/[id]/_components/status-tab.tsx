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
  'ממתין': 'bg-gray-100 text-gray-700',
  'בטיפול': 'bg-yellow-100 text-yellow-800',
  'הוגש': 'bg-blue-100 text-blue-800',
  'התקבל': 'bg-green-100 text-green-800',
  'חזרו הערות': 'bg-red-100 text-red-800',
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
        className="rounded border border-blue-300 px-1 py-0.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    )
  }

  return (
    <button
      onClick={() => setEditing(true)}
      className="rounded px-1 py-0.5 text-xs transition-all hover:bg-blue-50 hover:ring-1 hover:ring-blue-200 print:cursor-default"
    >
      {value ? formatDate(value) : <span className="italic text-gray-400">—</span>}
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
      className={`rounded px-2 py-1 text-xs font-medium focus:outline-none ${STATUS_STYLES[value]} print:border-none print:bg-transparent`}
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
      className="w-full rounded border border-[#CBD5E1] bg-[#F8FAFC] px-2 py-1.5 text-[13px] text-[#0F172A] placeholder:text-[#94A3B8] focus:border-[#6366F1] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#6366F1]/20"
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
      <h2 className="mb-3 text-base font-semibold text-gray-800">אנשי קשר</h2>
      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-xs text-gray-500">
            <tr>
              <th className="px-3 py-2 text-right font-medium">תפקיד</th>
              <th className="px-3 py-2 text-center font-medium">מינוי</th>
              <th className="px-3 py-2 text-right font-medium">שם</th>
              <th className="px-3 py-2 text-right font-medium">טלפון</th>
              <th className="px-3 py-2 text-right font-medium">מייל</th>
              <th className="w-8 px-3 py-2" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {(contacts ?? []).map((c) => (
              <tr key={c.id} className="group hover:bg-gray-50">
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
                    className="hidden text-gray-300 hover:text-red-500 group-hover:block"
                  >
                    ✕
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="border-t border-gray-100 p-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleAdd}
            disabled={createContact.isPending}
            className="text-xs text-gray-500"
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
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white print:break-inside-avoid">
      {/* Section header */}
      <div className="border-b border-gray-200 bg-gray-800 px-4 py-2">
        <span className="text-sm font-semibold text-white">{section}</span>
      </div>

      <table className="w-full text-sm">
        <thead className="bg-gray-50 text-xs text-gray-500">
          <tr>
            <th className="w-8 px-3 py-2 text-center font-medium">#</th>
            <th className="w-20 px-3 py-2 text-center font-medium">עלה למערכת</th>
            <th className="px-3 py-2 text-right font-medium">פירוט</th>
            <th className="w-32 px-3 py-2 text-center font-medium">סטטוס</th>
            <th className="w-24 px-3 py-2 text-center font-medium">תאריך</th>
            <th className="px-3 py-2 text-right font-medium">הערות</th>
            <th className="print:hidden w-8 px-3 py-2" />
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {requirements.map((req, idx) => (
            <tr key={req.id} className="group hover:bg-gray-50">
              <td className="px-3 py-1.5 text-center text-xs text-gray-400">
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
                  className="hidden text-gray-300 hover:text-red-500 group-hover:block"
                >
                  ✕
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="print:hidden border-t border-gray-100 p-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleAddRow(requirements)}
          disabled={createReq.isPending}
          className="text-xs text-gray-500"
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
    return <div className="py-8 text-center text-gray-400">טוען...</div>
  }

  const todayFormatted = new Date().toLocaleDateString('he-IL')

  return (
    <div className="space-y-6">
      {/* Print-only header */}
      <div className="hidden print:block print:mb-6">
        <h1 className="text-xl font-bold">
          דוח סטטוס — {project.title} — {todayFormatted}
        </h1>
        {project.location && <p className="text-sm text-gray-600">{project.location}</p>}
      </div>

      {/* PDF button */}
      <div className="flex justify-end print:hidden">
        <Button variant="outline" onClick={() => window.print()}>
          🖨️ הורד דוח PDF
        </Button>
      </div>

      {/* Report header */}
      <div className="rounded-lg border border-gray-200 bg-white p-5">
        <h2 className="mb-4 text-base font-semibold text-gray-800 print:hidden">פרטי דוח</h2>
        <dl className="grid grid-cols-2 gap-x-8 gap-y-2">
          <div className="flex items-center gap-2">
            <dt className="text-sm font-medium text-gray-500 whitespace-nowrap">שם פרויקט:</dt>
            <dd className="text-sm text-gray-900">
              <InlineEdit value={project.title} onSave={(v) => saveProjectField('title', v)} />
            </dd>
          </div>
          <div className="flex items-center gap-2">
            <dt className="text-sm font-medium text-gray-500 whitespace-nowrap">מיקום:</dt>
            <dd className="text-sm text-gray-900">
              <InlineEdit value={project.location} onSave={(v) => saveProjectField('location', v)} emptyText="לחץ להוספה" />
            </dd>
          </div>
          <div className="flex items-center gap-2">
            <dt className="text-sm font-medium text-gray-500 whitespace-nowrap">מס׳ תיק מידע:</dt>
            <dd className="text-sm text-gray-900">
              <InlineEdit value={project.info_file_number} onSave={(v) => saveProjectField('info_file_number', v)} emptyText="לחץ להוספה" />
            </dd>
          </div>
          <div className="flex items-center gap-2">
            <dt className="text-sm font-medium text-gray-500 whitespace-nowrap">מס׳ הגשה להיתר:</dt>
            <dd className="text-sm text-gray-900">
              <InlineEdit value={project.permit_submission_number} onSave={(v) => saveProjectField('permit_submission_number', v)} emptyText="לחץ להוספה" />
            </dd>
          </div>
          <div className="flex items-center gap-2">
            <dt className="text-sm font-medium text-gray-500 whitespace-nowrap">תאריך עדכון:</dt>
            <dd className="text-sm text-gray-600">{todayFormatted}</dd>
          </div>
        </dl>
      </div>

      {/* Contacts table */}
      <ContactsTable projectId={projectId} />

      {/* Requirements sections */}
      <div className="space-y-4">
        <h2 className="text-base font-semibold text-gray-800 print:hidden">דרישות</h2>

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
          <p className="py-4 text-center text-sm italic text-gray-400">
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
            <div className="flex flex-wrap items-center gap-2 rounded-lg border border-dashed border-gray-300 p-3">
              {availablePredefined.map((s) => (
                <button
                  key={s}
                  onClick={() => handleAddPredefined(s)}
                  className="rounded-md border border-gray-300 bg-white px-3 py-1 text-sm hover:bg-gray-50"
                >
                  {s}
                </button>
              ))}

              {!showCustomInput ? (
                <button
                  onClick={() => setShowCustomInput(true)}
                  className="rounded-md border border-blue-300 bg-blue-50 px-3 py-1 text-sm text-blue-700 hover:bg-blue-100"
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
                    className="rounded border border-blue-300 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={handleAddCustom}
                    className="rounded bg-blue-600 px-3 py-1 text-sm text-white hover:bg-blue-700"
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
                className="text-sm text-gray-400 hover:text-gray-600"
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
