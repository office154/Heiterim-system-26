'use client'

import { useState, useEffect, useRef } from 'react'
import { useProject } from '@/lib/hooks/use-projects'
import {
  useProjectStages,
  useUpdateStage,
  useAddTrack,
  useRemoveTrack,
} from '@/lib/hooks/use-stages'
import { useCurrentRole } from '@/lib/hooks/use-profile'
import { InlineEdit } from '@/components/inline-edit'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { TRACK_LABELS, TRACK_OPTIONS } from '@/lib/constants/tracks'
import type { ProjectStage, TrackValue } from '@/types/database'

interface StagesTabProps {
  projectId: string
}

function formatPrice(price: number): string {
  return `₪${price.toLocaleString('he-IL')}`
}

// Inline price input component
function PriceInput({
  value,
  onSave,
}: {
  value: number
  onSave: (v: string) => Promise<void>
}) {
  const [editing, setEditing] = useState(false)
  const [localValue, setLocalValue] = useState(String(value || ''))
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setLocalValue(String(value || ''))
  }, [value])

  useEffect(() => {
    if (editing) inputRef.current?.focus()
  }, [editing])

  async function handleBlur() {
    await onSave(localValue)
    setEditing(false)
  }

  if (editing) {
    return (
      <input
        ref={inputRef}
        type="number"
        min="0"
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={(e) => {
          if (e.key === 'Enter') e.currentTarget.blur()
          if (e.key === 'Escape') {
            setLocalValue(String(value || ''))
            setEditing(false)
          }
        }}
        dir="ltr"
        className="w-24 rounded border border-blue-300 px-2 py-1 text-center text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    )
  }

  return (
    <button
      onClick={() => setEditing(true)}
      title="לחץ לעריכה"
      className="rounded px-2 py-1 text-sm transition-all hover:bg-blue-50 hover:ring-1 hover:ring-blue-200"
    >
      {formatPrice(value)}
    </button>
  )
}

