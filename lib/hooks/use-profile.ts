'use client'

import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import type { UserRole } from '@/types/database'

export function useCurrentRole() {
  return useQuery<UserRole>({
    queryKey: ['current-role'],
    queryFn: async () => {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      if (error) throw error
      return data.role as UserRole
    },
    staleTime: 1000 * 60 * 5,
  })
}
