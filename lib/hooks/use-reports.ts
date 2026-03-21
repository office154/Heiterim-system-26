'use client'

import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'

export interface FinancialSummary {
  totalContract: number
  totalPaid: number
  totalBalance: number
}

export interface ProjectAlert {
  projectId: string
  projectTitle: string
  stageName: string
  track: string
}

export interface ProjectsCount {
  active: number
  completed: number
  on_hold: number
}

interface StageWithProject {
  price: number
  paid: boolean
  completed: boolean
  invoice_sent: boolean
  project_id: string
  name: string
  track: string
  projects: { title: string; status: string } | null
}

export function useFinancialSummary() {
  return useQuery<FinancialSummary>({
    queryKey: ['financial-summary'],
    queryFn: async () => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('project_stages')
        .select('price, paid, projects!inner(status)')

      if (error) throw error

      let totalContract = 0
      let totalPaid = 0

      for (const row of (data ?? []) as unknown as { price: number; paid: boolean; projects: { status: string } }[]) {
        if (row.projects?.status !== 'active') continue
        totalContract += row.price ?? 0
        if (row.paid) totalPaid += row.price ?? 0
      }

      return {
        totalContract,
        totalPaid,
        totalBalance: totalContract - totalPaid,
      }
    },
  })
}

export function useAlerts() {
  return useQuery<ProjectAlert[]>({
    queryKey: ['alerts'],
    queryFn: async () => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('project_stages')
        .select('id, name, track, price, completed, invoice_sent, paid, project_id, projects!inner(title, status)')
        .gt('price', 0)

      if (error) throw error

      const rows = (data ?? []) as unknown as StageWithProject[]
      const alerts: ProjectAlert[] = []

      for (const row of rows) {
        if (row.projects?.status !== 'active') continue
        if (row.completed && !row.invoice_sent) {
          alerts.push({
            projectId: row.project_id,
            projectTitle: row.projects.title,
            stageName: row.name,
            track: row.track,
          })
        } else if (row.invoice_sent && !row.paid) {
          alerts.push({
            projectId: row.project_id,
            projectTitle: row.projects.title,
            stageName: row.name,
            track: row.track,
          })
        }
      }
      return alerts
    },
  })
}

export function useProjectsCount() {
  return useQuery<ProjectsCount>({
    queryKey: ['projects-count'],
    queryFn: async () => {
      const supabase = createClient()
      const { data, error } = await supabase.from('projects').select('status')
      if (error) throw error

      const counts: ProjectsCount = { active: 0, completed: 0, on_hold: 0 }
      for (const row of data ?? []) {
        if (row.status in counts) {
          counts[row.status as keyof ProjectsCount]++
        }
      }
      return counts
    },
  })
}
