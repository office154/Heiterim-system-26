import type {
  ProjectContact,
  ProjectTask,
  TaskPriority,
  TaskStatus,
  TaskUrgency,
  TaskPhase,
  TaskParty,
  Subtask,
} from '@/types/database'

export type { ProjectContact, ProjectTask, TaskPriority, TaskStatus, TaskUrgency, TaskPhase, TaskParty, Subtask }

export const PRIORITY_LABELS: Record<TaskPriority, string> = {
  critical: 'דחוף מאוד',
  high: 'גבוה',
  normal: 'רגיל',
  low: 'נמוך',
}

export const STATUS_LABELS: Record<TaskStatus, string> = {
  open: 'פתוח',
  in_progress: 'בטיפול',
  waiting: 'ממתין',
  done: 'הושלם',
}

export const URGENCY_LABELS: Record<TaskUrgency, string> = {
  today: 'היום',
  week: 'השבוע',
  later: 'בהמשך',
}

export const PHASE_LABELS: Record<TaskPhase, string> = {
  planning: 'תכנון',
  approvals: 'אישורים',
  client_decisions: 'החלטות לקוח',
  submission: 'הגשה',
}

export const PARTY_LABELS: Record<TaskParty, string> = {
  internal: 'פנימי',
  client: 'לקוח',
  authority: 'רשות',
  consultants: 'יועצים',
}

export const PRIORITY_OPTIONS: { value: TaskPriority; label: string }[] = [
  { value: 'critical', label: PRIORITY_LABELS.critical },
  { value: 'high',     label: PRIORITY_LABELS.high },
  { value: 'normal',   label: PRIORITY_LABELS.normal },
  { value: 'low',      label: PRIORITY_LABELS.low },
]

export const STATUS_OPTIONS: { value: TaskStatus; label: string }[] = [
  { value: 'open',        label: STATUS_LABELS.open },
  { value: 'in_progress', label: STATUS_LABELS.in_progress },
  { value: 'waiting',     label: STATUS_LABELS.waiting },
  { value: 'done',        label: STATUS_LABELS.done },
]

export const URGENCY_OPTIONS: { value: TaskUrgency; label: string }[] = [
  { value: 'today', label: URGENCY_LABELS.today },
  { value: 'week',  label: URGENCY_LABELS.week },
  { value: 'later', label: URGENCY_LABELS.later },
]

export const PHASE_OPTIONS: { value: TaskPhase; label: string }[] = [
  { value: 'planning',         label: PHASE_LABELS.planning },
  { value: 'approvals',        label: PHASE_LABELS.approvals },
  { value: 'client_decisions', label: PHASE_LABELS.client_decisions },
  { value: 'submission',       label: PHASE_LABELS.submission },
]

export const PARTY_OPTIONS: { value: TaskParty; label: string }[] = [
  { value: 'internal',    label: PARTY_LABELS.internal },
  { value: 'client',      label: PARTY_LABELS.client },
  { value: 'authority',   label: PARTY_LABELS.authority },
  { value: 'consultants', label: PARTY_LABELS.consultants },
]
