import type { TaskUrgency } from "../../types"

interface UrgencyBadgeProps {
  urgency: TaskUrgency
  deadline?: string | null
}

export function UrgencyBadge({ urgency, deadline }: UrgencyBadgeProps) {
  if (urgency === "today") {
    return (
      <span className="inline-flex items-center px-1.5 py-0.5 rounded-md bg-[#E24B4A] text-white text-[10px] font-medium">
        דחוף היום
      </span>
    )
  }

  if (urgency === "week") {
    return (
      <span className="text-[11px] text-[#854F0B]">
        {deadline ?? "השבוע"}
      </span>
    )
  }

  return (
    <span className="text-[11px] text-stone-500">
      {deadline ?? "בהמשך"}
    </span>
  )
}
