import type { Subtask } from "../../types"

interface SubtaskProgressProps {
  subtasks: Subtask[]
}

export function SubtaskProgress({ subtasks }: SubtaskProgressProps) {
  if (!subtasks || subtasks.length === 0) return null

  const done = subtasks.filter(s => s.done).length

  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] bg-stone-100 text-stone-600">
      ☑ {done}/{subtasks.length}
    </span>
  )
}
