'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import type { ProjectFile } from '@/types/database'

const BUCKET = 'project-files'

export function useProjectFiles(projectId: string) {
  return useQuery<ProjectFile[]>({
    queryKey: ['project-files', projectId],
    queryFn: async () => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('project_files')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false })
      if (error) throw error
      return data as ProjectFile[]
    },
    enabled: !!projectId,
  })
}

export function useUploadFile(projectId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (file: File) => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      // Sanitize filename: keep only safe ASCII chars
      const safeName = file.name
        .replace(/[^\w.\-]/g, '_')   // replace non-word chars (including Hebrew) with _
        .replace(/_+/g, '_')          // collapse multiple underscores
        .replace(/^_|_(?=\.)/g, '')   // trim leading _ and _ before extension
      const path = `${projectId}/${Date.now()}-${safeName}`

      const { error: uploadError } = await supabase.storage
        .from(BUCKET)
        .upload(path, file)
      if (uploadError) throw uploadError

      const { error: dbError } = await supabase.from('project_files').insert({
        project_id: projectId,
        file_name: file.name,
        file_path: path,
        file_type: file.type || null,
        file_size: file.size,
        uploaded_by: user?.id ?? null,
      })
      if (dbError) throw dbError
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project-files', projectId] })
    },
  })
}

export function useDeleteFile(projectId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, filePath }: { id: string; filePath: string }) => {
      const supabase = createClient()

      const { error: storageError } = await supabase.storage
        .from(BUCKET)
        .remove([filePath])
      if (storageError) throw storageError

      const { error: dbError } = await supabase
        .from('project_files')
        .delete()
        .eq('id', id)
      if (dbError) throw dbError
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project-files', projectId] })
    },
  })
}

export async function getSignedUrl(filePath: string): Promise<string> {
  const supabase = createClient()
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(filePath, 60 * 60) // 1 hour
  if (error) throw error
  return data.signedUrl
}
