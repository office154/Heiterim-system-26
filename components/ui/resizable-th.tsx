import React from 'react'

interface ResizableThProps extends React.ThHTMLAttributes<HTMLTableCellElement> {
  width: number
  onResizeStart: (e: React.MouseEvent) => void
}

/**
 * A <th> that shows a drag handle on its left edge (RTL-aware).
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
      {/* Drag handle — left edge in RTL */}
      <div
        onMouseDown={onResizeStart}
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          height: '100%',
          width: 4,
          cursor: 'col-resize',
          zIndex: 2,
        }}
        className="hover:bg-[#3D6A9E]/40 transition-colors"
      />
    </th>
  )
}
