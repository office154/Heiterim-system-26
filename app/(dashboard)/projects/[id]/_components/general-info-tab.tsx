'use client'

import { useState } from 'react'
import { useUpdateProject } from '@/lib/hooks/use-projects'
import { useUpdateClient } from '@/lib/hooks/use-clients'
import { useProjectAssistants, useAddAssistant, useRemoveAssistant } from '@/lib/hooks/use-project-assistants'
import { useProfiles } from '@/lib/hooks/use-users'
import { useCurrentRole } from '@/lib/hooks/use-profile'
import { InlineEdit } from '@/components/inline-edit'
import { Badge } from '@/components/ui/badge'
import { TRACK_LABELS, STATUS_LABELS, STATUS_COLORS } from '@/lib/constants/tracks'
import { ProjectOverview } from './project-overview'
import type { ProjectWithClient, TrackValue } from '@/types/database'

interface GeneralInfoTabProps {
  project: ProjectWithClient
  onNavigate: (tab: string) => void
}

interface FieldRowProps {
  label: string
  children: React.ReactNode
}

function FieldRow({ label, children }: FieldRowProps) {
  return (
    <div className="grid grid-cols-3 gap-4 py-3 border-b border-[#f4f4f4] last:border-0">
      <dt className="text-sm font-medium text-[#666666] pt-1">{label}</dt>
      <dd className="col-span-2 text-sm text-[#1a1a1a]">{children}</dd>
    </div>
  )
}

