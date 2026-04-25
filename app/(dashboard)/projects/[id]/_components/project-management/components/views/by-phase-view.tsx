"use client"

import { TaskGroup } from "../task-group"
import type { ViewProps } from "./types"
import type { TaskPhase } from "../../types"

interface PhaseConfig {
  key: TaskPhase
  title: string
  label: string
  subtitle: string
  bg: string
  textColor: string
  badgeBg: string
  status: string
}

const PHASES: PhaseConfig[] = [
  {
    key: "planning",
    title: "תכנון אדריכלי ותיאום יועצים",
    label: "תכנון",
    subtitle: "פעיל",
    bg: "bg-[#E6F1FB]",
    textColor: "text-[#042C53]",
    badgeBg: "bg-[#185FA5]",
    status: "בעבודה",
  },
  {
    key: "approvals",
    title: "אישורים סטטוטוריים",
    label: "אישורים",
    subtitle: "במקביל",
    bg: "bg-[#FAEEDA]",
    textColor: "text-[#412402]",
    badgeBg: "bg-[#854F0B]",
    status: "ממתין",
  },
  {
    key: "client_decisions",
    title: "החלטות לקוח פתוחות",
    label: "לקוח",
    subtitle: "עוצר התקדמות",
    bg: "bg-[#FAECE7]",
    textColor: "text-[#4A1B0C]",
    badgeBg: "bg-[#993C1D]",
    status: "דחוף",
  },
  {
    key: "submission",
    title: "הגשה לוועדה",
    label: "הגשה",
    subtitle: "מתוכנן",
    bg: "bg-stone-100",
    textColor: "text-stone-800",
    badgeBg: "bg-stone-600",
    status: "בהמשך",
  },
]

export function ByPhaseView({
  tasks,
  contacts,
  onToggleDone,
  onToggleSubtask,
  onTaskClick,
}: ViewProps) {
  return (
    <div>
      {PHASES.map((phase) => {
        const phaseTasks = tasks.filter(
          (t) => t.phase === phase.key && t.status !== "done"
        )

        return (
          <TaskGroup
            key={phase.key}
            tasks={phaseTasks}
            contacts={contacts}
            onToggleDone={onToggleDone}
            onToggleSubtask={onToggleSubtask}
            onTaskClick={onTaskClick}
            header={
              <div className={`flex items-center gap-2.5 px-4 py-3 ${phase.bg} border-b border-stone-200`}>
                <span className={`text-[11px] ${phase.badgeBg} text-white px-2 py-0.5 rounded-md font-medium`}>
                  {phase.label}
                </span>
                <div className="flex-1 min-w-0">
                  <div className={`text-[13px] font-medium ${phase.textColor}`}>{phase.title}</div>
                  <div className="text-[11px] opacity-70">
                    {phase.subtitle} · {phaseTasks.length} משימות
                  </div>
                </div>
                <span className="bg-white rounded-md px-2.5 py-1 text-[11px] font-medium opacity-80">
                  {phase.status}
                </span>
              </div>
            }
          />
        )
      })}
    </div>
  )
}
