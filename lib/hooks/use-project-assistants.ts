'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import type { Profile } from '@/types/database'

export type AssistantWithProfile = {
  id: string
  project_id: string
  profile_id: string
  created_at: string
  profile: Pick<Profile, 'id' | 'full_name' | 'role'>
}

export function useProjectAssistants(projectId: string) {
  return useQuery<AssistantWithProfile[]>({
    queryKey: ['project-assistants', projectId],
    queryFn: async () => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('project_assistants')
        .select('*, profile:profiles(id, full_name, role)')
        .eq('project_id', projectId)
        .order('created_at')
      if (error) throw error
      return data as AssistantWithProfile[]
    },
    enabled: !!projectId,
  })
}

export function useAddAssistant() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ project_id, profile_id }: { project_id: string; profile_id: string }) => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('project_assistants')
        .insert({ project_id, profile_id })
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['project-assistants', variables.project_id] })
    },
  })
}

export function useRemoveAssistant() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, project_id }: { id: string; project_id: string }) => {
      const supabase = createClient()
      const { error } = await supabase.from('project_assistants').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['project-assistants', variables.project_id] })
    },
  })
}
