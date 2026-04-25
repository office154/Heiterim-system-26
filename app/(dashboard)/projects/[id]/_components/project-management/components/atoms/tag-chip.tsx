interface TagChipProps {
  label: string
}

export function TagChip({ label }: TagChipProps) {
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] bg-stone-100 text-stone-600">
      {label}
    </span>
  )
}
