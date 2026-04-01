'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import Link from 'next/link'
import { useCurrentRole } from '@/lib/hooks/use-profile'
import { useFinancialSummary, useAlerts, useProjectsCount } from '@/lib/hooks/use-reports'
import { TRACK_LABELS } from '@/lib/constants/tracks'
import type { TrackValue } from '@/types/database'
import { Breadcrumb } from '@/components/shared/Breadcrumb'

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
      <Breadcrumb items={[{ label: 'דשבורד', href: '/' }, { label: 'דוחות' }]} />
      <h1 className="text-[20px] font-black text-[#1a1a1a] tracking-tight">דוחות</h1>

      {/* Projects count */}
      <section>
        <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-[#aaaaaa] mb-3">סטטוס פרויקטים</p>
        <div className="grid grid-cols-3 gap-4">
          <div
            className="bg-white rounded-lg p-5"
            style={{ border: '1px solid #E5E7EB', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}
          >
            <div className="text-[10px] font-bold uppercase tracking-[0.08em] text-[#aaaaaa] mb-3">פעילים</div>
            <div className="text-3xl font-black text-[#3D6A9E] tracking-tight">
              {countsLoading ? '—' : counts?.active ?? 0}
            </div>
          </div>
          <div
            className="bg-white rounded-lg p-5"
            style={{ border: '1px solid #E5E7EB', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}
          >
            <div className="text-[10px] font-bold uppercase tracking-[0.08em] text-[#aaaaaa] mb-3">הושלמו</div>
            <div className="text-3xl font-black text-[#1a1a1a] tracking-tight">
              {countsLoading ? '—' : counts?.completed ?? 0}
            </div>
          </div>
          <div
            className="bg-white rounded-lg p-5"
            style={{ border: '1px solid #E5E7EB', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}
          >
            <div className="text-[10px] font-bold uppercase tracking-[0.08em] text-[#aaaaaa] mb-3">מושהים</div>
            <div className="text-3xl font-black text-[#1a1a1a] tracking-tight">
              {countsLoading ? '—' : counts?.on_hold ?? 0}
            </div>
          </div>
        </div>
      </section>

      {/* Financial */}
      <section>
        <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-[#aaaaaa] mb-3">סיכום פיננסי — פרויקטים פעילים</p>
        <div className="grid grid-cols-3 gap-4">
          <div
            className="bg-white rounded-lg p-5"
            style={{ border: '1px solid #E5E7EB', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}
          >
            <div className="text-[10px] font-bold uppercase tracking-[0.08em] text-[#aaaaaa] mb-3">סה״כ חוזה</div>
            <div className="text-2xl font-black text-[#1a1a1a] tracking-tight">
              {finLoading ? '—' : formatCurrency(financial?.totalContract ?? 0)}
            </div>
          </div>
          <div
            className="bg-white rounded-lg p-5"
            style={{ border: '1px solid #E5E7EB', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}
          >
            <div className="text-[10px] font-bold uppercase tracking-[0.08em] text-[#aaaaaa] mb-3">סה״כ שולם</div>
            <div className="text-2xl font-black text-[#3D6A9E] tracking-tight">
              {finLoading ? '—' : formatCurrency(financial?.totalPaid ?? 0)}
            </div>
          </div>
          <div
            className="bg-white rounded-lg p-5"
            style={{ border: '1px solid #E5E7EB', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}
          >
            <div className="text-[10px] font-bold uppercase tracking-[0.08em] text-[#aaaaaa] mb-3">יתרה לגביה</div>
            <div className="text-2xl font-black text-[#C0392B] tracking-tight">
              {finLoading ? '—' : formatCurrency(financial?.totalBalance ?? 0)}
            </div>
          </div>
        </div>
      </section>

      {/* Alerts */}
      <section>
        <div className="flex items-center gap-2.5 mb-3">
          <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-[#aaaaaa]">התראות</p>
          {!alertsLoading && alerts && alerts.length > 0 && (
            <span className="text-[11px] font-bold text-[#1a1a1a] bg-[#3D6A9E] px-2 py-0.5 rounded-full">
              {alerts.length}
            </span>
          )}
        </div>

        {alertsLoading ? (
          <div className="text-[13px] text-[#666666]">טוען...</div>
        ) : !alerts || alerts.length === 0 ? (
          <div
            className="rounded-lg px-5 py-8 text-center text-[13px] text-[#666666]"
            style={{ border: '1px solid #E5E7EB', background: '#FFFFFF' }}
          >
            אין התראות פתוחות
          </div>
        ) : (
          <div
            className="bg-white rounded-lg overflow-hidden"
            style={{ border: '1px solid #E5E7EB', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}
          >
            {alerts.map((alert, i) => (
              <Link
                key={i}
                href={`/projects/${alert.projectId}`}
                className="flex items-center gap-4 px-5 py-3.5 border-b border-[#f4f4f4] last:border-0 hover:bg-[#f8f8f8] transition-colors"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#3D6A9E] flex-shrink-0" />
                <span className="text-[13px] font-semibold text-[#1a1a1a] flex-1">{alert.projectTitle}</span>
                <span className="text-[#dddddd]">·</span>
                <span className="text-[13px] text-[#666666]">{alert.stageName}</span>
                <span className="text-[11px] text-[#666666] bg-[#F0F2F5] border border-[#dddddd] px-2 py-0.5 rounded-lg">
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
