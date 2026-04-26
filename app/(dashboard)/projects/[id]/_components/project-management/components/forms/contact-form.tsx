"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useCreateContact, useUpdateContact } from "../../hooks/use-project-contacts"
import type { ProjectContact } from "../../types"

interface ContactFormProps {
  projectId: string
  contact?: ProjectContact
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ContactForm({ projectId, contact, open, onOpenChange }: ContactFormProps) {
  const isEdit = !!contact

  const [name, setName] = useState(contact?.name ?? "")
  const [role, setRole] = useState(contact?.role ?? "")
  const [company, setCompany] = useState(contact?.company ?? "")
  const [phone, setPhone] = useState(contact?.phone ?? "")
  const [email, setEmail] = useState(contact?.email ?? "")
  const [notes, setNotes] = useState(contact?.notes ?? "")
  const [error, setError] = useState("")

  const createContact = useCreateContact()
  const updateContact = useUpdateContact()

  const isPending = createContact.isPending || updateContact.isPending

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")

    if (!name.trim()) {
      setError("שם הוא שדה חובה")
      return
    }

    try {
      if (isEdit) {
        await updateContact.mutateAsync({
          id: contact.id,
          projectId,
          name: name.trim(),
          role: role.trim() || null,
          company: company.trim() || null,
          phone: phone.trim() || null,
          email: email.trim() || null,
          notes: notes.trim() || null,
        })
      } else {
        await createContact.mutateAsync({
          project_id: projectId,
          name: name.trim(),
          role: role.trim() || null,
          company: company.trim() || null,
          phone: phone.trim() || null,
          email: email.trim() || null,
          notes: notes.trim() || null,
        })
      }
      onOpenChange(false)
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : typeof err === "object" && err !== null && "message" in err
          ? String((err as { message: unknown }).message)
          : JSON.stringify(err)
      setError(msg)
    }
  }

  function handleOpenChange(val: boolean) {
    if (!val) {
      setError("")
    }
    onOpenChange(val)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md" dir="rtl">
        <DialogHeader>
          <DialogTitle>{isEdit ? "עריכת איש קשר" : "הוספת איש קשר"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-1">
            <Label htmlFor="contact-name">שם *</Label>
            <Input
              id="contact-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="שם מלא"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="contact-role">תפקיד</Label>
              <Input
                id="contact-role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="קבלן, מפקח, יועץ..."
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="contact-company">חברה</Label>
              <Input
                id="contact-company"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="שם החברה"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="contact-phone">טלפון</Label>
              <Input
                id="contact-phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="050-0000000"
                dir="ltr"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="contact-email">אימייל</Label>
              <Input
                id="contact-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                dir="ltr"
              />
            </div>
          </div>

          <div className="space-y-1">
            <Label htmlFor="contact-notes">הערות</Label>
            <Textarea
              id="contact-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="מידע נוסף..."
              rows={2}
            />
          </div>

          {error && <p className="text-sm text-[#C0392B]">{error}</p>}

          <div className="flex gap-2 pt-1">
            <Button type="submit" disabled={isPending} className="flex-1">
              {isPending ? "שומר..." : isEdit ? "שמור שינויים" : "הוסף"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              ביטול
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
