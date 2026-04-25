'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import type { ProjectContact } from '@/types/database'
import type { Database } from '@/types/database'

type ContactInsert = Database['public']['Tables']['project_contacts']['Insert']
type ContactUpdate = Database['public']['Tables']['project_contacts']['Update']

export function useProjectContacts(projectId: string) {
  return useQuery({
    queryKey: ['project-contacts', projectId],
    queryFn: async () => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('project_contacts')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at')
      if (error) throw error
      return data as ProjectContact[]
    },
    enabled: !!projectId,
  })
}

export function useCreateContact() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (contact: ContactInsert) => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('project_contacts')
        .insert(contact)
        .select()
        .single()
      if (error) throw error
      return data as ProjectContact
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['project-contacts', variables.project_id] })
    },
  })
}

export function useUpdateContact() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({
      id,
      projectId,
      ...update
    }: ContactUpdate & { id: string; projectId: string }) => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('project_contacts')
        .update(update)
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      return data as ProjectContact
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['project-contacts', variables.projectId] })
    },
  })
}

export function useDeleteContact() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, projectId }: { id: string; projectId: string }) => {
      const supabase = createClient()
      const { error } = await supabase.from('project_contacts').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['project-contacts', variables.projectId] })
    },
  })
}
