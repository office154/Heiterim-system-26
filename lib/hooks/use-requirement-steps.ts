'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import type { RequirementStep } from '@/types/database'
import type { Database } from '@/types/database'

type StepInsert = Database['public']['Tables']['requirement_steps']['Insert']
type StepUpdate = Database['public']['Tables']['requirement_steps']['Update']

export function useRequirementSteps(requirementId: string) {
  return useQuery({
    queryKey: ['requirement-steps', requirementId],
    queryFn: async () => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('requirement_steps')
        .select('*')
        .eq('requirement_id', requirementId)
        .order('order_index')
      if (error) throw error
      return data as RequirementStep[]
    },
    enabled: !!requirementId,
  })
}

export function useCreateStep() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (step: StepInsert) => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('requirement_steps')
        .insert(step)
        .select()
        .single()
      if (error) throw error
      return data as RequirementStep
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['requirement-steps', variables.requirement_id] })
    },
  })
}

export function useUpdateStep() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, requirementId, ...update }: StepUpdate & { id: string; requirementId: string }) => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('requirement_steps')
        .update(update)
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      return data as RequirementStep
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['requirement-steps', variables.requirementId] })
    },
  })
}

export function useDeleteStep() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, requirementId }: { id: string; requirementId: string }) => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('requirement_steps')
        .delete()
        .eq('id', id)
        .select()
      if (error) throw error
      if (!data || data.length === 0) throw new Error('מחיקה נכשלה')
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['requirement-steps', variables.requirementId] })
    },
  })
}
