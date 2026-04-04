'use client'

import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useClient, useUpdateClient, useDeleteClient } from '@/lib/hooks/use-clients'
import { InlineEdit } from '@/components/inline-edit'
import { Badge } from '@/components/ui/badge'
import { TRACK_LABELS, STATUS_LABELS, STATUS_COLORS } from '@/lib/constants/tracks'
import { useState } from 'react'
import type { TrackValue } from '@/types/database'
import { Breadcrumb } from '@/components/shared/Breadcrumb'

interface FieldRowProps {
  label: string
  children: React.ReactNode
}

function FieldRow({ label, children }: FieldRowProps) {
  return (
    <div className="grid grid-cols-3 gap-4 border-b border-gray-100 py-3 last:border-0">
      <dt className="pt-1 text-sm font-medium text-gray-500">{label}</dt>
      <dd className="col-span-2 text-sm text-gray-900">{children}</dd>
    </div>
  )
}

export default function ClientDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string
  const { data: client, isLoading, error } = useClient(id)
  const updateClient = useUpdateClient()
  const deleteClient = useDeleteClient()
  const [confirmDelete, setConfirmDelete] = useState(false)

  async function save(field: string, value: string) {
    await updateClient.mutateAsync({ id, [field]: value || null })
  }

  async function handleDelete() {
    try {
      await deleteClient.mutateAsync(id)
      router.push('/clients')
    } catch {
      alert('שגיאה במחיקת הלקוח')
    }
  }

  if (isLoading) {
    return <div className="py-12 text-center text-gray-400">טוען לקוח...</div>
  }

  if (error || !client) {
    return <div className="py-12 text-center text-red-500">שגיאה בטעינת הלקוח</div>
  }

  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ label: 'דשבורד', href: '/' }, { label: 'לקוחות', href: '/clients' }, { label: client.name }]} />
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{client.name}</h1>
          {client.company && (
            <p className="mt-1 text-sm text-gray-500">{client.company}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {confirmDelete ? (
            <>
              <span className="text-[13px] text-[#666666]">למחוק את הלקוח?</span>
              <button
                onClick={handleDelete}
                disabled={deleteClient.isPending}
                className="rounded-lg bg-[#C0392B] px-3 py-1.5 text-[12px] font-bold text-white hover:bg-[#a93226] disabled:opacity-50 transition-colors"
              >
                {deleteClient.isPending ? '...' : 'מחק'}
              </button>
              <button
                onClick={() => setConfirmDelete(false)}
                className="rounded-lg border border-[#E5E7EB] px-3 py-1.5 text-[12px] text-[#666666] hover:bg-[#F0F2F5] transition-colors"
              >
                ביטול
              </button>
            </>
          ) : (
            <button
              onClick={() => setConfirmDelete(true)}
              className="rounded-lg border border-[#E5E7EB] px-3 py-1.5 text-[12px] text-[#aaaaaa] hover:border-[#C0392B] hover:text-[#C0392B] hover:bg-[#fdf0ef] transition-colors"
            >
              מחק לקוח
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Client Details */}
        <div className="rounded-lg border border-gray-200 bg-white p-5">
          <h2 className="mb-4 text-base font-semibold text-gray-800">פרטי לקוח</h2>
          <dl>
            <FieldRow label="שם">
              <InlineEdit value={client.name} onSave={(v) => save('name', v)} />
            </FieldRow>
            <FieldRow label="מספר ח.פ">
              <InlineEdit
                value={client.company}
                onSave={(v) => save('company', v)}
                emptyText="לחץ להוספה"
              />
            </FieldRow>
            <FieldRow label="איש קשר">
              <div className="flex items-center gap-2 group/contact">
                <InlineEdit
                  value={client.contact_name}
                  onSave={(v) => save('contact_name', v)}
                  emptyText="לחץ להוספה"
                />
                {client.contact_name && (
                  <button
                    onClick={() => save('contact_name', '')}
                    className="opacity-0 group-hover/contact:opacity-100 text-[#cccccc] hover:text-[#C0392B] transition-opacity text-xs"
                    title="מחק איש קשר"
                  >
                    ✕
                  </button>
                )}
              </div>
            </FieldRow>
            <FieldRow label="טלפון">
              <InlineEdit
                value={client.phone}
                onSave={(v) => save('phone', v)}
                emptyText="לחץ להוספת טלפון"
              />
            </FieldRow>
            <FieldRow label="אימייל">
              <InlineEdit
                value={client.email}
                onSave={(v) => save('email', v)}
                emptyText="לחץ להוספת אימייל"
              />
            </FieldRow>
            <FieldRow label="כתובת">
              <InlineEdit
                value={client.address}
                onSave={(v) => save('address', v)}
                emptyText="לחץ להוספת כתובת"
              />
            </FieldRow>
            <FieldRow label="מקור הגעה">
              <span className="text-gray-600">{client.lead_source ?? '—'}</span>
            </FieldRow>
            <FieldRow label="הערות">
              <InlineEdit
                value={client.notes}
                onSave={(v) => save('notes', v)}
                type="textarea"
                emptyText="לחץ להוספת הערות"
              />
            </FieldRow>
            <FieldRow label="נרשם">
              <span className="text-gray-600">
                {new Date(client.created_at).toLocaleDateString('he-IL')}
              </span>
            </FieldRow>
          </dl>
        </div>

        {/* Projects */}
        <div className="rounded-lg border border-gray-200 bg-white p-5">
          <h2 className="mb-4 text-base font-semibold text-gray-800">
            פרויקטים ({client.projects.length})
          </h2>
          {client.projects.length === 0 ? (
            <p className="text-sm italic text-gray-400">אין פרויקטים ללקוח זה</p>
          ) : (
            <div className="divide-y divide-gray-100">
              {client.projects.map((project) => (
                <div key={project.id} className="py-3 first:pt-0 last:pb-0">
                  <Link
                    href={`/projects/${project.id}`}
                    className="font-medium text-blue-700 hover:underline"
                  >
                    {project.title}
                  </Link>
                  <div className="mt-1 flex flex-wrap items-center gap-2">
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[project.status]}`}
                    >
                      {STATUS_LABELS[project.status]}
                    </span>
                    {project.tracks.map((t) => (
                      <Badge key={t} variant="secondary" className="text-xs">
                        {TRACK_LABELS[t as TrackValue]}
                      </Badge>
                    ))}
                    {project.location && (
                      <span className="text-xs text-gray-400">{project.location}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
