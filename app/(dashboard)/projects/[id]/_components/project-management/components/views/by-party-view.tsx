"use client"

import { TaskGroup } from "../task-group"
import type { ViewProps } from "./types"
import type { TaskParty } from "../../types"

interface PartyConfig {
  key: TaskParty
  title: string
  icon: string
  bg: string
  iconBg: string
  textColor: string
  tag: string
}

const PARTIES: PartyConfig[] = [
  {
    key: "internal",
    title: "פנימי - היתרים IL",
    icon: "⌂",
    bg: "bg-[#EEEDFE]",
    iconBg: "bg-[#534AB7]",
    textColor: "text-[#26215C]",
    tag: "בשליטתנו",
  },
  {
    key: "client",
    title: "לקוח",
    icon: "★",
    bg: "bg-[#FAECE7]",
    iconBg: "bg-[#993C1D]",
    textColor: "text-[#4A1B0C]",
    tag: "דרושה החלטה",
  },
  {
    key: "authority",
    title: "רשויות",
    icon: "⚖",
    bg: "bg-[#FAEEDA]",
    iconBg: "bg-[#854F0B]",
    textColor: "text-[#412402]",
    tag: "ממתין",
  },
  {
    key: "consultants",
    title: "יועצים",
    icon: "⚙",
    bg: "bg-[#E6F1FB]",
    iconBg: "bg-[#185FA5]",
    textColor: "text-[#042C53]",
    tag: "בתיאום",
  },
]

export function ByPartyView({
  tasks,
  contacts,
  onToggleDone,
  onToggleSubtask,
  onTaskClick,
  onTaskDelete,
}: ViewProps) {
  return (
    <div>
      {PARTIES.map((party) => {
        const partyTasks = tasks.filter(
          (t) => t.party === party.key && t.status !== "done"
        )

        return (
          <TaskGroup
            key={party.key}
            tasks={partyTasks}
            contacts={contacts}
            onToggleDone={onToggleDone}
            onToggleSubtask={onToggleSubtask}
            onTaskClick={onTaskClick}
        onTaskDelete={onTaskDelete}
            header={
              <div className={`flex items-center gap-2.5 px-4 py-3 ${party.bg} border-b border-stone-200`}>
                <div className={`w-7 h-7 ${party.iconBg} text-white rounded-md flex items-center justify-center text-base`}>
                  {party.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className={`text-[13px] font-medium ${party.textColor}`}>{party.title}</div>
                  <div className="text-[11px] opacity-70">
                    {partyTasks.length} משימות פעילות
                  </div>
                </div>
                <span className="text-[11px] bg-white px-2.5 py-1 rounded-md font-medium opacity-80">
                  {party.tag}
                </span>
              </div>
            }
          />
        )
      })}
    </div>
  )
}
