'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * Provides resizable column widths for tables.
 * Handles dynamic column counts (e.g. stages-tab where columns are added/removed).
 * RTL-aware: dragging left increases width, dragging right decreases.
 */
export function useResizableColumns(
  initialWidths: number[],
  minWidth = 50
) {
  const [widths, setWidths] = useState<number[]>(initialWidths)

  // Sync when the number of columns changes (e.g. stages added/removed)
  const prevLen = useRef(initialWidths.length)
  useEffect(() => {
    if (initialWidths.length === prevLen.current) return
    prevLen.current = initialWidths.length
    setWidths((prev) => {
      const next = [...initialWidths]
      for (let i = 0; i < Math.min(prev.length, next.length); i++) {
        next[i] = prev[i]
      }
      return next
    })
  }, [initialWidths.length]) // eslint-disable-line react-hooks/exhaustive-deps

  const resizingIndex = useRef<number | null>(null)
  const startX = useRef(0)
  const startWidth = useRef(0)

  const startResize = useCallback(
    (index: number) => (e: React.MouseEvent) => {
      e.preventDefault()
      resizingIndex.current = index
      startX.current = e.clientX
      startWidth.current = widths[index]
    },
    [widths]
  )

  useEffect(() => {
    function onMove(e: MouseEvent) {
      if (resizingIndex.current === null) return
      // RTL: left handle — drag left increases, drag right decreases
      const delta = startX.current - e.clientX
      const newWidth = Math.max(minWidth, startWidth.current + delta)
      setWidths((prev) => {
        const next = [...prev]
        next[resizingIndex.current!] = newWidth
        return next
      })
    }
    function onUp() {
      resizingIndex.current = null
    }
    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseup', onUp)
    return () => {
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseup', onUp)
    }
  }, [minWidth])

  return { widths, startResize }
}
