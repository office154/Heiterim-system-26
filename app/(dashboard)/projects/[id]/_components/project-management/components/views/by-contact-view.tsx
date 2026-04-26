"use client"

import { TaskGroup } from "../task-group"
import { ContactAvatar } from "../atoms/contact-avatar"
import type { ViewProps } from "./types"
import type { ProjectContact, ProjectTask } from "../../types"

interface ContactGroup {
  contact: ProjectContact
  tasks: ProjectTask[]
  hasUrgent: boolean
  hasWaiting: boolean
}

export function ByContactView({
  tasks,
  contacts,
  onToggleDone,
  onToggleSubtask,
  onTaskClick,
  onTaskDelete,
}: ViewProps) {
  const groups: ContactGroup[] = contacts
    .map((contact) => {
      const contactTasks = tasks.filter(
        (t) =>
          (t.contact_id === contact.id || t.waiting_on_contact_id === contact.id) &&
          t.status !== "done"
      )
      return {
        contact,
        tasks: contactTasks,
        hasUrgent: contactTasks.some((t) => t.urgency === "today"),
        hasWaiting: contactTasks.some((t) => t.status === "waiting"),
      }
    })
    .filter((g) => g.tasks.length > 0)
    .sort((a, b) => {
      const score = (g: ContactGroup) => (g.hasUrgent ? 0 : g.hasWaiting ? 1 : 2)
      return score(a) - score(b)
    })

  const orphanTasks = tasks.filter(
    (t) => !t.contact_id && !t.waiting_on_contact_id && t.status !== "done"
  )

  return (
    <div>
      {groups.map((group) => {
        const isUrgent = group.hasUrgent
        const headerBg = isUrgent ? "bg-[#FCEBEB]" : group.hasWaiting ? "bg-[#FAEEDA]" : "bg-stone-100"
        const badgeText = isUrgent ? "דחוף" : group.hasWaiting ? "בהמתנה" : null
        const badgeColor = isUrgent ? "bg-[#E24B4A]" : "bg-[#BA7517]"

        return (
          <TaskGroup
            key={group.contact.id}
            tasks={group.tasks}
            contacts={contacts}
            isUrgent={isUrgent}
            onToggleDone={onToggleDone}
            onToggleSubtask={onToggleSubtask}
            onTaskClick={onTaskClick}
        onTaskDelete={onTaskDelete}
            header={
              <div className={`flex items-center gap-2.5 px-4 py-3 ${headerBg} border-b border-stone-200`}>
                <ContactAvatar contact={group.contact} size="md" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[13px] font-medium">{group.contact.name}</span>
                    {badgeText && (
                      <span className={`text-[10px] ${badgeColor} text-white px-1.5 py-0.5 rounded-md font-medium`}>
                        {badgeText}
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-stone-600 truncate">
                    {[group.contact.role, group.contact.company].filter(Boolean).join(" · ")}
                  </div>
                </div>
                <span className="text-[11px] text-stone-600">{group.tasks.length} משימות</span>
              </div>
            }
          />
        )
      })}

      {orphanTasks.length > 0 && (
        <TaskGroup
          tasks={orphanTasks}
          contacts={contacts}
          onToggleDone={onToggleDone}
          onToggleSubtask={onToggleSubtask}
          onTaskClick={onTaskClick}
        onTaskDelete={onTaskDelete}
          header={
            <div className="flex items-center gap-2.5 px-4 py-3 bg-stone-100 border-b border-stone-200">
              <span className="text-[13px] font-medium flex-1 text-stone-500">ללא איש קשר משויך</span>
              <span className="text-[11px] text-stone-600">{orphanTasks.length} משימות</span>
            </div>
          }
        />
      )}
    </div>
  )
}
