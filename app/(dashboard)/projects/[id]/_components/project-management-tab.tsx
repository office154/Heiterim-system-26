"use client"

import { useState } from "react"
import { useProjectTasks, useUpdateTask, useToggleSubtask, useDeleteTask } from "./project-management/hooks/use-project-tasks"
import { useProjectContacts, useDeleteContact } from "./project-management/hooks/use-project-contacts"
import type { ProjectTask, ProjectContact } from "./project-management/types"
import { TaskForm } from "./project-management/components/forms/task-form"
import { ContactForm } from "./project-management/components/forms/contact-form"
import { ByUrgencyView } from "./project-management/components/views/by-urgency-view"
import { ByContactView } from "./project-management/components/views/by-contact-view"
import { ByPhaseView } from "./project-management/components/views/by-phase-view"
import { ByPartyView } from "./project-management/components/views/by-party-view"

type ViewKey = "urgency" | "contact" | "phase" | "party"

interface ProjectManagementTabProps {
  projectId: string
}

const VIEW_OPTIONS: { key: ViewKey; label: string }[] = [
  { key: "urgency", label: "לפי דחיפות" },
  { key: "contact", label: "לפי איש קשר" },
  { key: "phase", label: "לפי שלב" },
  { key: "party", label: "לפי גורם" },
]

