'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import type { StatusRequirement } from '@/types/database'
import type { Database } from '@/types/database'

type ReqInsert = Database['public']['Tables']['status_requirements']['Insert']
type ReqUpdate = Database['public']['Tables']['status_requirements']['Update']

export function useStatusRequirements(projectId: string) {
  return useQuery({
    queryKey: ['status-requirements', projectId],
    queryFn: async () => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('status_requirements')
        .select('*')
        .eq('project_id', projectId)
        .order('order_index')
      if (error) throw error
      return data as StatusRequirement[]
    },
    enabled: !!projectId,
  })
}

export function useCreateRequirement() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (req: ReqInsert) => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('status_requirements')
        .insert(req)
        .select()
        .single()
      if (error) throw error
      return data as StatusRequirement
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['status-requirements', variables.project_id],
      })
    },
  })
}

export function useUpdateRequirement() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({
      id,
      projectId,
      ...update
    }: ReqUpdate & { id: string; projectId: string }) => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('status_requirements')
        .update(update)
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      // Sync updated requirement text to linked todos
      if (typeof update.requirement === 'string' && update.requirement.trim()) {
        await supabase
          .from('todos')
          .update({ task: update.requirement.trim() })
          .eq('source_requirement_id', id)
      }
      return data as StatusRequirement
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['status-requirements', variables.projectId],
      })
      queryClient.invalidateQueries({ queryKey: ['todos'] })
    },
  })
}

export function useDeleteRequirement() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, projectId }: { id: string; projectId: string }) => {
      const supabase = createClient()
      // Delete linked todos first (open and archived)
      await supabase.from('todos').delete().eq('source_requirement_id', id)
      const { data, error } = await supabase
        .from('status_requirements')
        .delete()
        .eq('id', id)
        .select()
      if (error) throw error
      if (!data || data.length === 0) throw new Error('RLS_BLOCK: אין הרשאת מחיקה לשורה זו')
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['status-requirements', variables.projectId],
      })
      queryClient.invalidateQueries({ queryKey: ['todos'] })
    },
  })
}
