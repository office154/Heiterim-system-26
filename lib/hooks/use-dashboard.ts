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
  order_index: number
}

export interface AlertStageItem {
  projectId: string
  projectTitle: string
  clientName: string
  stageName: string
  amount: number
  daysSince?: number
}

export interface InactiveProjectItem {
  projectId: string
  projectTitle: string
  clientName: string
  daysSinceActivity: number
}

export interface ProjectProgress {
  id: string
  title: string
  clientName: string
  status: string
  completedStages: number
  totalStages: number
  progressPercent: number
  currentStageName: string
}

export interface DashboardData {
  activeProjectsCount: number
  totalPaid: number
  totalContract: number
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
  projectsWithProgress: ProjectProgress[]
}

const EMPTY_DATA: DashboardData = {
  activeProjectsCount: 0,
  totalPaid: 0,
  totalContract: 0,
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
  projectsWithProgress: [],
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
        .select('id, name, price, completed, invoice_sent, paid, completed_at, project_id, order_index')
        .in('project_id', activeProjectIds)

      if (stagesError) throw stagesError

      const stages = (stagesRaw ?? []) as StageRow[]

      // Build project info map
      const projectInfoMap = new Map(
        projects.map((p) => [
          p.id,
          {
            title: p.title,
            clientName: p.client?.name ?? '—',
            clientId: p.client_id,
            createdAt: p.created_at,
          },
        ])
      )

      // Unique client IDs for active clients count
      const activeClientIds = new Set<string>()
      for (const p of projects) {
        if (p.client_id) activeClientIds.add(p.client_id)
      }

      // KPI aggregations
      let totalPaid = 0
      let totalContract = 0
      let totalPendingCollection = 0

      const waitingPaymentProjectIds = new Set<string>()
      const waitingInvoiceProjectIds = new Set<string>()
      const waitingPaymentItems: AlertStageItem[] = []
      const waitingInvoiceItems: AlertStageItem[] = []
      const notInvoicedStages: AlertStageItem[] = []
      const notPaidStages: AlertStageItem[] = []

      // Per-project stage grouping (for progress + last activity)
      const stagesByProject = new Map<string, StageRow[]>()
      const projectLastActivity = new Map<string, number>()
      for (const p of projects) {
        stagesByProject.set(p.id, [])
        projectLastActivity.set(p.id, new Date(p.created_at).getTime())
      }

      for (const stage of stages) {
        const info = projectInfoMap.get(stage.project_id)
        if (!info) continue

        // Group for progress
        stagesByProject.get(stage.project_id)?.push(stage)

        // Financial aggregations
        totalContract += stage.price ?? 0
        if (stage.paid) totalPaid += stage.price ?? 0

        const item: AlertStageItem = {
          projectId: stage.project_id,
          projectTitle: info.title,
          clientName: info.clientName,
          stageName: stage.name,
          amount: stage.price ?? 0,
        }

        if (stage.invoice_sent && !stage.paid) {
          totalPendingCollection += stage.price ?? 0
          waitingPaymentProjectIds.add(stage.project_id)
          const daysSince = stage.completed_at
            ? Math.floor((Date.now() - new Date(stage.completed_at).getTime()) / 86_400_000)
            : undefined
          waitingPaymentItems.push({ ...item, daysSince })
          notPaidStages.push({ ...item, daysSince })
        }

        if (stage.completed && !stage.invoice_sent) {
          waitingInvoiceProjectIds.add(stage.project_id)
          waitingInvoiceItems.push(item)
          notInvoicedStages.push(item)
        }

        // Track last activity for inactive detection
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
          inactiveProjects.push({
            projectId: p.id,
            projectTitle: p.title,
            clientName: p.client?.name ?? '—',
            daysSinceActivity: Math.floor((Date.now() - lastActivity) / 86_400_000),
          })
        }
      }

      // Project progress cards
      const projectsWithProgress: ProjectProgress[] = projects.map((p) => {
        const projStages = stagesByProject.get(p.id) ?? []
        const totalStages = projStages.length
        const completedStages = projStages.filter((s) => s.completed).length
        const progressPercent = totalStages > 0 ? Math.round((completedStages / totalStages) * 100) : 0
        const sorted = [...projStages].sort((a, b) => a.order_index - b.order_index)
        const currentStage = sorted.find((s) => !s.completed) ?? sorted[sorted.length - 1]
        return {
          id: p.id,
          title: p.title,
          clientName: p.client?.name ?? '—',
          status: p.status,
          completedStages,
          totalStages,
          progressPercent,
          currentStageName: currentStage?.name ?? '—',
        }
      })

      return {
        activeProjectsCount: projects.length,
        totalPaid,
        totalContract,
        activeClientsCount: activeClientIds.size,
        totalPendingCollection,
        waitingPaymentCount: waitingPaymentProjectIds.size,
        waitingInvoiceCount: waitingInvoiceProjectIds.size,
        waitingPaymentItems,
        waitingInvoiceItems,
        notInvoicedStages,
        notPaidStages,
        inactiveProjects,
        activeProjects: projects.map((p) => ({ id: p.id, title: p.title })),
        projectsWithProgress,
      }
    },
    staleTime: 60_000,
  })
}
