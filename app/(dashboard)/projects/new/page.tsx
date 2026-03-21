'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useCreateProject } from '@/lib/hooks/use-projects'
import { useClients } from '@/lib/hooks/use-clients'
import { TRACK_OPTIONS } from '@/lib/constants/tracks'
import { CreateClientModal } from '@/components/create-client-modal'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { TrackValue, Client } from '@/types/database'

export default function NewProjectPage() {
  const router = useRouter()
  const createProject = useCreateProject()
  const { data: clients, refetch: refetchClients } = useClients()

  const [title, setTitle] = useState('')
  const [location, setLocation] = useState('')
  const [clientId, setClientId] = useState('')
  const [tracks, setTracks] = useState<TrackValue[]>(['permit'])
  const [contractDate, setContractDate] = useState('')
  const [notes, setNotes] = useState('')
  const [error, setError] = useState('')
  const [showClientModal, setShowClientModal] = useState(false)

  function toggleTrack(track: TrackValue) {
    setTracks((prev) =>
      prev.includes(track) ? prev.filter((t) => t !== track) : [...prev, track]
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!title.trim()) {
      setError('שם הפרויקט הוא שדה חובה')
      return
    }
    if (tracks.length === 0) {
      setError('יש לבחור לפחות מסלול אחד')
      return
    }

    try {
      const project = await createProject.mutateAsync({
        title: title.trim(),
        location: location || null,
        client_id: clientId || null,
        tracks,
        contract_date: contractDate || null,
        notes: notes || null,
      })
      router.push(`/projects/${project.id}`)
    } catch {
      setError('שגיאה ביצירת הפרויקט, נסה שוב')
    }
  }

  function handleClientCreated(client: Client) {
    refetchClients()
    setClientId(client.id)
  }

  return (
    <div className="max-w-2xl">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">פרויקט חדש</h1>

      <form onSubmit={handleSubmit} className="space-y-5 rounded-lg border border-gray-200 bg-white p-6">
        {/* Title */}
        <div className="space-y-1">
          <Label htmlFor="title">שם הפרויקט *</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="לדוגמה: בניין מגורים ברחוב הרצל"
            required
          />
        </div>

        {/* Location */}
        <div className="space-y-1">
          <Label htmlFor="location">מיקום</Label>
          <Input
            id="location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="עיר / כתובת"
          />
        </div>

        {/* Client */}
        <div className="space-y-1">
          <Label>לקוח</Label>
          <div className="flex gap-2">
            <Select value={clientId} onValueChange={(v) => setClientId(v ?? '')}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="בחר לקוח...">
                  {clientId
                    ? ((clients ?? []).find((c) => c.id === clientId)?.name ?? '')
                    : null}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {(clients ?? []).map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}{c.company ? ` — ${c.company}` : ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowClientModal(true)}
            >
              + לקוח חדש
            </Button>
          </div>
        </div>

        {/* Tracks */}
        <div className="space-y-2">
          <Label>מסלולים *</Label>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {TRACK_OPTIONS.map((opt) => (
              <label
                key={opt.value}
                className="flex cursor-pointer items-center gap-2 rounded-md border border-gray-200 px-3 py-2 hover:bg-gray-50"
              >
                <Checkbox
                  checked={tracks.includes(opt.value)}
                  onCheckedChange={() => toggleTrack(opt.value)}
                />
                <span className="text-sm">{opt.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Contract Date */}
        <div className="space-y-1">
          <Label htmlFor="contract-date">תאריך חוזה</Label>
          <Input
            id="contract-date"
            type="date"
            value={contractDate}
            onChange={(e) => setContractDate(e.target.value)}
            dir="ltr"
            className="w-48"
          />
        </div>

        {/* Notes */}
        <div className="space-y-1">
          <Label htmlFor="notes">הערות</Label>
          <Textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="הערות נוספות..."
            rows={3}
          />
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <div className="flex gap-3 pt-2">
          <Button type="submit" disabled={createProject.isPending}>
            {createProject.isPending ? 'יוצר...' : 'צור פרויקט'}
          </Button>
          <Button type="button" variant="outline" onClick={() => router.back()}>
            ביטול
          </Button>
        </div>
      </form>

      <CreateClientModal
        open={showClientModal}
        onOpenChange={setShowClientModal}
        onCreated={handleClientCreated}
      />
    </div>
  )
}
