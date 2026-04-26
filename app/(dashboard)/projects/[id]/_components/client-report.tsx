'use client'

import { useState } from 'react'
import { useProject } from '@/lib/hooks/use-projects'
import { useProjectTasks } from './project-management/hooks/use-project-tasks'
import { useProjectContacts } from './project-management/hooks/use-project-contacts'
import type { ProjectTask, ProjectContact } from './project-management/types'

type ViewKey = "urgency" | "contact" | "phase" | "party"

const VIEW_OPTIONS: { key: ViewKey; label: string }[] = [
  { key: "urgency",  label: "לפי דחיפות" },
  { key: "contact",  label: "לפי איש קשר" },
  { key: "phase",    label: "לפי שלב" },
  { key: "party",    label: "לפי גורם" },
]

function formatDate(d: string | null): string | null {
  if (!d) return null
  const dt = new Date(d)
  return `${String(dt.getDate()).padStart(2, '0')}.${String(dt.getMonth() + 1).padStart(2, '0')}`
}

function todayString() {
  const d = new Date()
  return `${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth() + 1).padStart(2, '0')}.${d.getFullYear()}`
}

// ─── Status badge ───────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const cfg: Record<string, { label: string; cls: string }> = {
    open:        { label: 'פתוח',    cls: 'bg-[#F3F4F6] text-[#6B7280]' },
    in_progress: { label: 'בטיפול', cls: 'bg-[#EBF1F9] text-[#3D6A9E]' },
    waiting:     { label: 'ממתין',  cls: 'bg-[#FEF3E0] text-[#D4820A]' },
    done:        { label: 'הושלם',  cls: 'bg-[#EAF3DE] text-[#27500A]' },
  }
  const c = cfg[status] ?? cfg.open
  return (
    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded whitespace-nowrap ${c.cls}`}>
      {c.label}
    </span>
  )
}

// ─── Task row ────────────────────────────────────────────────────────────────

function TaskRow({ task, contacts }: { task: ProjectTask; contacts: ProjectContact[] }) {
  const isDone = task.status === 'done'
  const contact = contacts.find(c => c.id === task.contact_id)
  const deadline = formatDate(task.deadline)

  const urgencyDisplay = {
    today: { label: 'היום',            cls: 'text-[#C0392B] font-bold' },
    week:  { label: deadline ?? 'השבוע', cls: 'text-[#D4820A] font-semibold' },
    later: { label: deadline ?? 'בהמשך', cls: 'text-[#9CA3AF]' },
  }[task.urgency]

  return (
    <div
      className={`flex items-start gap-3 px-4 py-2.5 border-b border-[#F3F4F6] last:border-0 text-xs ${
        isDone ? 'opacity-55' : ''
      }`}
    >
      {/* Circle indicator */}
      <div
        className={`mt-0.5 w-4 h-4 rounded-full border-[1.5px] flex-shrink-0 flex items-center justify-center ${
          isDone ? 'bg-[#3D6A9E] border-[#3D6A9E]' : 'border-[#D1D5DB]'
        }`}
      >
        {isDone && <span className="text-white" style={{ fontSize: 8 }}>✓</span>}
      </div>

      {/* Title + description */}
      <div className="flex-1 min-w-0">
        <div className={`font-medium text-stone-800 leading-snug ${isDone ? 'line-through text-stone-400' : ''}`}>
          {task.title}
        </div>
        {task.description && (
          <div className="text-[10px] text-stone-400 mt-0.5 truncate">{task.description}</div>
        )}
      </div>

      {/* Meta */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <StatusBadge status={task.status} />
        {contact && (
          <span className="text-[10px] text-stone-400 hidden sm:inline">{contact.name}</span>
        )}
        <span className={`text-[11px] min-w-[44px] text-left ${urgencyDisplay.cls}`}>
          {urgencyDisplay.label}
        </span>
      </div>
    </div>
  )
}

// ─── Group wrapper ────────────────────────────────────────────────────────────

function Group({
  tasks,
  contacts,
  header,
  hideWhenEmpty = false,
}: {
  tasks: ProjectTask[]
  contacts: ProjectContact[]
  header: React.ReactNode
  hideWhenEmpty?: boolean
}) {
  if (hideWhenEmpty && tasks.length === 0) return null
  return (
    <div className="bg-white border border-[#E5E7EB] rounded-lg overflow-hidden print:break-inside-avoid">
      {header}
      {tasks.length === 0 ? (
        <div className="py-4 text-center text-[11px] text-stone-400">אין משימות</div>
      ) : (
        tasks.map(t => <TaskRow key={t.id} task={t} contacts={contacts} />)
      )}
    </div>
  )
}

// ─── Urgency view ─────────────────────────────────────────────────────────────

function UrgencyView({ tasks, contacts }: { tasks: ProjectTask[]; contacts: ProjectContact[] }) {
  const groups = [
    {
      key: 'today',
      badge: 'היום', pill: 'דחוף',
      title: 'דחוף להיום', sub: 'טעון טיפול מיידי',
      headerBg: 'bg-[#FCEBEB]', titleCls: 'text-[#7B1A1A]', subCls: 'text-[#7B1A1A] opacity-70',
      badgeCls: 'bg-[#C0392B]',
    },
    {
      key: 'week',
      badge: 'השבוע', pill: 'בטיפול',
      title: 'עד סוף השבוע', sub: '',
      headerBg: 'bg-[#FAEEDA]', titleCls: 'text-[#412402]', subCls: 'text-[#412402] opacity-70',
      badgeCls: 'bg-[#854F0B]',
    },
    {
      key: 'later',
      badge: 'בהמשך', pill: 'ממתין',
      title: 'בהמשך הדרך', sub: '',
      headerBg: 'bg-[#F3F4F6]', titleCls: 'text-stone-700', subCls: 'text-stone-500',
      badgeCls: 'bg-[#6B7280]',
    },
  ]

  return (
    <>
      {groups.map(g => {
        const groupTasks = tasks.filter(t => t.urgency === g.key)
        return (
          <Group
            key={g.key}
            tasks={groupTasks}
            contacts={contacts}
            header={
              <div className={`flex items-center gap-2.5 px-4 py-2.5 border-b border-[#E5E7EB] ${g.headerBg}`}>
                <span className={`text-[10px] font-semibold text-white px-2.5 py-1 rounded-md whitespace-nowrap ${g.badgeCls}`}>
                  {g.badge}
                </span>
                <div className="flex-1 min-w-0">
                  <div className={`text-[13px] font-semibold ${g.titleCls}`}>{g.title}</div>
                  <div className={`text-[11px] ${g.subCls}`}>
                    {g.sub ? `${g.sub} · ` : ''}{groupTasks.length} משימות
                  </div>
                </div>
                <span className="text-[10px] font-medium px-2.5 py-1 rounded-md bg-white border border-[#E5E7EB] text-stone-600 whitespace-nowrap">
                  {g.pill}
                </span>
              </div>
            }
          />
        )
      })}
    </>
  )
}

