'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import Link from 'next/link'
import { useCurrentRole } from '@/lib/hooks/use-profile'
import { useFinancialSummary, useAlerts, useProjectsCount } from '@/lib/hooks/use-reports'
import { TRACK_LABELS } from '@/lib/constants/tracks'
import type { TrackValue } from '@/types/database'

function formatCurrency(n: number) {
  return '₪' + n.toLocaleString('he-IL')
}

export default function ReportsPage() {
  const router = useRouter()
  const { data: role, isLoading: roleLoading } = useCurrentRole()
  const { data: financial, isLoading: finLoading } = useFinancialSummary()
  const { data: alerts, isLoading: alertsLoading } = useAlerts()
  const { data: counts, isLoading: countsLoading } = useProjectsCount()

  useEffect(() => {
    if (!roleLoading && role === 'employee') router.replace('/')
  }, [role, roleLoading, router])

  if (roleLoading || role !== 'admin') return null

  return (
    <div className="space-y-7">
      <h1 className="text-[20px] font-bold text-[#0F172A] tracking-tight">דוחות</h1>

      {/* Projects count */}
      <section>
        <p className="text-[11px] font-semibold uppercase tracking-widest text-[#64748B] mb-3">סטטוס פרויקטים</p>
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white border border-[#E5E7EB] rounded-lg p-5">
            <div className="text-[11px] font-semibold uppercase tracking-widest text-[#64748B] mb-3">פעילים</div>
            <div className="text-3xl font-bold text-[#6366F1] tracking-tight">
              {countsLoading ? '—' : counts?.active ?? 0}
            </div>
          </div>
          <div className="bg-white border border-[#E5E7EB] rounded-lg p-5">
            <div className="text-[11px] font-semibold uppercase tracking-widest text-[#64748B] mb-3">הושלמו</div>
            <div className="text-3xl font-bold text-[#0F172A] tracking-tight">
              {countsLoading ? '—' : counts?.completed ?? 0}
            </div>
          </div>
          <div className="bg-white border border-[#E5E7EB] rounded-lg p-5">
            <div className="text-[11px] font-semibold uppercase tracking-widest text-[#64748B] mb-3">מושהים</div>
            <div className="text-3xl font-bold text-[#0F172A] tracking-tight">
              {countsLoading ? '—' : counts?.on_hold ?? 0}
            </div>
          </div>
        </div>
      </section>

      {/* Financial */}
      <section>
        <p className="text-[11px] font-semibold uppercase tracking-widest text-[#64748B] mb-3">סיכום פיננסי — פרויקטים פעילים</p>
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white border border-[#E5E7EB] rounded-lg p-5">
            <div className="text-[11px] font-semibold uppercase tracking-widest text-[#64748B] mb-3">סה״כ חוזה</div>
            <div className="text-2xl font-bold text-[#0F172A] tracking-tight">
              {finLoading ? '—' : formatCurrency(financial?.totalContract ?? 0)}
            </div>
          </div>
          <div className="bg-white border border-[#E5E7EB] rounded-lg p-5">
            <div className="text-[11px] font-semibold uppercase tracking-widest text-[#64748B] mb-3">סה״כ שולם</div>
            <div className="text-2xl font-bold text-[#0F172A] tracking-tight">
              {finLoading ? '—' : formatCurrency(financial?.totalPaid ?? 0)}
            </div>
          </div>
          <div className="bg-white border border-[#E5E7EB] rounded-lg p-5">
            <div className="text-[11px] font-semibold uppercase tracking-widest text-[#64748B] mb-3">יתרה לגביה</div>
            <div className="text-2xl font-bold text-[#6366F1] tracking-tight">
              {finLoading ? '—' : formatCurrency(financial?.totalBalance ?? 0)}
            </div>
          </div>
        </div>
      </section>

      {/* Alerts */}
      <section>
        <div className="flex items-center gap-2.5 mb-3">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-[#64748B]">התראות</p>
          {!alertsLoading && alerts && alerts.length > 0 && (
            <span className="text-[11px] font-semibold text-white bg-[#6366F1] px-2 py-0.5 rounded-full">
              {alerts.length}
            </span>
          )}
        </div>

        {alertsLoading ? (
          <div className="text-[13px] text-[#64748B]">טוען...</div>
        ) : !alerts || alerts.length === 0 ? (
          <div className="bg-white border border-[#E5E7EB] rounded-lg px-5 py-8 text-center text-[13px] text-[#64748B]">
            אין התראות פתוחות
          </div>
        ) : (
          <div className="bg-white border border-[#E5E7EB] rounded-lg overflow-hidden">
            {alerts.map((alert, i) => (
              <Link
                key={i}
                href={`/projects/${alert.projectId}`}
                className="flex items-center gap-4 px-5 py-3.5 border-b border-[#F6F7F9] last:border-0 hover:bg-[#F6F7F9] transition-colors"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#6366F1] flex-shrink-0" />
                <span className="text-[13px] font-semibold text-[#0F172A] flex-1">{alert.projectTitle}</span>
                <span className="text-[#E5E7EB]">·</span>
                <span className="text-[13px] text-[#64748B]">{alert.stageName}</span>
                <span className="text-[11px] text-[#64748B] bg-[#F6F7F9] border border-[#E5E7EB] px-2 py-0.5 rounded">
                  {TRACK_LABELS[alert.track as TrackValue] ?? alert.track}
                </span>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
