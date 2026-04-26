"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useCreateTask, useUpdateTask } from "../../hooks/use-project-tasks"
import {
  PRIORITY_OPTIONS,
  URGENCY_OPTIONS,
  PHASE_OPTIONS,
  PARTY_OPTIONS,
} from "../../types"
import type { ProjectTask, ProjectContact, TaskPriority, TaskUrgency, TaskPhase, TaskParty } from "../../types"

interface TaskFormProps {
  projectId: string
  contacts: ProjectContact[]
  task?: ProjectTask
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function TaskForm({ projectId, contacts, task, open, onOpenChange }: TaskFormProps) {
  const isEdit = !!task

  const [title, setTitle] = useState(task?.title ?? "")
  const [description, setDescription] = useState(task?.description ?? "")
  const [priority, setPriority] = useState<TaskPriority>(task?.priority ?? "normal")
  const [urgency, setUrgency] = useState<TaskUrgency>(task?.urgency ?? "later")
  const [deadline, setDeadline] = useState(task?.deadline?.slice(0, 10) ?? "")
  const [phase, setPhase] = useState<TaskPhase | "">(task?.phase ?? "")
  const [party, setParty] = useState<TaskParty | "">(task?.party ?? "")
  const [contactId, setContactId] = useState(task?.contact_id ?? "")
  const [tagsInput, setTagsInput] = useState(task?.tags.join(", ") ?? "")
  const [subtasksInput, setSubtasksInput] = useState(
    task?.subtasks.map((s) => s.text).join("\n") ?? ""
  )
  const [error, setError] = useState("")

  const createTask = useCreateTask()
  const updateTask = useUpdateTask()

  const isPending = createTask.isPending || updateTask.isPending

  const parseTags = (raw: string) =>
    raw.split(",").map((t) => t.trim()).filter(Boolean)

  const parseSubtasks = (raw: string) =>
    raw.split("\n").map((t) => t.trim()).filter(Boolean).map((text) => ({ text, done: false }))

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")

    if (!title.trim()) {
      setError("כותרת המשימה היא שדה חובה")
      return
    }

    try {
      if (isEdit) {
        await updateTask.mutateAsync({
          id: task.id,
          projectId,
          title: title.trim(),
          description: description.trim() || null,
          priority,
          urgency,
          deadline: deadline || null,
          ...(phase ? { phase: phase as TaskPhase } : {}),
          ...(party ? { party: party as TaskParty } : {}),
          contact_id: contactId || null,
          tags: parseTags(tagsInput),
          subtasks: task.subtasks.map((s) => s),
        })
      } else {
        await createTask.mutateAsync({
          project_id: projectId,
          title: title.trim(),
          description: description.trim() || null,
          priority,
          urgency,
          status: "open",
          deadline: deadline || null,
          ...(phase ? { phase: phase as TaskPhase } : {}),
          ...(party ? { party: party as TaskParty } : {}),
          contact_id: contactId || null,
          tags: parseTags(tagsInput),
          subtasks: parseSubtasks(subtasksInput),
        })
      }
      onOpenChange(false)
    } catch {
      setError("שגיאה בשמירה, נסי שוב")
    }
  }

  function handleOpenChange(val: boolean) {
    if (!val) setError("")
    onOpenChange(val)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-lg" dir="rtl">
        <DialogHeader>
          <DialogTitle>{isEdit ? "עריכת משימה" : "הוספת משימה"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          {/* כותרת */}
          <div className="space-y-1">
            <Label htmlFor="task-title">כותרת *</Label>
            <Input
              id="task-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="תיאור קצר של המשימה"
            />
          </div>

          {/* תיאור */}
          <div className="space-y-1">
            <Label htmlFor="task-desc">פרטים</Label>
            <Textarea
              id="task-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="פרטים נוספים, הנחיות..."
              rows={2}
            />
          </div>

          {/* עדיפות + דחיפות */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>עדיפות</Label>
              <Select value={priority} onValueChange={(v) => setPriority(v as TaskPriority)}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PRIORITY_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>דחיפות</Label>
              <Select value={urgency} onValueChange={(v) => setUrgency(v as TaskUrgency)}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {URGENCY_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* שלב + גורם */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>שלב בפרויקט</Label>
              <Select value={phase} onValueChange={(v) => setPhase(v as TaskPhase)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="בחר שלב..." />
                </SelectTrigger>
                <SelectContent>
                  {PHASE_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>גורם אחראי</Label>
              <Select value={party} onValueChange={(v) => setParty(v as TaskParty)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="בחר גורם..." />
                </SelectTrigger>
                <SelectContent>
                  {PARTY_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* תאריך יעד + איש קשר */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="task-deadline">תאריך יעד</Label>
              <Input
                id="task-deadline"
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                dir="ltr"
              />
            </div>
            <div className="space-y-1">
              <Label>איש קשר</Label>
              <Select value={contactId} onValueChange={(v) => setContactId(v ?? "")}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="בחר..." />
                </SelectTrigger>
                <SelectContent>
                  {contacts.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}{c.role ? ` · ${c.role}` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* תגיות */}
          <div className="space-y-1">
            <Label htmlFor="task-tags">תגיות</Label>
            <Input
              id="task-tags"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="היתר בנייה, עירייה, לקוח (מופרדות בפסיק)"
            />
          </div>

          {/* תתי-משימות (רק ביצירה) */}
          {!isEdit && (
            <div className="space-y-1">
              <Label htmlFor="task-subtasks">תתי-משימות</Label>
              <Textarea
                id="task-subtasks"
                value={subtasksInput}
                onChange={(e) => setSubtasksInput(e.target.value)}
                placeholder={"שורה לכל תת-משימה:\nהכן מסמכים\nשלח לאישור"}
                rows={3}
              />
              <p className="text-[10px] text-stone-400">שורה אחת לכל תת-משימה</p>
            </div>
          )}

          {error && <p className="text-sm text-[#C0392B]">{error}</p>}

          <div className="flex gap-2 pt-1">
            <Button type="submit" disabled={isPending} className="flex-1">
              {isPending ? "שומר..." : isEdit ? "שמור שינויים" : "הוסף משימה"}
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