function TeamSection({ project }: { project: ProjectWithClient }) {
  const { data: currentRole } = useCurrentRole()
  const { data: assistants = [] } = useProjectAssistants(project.id)
  const { data: profiles = [] } = useProfiles()
  const updateProject = useUpdateProject()
  const addAssistant = useAddAssistant()
  const removeAssistant = useRemoveAssistant()
  const [addingAssistant, setAddingAssistant] = useState(false)
  const [selectedProfileId, setSelectedProfileId] = useState('')

  const isAdmin = currentRole === 'admin'
  const assistantProfileIds = new Set(assistants.map((a) => a.profile_id))
  const availableForAssistant = profiles.filter(
    (p) => p.id !== project.manager_id && !assistantProfileIds.has(p.id)
  )

  async function handleManagerChange(newManagerId: string) {
    await updateProject.mutateAsync({ id: project.id, manager_id: newManagerId || null })
  }

  async function handleAddAssistant() {
    if (!selectedProfileId) return
    await addAssistant.mutateAsync({ project_id: project.id, profile_id: selectedProfileId })
    setSelectedProfileId('')
    setAddingAssistant(false)
  }

  return (
    <div
      className="rounded-lg border border-[#dddddd] bg-white p-5"
      style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}
    >
      <h2 className="mb-4 text-base font-semibold text-[#1a1a1a]">צוות הפרויקט</h2>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        {/* Manager */}
        <div>
          <p className="mb-2 text-xs font-medium text-[#6B7280]">מנהל פרויקט</p>
          {isAdmin ? (
            <select
              value={project.manager_id ?? ''}
              onChange={(e) => handleManagerChange(e.target.value)}
              disabled={updateProject.isPending}
              className="w-full rounded-md border border-[#E5E7EB] bg-white px-2 py-1.5 text-sm text-[#1a1a1a] focus:border-[#3D6A9E] focus:outline-none disabled:opacity-60"
            >
              <option value="">ללא מנהל</option>
              {profiles.map((p) => (
                <option key={p.id} value={p.id}>{p.full_name}</option>
              ))}
            </select>
          ) : (
            <p className="text-sm text-[#1a1a1a]">{project.manager?.full_name ?? '—'}</p>
          )}
        </div>

        {/* Assistants */}
        <div>
          <p className="mb-2 text-xs font-medium text-[#6B7280]">עוזרים</p>
          <div className="space-y-1">
            {assistants.length === 0 && !addingAssistant && (
              <p className="text-sm italic text-[#9CA3AF]">לא שויכו עוזרים</p>
            )}
            {assistants.map((a) => (
              <div
                key={a.id}
                className="flex items-center justify-between gap-2 rounded px-2 py-1 text-sm"
                style={{ background: '#F0F2F5' }}
              >
                <span className="text-[#1a1a1a]">{a.profile.full_name}</span>
                {isAdmin && (
                  <button
                    onClick={() => removeAssistant.mutate({ id: a.id, project_id: project.id })}
                    className="text-xs leading-none text-[#9CA3AF] hover:text-[#C0392B]"
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
            {isAdmin && addingAssistant && (
              <div className="mt-1 flex gap-1">
                <select
                  value={selectedProfileId}
                  onChange={(e) => setSelectedProfileId(e.target.value)}
                  className="flex-1 rounded-md border border-[#E5E7EB] bg-white px-2 py-1 text-sm text-[#1a1a1a] focus:border-[#3D6A9E] focus:outline-none"
                >
                  <option value="">בחר...</option>
                  {availableForAssistant.map((p) => (
                    <option key={p.id} value={p.id}>{p.full_name}</option>
                  ))}
                </select>
                <button
                  onClick={handleAddAssistant}
                  disabled={!selectedProfileId || addAssistant.isPending}
                  className="rounded-md bg-[#3D6A9E] px-2 py-1 text-xs text-white disabled:opacity-50"
                >
                  הוסף
                </button>
                <button
                  onClick={() => { setAddingAssistant(false); setSelectedProfileId('') }}
                  className="rounded-md border border-[#E5E7EB] px-2 py-1 text-xs text-[#6B7280]"
                >
                  ביטול
                </button>
              </div>
            )}
            {isAdmin && !addingAssistant && availableForAssistant.length > 0 && (
              <button
                onClick={() => setAddingAssistant(true)}
                className="mt-1 text-xs text-[#3D6A9E] hover:underline"
              >
                + הוסף עוזר
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export function GeneralInfoTab({ project, onNavigate }: GeneralInfoTabProps) {
  const updateProject = useUpdateProject()
  const updateClient = useUpdateClient()

  async function saveProject(field: string, value: string) {
    await updateProject.mutateAsync({ id: project.id, [field]: value || null })
  }

  async function saveClient(field: string, value: string) {
    if (!project.client) return
    await updateClient.mutateAsync({ id: project.client.id, [field]: value || null })
  }

  return (
    <div className="space-y-6">
      <ProjectOverview projectId={project.id} onNavigate={onNavigate} />
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      {/* Project Info */}
      <div
        className="rounded-lg border border-[#dddddd] bg-white p-5"
        style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}
      >
        <h2 className="mb-4 text-base font-semibold text-[#1a1a1a]">פרטי פרויקט</h2>
        <dl>
          <FieldRow label="שם הפרויקט">
            <InlineEdit
              value={project.title}
              onSave={(v) => saveProject('title', v)}
            />
          </FieldRow>

          <FieldRow label="מיקום">
            <InlineEdit
              value={project.location}
              onSave={(v) => saveProject('location', v)}
              emptyText="לחץ להוספת מיקום"
            />
          </FieldRow>

          <FieldRow label="סטטוס">
            <span
              className={`inline-flex items-center rounded-lg px-2.5 py-0.5 text-xs font-medium ${STATUS_COLORS[project.status]}`}
            >
              {STATUS_LABELS[project.status]}
            </span>
          </FieldRow>

          <FieldRow label="מסלולים">
            <div className="flex flex-wrap gap-1">
              {project.tracks.map((t) => (
                <Badge key={t} variant="secondary" className="text-xs">
                  {TRACK_LABELS[t as TrackValue]}
                </Badge>
              ))}
            </div>
          </FieldRow>

          <FieldRow label="תאריך חוזה">
            <InlineEdit
              value={project.contract_date}
              onSave={(v) => saveProject('contract_date', v)}
              type="date"
              emptyText="לחץ לבחירת תאריך"
            />
          </FieldRow>

          <FieldRow label="מספר תיק מידע">
            <InlineEdit
              value={project.info_file_number}
              onSave={(v) => saveProject('info_file_number', v)}
              emptyText="לחץ להוספה"
            />
          </FieldRow>

          <FieldRow label="מספר הגשה להיתר">
            <InlineEdit
              value={project.permit_submission_number}
              onSave={(v) => saveProject('permit_submission_number', v)}
              emptyText="לחץ להוספה"
            />
          </FieldRow>

          <FieldRow label="הערות">
            <InlineEdit
              value={project.notes}
              onSave={(v) => saveProject('notes', v)}
              type="textarea"
              emptyText="לחץ להוספת הערות"
            />
          </FieldRow>

          <FieldRow label="נוצר ע״י">
            <span className="text-[#666666]">
              {project.creator?.full_name ?? '—'}
            </span>
          </FieldRow>

          <FieldRow label="תאריך יצירה">
            <span className="text-[#666666]">
              {new Date(project.created_at).toLocaleDateString('he-IL')}
            </span>
          </FieldRow>
        </dl>
      </div>

      {/* Client Info */}
      <div
        className="rounded-lg border border-[#dddddd] bg-white p-5"
        style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}
      >
        <h2 className="mb-4 text-base font-semibold text-[#1a1a1a]">פרטי לקוח</h2>
        {!project.client ? (
          <p className="text-sm text-[#aaaaaa] italic">לא שויך לקוח לפרויקט זה</p>
        ) : (
          <dl>
            <FieldRow label="שם">
              <InlineEdit
                value={project.client.name}
                onSave={(v) => saveClient('name', v)}
              />
            </FieldRow>

            <FieldRow label="מספר ח.פ">
              <InlineEdit
                value={project.client.company}
                onSave={(v) => saveClient('company', v)}
                emptyText="לחץ להוספה"
              />
            </FieldRow>

            <FieldRow label="איש קשר">
              <InlineEdit
                value={project.client.contact_name}
                onSave={(v) => saveClient('contact_name', v)}
                emptyText="לחץ להוספה"
              />
            </FieldRow>
          </dl>
        )}
      </div>
    </div>
      <TeamSection project={project} />
    </div>
  )
}
