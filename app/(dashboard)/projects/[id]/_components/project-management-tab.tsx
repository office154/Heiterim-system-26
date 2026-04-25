"use client"

import { useState } from "react"
import { useProjectTasks, useUpdateTask, useToggleSubtask } from "./project-management/hooks/use-project-tasks"
import { useProjectContacts } from "./project-management/hooks/use-project-contacts"
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

  const { data: tasks = [], isLoading: tasksLoading, error: tasksError } = useProjectTasks(projectId)
  const { data: contacts = [], isLoading: contactsLoading } = useProjectContacts(projectId)

  const updateTask = useUpdateTask()
  const toggleSubtask = useToggleSubtask()

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
        />
      )}

      {/* כפתורי פעולה - placeholder עד שלב 7ה */}
      <div className="flex gap-2.5 mt-4">
        <button
          disabled
          className="flex-1 bg-white border border-stone-300 rounded-md py-2.5 text-xs font-medium text-stone-400 cursor-not-allowed"
        >
          + הוסף משימה (בשלב הבא)
        </button>
        <button
          disabled
          className="flex-1 bg-white border border-stone-300 rounded-md py-2.5 text-xs font-medium text-stone-400 cursor-not-allowed"
        >
          + הוסף איש קשר (בשלב הבא)
        </button>
      </div>
    </div>
  )
}
