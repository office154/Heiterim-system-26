import * as React from "react"
import { Input as InputPrimitive } from "@base-ui/react/input"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(
        // base
        "h-9 w-full min-w-0 rounded-lg border bg-card px-3 py-1.5 text-sm transition-colors outline-none",
        // colors - using new tokens
        "border-[var(--border-input)] text-[var(--text-primary)]",
        // placeholder
        "placeholder:text-[var(--text-muted)]",
        // file input
        "file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-[var(--text-primary)]",
        // focus
        "focus-visible:border-[var(--border-focus)] focus-visible:ring-2 focus-visible:ring-[var(--accent-primary-light)]",
        // disabled
        "disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-[var(--bg-elevated)] disabled:opacity-60",
        // aria-invalid - using new danger tokens
        "aria-invalid:border-[var(--danger-border)] aria-invalid:ring-2 aria-invalid:ring-[var(--danger-bg)]",
        // dark mode preserved for future use
        "dark:bg-input/30 dark:disabled:bg-input/80 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40",
        className
      )}
      {...props}
    />
  )
}

export { Input }
