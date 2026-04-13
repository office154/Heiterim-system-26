import React from 'react'

// Custom white double-arrow cursor (no vertical line through it)
const RESIZE_CURSOR =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20'%3E%3Cpath d='M1 10 L5 6 L5 8.5 L8 8.5 L8 11.5 L5 11.5 L5 14 Z M19 10 L15 6 L15 8.5 L12 8.5 L12 11.5 L15 11.5 L15 14 Z' fill='white' stroke='%23999' stroke-width='0.8' stroke-linejoin='round'/%3E%3C/svg%3E\") 10 10, ew-resize"

interface ResizableThProps extends React.ThHTMLAttributes<HTMLTableCellElement> {
  width: number
  onResizeStart: (e: React.MouseEvent) => void
}

/**
 * A <th> with a drag handle on its left edge (RTL-aware).
 * Shows a visible blue line on hover. Uses a clean white double-arrow cursor.
 * Requires parent table to have style={{ tableLayout: 'fixed' }}.
 */
export function ResizableTh({
  width,
  onResizeStart,
  children,
  style,
  className,
  ...props
}: ResizableThProps) {
  return (
    <th
      {...props}
      className={className}
      style={{
        ...style,
        width,
        minWidth: width,
        position: 'relative',
        userSelect: 'none',
        overflow: 'hidden',
      }}
    >
      {children}

      {/* Drag handle — 8px wide, left edge in RTL */}
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
        className="group/handle"
      >
        {/* Visible indicator line — appears on hover */}
        <div
          style={{
            width: 2,
            background: '#3D6A9E',
            borderRadius: 1,
            transition: 'opacity 0.15s',
          }}
          className="opacity-0 group-hover/handle:opacity-100"
        />
      </div>
    </th>
  )
}
