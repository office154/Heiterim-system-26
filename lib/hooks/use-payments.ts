'use client'

import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface PaymentStage {
  id: string
  name: string
  order_index: number
  price: number
  extra_payment: number
  completed: boolean
  invoice_sent: boolean
  paid: boolean
}

export interface PaymentProject {
  id: string
  title: string
  clientName: string | null
  stages: PaymentStage[]
  totalContract: number
  totalPaid: number
  totalInvoiced: number
  totalRequired: number
}

export interface PaymentsSummary {
  totalContract: number
  totalPaid: number
  totalInvoiced: number
  totalRequired: number
  projects: PaymentProject[]
}

// ─── Status helper ────────────────────────────────────────────────────────────

export type PaymentStatus = 'paid' | 'invoiced' | 'required' | 'pending'

export function getPaymentStatus(stage: Pick<PaymentStage, 'paid' | 'invoice_sent' | 'completed'>): PaymentStatus {
  if (stage.paid)                              return 'paid'
  if (stage.invoice_sent && !stage.paid)       return 'invoiced'
  if (stage.completed && !stage.invoice_sent)  return 'required'
  return 'pending'
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function usePayments() {
  return useQuery<PaymentsSummary>({
    queryKey: ['payments'],
    queryFn: async () => {
      const supabase = createClient()

      // Fetch active projects with client info and stages in one query
      type RawProject = {
        id: string
        title: string
        status: string
        created_at: string
        clients: { name: string } | null
        project_stages: PaymentStage[]
      }

      const { data: projects, error } = await supabase
        .from('projects')
        .select(`
          id, title, status, created_at,
          clients ( name ),
          project_stages (
            id, name, order_index, price, extra_payment,
            completed, invoice_sent, paid
          )
        `)
        .eq('status', 'active')
        .order('created_at', { ascending: false })

      if (error) throw error

      let summaryContract  = 0
      let summaryPaid      = 0
      let summaryInvoiced  = 0
      let summaryRequired  = 0

      const paymentProjects: PaymentProject[] = ((projects ?? []) as unknown as RawProject[]).map((proj) => {
        // Sort stages by order_index
        const stages: PaymentStage[] = (proj.project_stages ?? [])
          .slice()
          .sort((a, b) => a.order_index - b.order_index)

        const totalContract = stages.reduce((s, st) => s + (st.price || 0), 0)
        const totalPaid     = stages.filter(st => st.paid)
                                    .reduce((s, st) => s + (st.price || 0), 0)
        const totalInvoiced = stages.filter(st => st.invoice_sent && !st.paid)
                                    .reduce((s, st) => s + (st.price || 0), 0)
        const totalRequired = stages.filter(st => st.completed && !st.invoice_sent)
                                    .reduce((s, st) => s + (st.price || 0), 0)

        summaryContract += totalContract
        summaryPaid     += totalPaid
        summaryInvoiced += totalInvoiced
        summaryRequired += totalRequired

        return {
          id: proj.id,
          title: proj.title,
          clientName: proj.clients?.name ?? null,
          stages,
          totalContract,
          totalPaid,
          totalInvoiced,
          totalRequired,
        }
      })

      // Sort: required first → invoiced → fully paid → rest
      paymentProjects.sort((a, b) => {
        const rank = (p: PaymentProject) => {
          if (p.totalRequired > 0) return 0
          if (p.totalInvoiced > 0) return 1
          if (p.totalContract > 0 && p.totalPaid === p.totalContract) return 2
          return 3
        }
        return rank(a) - rank(b)
      })

      return {
        totalContract:  summaryContract,
        totalPaid:      summaryPaid,
        totalInvoiced:  summaryInvoiced,
        totalRequired:  summaryRequired,
        projects:       paymentProjects,
      }
    },
    staleTime: 30_000,
  })
}