export function ProjectManagementTab({ projectId }: ProjectManagementTabProps) {
  const [currentView, setCurrentView] = useState<ViewKey>("urgency")
  const [taskFormOpen, setTaskFormOpen] = useState(false)
  const [contactFormOpen, setContactFormOpen] = useState(false)
  const [selectedTask, setSelectedTask] = useState<ProjectTask | undefined>()
  const [selectedContact, setSelectedContact] = useState<ProjectContact | undefined>()

  const { data: tasks = [], isLoading: tasksLoading, error: tasksError } = useProjectTasks(projectId)
  const { data: contacts = [], isLoading: contactsLoading } = useProjectContacts(projectId)

  const updateTask = useUpdateTask()
  const toggleSubtask = useToggleSubtask()
  const deleteTask = useDeleteTask()
  const deleteContact = useDeleteContact()

  const stats = {
    today: tasks.filter((t) => t.urgency === "today" && t.status !== "done").length,
    week: tasks.filter((t) => t.urgency === "week" && t.status !== "done").length,
    later: tasks.filter((t) => t.urgency === "later" && t.status !== "done").length,
    completedThisWeek: tasks.filter((t) => {
      if (t.status !== "done" || !t.completed_at) return false
      const completedDate = new Date(t.completed_at)
      const weekAgo = new Date()
      weekAgo.setDate(weekAgo.getDate() - 7)
      return completedDate >= weekAgo
    }).length,
  }

  const handleToggleDone = (taskId: string) => {
    const task = tasks.find((t) => t.id === taskId)
    if (!task) return
    const newStatus = task.status === "done" ? "open" : "done"
    updateTask.mutate({ id: taskId, projectId, status: newStatus })
  }

  const handleToggleSubtask = (taskId: string, index: number) => {
    const task = tasks.find((t) => t.id === taskId)
    if (!task) return
    toggleSubtask.mutate({ id: taskId, projectId, subtasks: task.subtasks, index })
  }

  const handleTaskEdit = (taskId: string) => {
    const task = tasks.find((t) => t.id === taskId)
    if (!task) return
    setSelectedTask(task)
    setTaskFormOpen(true)
  }

  const handleTaskDelete = (taskId: string) => {
    if (!confirm("למחוק את המשימה?")) return
    deleteTask.mutate({ id: taskId, projectId })
  }

  const handleContactEdit = (contact: ProjectContact) => {
    setSelectedContact(contact)
    setContactFormOpen(true)
  }

  const handleContactDelete = (contactId: string) => {
    if (!confirm("למחוק את איש הקשר?")) return
    deleteContact.mutate({ id: contactId, projectId })
  }

  if (tasksLoading || contactsLoading) {
    return <div className="text-center py-12 text-stone-500">טוען משימות...</div>
  }

  if (tasksError) {
    return (
      <div className="text-center py-12 text-red-600">
        שגיאה בטעינת משימות: {tasksError.message}
      </div>
    )
  }

  const ViewComponent = {
    urgency: ByUrgencyView,
    contact: ByContactView,
    phase: ByPhaseView,
    party: ByPartyView,
  }[currentView]

  return (
    <div dir="rtl" className="space-y-4">
      {/* כרטיסי סטטיסטיקה */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
        <div className="bg-[#FCEBEB] rounded-md px-3 py-3">
          <div className="text-[11px] text-[#791F1F] mb-0.5">דחוף היום</div>
          <div className="text-xl font-medium text-[#791F1F]">{stats.today}</div>
        </div>
        <div className="bg-[#FAEEDA] rounded-md px-3 py-3">
          <div className="text-[11px] text-[#854F0B] mb-0.5">השבוע</div>
          <div className="text-xl font-medium text-[#854F0B]">{stats.week}</div>
        </div>
        <div className="bg-stone-100 rounded-md px-3 py-3">
          <div className="text-[11px] text-stone-600 mb-0.5">בהמתנה</div>
          <div className="text-xl font-medium">{stats.later}</div>
        </div>
        <div className="bg-[#EAF3DE] rounded-md px-3 py-3">
          <div className="text-[11px] text-[#27500A] mb-0.5">בוצעו השבוע</div>
          <div className="text-xl font-medium text-[#27500A]">{stats.completedThisWeek}</div>
        </div>
      </div>

      {/* בורר תצוגות */}
      <div className="flex gap-1.5 items-center flex-wrap">
        <span className="text-[11px] text-stone-500 ml-1">תצוגה:</span>
        {VIEW_OPTIONS.map((option) => {
          const isActive = currentView === option.key
          return (
            <button
              key={option.key}
              onClick={() => setCurrentView(option.key)}
              className={`px-3 py-1.5 rounded-md text-xs border transition-colors ${
                isActive
                  ? "bg-white border-stone-400 text-stone-900 font-medium"
                  : "bg-transparent border-stone-200 text-stone-600 hover:bg-stone-50"
              }`}
            >
              {option.label}
            </button>
          )
        })}
        <a
          href={`/projects/${projectId}/report?view=${currentView}`}
          target="_blank"
          rel="noopener noreferrer"
          className="ms-auto text-[11px] text-[#3D6A9E] border border-[#3D6A9E]/30 hover:bg-[#EBF1F9] px-2.5 py-1.5 rounded-md transition-colors whitespace-nowrap"
        >
          📄 דוח לקוח
        </a>
      </div>

      {/* התצוגה הנוכחית */}
      {tasks.length === 0 ? (
        <div className="bg-white border border-stone-200 rounded-lg py-12 text-center text-stone-500">
          <div className="text-sm mb-2">אין משימות בפרויקט הזה</div>
          <div className="text-xs text-stone-400">לחצי על &quot;+ הוסף משימה&quot; כדי להתחיל</div>
        </div>
      ) : (
        <ViewComponent
          tasks={tasks}
          contacts={contacts}
          onToggleDone={handleToggleDone}
          onToggleSubtask={handleToggleSubtask}
          onTaskClick={handleTaskEdit}
          onTaskDelete={handleTaskDelete}
        />
      )}

      {/* אנשי קשר */}
      {contacts.length > 0 && (
        <div className="bg-white border border-stone-200 rounded-lg overflow-hidden mt-2">
          <div className="flex items-center justify-between px-4 py-3 bg-stone-50 border-b border-stone-200">
            <span className="text-[13px] font-medium">אנשי קשר</span>
            <span className="text-[11px] text-stone-500">{contacts.length}</span>
          </div>
          <div className="divide-y divide-stone-100">
            {contacts.map((c) => (
              <div key={c.id} className="group flex items-center gap-3 px-4 py-2.5">
                <div className="w-7 h-7 rounded-full bg-[#E6F1FB] text-[#0C447C] flex items-center justify-center text-[11px] font-medium shrink-0">
                  {c.name.trim().charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-medium text-stone-900">{c.name}</div>
                  <div className="text-[11px] text-stone-500 truncate">
                    {[c.role, c.company].filter(Boolean).join(" · ")}
                  </div>
                </div>
                {c.phone && (
                  <a href={`tel:${c.phone}`} className="text-[11px] text-[#3D6A9E] hover:underline" dir="ltr">
                    {c.phone}
                  </a>
                )}
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleContactEdit(c)}
                    className="px-1.5 py-1 rounded text-[10px] text-stone-500 hover:text-[#3D6A9E] hover:bg-[#EBF1F9] transition-colors"
                    title="עריכה"
                  >
                    ✎
                  </button>
                  <button
                    onClick={() => handleContactDelete(c.id)}
                    className="px-1.5 py-1 rounded text-[10px] text-stone-500 hover:text-[#C0392B] hover:bg-[#fdf0ef] transition-colors"
                    title="מחיקה"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* כפתורי פעולה */}
      <div className="flex gap-2.5 mt-4">
        <button
          onClick={() => setTaskFormOpen(true)}
          className="flex-1 bg-white border border-stone-300 rounded-md py-2.5 text-xs font-medium text-stone-700 hover:bg-stone-50 transition-colors"
        >
          + הוסף משימה
        </button>
        <button
          onClick={() => setContactFormOpen(true)}
          className="flex-1 bg-white border border-stone-300 rounded-md py-2.5 text-xs font-medium text-stone-700 hover:bg-stone-50 transition-colors"
        >
          + הוסף איש קשר
        </button>
      </div>

      <TaskForm
        key={selectedTask?.id ?? "new-task"}
        projectId={projectId}
        contacts={contacts}
        task={selectedTask}
        open={taskFormOpen}
        onOpenChange={(open) => { setTaskFormOpen(open); if (!open) setSelectedTask(undefined) }}
      />
      <ContactForm
        key={selectedContact?.id ?? "new-contact"}
        projectId={projectId}
        contact={selectedContact}
        open={contactFormOpen}
        onOpenChange={(open) => { setContactFormOpen(open); if (!open) setSelectedContact(undefined) }}
      />
    </div>
  )
}
