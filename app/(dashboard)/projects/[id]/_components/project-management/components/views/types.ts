import type { ProjectTask, ProjectContact } from "../../types"

export interface ViewProps {
  tasks: ProjectTask[]
  contacts: ProjectContact[]
  onToggleDone: (taskId: string) => void
  onToggleSubtask: (taskId: string, index: number) => void
  onTaskClick?: (taskId: string) => void
  onTaskDelete?: (taskId: string) => void
}
