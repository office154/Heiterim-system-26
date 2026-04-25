import type { ProjectContact } from "../../types"

interface ContactAvatarProps {
  contact: ProjectContact | null
  size?: "sm" | "md"
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).slice(0, 2)
  return parts.map(p => p.charAt(0)).join("")
}

function getColorScheme(name: string): { bg: string; text: string } {
  const palettes = [
    { bg: "bg-[#E6F1FB]", text: "text-[#0C447C]" },
    { bg: "bg-[#EEEDFE]", text: "text-[#3C3489]" },
    { bg: "bg-[#FAEEDA]", text: "text-[#854F0B]" },
    { bg: "bg-[#FAECE7]", text: "text-[#712B13]" },
  ]
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
  return palettes[Math.abs(hash) % palettes.length]
}

export function ContactAvatar({ contact, size = "sm" }: ContactAvatarProps) {
  if (!contact) {
    return <span className="text-xs text-stone-400">—</span>
  }

  const dimensions = size === "sm" ? "w-[22px] h-[22px] text-[10px]" : "w-8 h-8 text-[11px]"
  const colors = getColorScheme(contact.name)
  const initials = getInitials(contact.name)

  return (
    <div className="inline-flex items-center gap-1.5">
      <div
        className={`${dimensions} ${colors.bg} ${colors.text} rounded-full flex items-center justify-center font-medium flex-shrink-0`}
        aria-label={contact.name}
      >
        {initials}
      </div>
      <span className="text-xs truncate">{contact.name}</span>
    </div>
  )
}