// One track section
function TrackSection({
  track,
  stages,
  showHeader,
  currentTracks,
  projectId,
  showPrices,
}: {
  track: TrackValue
  stages: ProjectStage[]
  showHeader: boolean
  currentTracks: TrackValue[]
  projectId: string
  showPrices: boolean
}) {
  const updateStage = useUpdateStage()
  const removeTrack = useRemoveTrack()

  const totalContract = stages.reduce((sum, s) => sum + s.price, 0)
  const totalPaid = stages.filter((s) => s.paid).reduce((sum, s) => sum + s.price, 0)
  const balance = totalContract - totalPaid

  async function handleCheckbox(
    stage: ProjectStage,
    field: 'completed' | 'invoice_sent' | 'paid',
    checked: boolean
  ) {
    await updateStage.mutateAsync({ id: stage.id, projectId, [field]: checked })
  }

  async function handlePrice(stage: ProjectStage, raw: string) {
    const price = parseFloat(raw) || 0
    await updateStage.mutateAsync({ id: stage.id, projectId, price })
  }

  async function handleName(stage: ProjectStage, name: string) {
    if (!name.trim()) return
    await updateStage.mutateAsync({ id: stage.id, projectId, name: name.trim() })
  }

  async function handleRemove() {
    if (!confirm(`האם למחוק את מסלול "${TRACK_LABELS[track]}" וכל שלביו?`)) return
    await removeTrack.mutateAsync({ projectId, track, currentTracks })
  }

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
      {/* Track header — only when multiple tracks */}
      {showHeader && (
        <div className="flex items-center justify-between bg-gray-800 px-4 py-2">
          <h3 className="text-sm font-semibold text-white">{TRACK_LABELS[track]}</h3>
          <button
            onClick={handleRemove}
            disabled={removeTrack.isPending}
            className="text-xs text-gray-400 transition-colors hover:text-red-400 disabled:opacity-50"
          >
            הסר מסלול ✕
          </button>
        </div>
      )}

      {stages.length === 0 ? (
        <p className="px-6 py-8 text-center text-sm italic text-gray-400">אין שלבים במסלול זה</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                {/* Row-label column */}
                <th className="sticky right-0 z-10 min-w-36 bg-gray-50 px-4 py-2 text-right text-xs font-medium text-gray-500">
                  שלב
                </th>
                {stages.map((stage) => (
                  <th
                    key={stage.id}
                    className="min-w-32 px-3 py-2 text-center font-medium text-gray-700"
                  >
                    <InlineEdit
                      value={stage.name}
                      onSave={(v) => handleName(stage, v)}
                      className="text-center text-xs"
                    />
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {/* בוצע */}
              <tr className="border-b border-gray-100">
                <td className="sticky right-0 z-10 bg-gray-50 px-4 py-2.5 text-right text-xs font-medium text-gray-600">
                  בוצע
                </td>
                {stages.map((stage) => (
                  <td key={stage.id} className="px-3 py-2.5 text-center">
                    <div className="flex justify-center">
                      <Checkbox
                        checked={stage.completed}
                        onCheckedChange={(v) => handleCheckbox(stage, 'completed', !!v)}
                      />
                    </div>
                  </td>
                ))}
              </tr>

              {/* נשלחה חשבונית */}
              <tr className="border-b border-gray-100">
                <td className="sticky right-0 z-10 bg-gray-50 px-4 py-2.5 text-right text-xs font-medium text-gray-600">
                  נשלחה חשבונית
                </td>
                {stages.map((stage) => {
                  const highlight = stage.price > 0 && stage.completed && !stage.invoice_sent
                  return (
                    <td
                      key={stage.id}
                      className={`px-3 py-2.5 text-center transition-colors ${
                        highlight ? 'bg-red-100' : ''
                      }`}
                    >
                      <div className="flex justify-center">
                        <Checkbox
                          checked={stage.invoice_sent}
                          onCheckedChange={(v) => handleCheckbox(stage, 'invoice_sent', !!v)}
                        />
                      </div>
                    </td>
                  )
                })}
              </tr>

              {/* שולם */}
              <tr className="border-b border-gray-100">
                <td className="sticky right-0 z-10 bg-gray-50 px-4 py-2.5 text-right text-xs font-medium text-gray-600">
                  שולם
                </td>
                {stages.map((stage) => {
                  const highlight = stage.price > 0 && stage.invoice_sent && !stage.paid
                  return (
                    <td
                      key={stage.id}
                      className={`px-3 py-2.5 text-center transition-colors ${
                        highlight ? 'bg-red-300' : ''
                      }`}
                    >
                      <div className="flex justify-center">
                        <Checkbox
                          checked={stage.paid}
                          onCheckedChange={(v) => handleCheckbox(stage, 'paid', !!v)}
                        />
                      </div>
                    </td>
                  )
                })}
              </tr>

              {/* מחיר — admin only */}
              {showPrices && (
                <tr className="border-b-2 border-gray-200">
                  <td className="sticky right-0 z-10 bg-gray-50 px-4 py-2.5 text-right text-xs font-medium text-gray-600">
                    מחיר
                  </td>
                  {stages.map((stage) => (
                    <td key={stage.id} className="px-3 py-2.5 text-center">
                      <PriceInput
                        value={stage.price}
                        onSave={(v) => handlePrice(stage, v)}
                      />
                    </td>
                  ))}
                </tr>
              )}

              {/* Summary rows — admin only */}
              {showPrices && (
                <>
                  <tr className="bg-gray-50">
                    <td className="sticky right-0 z-10 bg-gray-50 px-4 py-2 text-right text-xs font-semibold text-gray-700">
                      סה״כ חוזה
                    </td>
                    <td
                      colSpan={stages.length}
                      className="px-4 py-2 text-right text-sm font-semibold text-gray-900"
                    >
                      {formatPrice(totalContract)}
                    </td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="sticky right-0 z-10 bg-gray-50 px-4 py-2 text-right text-xs font-semibold text-gray-700">
                      סה״כ שולם
                    </td>
                    <td
                      colSpan={stages.length}
                      className="px-4 py-2 text-right text-sm font-semibold text-green-700"
                    >
                      {formatPrice(totalPaid)}
                    </td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="sticky right-0 z-10 bg-gray-50 px-4 py-2 text-right text-xs font-semibold text-gray-700">
                      יתרה
                    </td>
                    <td
                      colSpan={stages.length}
                      className={`px-4 py-2 text-right text-sm font-semibold ${
                        balance > 0 ? 'text-orange-600' : 'text-green-700'
                      }`}
                    >
                      {formatPrice(balance)}
                    </td>
                  </tr>
                </>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export function StagesTab({ projectId }: StagesTabProps) {
  const { data: project } = useProject(projectId)
  const { data: stages, isLoading } = useProjectStages(projectId)
  const { data: role } = useCurrentRole()
  const addTrack = useAddTrack()
  const [addingTrack, setAddingTrack] = useState(false)
  const showPrices = role === 'admin'

  if (isLoading) {
    return <div className="py-8 text-center text-gray-400">טוען שלבים...</div>
  }

  if (!project || !stages) return null

  // Group stages by track
  const stagesByTrack = stages.reduce<Record<string, ProjectStage[]>>((acc, stage) => {
    if (!acc[stage.track]) acc[stage.track] = []
    acc[stage.track].push(stage)
    return acc
  }, {})

  const currentTracks = project.tracks as TrackValue[]
  const showHeaders = currentTracks.length > 1

  // Tracks available to add
  const availableTracks = TRACK_OPTIONS.filter((t) => !currentTracks.includes(t.value))

  async function handleAddTrack(track: TrackValue) {
    await addTrack.mutateAsync({ projectId, track, currentTracks })
    setAddingTrack(false)
  }

  return (
    <div className="space-y-6">
      {currentTracks.map((track) => (
        <TrackSection
          key={track}
          track={track as TrackValue}
          stages={stagesByTrack[track] ?? []}
          showHeader={showHeaders}
          currentTracks={currentTracks}
          projectId={projectId}
          showPrices={showPrices}
        />
      ))}

      {/* Add track */}
      {availableTracks.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          {addingTrack ? (
            <>
              {availableTracks.map((t) => (
                <Button
                  key={t.value}
                  variant="outline"
                  size="sm"
                  onClick={() => handleAddTrack(t.value)}
                  disabled={addTrack.isPending}
                >
                  + {t.label}
                </Button>
              ))}
              <Button variant="ghost" size="sm" onClick={() => setAddingTrack(false)}>
                ביטול
              </Button>
            </>
          ) : (
            <Button variant="outline" onClick={() => setAddingTrack(true)}>
              + הוסף מסלול
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
