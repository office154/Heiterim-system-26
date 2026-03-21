'use client'

import { useState, useEffect, useRef } from 'react'
import { useProject } from '@/lib/hooks/use-projects'
import {
  useProjectStages,
  useUpdateStage,
  useAddStage,
  useDeleteStage,
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

// ─── Inline price input ───────────────────────────────────────────────────────
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

  useEffect(() => { setLocalValue(String(value || '')) }, [value])
  useEffect(() => { if (editing) inputRef.current?.focus() }, [editing])

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
          if (e.key === 'Escape') { setLocalValue(String(value || '')); setEditing(false) }
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

// ─── New-stage name input (appears as last column header) ─────────────────────
function NewStageInput({
  onConfirm,
  onCancel,
}: {
  onConfirm: (name: string) => void
  onCancel: () => void
}) {
  const [name, setName] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  useEffect(() => { inputRef.current?.focus() }, [])

  function confirm() {
    const trimmed = name.trim()
    if (trimmed) onConfirm(trimmed)
    else onCancel()
  }

  return (
    <input
      ref={inputRef}
      type="text"
      value={name}
      onChange={(e) => setName(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === 'Enter') confirm()
        if (e.key === 'Escape') onCancel()
      }}
      onBlur={confirm}
      placeholder="שם שלב..."
      className="w-28 rounded border border-[#6366F1] bg-[#EEF2FF] px-2 py-1 text-center text-xs font-medium text-[#4F46E5] placeholder:text-[#A5B4FC] focus:outline-none focus:ring-2 focus:ring-[#6366F1]/40"
    />
  )
}

// ─── One track section ────────────────────────────────────────────────────────
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
  const addStage    = useAddStage()
  const deleteStage = useDeleteStage()
  const removeTrack = useRemoveTrack()

  const [addingStage, setAddingStage] = useState(false)

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

  async function handleDeleteStage(stage: ProjectStage) {
    if (!confirm(`האם למחוק את השלב "${stage.name}"?`)) return
    await deleteStage.mutateAsync({ id: stage.id, projectId })
  }

  async function handleAddStage(name: string) {
    const nextIndex =
      stages.length > 0 ? Math.max(...stages.map((s) => s.order_index)) + 1 : 1
    await addStage.mutateAsync({ projectId, track, name, orderIndex: nextIndex })
    setAddingStage(false)
  }

  async function handleRemoveTrack() {
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
            onClick={handleRemoveTrack}
            disabled={removeTrack.isPending}
            className="text-xs text-gray-400 transition-colors hover:text-red-400 disabled:opacity-50"
          >
            הסר מסלול ✕
          </button>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              {/* Row-label column */}
              <th className="sticky right-0 z-10 min-w-36 bg-gray-50 px-4 py-2 text-right text-xs font-medium text-gray-500">
                שלב
              </th>

              {/* One column per existing stage */}
              {stages.map((stage) => (
                <th key={stage.id} className="min-w-32 px-3 py-2 text-center font-medium text-gray-700">
                  <div className="flex flex-col items-center gap-1">
                    {/* ✕ delete button */}
                    <button
                      onClick={() => handleDeleteStage(stage)}
                      disabled={deleteStage.isPending}
                      title={`מחק שלב "${stage.name}"`}
                      className="h-4 w-4 flex items-center justify-center rounded text-gray-300 hover:bg-red-50 hover:text-red-500 transition-colors text-[10px] leading-none disabled:opacity-40"
                    >
                      ✕
                    </button>
                    <InlineEdit
                      value={stage.name}
                      onSave={(v) => handleName(stage, v)}
                      className="text-center text-xs"
                    />
                  </div>
                </th>
              ))}

              {/* Add-stage column */}
              <th className="px-3 py-2 text-center">
                {addingStage ? (
                  <NewStageInput
                    onConfirm={handleAddStage}
                    onCancel={() => setAddingStage(false)}
                  />
                ) : (
                  <button
                    onClick={() => setAddingStage(true)}
                    disabled={addStage.isPending}
                    className="whitespace-nowrap rounded-md border border-dashed border-[#6366F1] px-2.5 py-1 text-[11px] font-semibold text-[#6366F1] hover:bg-[#EEF2FF] transition-colors disabled:opacity-40"
                  >
                    + הוסף שלב
                  </button>
                )}
              </th>
            </tr>
          </thead>

          <tbody>
            {stages.length === 0 && !addingStage ? (
              <tr>
                <td
                  colSpan={2}
                  className="px-6 py-8 text-center text-sm italic text-gray-400"
                >
                  לחץ &quot;+ הוסף שלב&quot; כדי להוסיף את השלב הראשון
                </td>
              </tr>
            ) : (
              <>
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
                  {/* Empty cell under add-stage column */}
                  <td />
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
                        className={`px-3 py-2.5 text-center transition-colors ${highlight ? 'bg-red-100' : ''}`}
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
                  <td />
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
                        className={`px-3 py-2.5 text-center transition-colors ${highlight ? 'bg-red-300' : ''}`}
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
                  <td />
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
                    <td />
                  </tr>
                )}

                {/* Summary rows — admin only */}
                {showPrices && stages.length > 0 && (
                  <>
                    <tr className="bg-gray-50">
                      <td className="sticky right-0 z-10 bg-gray-50 px-4 py-2 text-right text-xs font-semibold text-gray-700">
                        סה״כ חוזה
                      </td>
                      <td colSpan={stages.length + 1} className="px-4 py-2 text-right text-sm font-semibold text-gray-900">
                        {formatPrice(totalContract)}
                      </td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="sticky right-0 z-10 bg-gray-50 px-4 py-2 text-right text-xs font-semibold text-gray-700">
                        סה״כ שולם
                      </td>
                      <td colSpan={stages.length + 1} className="px-4 py-2 text-right text-sm font-semibold text-green-700">
                        {formatPrice(totalPaid)}
                      </td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="sticky right-0 z-10 bg-gray-50 px-4 py-2 text-right text-xs font-semibold text-gray-700">
                        יתרה
                      </td>
                      <td
                        colSpan={stages.length + 1}
                        className={`px-4 py-2 text-right text-sm font-semibold ${balance > 0 ? 'text-orange-600' : 'text-green-700'}`}
                      >
                        {formatPrice(balance)}
                      </td>
                    </tr>
                  </>
                )}
              </>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ─── Main tab ─────────────────────────────────────────────────────────────────
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

  // Group stages by track, preserving order_index order
  const stagesByTrack = stages.reduce<Record<string, ProjectStage[]>>((acc, stage) => {
    if (!acc[stage.track]) acc[stage.track] = []
    acc[stage.track].push(stage)
    return acc
  }, {})

  const currentTracks = project.tracks as TrackValue[]
  const showHeaders = currentTracks.length > 1
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
