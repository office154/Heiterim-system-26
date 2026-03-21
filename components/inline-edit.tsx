'use client'

import { useState, useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'

interface InlineEditProps {
  value: string | null
  onSave: (value: string) => Promise<void>
  placeholder?: string
  type?: 'text' | 'date' | 'textarea'
  className?: string
  emptyText?: string
  disabled?: boolean
}

export function InlineEdit({
  value,
  onSave,
  placeholder,
  type = 'text',
  className,
  emptyText = 'לחץ להוספה',
  disabled = false,
}: InlineEditProps) {
  const [editing, setEditing] = useState(false)
  const [localValue, setLocalValue] = useState(value ?? '')
  const [saving, setSaving] = useState(false)
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null)

  useEffect(() => {
    setLocalValue(value ?? '')
  }, [value])

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus()
    }
  }, [editing])

  async function handleSave() {
    if (localValue === (value ?? '')) {
      setEditing(false)
      return
    }
    setSaving(true)
    try {
      await onSave(localValue)
    } catch {
      setLocalValue(value ?? '')
    } finally {
      setSaving(false)
      setEditing(false)
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && type !== 'textarea') {
      e.preventDefault()
      handleSave()
    }
    if (e.key === 'Escape') {
      setLocalValue(value ?? '')
      setEditing(false)
    }
  }

  if (disabled) {
    return (
      <span className={cn('px-2 py-1 text-sm', !value && 'text-gray-400 italic', className)}>
        {value || emptyText}
      </span>
    )
  }

  if (editing) {
    const sharedProps = {
      value: localValue,
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
        setLocalValue(e.target.value),
      onBlur: handleSave,
      onKeyDown: handleKeyDown,
      disabled: saving,
      placeholder,
      className: cn(
        'w-full rounded border border-blue-300 bg-white px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500',
        className
      ),
    }

    if (type === 'textarea') {
      return (
        <textarea
          ref={inputRef as React.RefObject<HTMLTextAreaElement>}
          {...sharedProps}
          rows={3}
          className={cn(sharedProps.className, 'resize-none')}
        />
      )
    }

    return (
      <input
        ref={inputRef as React.RefObject<HTMLInputElement>}
        type={type}
        {...sharedProps}
      />
    )
  }

  return (
    <span
      onClick={() => setEditing(true)}
      title="לחץ לעריכה"
      className={cn(
        'cursor-pointer rounded px-2 py-1 text-sm transition-all hover:bg-blue-50 hover:ring-1 hover:ring-blue-200',
        !value && 'italic text-gray-400',
        className
      )}
    >
      {value || emptyText}
    </span>
  )
}
