'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useCurrentRole } from '@/lib/hooks/use-profile'
import { useProfiles, useUpdateProfile } from '@/lib/hooks/use-users'
import { createClient } from '@/lib/supabase/client'
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
      className="text-[12px] border border-[#E5E7EB] rounded-md px-2 py-1 bg-white text-[#0F172A] focus:outline-none focus:ring-1 focus:ring-[#3D6A9E]"
    >
      <option value="admin">מנהל</option>
      <option value="employee">עובד</option>
    </select>
  )
}

function UserActions({ profile, currentUserId }: { profile: Profile; currentUserId: string }) {
  const queryClient = useQueryClient()
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [resetting, setResetting] = useState(false)
  const [feedback, setFeedback] = useState<{ type: 'ok' | 'err'; msg: string } | null>(null)

  const isSelf = profile.id === currentUserId

  function showFeedback(type: 'ok' | 'err', msg: string) {
    setFeedback({ type, msg })
    setTimeout(() => setFeedback(null), 3000)
  }

  async function handleResetPassword() {
    if (!profile.email) return
    setResetting(true)
    const supabase = createClient()
    const { error } = await supabase.auth.resetPasswordForEmail(profile.email, {
      redirectTo: `${window.location.origin}/auth/callback`,
    })
    setResetting(false)
    if (error) showFeedback('err', 'שגיאה בשליחה')
    else showFeedback('ok', 'מייל נשלח ✓')
  }

  async function handleDelete() {
    setDeleting(true)
    const res = await fetch('/api/admin/delete-user', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: profile.id }),
    })
    const json = await res.json()
    setDeleting(false)
    if (!res.ok) {
      setConfirmDelete(false)
      showFeedback('err', json.error ?? 'שגיאה במחיקה')
    } else {
      queryClient.invalidateQueries({ queryKey: ['profiles'] })
    }
  }

  if (isSelf) return <span className="text-[11px] text-[#9CA3AF]">אתה</span>

  if (feedback) {
    return (
      <span className={`text-[12px] font-medium ${feedback.type === 'ok' ? 'text-emerald-600' : 'text-red-500'}`}>
        {feedback.msg}
      </span>
    )
  }

  if (confirmDelete) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-[12px] text-[#0F172A]">למחוק?</span>
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="text-[12px] font-semibold text-white bg-[#C0392B] rounded px-2 py-0.5 hover:bg-[#a93226] disabled:opacity-50"
        >
          {deleting ? '...' : 'כן'}
        </button>
        <button
          onClick={() => setConfirmDelete(false)}
          className="text-[12px] text-[#64748B] hover:text-[#0F172A]"
        >
          ביטול
        </button>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={handleResetPassword}
        disabled={resetting || !profile.email}
        className="text-[12px] text-[#3D6A9E] hover:underline disabled:opacity-40 disabled:no-underline"
      >
        {resetting ? 'שולח...' : 'איפוס סיסמה'}
      </button>
      <span className="text-[#E5E7EB]">|</span>
      <button
        onClick={() => setConfirmDelete(true)}
        className="text-[12px] text-[#C0392B] hover:underline"
      >
        מחק
      </button>
    </div>
  )
}

