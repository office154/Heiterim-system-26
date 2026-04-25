'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import type { ProjectTask, Subtask } from '@/types/database'
import type { Database } from '@/types/database'

type TaskInsert = Database['public']['Tables']['project_tasks']['Insert']
type TaskUpdate = Database['public']['Tables']['project_tasks']['Update']

export function useProjectTasks(projectId: string) {
  return useQuery({
    queryKey: ['project-tasks', projectId],
    queryFn: async () => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('project_tasks')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at')
      if (error) throw error
      return data as ProjectTask[]
    },
    enabled: !!projectId,
  })
}

export function useCreateTask() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (task: TaskInsert) => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('project_tasks')
        .insert(task)
        .select()
        .single()
      if (error) throw error
      return data as ProjectTask
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['project-tasks', variables.project_id] })
    },
  })
}

export function useUpdateTask() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({
      id,
      projectId,
      ...update
    }: TaskUpdate & { id: string; projectId: string }) => {
      // Auto-manage completed_at when status changes
      if (update.status === 'done' && update.completed_at === undefined) {
        update.completed_at = new Date().toISOString()
      } else if (update.status !== undefined && update.status !== 'done') {
        update.completed_at = null
      }
      const supabase = createClient()
      const { data, error } = await supabase
        .from('project_tasks')
        .update(update)
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      return data as ProjectTask
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['project-tasks', variables.projectId] })
    },
  })
}

export function useDeleteTask() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, projectId }: { id: string; projectId: string }) => {
      const supabase = createClient()
      const { error } = await supabase.from('project_tasks').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['project-tasks', variables.projectId] })
    },
  })
}

export function useToggleSubtask() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({
      id,
      projectId,
      subtasks,
      index,
    }: {
      id: string
      projectId: string
      subtasks: Subtask[]
      index: number
    }) => {
      const updated = subtasks.map((s, i) =>
        i === index ? { ...s, done: !s.done } : s
      )
      const supabase = createClient()
      const { data, error } = await supabase
        .from('project_tasks')
        .update({ subtasks: updated })
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      return data as ProjectTask
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['project-tasks', variables.projectId] })
    },
  })
}
