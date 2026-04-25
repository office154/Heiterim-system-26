import type { TaskPriority } from "../../types"
import { PRIORITY_LABELS } from "../../types"

interface PriorityBadgeProps {
  priority: TaskPriority
}

export function PriorityBadge({ priority }: PriorityBadgeProps) {
  const styles: Record<TaskPriority, string> = {
    critical: "bg-[#E24B4A] text-white",
    high: "bg-[#F0997B] text-[#4A1B0C]",
    normal: "bg-stone-100 text-stone-600",
    low: "bg-transparent text-stone-500 border border-stone-200",
  }

  return (
    <span
      className={`inline-flex items-center px-1.5 py-0.5 rounded-sm text-[9px] font-medium tracking-tight ${styles[priority]}`}
    >
      {PRIORITY_LABELS[priority]}
    </span>
  )
}
