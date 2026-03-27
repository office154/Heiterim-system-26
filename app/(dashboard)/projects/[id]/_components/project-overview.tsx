'use client'

import { useProjectStages } from '@/lib/hooks/use-stages'
import { useStatusRequirements } from '@/lib/hooks/use-requirements'
import { useProjectFiles } from '@/lib/hooks/use-files'
import { useCurrentRole } from '@/lib/hooks/use-profile'
import type { RequirementStatus } from '@/types/database'

interface ProjectOverviewProps {
  projectId: string
  onNavigate: (tab: string) => void
}

function formatPrice(n: number) {
  return `₪${n.toLocaleString('he-IL')}`
}

const REQ_STATUS_STYLE: Record<RequirementStatus, { bg: string; color: string }> = {
  'ממתין':       { bg: '#f3f4f6', color: '#6b7280' },
  'בטיפול':     { bg: '#dbeafe', color: '#1e40af' },
  'הוגש':       { bg: '#fef9c3', color: '#854d0e' },
  'התקבל':      { bg: '#dcfce7', color: '#166534' },
  'חזרו הערות': { bg: '#fee2e2', color: '#991b1b' },
}

function StatusBadge({ status }: { status: RequirementStatus }) {
  const s = REQ_STATUS_STYLE[status] ?? REQ_STATUS_STYLE['ממתין']
  return (
    <span
      style={{ background: s.bg, color: s.color }}
      className="rounded-[2px] px-2 py-0.5 text-[10px] font-semibold whitespace-nowrap"
    >
      {status}
    </span>
  )
}

function StageBadge({ stage }: { stage: { paid: boolean; invoice_sent: boolean; completed: boolean } }) {
  if (stage.paid)
    return <span style={{ background: '#dcfce7', color: '#166534' }} className="rounded-[2px] px-2 py-0.5 text-[10px] font-semibold whitespace-nowrap">שולם</span>
  if (stage.invoice_sent)
    return <span style={{ background: '#fef9c3', color: '#854d0e' }} className="rounded-[2px] px-2 py-0.5 text-[10px] font-semibold whitespace-nowrap">חשבונית</span>
  if (stage.completed)
    return <span style={{ background: '#dbeafe', color: '#1e40af' }} className="rounded-[2px] px-2 py-0.5 text-[10px] font-semibold whitespace-nowrap">בוצע</span>
  return <span style={{ background: '#f3f4f6', color: '#6b7280' }} className="rounded-[2px] px-2 py-0.5 text-[10px] font-semibold whitespace-nowrap">ממתין</span>
}

