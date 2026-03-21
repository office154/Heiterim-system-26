'use client'

import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'

interface ActiveProjectRow {
  id: string
  title: string
  status: string
  client_id: string | null
  created_at: string
  client: { name: string } | null
}

interface StageRow {
  id: string
  name: string
  price: number
  completed: boolean
  invoice_sent: boolean
  paid: boolean
  completed_at: string | null
  project_id: string
}

export interface AlertStageItem {
  projectId: string
  projectTitle: string
  clientName: string
  stageName: string
  amount: number
}

export interface InactiveProjectItem {
  projectId: string
  projectTitle: string
  clientName: string
  daysSinceActivity: number
}

export interface DashboardData {
  activeProjectsCount: number
  totalPaid: number
  activeClientsCount: number
  totalPendingCollection: number
  waitingPaymentCount: number
  waitingInvoiceCount: number
  waitingPaymentItems: AlertStageItem[]
  waitingInvoiceItems: AlertStageItem[]
  notInvoicedStages: AlertStageItem[]
  notPaidStages: AlertStageItem[]
  inactiveProjects: InactiveProjectItem[]
  activeProjects: { id: string; title: string }[]
}

const EMPTY_DATA: DashboardData = {
  activeProjectsCount: 0,
  totalPaid: 0,
  activeClientsCount: 0,
  totalPendingCollection: 0,
  waitingPaymentCount: 0,
  waitingInvoiceCount: 0,
  waitingPaymentItems: [],
  waitingInvoiceItems: [],
  notInvoicedStages: [],
  notPaidStages: [],
  inactiveProjects: [],
  activeProjects: [],
}

export function useDashboardData() {
  return useQuery<DashboardData>({
    queryKey: ['dashboard-data'],
    queryFn: async () => {
      const supabase = createClient()

      // Fetch active projects with client names
      const { data: projectsRaw, error: projectsError } = await supabase
        .from('projects')
        .select('id, title, status, client_id, created_at, client:clients(name)')
        .eq('status', 'active')
        .order('created_at', { ascending: false })

      if (projectsError) throw projectsError

      const projects = (projectsRaw ?? []) as unknown as ActiveProjectRow[]

      if (projects.length === 0) return EMPTY_DATA

      const activeProjectIds = projects.map((p) => p.id)

      // Fetch all stages for active projects
      const { data: stagesRaw, error: stagesError } = await supabase
        .from('project_stages')
        .select('id, name, price, completed, invoice_sent, paid, completed_at, project_id')
        .in('project_id', activeProjectIds)

      if (stagesError) throw stagesError

      const stages = (stagesRaw ?? []) as StageRow[]

      // Build lookup maps
      const projectInfoMap = new Map(
        projects.map((p) => [
          p.id,
          { title: p.title, clientName: p.client?.name ?? '—', clientId: p.client_id, createdAt: p.created_at },
        ])
      )

      // --- KPI calculations ---
      const activeClientIds = new Set<string>()
      for (const p of projects) {
        if (p.client_id) activeClientIds.add(p.client_id)
      }

      let totalPaid = 0
      let totalPendingCollection = 0

      const waitingPaymentProjectIds = new Set<string>()
      const waitingInvoiceProjectIds = new Set<string>()
      const waitingPaymentItems: AlertStageItem[] = []
      const waitingInvoiceItems: AlertStageItem[] = []
      const notInvoicedStages: AlertStageItem[] = []
      const notPaidStages: AlertStageItem[] = []

      // Track last activity per project
      const projectLastActivity = new Map<string, number>()
      for (const p of projects) {
        projectLastActivity.set(p.id, new Date(p.created_at).getTime())
      }

      for (const stage of stages) {
        const info = projectInfoMap.get(stage.project_id)
        if (!info) continue

        const item: AlertStageItem = {
          projectId: stage.project_id,
          projectTitle: info.title,
          clientName: info.clientName,
          stageName: stage.name,
          amount: stage.price ?? 0,
        }

        if (stage.paid) {
          totalPaid += stage.price ?? 0
        }

        if (stage.invoice_sent && !stage.paid) {
          totalPendingCollection += stage.price ?? 0
          waitingPaymentProjectIds.add(stage.project_id)
          waitingPaymentItems.push(item)
          notPaidStages.push(item)
        }

        if (stage.completed && !stage.invoice_sent) {
          waitingInvoiceProjectIds.add(stage.project_id)
          waitingInvoiceItems.push(item)
          notInvoicedStages.push(item)
        }

        // Update last activity
        if (stage.completed_at) {
          const t = new Date(stage.completed_at).getTime()
          const prev = projectLastActivity.get(stage.project_id) ?? 0
          if (t > prev) projectLastActivity.set(stage.project_id, t)
        }
      }

      // Inactive projects (no activity > 30 days)
      const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000
      const inactiveProjects: InactiveProjectItem[] = []
      for (const p of projects) {
        const lastActivity = projectLastActivity.get(p.id) ?? 0
        if (lastActivity < thirtyDaysAgo) {
          const daysSince = Math.floor((Date.now() - lastActivity) / (1000 * 60 * 60 * 24))
          inactiveProjects.push({
            projectId: p.id,
            projectTitle: p.title,
            clientName: p.client?.name ?? '—',
            daysSinceActivity: daysSince,
          })
        }
      }

      return {
        activeProjectsCount: projects.length,
        totalPaid,
        activeClientsCount: activeClientIds.size,
        totalPendingCollection,
        waitingPaymentCount: waitingPaymentProjectIds.size,
        waitingInvoiceCount: waitingInvoiceProjectIds.size,
        waitingPaymentItems,
        waitingInvoiceItems,
        notInvoicedStages,
        notPaidStages,
        inactiveProjects,
        activeProjects: projects.slice(0, 10).map((p) => ({ id: p.id, title: p.title })),
      }
    },
    staleTime: 60_000,
  })
}
