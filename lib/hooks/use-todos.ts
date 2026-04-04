'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import type { Todo } from '@/types/database'

export function useTodos() {
  return useQuery({
    queryKey: ['todos'],
    queryFn: async () => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('todos')
        .select('*')
        .order('created_at', { ascending: false })
      if (error) throw error
      return data as Todo[]
    },
  })
}

export function useCreateTodo() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (todo: {
      task: string
      project_id: string
      project_title: string
      source_requirement_id?: string
    }) => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      const { data, error } = await supabase
        .from('todos')
        .insert({ ...todo, created_by: user?.id ?? null })
        .select()
        .single()
      if (error) throw error
      return data as Todo
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] })
    },
  })
}

export function useUpdateTodo() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...update }: { id: string; done?: boolean; task?: string }) => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('todos')
        .update(update)
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      return data as Todo
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] })
    },
  })
}

export function useDeleteTodo() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const supabase = createClient()
      const { error } = await supabase.from('todos').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] })
    },
  })
}
