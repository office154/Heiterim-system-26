"use client"

import * as React from 'react'
import { cn } from '@/lib/utils'

// Custom white double-arrow resize cursor — matches resizable-th.tsx
const RESIZE_CURSOR =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20'%3E%3Cpath d='M1 10 L5 6 L5 8.5 L8 8.5 L8 11.5 L5 11.5 L5 14 Z M19 10 L15 6 L15 8.5 L12 8.5 L12 11.5 L15 11.5 L15 14 Z' fill='white' stroke='%23999' stroke-width='0.8' stroke-linejoin='round'/%3E%3C/svg%3E\") 10 10, ew-resize"

// ─── Table ───────────────────────────────────────────────────────────────────

interface TableProps extends React.HTMLAttributes<HTMLTableElement> {
  /** Wraps the table in an overflow-x-auto container and sets width to max-content */
  scrollable?: boolean
}

const Table = React.forwardRef<HTMLTableElement, TableProps>(
  ({ className, scrollable, style, ...props }, ref) => {
    const table = (
      <table
        ref={ref}
        className={cn('w-full caption-bottom text-[var(--text-base)]', className)}
        style={{
          tableLayout: 'fixed',
          ...(scrollable ? { width: 'max-content', minWidth: '100%' } : {}),
          ...style,
        }}
        {...props}
      />
    )

    if (scrollable) {
      return <div style={{ overflowX: 'auto' }}>{table}</div>
    }

    return table
  }
)
Table.displayName = 'Table'

// ─── TableHeader ─────────────────────────────────────────────────────────────

interface TableHeaderProps extends React.HTMLAttributes<HTMLTableSectionElement> {
  /** Pins the header to the top of the scroll container */
  sticky?: boolean
}

const TableHeader = React.forwardRef<HTMLTableSectionElement, TableHeaderProps>(
  ({ className, sticky, ...props }, ref) => (
    <thead
      ref={ref}
      className={cn(
        'bg-[var(--bg-elevated)]',
        'border-b border-[var(--border-strong)]',
        sticky && 'sticky top-0 z-10',
        className
      )}
      {...props}
    />
  )
)
TableHeader.displayName = 'TableHeader'

// ─── TableBody ───────────────────────────────────────────────────────────────

const TableBody = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tbody ref={ref} className={cn(className)} {...props} />
))
TableBody.displayName = 'TableBody'

// ─── TableFooter ─────────────────────────────────────────────────────────────

const TableFooter = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tfoot
    ref={ref}
    className={cn('border-t border-[var(--border)]', className)}
    {...props}
  />
))
TableFooter.displayName = 'TableFooter'

// ─── TableRow ────────────────────────────────────────────────────────────────

const TableRow = React.forwardRef<
  HTMLTableRowElement,
  React.HTMLAttributes<HTMLTableRowElement>
>(({ className, ...props }, ref) => (
  <tr
    ref={ref}
    className={cn(
      'border-b border-[var(--border)]',
      'hover:bg-[var(--bg-hover)]',
      'transition-colors',
      'data-[state=selected]:bg-[var(--accent-primary-light)]',
      className
    )}
    {...props}
  />
))
TableRow.displayName = 'TableRow'

// ─── TableHead ───────────────────────────────────────────────────────────────

interface TableHeadProps extends React.ThHTMLAttributes<HTMLTableCellElement> {
  /** Adds an 8px drag handle on the left edge (RTL: end of column) with a blue hover indicator */
  resizable?: boolean
  /** Column width in pixels — applied as both width and minWidth when resizable */
  width?: number
  /** Called when the user starts dragging the resize handle */
  onResizeStart?: (e: React.MouseEvent<HTMLDivElement>) => void
  /** Pins the column to the right edge of the scroll container (RTL: first column) */
  sticky?: boolean
}

const TableHead = React.forwardRef<HTMLTableCellElement, TableHeadProps>(
  ({ className, resizable, width, onResizeStart, sticky, style, children, ...props }, ref) => (
    <th
      ref={ref}
      className={cn(
        'text-right align-middle font-medium',
        'text-[var(--text-secondary)] [font-size:var(--text-sm)]',
        'px-[var(--space-3)] py-[var(--space-3)]',
        sticky && 'sticky right-0 z-10 bg-[var(--bg-elevated)]',
        className
      )}
      style={{
        ...(resizable
          ? { position: 'relative', userSelect: 'none' }
          : {}),
        ...(width !== undefined ? { width, minWidth: width } : {}),
        ...style,
      }}
      {...props}
    >
      {children}

      {resizable && (
        <div
          onMouseDown={onResizeStart}
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            height: '100%',
            width: 8,
            zIndex: 2,
            cursor: RESIZE_CURSOR,
            display: 'flex',
            alignItems: 'stretch',
            justifyContent: 'center',
          }}
          className="group/resize-handle"
        >
          <div
            style={{
              width: 2,
              background: 'var(--accent-primary)',
              borderRadius: 1,
              transition: 'opacity 0.15s',
            }}
            className="opacity-0 group-hover/resize-handle:opacity-100"
          />
        </div>
      )}
    </th>
  )
)
TableHead.displayName = 'TableHead'

// ─── TableCell ───────────────────────────────────────────────────────────────

const TableCell = React.forwardRef<
  HTMLTableCellElement,
  React.TdHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <td
    ref={ref}
    className={cn(
      'px-[var(--space-3)] py-[var(--space-3)]',
      'align-middle',
      'text-[var(--text-primary)] [font-size:var(--text-sm)]',
      className
    )}
    {...props}
  />
))
TableCell.displayName = 'TableCell'

// ─── TableCaption ────────────────────────────────────────────────────────────

const TableCaption = React.forwardRef<
  HTMLTableCaptionElement,
  React.HTMLAttributes<HTMLTableCaptionElement>
>(({ className, ...props }, ref) => (
  <caption
    ref={ref}
    className={cn(
      'mt-[var(--space-4)]',
      'text-[var(--text-secondary)] [font-size:var(--text-sm)]',
      className
    )}
    {...props}
  />
))
TableCaption.displayName = 'TableCaption'

// ─── Exports ─────────────────────────────────────────────────────────────────

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableRow,
  TableHead,
  TableCell,
  TableCaption,
}
