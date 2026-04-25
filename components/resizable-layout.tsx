'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

const MIN_WIDTH = 160
const MAX_WIDTH = 380
const DEFAULT_WIDTH = 224

export function ResizableLayout({
  sidebar,
  children,
}: {
  sidebar: React.ReactNode
  children: React.ReactNode
}) {
  const [sidebarWidth, setSidebarWidth] = useState(DEFAULT_WIDTH)
  const [isResizing, setIsResizing] = useState(false)
  const startX = useRef(0)
  const startWidth = useRef(0)

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      startX.current = e.clientX
      startWidth.current = sidebarWidth
      setIsResizing(true)
      e.preventDefault()
    },
    [sidebarWidth]
  )

  useEffect(() => {
    if (!isResizing) return

    function handleMouseMove(e: MouseEvent) {
      // RTL: sidebar is on the right, dragging left increases width
      const delta = startX.current - e.clientX
      const newWidth = Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, startWidth.current + delta))
      setSidebarWidth(newWidth)
    }

    function handleMouseUp() {
      setIsResizing(false)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isResizing])

  return (
    <div
      className="flex min-h-screen"
      style={{
        userSelect: isResizing ? 'none' : 'auto',
        cursor: isResizing ? 'col-resize' : 'auto',
      }}
    >
      <div
        className="print:hidden"
        style={{ width: sidebarWidth, flexShrink: 0, position: 'relative' }}
      >
        {sidebar}
        {/* Resize handle on the left edge of the sidebar */}
        <div
          onMouseDown={handleMouseDown}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            bottom: 0,
            width: 5,
            cursor: 'col-resize',
            zIndex: 20,
            background: isResizing ? 'rgba(61,106,158,0.35)' : 'transparent',
            transition: 'background 0.15s',
          }}
          className="hover:bg-[#3D6A9E]/20"
        />
      </div>
      <main className="flex-1 p-8 overflow-auto bg-[#F0F2F5] min-h-screen max-w-7xl mx-auto w-full">
        {children}
      </main>
    </div>
  )
}
