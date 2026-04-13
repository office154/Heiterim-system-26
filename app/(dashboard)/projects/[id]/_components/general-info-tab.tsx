'use client'

import { useUpdateProject } from '@/lib/hooks/use-projects'
import { useUpdateClient } from '@/lib/hooks/use-clients'
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
    </div>
  )
}
