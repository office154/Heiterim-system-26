'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { DEFAULT_STAGES } from '@/lib/constants/tracks'
import type { ProjectStage, TrackValue } from '@/types/database'
import type { Database } from '@/types/database'

type StageUpdate = Database['public']['Tables']['project_stages']['Update']

export function useProjectStages(projectId: string) {
  return useQuery({
    queryKey: ['project-stages', projectId],
    queryFn: async () => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('project_stages')
        .select('*')
        .eq('project_id', projectId)
        .order('order_index')
      if (error) throw error
      return data as ProjectStage[]
    },
    enabled: !!projectId,
  })
}

export function useUpdateStage() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({
      id,
      projectId,
      ...update
    }: StageUpdate & { id: string; projectId: string }) => {
      // Auto-manage completed_at
      if (update.completed === true && update.completed_at === undefined) {
        update.completed_at = new Date().toISOString()
      } else if (update.completed === false) {
        update.completed_at = null
      }
      const supabase = createClient()
      const { data, error } = await supabase
        .from('project_stages')
        .update(update)
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      return data as ProjectStage
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['project-stages', variables.projectId] })
    },
  })
}

export function useAddTrack() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({
      projectId,
      track,
      currentTracks,
    }: {
      projectId: string
      track: TrackValue
      currentTracks: TrackValue[]
    }) => {
      const supabase = createClient()
      const stages = DEFAULT_STAGES[track]

      const { error: stagesError } = await supabase.from('project_stages').insert(
        stages.map((name, index) => ({
          project_id: projectId,
          track,
          name,
          order_index: index + 1,
        }))
      )
      if (stagesError) throw stagesError

      const { error: projectError } = await supabase
        .from('projects')
        .update({ tracks: [...currentTracks, track] })
        .eq('id', projectId)
      if (projectError) throw projectError
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['project-stages', variables.projectId] })
      queryClient.invalidateQueries({ queryKey: ['projects', variables.projectId] })
      queryClient.invalidateQueries({ queryKey: ['projects'] })
    },
  })
}

export function useRemoveTrack() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({
      projectId,
      track,
      currentTracks,
    }: {
      projectId: string
      track: TrackValue
      currentTracks: TrackValue[]
    }) => {
      const supabase = createClient()

      const { error: stagesError } = await supabase
        .from('project_stages')
        .delete()
        .eq('project_id', projectId)
        .eq('track', track)
      if (stagesError) throw stagesError

      const { error: projectError } = await supabase
        .from('projects')
        .update({ tracks: currentTracks.filter((t) => t !== track) })
        .eq('id', projectId)
      if (projectError) throw projectError
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['project-stages', variables.projectId] })
      queryClient.invalidateQueries({ queryKey: ['projects', variables.projectId] })
      queryClient.invalidateQueries({ queryKey: ['projects'] })
    },
  })
}