export default function SettingsUsersPage() {
  const router = useRouter()
  const { data: role, isLoading: roleLoading } = useCurrentRole()
  const { data: profiles, isLoading: profilesLoading } = useProfiles()
  const { widths, startResize } = useResizableColumns([200, 240, 120, 180])

  const [currentUserId, setCurrentUserId] = useState('')
  const [showInvite, setShowInvite] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteName, setInviteName] = useState('')
  const [inviteRole, setInviteRole] = useState<UserRole>('employee')
  const [invitePassword, setInvitePassword] = useState('')
  const [showInvitePassword, setShowInvitePassword] = useState(false)
  const [inviting, setInviting] = useState(false)
  const [inviteError, setInviteError] = useState('')
  const [inviteSuccess, setInviteSuccess] = useState(false)

  useEffect(() => {
    if (!roleLoading && role === 'employee') router.replace('/')
  }, [role, roleLoading, router])

  useEffect(() => {
    createClient().auth.getUser().then(({ data }) => {
      if (data.user) setCurrentUserId(data.user.id)
    })
  }, [])

  if (roleLoading || role !== 'admin') return null

  async function handleInvite() {
    setInviting(true)
    setInviteError('')
    setInviteSuccess(false)
    try {
      const res = await fetch('/api/admin/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: inviteEmail, full_name: inviteName, role: inviteRole, password: invitePassword }),
      })
      const json = await res.json()
      if (!res.ok) {
        setInviteError(json.error ?? 'שגיאה בהזמנה')
      } else {
        setInviteSuccess(true)
        setInviteEmail('')
        setInviteName('')
        setInviteRole('employee')
        setInvitePassword('')
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

      <div className="flex items-center justify-between">
        <h1 className="text-[20px] font-bold text-[#0F172A] tracking-tight">ניהול משתמשים</h1>
        <button
          onClick={() => { setShowInvite(true); setInviteSuccess(false) }}
          className="inline-flex items-center px-4 py-2 bg-[#3D6A9E] text-white text-[13px] font-semibold rounded-md hover:bg-[#2F5A8A] transition-colors"
        >
          + הזמן משתמש
        </button>
      </div>

      {inviteSuccess && (
        <div className="border border-emerald-200 bg-emerald-50 text-emerald-700 rounded-lg px-4 py-3 text-[13px]">
          המשתמש נוצר בהצלחה — הוא יכול להיכנס עם האימייל והסיסמה שהגדרת
        </div>
      )}

      {showInvite && (
        <div className="bg-white border border-[#E5E7EB] rounded-lg p-6 space-y-4">
          <p className="text-[13px] font-semibold text-[#0F172A]">הזמנת משתמש חדש</p>
          <div className="grid grid-cols-4 gap-4">
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-widest text-[#64748B] mb-1.5">שם מלא</label>
              <input
                type="text"
                value={inviteName}
                onChange={(e) => setInviteName(e.target.value)}
                className="w-full border border-[#E5E7EB] rounded-md px-3 py-2 text-[13px] text-[#0F172A] focus:outline-none focus:ring-1 focus:ring-[#3D6A9E] bg-white"
                placeholder="שם מלא"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-widest text-[#64748B] mb-1.5">אימייל</label>
              <input
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                className="w-full border border-[#E5E7EB] rounded-md px-3 py-2 text-[13px] text-[#0F172A] focus:outline-none focus:ring-1 focus:ring-[#3D6A9E] bg-white"
                placeholder="email@example.com"
                dir="ltr"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-widests text-[#64748B] mb-1.5">תפקיד</label>
              <select
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value as UserRole)}
                className="w-full border border-[#E5E7EB] rounded-md px-3 py-2 text-[13px] text-[#0F172A] bg-white focus:outline-none focus:ring-1 focus:ring-[#3D6A9E]"
              >
                <option value="employee">עובד</option>
                <option value="admin">מנהל</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-widest text-[#64748B] mb-1.5">סיסמה</label>
              <div className="relative">
                <input
                  type={showInvitePassword ? 'text' : 'password'}
                  value={invitePassword}
                  onChange={(e) => setInvitePassword(e.target.value)}
                  className="w-full border border-[#E5E7EB] rounded-md pl-9 pr-3 py-2 text-[13px] text-[#0F172A] focus:outline-none focus:ring-1 focus:ring-[#3D6A9E] bg-white"
                  placeholder="לפחות 6 תווים"
                  dir="ltr"
                />
                <button
                  type="button"
                  onClick={() => setShowInvitePassword((v) => !v)}
                  className="absolute left-2 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#64748B]"
                  tabIndex={-1}
                >
                  {showInvitePassword ? '🙈' : '👁'}
                </button>
              </div>
            </div>
          </div>
          {inviteError && <p className="text-[13px] text-red-600">{inviteError}</p>}
          <div className="flex gap-3 pt-1">
            <button
              onClick={handleInvite}
              disabled={inviting || !inviteEmail || !inviteName || invitePassword.length < 6}
              className="px-4 py-2 bg-[#3D6A9E] text-white text-[13px] font-semibold rounded-md hover:bg-[#2F5A8A] disabled:opacity-40 transition-colors"
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
                <ResizableTh width={widths[3]} onResizeStart={startResize(3)} className="px-5 py-3 text-right text-[11px] font-semibold uppercase tracking-widest text-[#64748B]">פעולות</ResizableTh>
              </tr>
            </thead>
            <tbody>
              {(profiles ?? []).map((p) => (
                <tr key={p.id} className="border-b border-[#F6F7F9] last:border-0 hover:bg-[#F6F7F9] transition-colors">
                  <td className="px-5 py-3.5 font-semibold text-[#0F172A]">{p.full_name}</td>
                  <td className="px-5 py-3.5 text-[#64748B]" dir="ltr">{p.email ?? '—'}</td>
                  <td className="px-5 py-3.5"><RoleSelect profile={p} /></td>
                  <td className="px-5 py-3.5">
                    <UserActions profile={p} currentUserId={currentUserId} />
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
