"use client"

import type { ProjectTask, ProjectContact } from "../types"
import { TaskRow } from "./task-row"

interface TaskGroupProps {
  tasks: ProjectTask[]
  contacts: ProjectContact[]
  header: React.ReactNode
  isUrgent?: boolean
  onToggleDone: (taskId: string) => void
  onToggleSubtask: (taskId: string, index: number) => void
  onTaskClick?: (taskId: string) => void
}

export function TaskGroup({
  tasks,
  contacts,
  header,
  isUrgent = false,
  onToggleDone,
  onToggleSubtask,
  onTaskClick,
}: TaskGroupProps) {
  if (tasks.length === 0) return null

  const borderClass = isUrgent ? "border-[#F09595]" : "border-stone-200"

  return (
    <div className={`bg-white border ${borderClass} rounded-lg mb-2.5 overflow-hidden`}>
      {header}
      <div>
        {tasks.map((task) => (
          <TaskRow
            key={task.id}
            task={task}
            contacts={contacts}
            isUrgent={isUrgent}
            onToggleDone={onToggleDone}
            onToggleSubtask={onToggleSubtask}
            onClick={onTaskClick}
          />
        ))}
      </div>
    </div>
  )
}
