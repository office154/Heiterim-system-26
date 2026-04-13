'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useCurrentRole } from '@/lib/hooks/use-profile'
import { useProfiles, useUpdateProfile } from '@/lib/hooks/use-users'
import type { Profile, UserRole } from '@/types/database'
import { Breadcrumb } from '@/components/shared/Breadcrumb'
import { useResizableColumns } from '@/lib/hooks/use-resizable-columns'
import { ResizableTh } from '@/components/ui/resizable-th'

function RoleSelect({ profile }: { profile: Profile }) {
  const { mutate: update } = useUpdateProfile()
  return (
    <select
      value={profile.role}
      onChange={(e) => update({ id: profile.id, role: e.target.value as UserRole })}
      className="text-[12px] border border-[#E5E7EB] rounded-md px-2 py-1 bg-white text-[#0F172A] focus:outline-none focus:ring-1 focus:ring-[#6366F1]"
    >
      <option value="admin">מנהל</option>
      <option value="employee">עובד</option>
    </select>
  )
}

export default function SettingsUsersPage() {
  const router = useRouter()
  const { data: role, isLoading: roleLoading } = useCurrentRole()
  const { data: profiles, isLoading: profilesLoading } = useProfiles()
  const { widths, startResize } = useResizableColumns([220, 260, 150])

  const [showInvite, setShowInvite] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteName, setInviteName] = useState('')
  const [inviteRole, setInviteRole] = useState<UserRole>('employee')
  const [inviting, setInviting] = useState(false)
  const [inviteError, setInviteError] = useState('')
  const [inviteSuccess, setInviteSuccess] = useState(false)

  useEffect(() => {
    if (!roleLoading && role === 'employee') router.replace('/')
  }, [role, roleLoading, router])

  if (roleLoading || role !== 'admin') return null

  async function handleInvite() {
    setInviting(true)
    setInviteError('')
    setInviteSuccess(false)
    try {
      const res = await fetch('/api/admin/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: inviteEmail, full_name: inviteName, role: inviteRole }),
      })
      const json = await res.json()
      if (!res.ok) {
        setInviteError(json.error ?? 'שגיאה בהזמנה')
      } else {
        setInviteSuccess(true)
        setInviteEmail('')
        setInviteName('')
        setInviteRole('employee')
        setShowInvite(false)
      }
    } catch {
      setInviteError('שגיאה בשליחת הבקשה')
    } finally {
      setInviting(false)
    }
  }

  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ label: 'דשבורד', href: '/' }, { label: 'הגדרות' }, { label: 'ניהול משתמשים' }]} />
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-[20px] font-bold text-[#0F172A] tracking-tight">ניהול משתמשים</h1>
        <button
          onClick={() => { setShowInvite(true); setInviteSuccess(false) }}
          className="inline-flex items-center px-4 py-2 bg-[#6366F1] text-white text-[13px] font-semibold rounded-md hover:bg-[#4F46E5] transition-colors"
        >
          + הזמן משתמש
        </button>
      </div>

      {inviteSuccess && (
        <div className="border border-emerald-200 bg-emerald-50 text-emerald-700 rounded-lg px-4 py-3 text-[13px]">
          הזמנה נשלחה בהצלחה
        </div>
      )}

      {/* Invite form */}
      {showInvite && (
        <div className="bg-white border border-[#E5E7EB] rounded-lg p-6 space-y-4">
          <p className="text-[13px] font-semibold text-[#0F172A]">הזמנת משתמש חדש</p>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-widest text-[#64748B] mb-1.5">שם מלא</label>
              <input
                type="text"
                value={inviteName}
                onChange={(e) => setInviteName(e.target.value)}
                className="w-full border border-[#E5E7EB] rounded-md px-3 py-2 text-[13px] text-[#0F172A] focus:outline-none focus:ring-1 focus:ring-[#6366F1] bg-white"
                placeholder="שם מלא"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-widest text-[#64748B] mb-1.5">אימייל</label>
              <input
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                className="w-full border border-[#E5E7EB] rounded-md px-3 py-2 text-[13px] text-[#0F172A] focus:outline-none focus:ring-1 focus:ring-[#6366F1] bg-white"
                placeholder="email@example.com"
                dir="ltr"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-widest text-[#64748B] mb-1.5">תפקיד</label>
              <select
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value as UserRole)}
                className="w-full border border-[#E5E7EB] rounded-md px-3 py-2 text-[13px] text-[#0F172A] bg-white focus:outline-none focus:ring-1 focus:ring-[#6366F1]"
              >
                <option value="employee">עובד</option>
                <option value="admin">מנהל</option>
              </select>
            </div>
          </div>
          {inviteError && <p className="text-[13px] text-red-600">{inviteError}</p>}
          <div className="flex gap-3 pt-1">
            <button
              onClick={handleInvite}
              disabled={inviting || !inviteEmail || !inviteName}
              className="px-4 py-2 bg-[#6366F1] text-white text-[13px] font-semibold rounded-md hover:bg-[#4F46E5] disabled:opacity-40 transition-colors"
            >
              {inviting ? 'שולח...' : 'שלח הזמנה'}
            </button>
            <button
              onClick={() => setShowInvite(false)}
              className="px-4 py-2 text-[13px] text-[#64748B] hover:text-[#0F172A] transition-colors"
            >
              ביטול
            </button>
          </div>
        </div>
      )}

      {/* Users table */}
      <div className="bg-white border border-[#E5E7EB] rounded-lg overflow-hidden">
        {profilesLoading ? (
          <div className="py-12 text-center text-[13px] text-[#64748B]">טוען...</div>
        ) : (
          <table className="w-full text-[13px]" style={{ tableLayout: 'fixed' }}>
            <thead>
              <tr className="border-b border-[#E5E7EB]">
                <ResizableTh width={widths[0]} onResizeStart={startResize(0)} className="px-5 py-3 text-right text-[11px] font-semibold uppercase tracking-widest text-[#64748B]">שם</ResizableTh>
                <ResizableTh width={widths[1]} onResizeStart={startResize(1)} className="px-5 py-3 text-right text-[11px] font-semibold uppercase tracking-widest text-[#64748B]">אימייל</ResizableTh>
                <ResizableTh width={widths[2]} onResizeStart={startResize(2)} className="px-5 py-3 text-right text-[11px] font-semibold uppercase tracking-widest text-[#64748B]">תפקיד</ResizableTh>
              </tr>
            </thead>
            <tbody>
              {(profiles ?? []).map((p) => (
                <tr key={p.id} className="border-b border-[#F6F7F9] last:border-0 hover:bg-[#F6F7F9] transition-colors">
                  <td className="px-5 py-3.5 font-semibold text-[#0F172A]">{p.full_name}</td>
                  <td className="px-5 py-3.5 text-[#64748B]" dir="ltr">{p.email ?? '—'}</td>
                  <td className="px-5 py-3.5">
                    <RoleSelect profile={p} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
