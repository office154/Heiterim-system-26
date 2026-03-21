'use client'

import Link from 'next/link'
import { useFinancialSummary, useAlerts, useProjectsCount } from '@/lib/hooks/use-reports'

function formatCurrency(n: number) {
  return '₪' + n.toLocaleString('he-IL')
}

export default function DashboardCards() {
  const { data: financial, isLoading: finLoading } = useFinancialSummary()
  const { data: alerts, isLoading: alertsLoading } = useAlerts()
  const { data: counts, isLoading: countsLoading } = useProjectsCount()

  return (
    <div className="space-y-5">
      {/* KPI cards */}
      <div className="grid grid-cols-3 gap-4">
        {/* Accent — primary metric */}
        <div className="bg-white border border-[#E5E7EB] rounded-lg p-5">
          <div className="text-[11px] font-semibold uppercase tracking-widest text-[#64748B] mb-3">
            פרויקטים פעילים
          </div>
          <div className="text-3xl font-bold text-[#6366F1] tracking-tight">
            {countsLoading ? '—' : counts?.active ?? 0}
          </div>
        </div>

        {/* Neutral */}
        <div className="bg-white border border-[#E5E7EB] rounded-lg p-5">
          <div className="text-[11px] font-semibold uppercase tracking-widest text-[#64748B] mb-3">
            סה״כ חוזה
          </div>
          <div className="text-2xl font-bold text-[#0F172A] tracking-tight">
            {finLoading ? '—' : formatCurrency(financial?.totalContract ?? 0)}
          </div>
        </div>

        {/* Neutral — balance */}
        <div className="bg-white border border-[#E5E7EB] rounded-lg p-5">
          <div className="text-[11px] font-semibold uppercase tracking-widest text-[#64748B] mb-3">
            יתרה לגביה
          </div>
          <div className="text-2xl font-bold text-[#0F172A] tracking-tight">
            {finLoading ? '—' : formatCurrency(financial?.totalBalance ?? 0)}
          </div>
        </div>
      </div>

      {/* Alerts */}
      {!alertsLoading && alerts && alerts.length > 0 && (
        <div className="bg-white border border-[#E5E7EB] rounded-lg overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3 border-b border-[#E5E7EB]">
            <div className="flex items-center gap-2.5">
              <span className="text-[13px] font-semibold text-[#0F172A]">התראות פתוחות</span>
              <span className="text-[11px] font-semibold text-white bg-[#6366F1] px-2 py-0.5 rounded-full">
                {alerts.length}
              </span>
            </div>
            <Link href="/reports" className="text-[12px] text-[#64748B] hover:text-[#0F172A] transition-colors">
              הצג הכל
            </Link>
          </div>
          <div>
            {alerts.slice(0, 5).map((alert, i) => (
              <Link
                key={i}
                href={`/projects/${alert.projectId}`}
                className="flex items-center gap-3 px-5 py-3 border-b border-[#F6F7F9] last:border-0 hover:bg-[#F6F7F9] transition-colors"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#6366F1] flex-shrink-0" />
                <span className="text-[13px] font-medium text-[#0F172A]">{alert.projectTitle}</span>
                <span className="text-[#E5E7EB]">·</span>
                <span className="text-[13px] text-[#64748B]">{alert.stageName}</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
