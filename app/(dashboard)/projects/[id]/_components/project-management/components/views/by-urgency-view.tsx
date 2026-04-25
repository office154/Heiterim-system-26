"use client"

import { TaskGroup } from "../task-group"
import type { ViewProps } from "./types"

export function ByUrgencyView({
  tasks,
  contacts,
  onToggleDone,
  onToggleSubtask,
  onTaskClick,
}: ViewProps) {
  const today = tasks.filter((t) => t.urgency === "today" && t.status !== "done")
  const week = tasks.filter((t) => t.urgency === "week" && t.status !== "done")
  const later = tasks.filter((t) => t.urgency === "later" && t.status !== "done")

  return (
    <div>
      <TaskGroup
        tasks={today}
        contacts={contacts}
        isUrgent={true}
        onToggleDone={onToggleDone}
        onToggleSubtask={onToggleSubtask}
        onTaskClick={onTaskClick}
        header={
          <div className="flex items-center gap-2.5 px-4 py-3 bg-[#FCEBEB] border-b border-stone-200">
            <span className="w-2.5 h-2.5 bg-[#E24B4A] rounded-full" />
            <span className="text-[13px] font-medium flex-1">דחוף - היום</span>
            <span className="text-[11px] text-[#791F1F]">{today.length} משימות</span>
          </div>
        }
      />

      <TaskGroup
        tasks={week}
        contacts={contacts}
        onToggleDone={onToggleDone}
        onToggleSubtask={onToggleSubtask}
        onTaskClick={onTaskClick}
        header={
          <div className="flex items-center gap-2.5 px-4 py-3 bg-stone-100 border-b border-stone-200">
            <span className="w-2.5 h-2.5 bg-[#BA7517] rounded-full" />
            <span className="text-[13px] font-medium flex-1">השבוע</span>
            <span className="text-[11px] text-stone-600">{week.length} משימות</span>
          </div>
        }
      />

      <TaskGroup
        tasks={later}
        contacts={contacts}
        onToggleDone={onToggleDone}
        onToggleSubtask={onToggleSubtask}
        onTaskClick={onTaskClick}
        header={
          <div className="flex items-center gap-2.5 px-4 py-3 bg-stone-100 border-b border-stone-200">
            <span className="w-2.5 h-2.5 bg-stone-400 rounded-full" />
            <span className="text-[13px] font-medium flex-1">בהמתנה / בהמשך</span>
            <span className="text-[11px] text-stone-600">{later.length} משימות</span>
          </div>
        }
      />
    </div>
  )
}
