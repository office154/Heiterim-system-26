'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useCreateClient } from '@/lib/hooks/use-clients'
import { LEAD_SOURCE_OPTIONS } from '@/lib/constants/tracks'
import type { Client, LeadSource } from '@/types/database'

interface CreateClientModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreated?: (client: Client) => void
}

export function CreateClientModal({ open, onOpenChange, onCreated }: CreateClientModalProps) {
  const createClient = useCreateClient()
  const [form, setForm] = useState({
    name: '',
    company: '',
    contact_name: '',
    phone: '',
    email: '',
    address: '',
    lead_source: '' as LeadSource | '',
    notes: '',
  })
  const [error, setError] = useState('')

  function handleChange(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!form.name.trim()) {
      setError('שם לקוח הוא שדה חובה')
      return
    }
    try {
      const created = await createClient.mutateAsync({
        name: form.name.trim(),
        company: form.company || null,
        contact_name: form.contact_name || null,
        phone: form.phone || null,
        email: form.email || null,
        address: form.address || null,
        lead_source: (form.lead_source as LeadSource) || null,
        notes: form.notes || null,
      })
      if (created) onCreated?.(created as Client)
      onOpenChange(false)
      setForm({ name: '', company: '', contact_name: '', phone: '', email: '', address: '', lead_source: '', notes: '' })
    } catch {
      setError('שגיאה ביצירת הלקוח, נסה שוב')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>לקוח חדש</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-1">
            <Label htmlFor="client-name">שם לקוח *</Label>
            <Input
              id="client-name"
              value={form.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="שם מלא"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="client-company">מספר ח.פ</Label>
              <Input
                id="client-company"
                value={form.company}
                onChange={(e) => handleChange('company', e.target.value)}
                placeholder="515XXXXXXX"
                dir="ltr"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="client-contact">איש קשר</Label>
              <div className="relative">
                <Input
                  id="client-contact"
                  value={form.contact_name}
                  onChange={(e) => handleChange('contact_name', e.target.value)}
                  placeholder="שם איש קשר"
                />
                {form.contact_name && (
                  <button
                    type="button"
                    onClick={() => handleChange('contact_name', '')}
                    className="absolute left-2 top-1/2 -translate-y-1/2 text-[#aaaaaa] hover:text-[#C0392B] text-xs"
                    title="נקה"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="client-phone">טלפון</Label>
              <Input
                id="client-phone"
                value={form.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                placeholder="050-0000000"
                dir="ltr"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="client-email">אימייל</Label>
              <Input
                id="client-email"
                type="email"
                value={form.email}
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder="email@example.com"
                dir="ltr"
              />
            </div>
          </div>
          <div className="space-y-1">
            <Label htmlFor="client-lead">מקור הגעה</Label>
            <Select
              value={form.lead_source}
              onValueChange={(v) => handleChange('lead_source', v ?? '')}
            >
              <SelectTrigger id="client-lead">
                <SelectValue placeholder="בחר מקור" />
              </SelectTrigger>
              <SelectContent>
                {LEAD_SOURCE_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label htmlFor="client-notes">הערות</Label>
            <Textarea
              id="client-notes"
              value={form.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
              placeholder="הערות נוספות..."
              rows={2}
            />
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <div className="flex gap-2 justify-end pt-1">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              ביטול
            </Button>
            <Button type="submit" disabled={createClient.isPending}>
              {createClient.isPending ? 'שומר...' : 'צור לקוח'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
