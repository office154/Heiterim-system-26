"use client"

import { useState } from "react"
import { Checkbox } from "@/components/ui/checkbox"
import type { ProjectTask, ProjectContact } from "../types"
import { PriorityBadge } from "./atoms/priority-badge"
import { TagChip } from "./atoms/tag-chip"
import { UrgencyBadge } from "./atoms/urgency-badge"
import { SubtaskProgress } from "./atoms/subtask-progress"

interface TaskRowProps {
  task: ProjectTask
  contacts: ProjectContact[]
  isUrgent?: boolean
  onToggleDone: (taskId: string) => void
  onToggleSubtask: (taskId: string, index: number) => void
  onClick?: (taskId: string) => void
}

export function TaskRow({
  task,
  contacts,
  isUrgent = false,
  onToggleDone,
  onToggleSubtask,
  onClick,
}: TaskRowProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const hasExpandable = !!task.description || (task.subtasks && task.subtasks.length > 0)
  const isDone = task.status === "done"
  const isPrimary = task.urgency === "today"

  const formatDeadline = (date: string | null): string | null => {
    if (!date) return null
    const d = new Date(date)
    return `${String(d.getDate()).padStart(2, "0")}.${String(d.getMonth() + 1).padStart(2, "0")}`
  }

  const rowBg = isUrgent ? "bg-[#FCEBEB]" : ""

  return (
    <div className={`px-4 py-3 border-b border-stone-200 last:border-b-0 text-xs ${rowBg}`}>
      {/* שורה ראשית */}
      <div className="grid grid-cols-[auto_1fr_auto_auto_auto] gap-3 items-center">
        <Checkbox
          checked={isDone}
          onCheckedChange={() => onToggleDone(task.id)}
          aria-label={`סמן ${task.title} כבוצע`}
        />

        <div className="min-w-0">
          <div className="font-medium text-stone-900 truncate">{task.title}</div>
          {task.description && (
            <div className="text-[10px] text-stone-500 truncate">
              {task.description}
            </div>
          )}
        </div>

        <UrgencyBadge urgency={task.urgency} deadline={formatDeadline(task.deadline)} />

        <button
          onClick={() => onToggleDone(task.id)}
          className={`px-2.5 py-1 rounded-md text-[10px] font-medium border transition-colors ${
            isPrimary
              ? "bg-[#E6F1FB] text-[#185FA5] border-[#85B7EB]"
              : "bg-white text-stone-700 border-stone-300 hover:bg-stone-50"
          }`}
        >
          בוצע ✓
        </button>
      </div>

      {/* שורת מטא-דאטה */}
      <div className="flex flex-wrap items-center gap-1.5 mt-2 pr-7">
        <PriorityBadge priority={task.priority} />
        {task.tags.map((tag) => (
          <TagChip key={tag} label={tag} />
        ))}
        <SubtaskProgress subtasks={task.subtasks} />
        <span className="text-[10px] text-stone-400 mr-auto">
          נפתחה {formatDeadline(task.created_at)}
        </span>
      </div>

      {/* כפתור הרחבה */}
      {hasExpandable && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-[11px] text-stone-500 hover:text-stone-700 mt-2 pr-7"
        >
          {isExpanded ? "▲ הסתר" : "▼ הצג פרטים"}
        </button>
      )}

      {/* תוכן מורחב */}
      {isExpanded && (
        <div className="mt-2 pr-7 space-y-2">
          {task.description && (
            <div className="bg-stone-100 rounded-md p-3 text-[11px] text-stone-700 leading-relaxed">
              {task.description}
            </div>
          )}
          {task.subtasks && task.subtasks.length > 0 && (
            <div className="bg-stone-100 rounded-md p-3 space-y-1.5">
              {task.subtasks.map((subtask, idx) => (
                <label
                  key={idx}
                  className="flex items-center gap-2 text-[11px] cursor-pointer"
                >
                  <Checkbox
                    checked={subtask.done}
                    onCheckedChange={() => onToggleSubtask(task.id, idx)}
                  />
                  <span
                    className={
                      subtask.done ? "line-through text-stone-400" : "text-stone-700"
                    }
                  >
                    {subtask.text}
                  </span>
                </label>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