// ─── Party view ───────────────────────────────────────────────────────────────

function PartyView({ tasks, contacts }: { tasks: ProjectTask[]; contacts: ProjectContact[] }) {
  const groups = [
    {
      key: 'internal', title: 'פנימי — היתרים IL', sub: 'בשליטתנו', pill: 'בעבודה',
      icon: '⌂', headerBg: 'bg-[#EEEDFE]', titleCls: 'text-[#26215C]', subCls: 'text-[#26215C] opacity-70',
      iconBg: 'bg-[#534AB7]',
    },
    {
      key: 'client', title: 'לקוח', sub: 'דרושה החלטה', pill: 'דחוף',
      icon: '★', headerBg: 'bg-[#FAECE7]', titleCls: 'text-[#4A1B0C]', subCls: 'text-[#4A1B0C] opacity-70',
      iconBg: 'bg-[#993C1D]',
    },
    {
      key: 'authority', title: 'רשויות', sub: 'ממתין', pill: 'ממתין',
      icon: '⚖', headerBg: 'bg-[#FAEEDA]', titleCls: 'text-[#412402]', subCls: 'text-[#412402] opacity-70',
      iconBg: 'bg-[#854F0B]',
    },
    {
      key: 'consultants', title: 'יועצים', sub: 'בתיאום', pill: 'בתיאום',
      icon: '⚙', headerBg: 'bg-[#E6F1FB]', titleCls: 'text-[#042C53]', subCls: 'text-[#042C53] opacity-70',
      iconBg: 'bg-[#185FA5]',
    },
  ]

  return (
    <>
      {groups.map(g => {
        const groupTasks = tasks.filter(t => t.party === g.key)
        return (
          <Group
            key={g.key}
            tasks={groupTasks}
            contacts={contacts}
            header={
              <div className={`flex items-center gap-2.5 px-4 py-2.5 border-b border-[#E5E7EB] ${g.headerBg}`}>
                <div className={`w-7 h-7 ${g.iconBg} text-white rounded-md flex items-center justify-center text-sm flex-shrink-0`}>
                  {g.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className={`text-[13px] font-semibold ${g.titleCls}`}>{g.title}</div>
                  <div className={`text-[11px] ${g.subCls}`}>{g.sub} · {groupTasks.length} משימות</div>
                </div>
                <span className="text-[10px] font-medium px-2.5 py-1 rounded-md bg-white border border-[#E5E7EB] text-stone-600 whitespace-nowrap">
                  {g.pill}
                </span>
              </div>
            }
          />
        )
      })}
    </>
  )
}

// ─── Phase view ───────────────────────────────────────────────────────────────

function PhaseView({ tasks, contacts }: { tasks: ProjectTask[]; contacts: ProjectContact[] }) {
  const groups = [
    {
      key: 'planning', label: 'תכנון', title: 'תכנון אדריכלי ותיאום יועצים', sub: 'פעיל', pill: 'בעבודה',
      headerBg: 'bg-[#E6F1FB]', titleCls: 'text-[#042C53]', subCls: 'text-[#042C53] opacity-65', badgeBg: 'bg-[#185FA5]',
    },
    {
      key: 'approvals', label: 'אישורים', title: 'אישורים סטטוטוריים', sub: 'במקביל', pill: 'ממתין',
      headerBg: 'bg-[#FAEEDA]', titleCls: 'text-[#412402]', subCls: 'text-[#412402] opacity-65', badgeBg: 'bg-[#854F0B]',
    },
    {
      key: 'client_decisions', label: 'לקוח', title: 'החלטות לקוח פתוחות', sub: 'עוצר התקדמות', pill: 'דחוף',
      headerBg: 'bg-[#FAECE7]', titleCls: 'text-[#4A1B0C]', subCls: 'text-[#4A1B0C] opacity-65', badgeBg: 'bg-[#993C1D]',
    },
    {
      key: 'submission', label: 'הגשה', title: 'הגשה לוועדה', sub: 'מתוכנן', pill: 'בהמשך',
      headerBg: 'bg-stone-100', titleCls: 'text-stone-800', subCls: 'text-stone-500', badgeBg: 'bg-stone-500',
    },
  ]

  return (
    <>
      {groups.map(g => {
        const groupTasks = tasks.filter(t => t.phase === g.key)
        return (
          <Group
            key={g.key}
            tasks={groupTasks}
            contacts={contacts}
            header={
              <div className={`flex items-center gap-2.5 px-4 py-2.5 border-b border-[#E5E7EB] ${g.headerBg}`}>
                <span className={`text-[10px] font-semibold text-white px-2.5 py-1 rounded-md whitespace-nowrap ${g.badgeBg}`}>
                  {g.label}
                </span>
                <div className="flex-1 min-w-0">
                  <div className={`text-[13px] font-semibold ${g.titleCls}`}>{g.title}</div>
                  <div className={`text-[11px] ${g.subCls}`}>{g.sub} · {groupTasks.length} משימות</div>
                </div>
                <span className="text-[10px] font-medium px-2.5 py-1 rounded-md bg-white border border-[#E5E7EB] text-stone-600 whitespace-nowrap">
                  {g.pill}
                </span>
              </div>
            }
          />
        )
      })}
    </>
  )
}

// ─── Contact view ─────────────────────────────────────────────────────────────

const AVATAR_COLORS = [
  'bg-[#185FA5]', 'bg-[#0D7C6A]', 'bg-[#3D5A80]',
  'bg-[#993C1D]', 'bg-[#534AB7]', 'bg-[#6B7280]',
]

function ContactView({ tasks, contacts }: { tasks: ProjectTask[]; contacts: ProjectContact[] }) {
  const unassigned = tasks.filter(t => !t.contact_id || !contacts.find(c => c.id === t.contact_id))

  return (
    <>
      {contacts.map((contact, idx) => {
        const contactTasks = tasks.filter(t => t.contact_id === contact.id)
        const avatarCls = AVATAR_COLORS[idx % AVATAR_COLORS.length]
        return (
          <Group
            key={contact.id}
            tasks={contactTasks}
            contacts={contacts}
            hideWhenEmpty
            header={
              <div className="flex items-center gap-3 px-4 py-3 border-b border-[#E5E7EB] bg-[#F9FAFB]">
                <div className={`w-8 h-8 rounded-full ${avatarCls} text-white flex items-center justify-center text-[13px] font-semibold flex-shrink-0`}>
                  {contact.name.trim().charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[14px] font-semibold text-stone-900">{contact.name}</div>
                  <div className="text-[11px] text-stone-500">
                    {[contact.role, contact.company].filter(Boolean).join(' · ')}
                  </div>
                </div>
                {contact.phone && (
                  <span className="text-[11px] text-[#3D6A9E] font-medium" dir="ltr">{contact.phone}</span>
                )}
                <span className="text-[10px] font-medium px-2.5 py-1 rounded-md bg-white border border-[#E5E7EB] text-stone-600 whitespace-nowrap">
                  {contactTasks.length} משימות
                </span>
              </div>
            }
          />
        )
      })}

      {unassigned.length > 0 && (
        <Group
          tasks={unassigned}
          contacts={contacts}
          header={
            <div className="flex items-center gap-3 px-4 py-3 border-b border-[#E5E7EB] bg-[#F9FAFB]">
              <div className="w-8 h-8 rounded-full bg-stone-300 text-white flex items-center justify-center text-[13px] font-semibold flex-shrink-0">
                —
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[14px] font-semibold text-stone-600">ללא שיוך</div>
                <div className="text-[11px] text-stone-400">טרם הוקצה אחראי</div>
              </div>
              <span className="text-[10px] font-medium px-2.5 py-1 rounded-md bg-white border border-[#E5E7EB] text-stone-600 whitespace-nowrap">
                {unassigned.length} משימות
              </span>
            </div>
          }
        />
      )}
    </>
  )
}

// ─── Contacts section (shown in non-contact views) ────────────────────────────

function ContactsSection({ contacts }: { contacts: ProjectContact[] }) {
  if (contacts.length === 0) return null
  return (
    <div className="bg-white border border-[#E5E7EB] rounded-lg overflow-hidden print:break-inside-avoid">
      <div className="flex items-center justify-between px-4 py-2.5 bg-[#F9FAFB] border-b border-[#E5E7EB]">
        <span className="text-[12px] font-semibold text-stone-700">אנשי קשר</span>
        <span className="text-[11px] text-stone-400">{contacts.length}</span>
      </div>
      {contacts.map(c => (
        <div key={c.id} className="flex items-center gap-3 px-4 py-2.5 border-b border-[#F3F4F6] last:border-0">
          <div className="w-7 h-7 rounded-full bg-[#EBF1F9] text-[#0C447C] flex items-center justify-center text-[11px] font-semibold flex-shrink-0">
            {c.name.trim().charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[12px] font-medium text-stone-900">{c.name}</div>
            <div className="text-[10px] text-stone-400">
              {[c.role, c.company].filter(Boolean).join(' · ')}
            </div>
          </div>
          {c.phone && (
            <span className="text-[11px] text-[#3D6A9E]" dir="ltr">{c.phone}</span>
          )}
        </div>
      ))}
    </div>
  )
}

// ─── Main export ──────────────────────────────────────────────────────────────

export function ClientReport({
  projectId,
  initialView,
}: {
  projectId: string
  initialView: ViewKey
}) {
  const [view, setView] = useState<ViewKey>(initialView)

  const { data: project, isLoading: projectLoading } = useProject(projectId)
  const { data: tasks = [], isLoading: tasksLoading } = useProjectTasks(projectId)
  const { data: contacts = [], isLoading: contactsLoading } = useProjectContacts(projectId)

  if (projectLoading || tasksLoading || contactsLoading) {
    return <div className="py-16 text-center text-stone-400 text-sm">טוען נתונים...</div>
  }

  const dateStr = todayString()
  const viewLabel = VIEW_OPTIONS.find(v => v.key === view)?.label ?? ''

  const ViewContent = {
    urgency: UrgencyView,
    contact: ContactView,
    phase:   PhaseView,
    party:   PartyView,
  }[view]

  return (
    <div dir="rtl">
      {/* ─ Controls bar (hidden on print) ─ */}
      <div className="print:hidden flex items-center justify-between mb-5 flex-wrap gap-2">
        <div className="flex gap-1.5 items-center flex-wrap">
          <span className="text-[11px] text-stone-500 ml-1">תצוגה:</span>
          {VIEW_OPTIONS.map(opt => (
            <button
              key={opt.key}
              onClick={() => setView(opt.key)}
              className={`px-3 py-1.5 rounded-md text-xs border transition-colors ${
                view === opt.key
                  ? 'bg-white border-stone-400 text-stone-900 font-medium'
                  : 'bg-transparent border-stone-200 text-stone-600 hover:bg-stone-50'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
        <button
          onClick={() => window.print()}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs border border-stone-300 bg-white text-stone-700 hover:bg-stone-50 transition-colors"
        >
          🖨 הדפסה / PDF
        </button>
      </div>

      {/* ─ Report content ─ */}
      <div className="max-w-3xl mx-auto space-y-2.5">

        {/* Header */}
        <div className="bg-white border border-[#E5E7EB] rounded-lg px-5 py-4 flex items-start justify-between print:rounded-none print:border-x-0 print:border-t-0 print:border-b-2">
          <div>
            <div className="text-[10px] font-semibold tracking-widest text-stone-400 uppercase mb-1.5">
              היתרים IL · דוח משימות
            </div>
            <div className="text-xl font-bold text-stone-900 leading-snug">{project?.title}</div>
            {project?.location && (
              <div className="text-[12px] text-stone-500 mt-1">{project.location}</div>
            )}
            {project?.client && (
              <div className="text-[11px] text-stone-400 mt-0.5">
                {project.client.name}
                {project.client.company ? ` · ${project.client.company}` : ''}
              </div>
            )}
          </div>
          <div className="text-left flex-shrink-0 mr-4">
            <div className="text-[10px] text-stone-400 mb-1">תצוגה נבחרת</div>
            <div className="bg-[#EBF1F9] text-[#3D6A9E] text-[11px] font-semibold px-3 py-1 rounded-md">
              {viewLabel}
            </div>
            <div className="text-[11px] text-stone-400 mt-1.5">{dateStr}</div>
          </div>
        </div>

        {/* Task groups */}
        <ViewContent tasks={tasks} contacts={contacts} />

        {/* Contacts section — only for non-contact views */}
        {view !== 'contact' && <ContactsSection contacts={contacts} />}

        {/* Footer */}
        <div className="flex justify-between text-[11px] text-stone-400 pt-1 print:pt-4">
          <span>היתרים IL — ניהול פרויקטי היתרי בנייה</span>
          <span>הופק: {dateStr}</span>
        </div>
      </div>
    </div>
  )
}
