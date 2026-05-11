"use client"

import { Loader2 } from "lucide-react"
import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center gap-2 rounded-[var(--radius)] border border-transparent bg-clip-padding font-medium text-sm whitespace-nowrap transition-colors duration-200 outline-none select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--border-focus)] focus-visible:ring-offset-2 active:translate-y-px disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          "bg-[var(--accent-primary)] text-[var(--text-on-accent)] hover:bg-[var(--accent-primary-hover)] shadow-sm",
        outline:
          "border border-[var(--border-input)] bg-[var(--bg-card)] text-[var(--text-primary)] hover:bg-[var(--bg-hover)] hover:border-[var(--accent-primary)]",
        secondary:
          "bg-[var(--accent-primary-light)] text-[var(--accent-primary)] hover:bg-[var(--accent-secondary-light)]",
        ghost:
          "bg-transparent text-[var(--text-primary)] hover:bg-[var(--bg-hover)] hover:text-[var(--accent-primary)]",
        destructive:
          "border border-[var(--danger-border)] bg-[var(--danger-bg)] text-[var(--danger-text)] hover:bg-[var(--danger)] hover:text-[var(--text-on-accent)]",
        link: "text-[var(--accent-primary)] underline-offset-4 hover:underline hover:text-[var(--accent-primary-hover)]",
      },
      size: {
        default:
          "h-8 px-2.5 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2",
        xs: "h-6 rounded-[min(var(--radius-md),10px)] px-2 text-xs in-data-[slot=button-group]:rounded-lg has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-7 rounded-[min(var(--radius-md),12px)] px-2.5 text-[0.8rem] in-data-[slot=button-group]:rounded-lg has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3.5",
        lg: "h-9 px-2.5 has-data-[icon=inline-end]:pr-3 has-data-[icon=inline-start]:pl-3",
        icon: "size-8",
        "icon-xs":
          "size-6 rounded-[min(var(--radius-md),10px)] in-data-[slot=button-group]:rounded-lg [&_svg:not([class*='size-'])]:size-3",
        "icon-sm":
          "size-7 rounded-[min(var(--radius-md),12px)] in-data-[slot=button-group]:rounded-lg",
        "icon-lg": "size-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

type ButtonProps = ButtonPrimitive.Props &
  VariantProps<typeof buttonVariants> & {
    loading?: boolean
  }

function Button({
  className,
  variant = "default",
  size = "default",
  loading = false,
  disabled,
  children,
  ...props
}: ButtonProps) {
  return (
    <ButtonPrimitive
      data-slot="button"
      disabled={disabled || loading}
      className={cn(
        buttonVariants({ variant, size, className }),
        loading && "[&>svg:not(.animate-spin)]:hidden"
      )}
      {...props}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" />}
      {children}
    </ButtonPrimitive>
  )
}

export { Button, buttonVariants }