export function ProjectOverview({ projectId, onNavigate }: ProjectOverviewProps) {
  const { data: stages = [] } = useProjectStages(projectId)
  const { data: requirements = [] } = useStatusRequirements(projectId)
  const { data: files = [] } = useProjectFiles(projectId)
  const { data: role } = useCurrentRole()
  const isAdmin = role === 'admin'

  const totalContract = stages.reduce((sum, s) => sum + s.price + (s.extra_payment || 0), 0)
  const totalPaid = stages.filter((s) => s.paid).reduce((sum, s) => sum + s.price + (s.extra_payment || 0), 0)
  const balance = totalContract - totalPaid
  const paidPct = totalContract > 0 ? Math.round((totalPaid / totalContract) * 100) : 0

  const completedReqs = requirements.filter((r) => r.status === 'התקבל').length
  const reqPct = requirements.length > 0 ? Math.round((completedReqs / requirements.length) * 100) : 0

  const previewStages = stages.slice(0, 4)
  const previewReqs = requirements.slice(0, 4)
  const previewFiles = files.slice(0, 4)

  return (
    <div className="space-y-4 mb-6">
      {/* ── KPI Strip ── */}
      <div className={`grid gap-3 ${isAdmin ? 'grid-cols-2 sm:grid-cols-4' : 'grid-cols-2'}`}>
        {isAdmin && (
          <>
            <button
              onClick={() => onNavigate('stages')}
              className="rounded-[2px] border border-[#dddddd] bg-white p-3 text-center transition-shadow hover:shadow-md"
              style={{ boxShadow: '0 2px 0 #cccccc, 0 4px 12px rgba(0,0,0,0.05)' }}
            >
              <div className="text-xl font-black text-[#2E7D5B]">{formatPrice(totalPaid)}</div>
              <div className="text-[10px] text-[#888] mt-1">שולם</div>
            </button>
            <button
              onClick={() => onNavigate('stages')}
              className="rounded-[2px] border border-[#dddddd] bg-white p-3 text-center transition-shadow hover:shadow-md"
              style={{ boxShadow: '0 2px 0 #cccccc, 0 4px 12px rgba(0,0,0,0.05)' }}
            >
              <div className={`text-xl font-black ${balance > 0 ? 'text-[#C62828]' : 'text-[#2E7D5B]'}`}>
                {formatPrice(balance)}
              </div>
              <div className="text-[10px] text-[#888] mt-1">יתרה לגביה</div>
            </button>
          </>
        )}
        <button
          onClick={() => onNavigate('status')}
          className="rounded-[2px] border border-[#dddddd] bg-white p-3 text-center transition-shadow hover:shadow-md"
          style={{ boxShadow: '0 2px 0 #cccccc, 0 4px 12px rgba(0,0,0,0.05)' }}
        >
          <div className="text-xl font-black text-[#1a1a1a]">
            {completedReqs} / {requirements.length}
          </div>
          <div className="text-[10px] text-[#888] mt-1">דרישות הושלמו</div>
        </button>
        <button
          onClick={() => onNavigate('files')}
          className="rounded-[2px] border border-[#dddddd] bg-white p-3 text-center transition-shadow hover:shadow-md"
          style={{ boxShadow: '0 2px 0 #cccccc, 0 4px 12px rgba(0,0,0,0.05)' }}
        >
          <div className="text-xl font-black text-[#1a1a1a]">{files.length}</div>
          <div className="text-[10px] text-[#888] mt-1">קבצים</div>
        </button>
      </div>

      {/* ── Panels ── */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Status */}
        <div
          className="rounded-[2px] border border-[#dddddd] bg-white overflow-hidden cursor-pointer group transition-shadow hover:shadow-md"
          style={{ boxShadow: '0 2px 0 #cccccc, 0 4px 12px rgba(0,0,0,0.05)' }}
          onClick={() => onNavigate('status')}
        >
          <div className="flex items-center justify-between px-4 py-3 border-b border-[#f0f0f0]">
            <span className="text-[12px] font-bold text-[#1a1a1a]">דוח סטטוס</span>
            <span className="text-[11px] text-[#E8C420] font-semibold group-hover:underline">
              לדוח המלא ←
            </span>
          </div>
          {requirements.length > 0 && (
            <div className="px-4 pt-3 pb-1">
              <div className="h-1.5 rounded-full bg-[#f0f0f0] overflow-hidden">
                <div
                  className="h-full bg-[#E8C420] rounded-full transition-all"
                  style={{ width: `${reqPct}%` }}
                />
              </div>
              <p className="text-[10px] text-[#888] mt-1">{reqPct}% הושלמו</p>
            </div>
          )}
          <div className="px-4 py-2">
            {previewReqs.length === 0 ? (
              <p className="text-[11px] text-[#aaa] italic py-2">אין דרישות</p>
            ) : (
              previewReqs.map((req) => (
                <div
                  key={req.id}
                  className="flex items-center justify-between py-1.5 border-b border-[#f5f5f5] last:border-0"
                >
                  <span className="text-[11px] text-[#333] truncate ml-2">{req.requirement}</span>
                  <StatusBadge status={req.status} />
                </div>
              ))
            )}
            {requirements.length > 4 && (
              <p className="text-[10px] text-[#aaa] pt-1">+ {requirements.length - 4} דרישות נוספות</p>
            )}
          </div>
        </div>

        {/* Payments */}
        <div
          className="rounded-[2px] border border-[#dddddd] bg-white overflow-hidden cursor-pointer group transition-shadow hover:shadow-md"
          style={{ boxShadow: '0 2px 0 #cccccc, 0 4px 12px rgba(0,0,0,0.05)' }}
          onClick={() => onNavigate('stages')}
        >
          <div className="flex items-center justify-between px-4 py-3 border-b border-[#f0f0f0]">
            <span className="text-[12px] font-bold text-[#1a1a1a]">תשלומים</span>
            <span className="text-[11px] text-[#E8C420] font-semibold group-hover:underline">
              לכל התשלומים ←
            </span>
          </div>
          {isAdmin && totalContract > 0 && (
            <div className="px-4 pt-3 pb-1">
              <div className="h-1.5 rounded-full bg-[#f0f0f0] overflow-hidden">
                <div
                  className="h-full bg-[#E8C420] rounded-full transition-all"
                  style={{ width: `${paidPct}%` }}
                />
              </div>
              <p className="text-[10px] text-[#888] mt-1">{paidPct}% שולם</p>
            </div>
          )}
          <div className="px-4 py-2">
            {previewStages.length === 0 ? (
              <p className="text-[11px] text-[#aaa] italic py-2">אין שלבים</p>
            ) : (
              previewStages.map((stage) => (
                <div
                  key={stage.id}
                  className="flex items-center justify-between py-1.5 border-b border-[#f5f5f5] last:border-0"
                >
                  <span className="text-[11px] text-[#333] truncate ml-2">{stage.name}</span>
                  <StageBadge stage={stage} />
                </div>
              ))
            )}
            {stages.length > 4 && (
              <p className="text-[10px] text-[#aaa] pt-1">+ {stages.length - 4} שלבים נוספים</p>
            )}
          </div>
        </div>

        {/* Files */}
        <div
          className="rounded-[2px] border border-[#dddddd] bg-white overflow-hidden cursor-pointer group transition-shadow hover:shadow-md"
          style={{ boxShadow: '0 2px 0 #cccccc, 0 4px 12px rgba(0,0,0,0.05)' }}
          onClick={() => onNavigate('files')}
        >
          <div className="flex items-center justify-between px-4 py-3 border-b border-[#f0f0f0]">
            <span className="text-[12px] font-bold text-[#1a1a1a]">קבצים</span>
            <span className="text-[11px] text-[#E8C420] font-semibold group-hover:underline">
              לכל הקבצים ←
            </span>
          </div>
          <div className="px-4 py-2">
            {previewFiles.length === 0 ? (
              <p className="text-[11px] text-[#aaa] italic py-2">אין קבצים</p>
            ) : (
              previewFiles.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center justify-between py-1.5 border-b border-[#f5f5f5] last:border-0"
                >
                  <span className="text-[11px] text-[#333] truncate ml-2">{file.file_name}</span>
                  <span className="text-[10px] text-[#aaa] whitespace-nowrap">
                    {file.file_size ? `${(file.file_size / 1024).toFixed(0)}KB` : ''}
                  </span>
                </div>
              ))
            )}
            {files.length > 4 && (
              <p className="text-[10px] text-[#aaa] pt-1">+ {files.length - 4} קבצים נוספים</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
