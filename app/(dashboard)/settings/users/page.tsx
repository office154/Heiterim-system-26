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

function downloadCredentialsPDF(name: string, email: string, password: string, origin: string) {
  const logoUrl = `${origin}/logo.png`
  const html = `<!DOCTYPE html>
<html dir="rtl" lang="he">
<head>
  <meta charset="UTF-8">
  <title>פרטי כניסה — ${name}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Rubik:wght@400;500;600;700;900&display=swap');
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Rubik', Arial, sans-serif;
      background: white;
      padding: 0;
      margin: 0;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .page {
      background: white;
      width: 100%;
      max-width: 600px;
      margin: 0 auto;
      overflow: hidden;
    }
    .header {
      background: #3D6A9E;
      padding: 32px 40px;
      display: flex;
      align-items: center;
      gap: 16px;
    }
    .header img {
      height: 48px;
      width: auto;
      object-fit: contain;
      filter: brightness(0) invert(1);
    }
    .header-text { color: white; }
    .header-title {
      font-size: 20px;
      font-weight: 900;
      letter-spacing: -0.3px;
      line-height: 1.2;
    }
    .header-sub {
      font-size: 12px;
      opacity: 0.75;
      margin-top: 2px;
    }
    .body { padding: 36px 40px; }
    .welcome-line {
      font-size: 22px;
      font-weight: 800;
      color: #1a1a1a;
      margin-bottom: 8px;
    }
    .welcome-sub {
      font-size: 13px;
      color: #6B7280;
      line-height: 1.6;
      margin-bottom: 28px;
    }
    .credentials-box {
      background: #F8FAFC;
      border: 1px solid #E5E7EB;
      border-radius: 12px;
      overflow: hidden;
      margin-bottom: 28px;
    }
    .cred-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 14px 20px;
      border-bottom: 1px solid #E5E7EB;
    }
    .cred-row:last-child { border-bottom: none; }
    .cred-label {
      font-size: 12px;
      font-weight: 600;
      color: #6B7280;
      text-transform: uppercase;
      letter-spacing: 0.06em;
    }
    .cred-value {
      font-size: 14px;
      font-weight: 700;
      color: #1a1a1a;
      direction: ltr;
      text-align: left;
    }
    .cred-value.password {
      background: #EBF1F9;
      color: #3D6A9E;
      padding: 4px 12px;
      border-radius: 6px;
      font-family: monospace;
      font-size: 15px;
      letter-spacing: 0.05em;
    }
    .login-btn {
      display: block;
      background: #3D6A9E;
      color: white;
      text-decoration: none;
      text-align: center;
      padding: 13px;
      border-radius: 10px;
      font-size: 14px;
      font-weight: 700;
      margin-bottom: 24px;
    }
    .footer {
      border-top: 1px solid #E5E7EB;
      padding: 16px 40px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .footer-note {
      font-size: 11px;
      color: #9CA3AF;
      line-height: 1.5;
    }
    .footer-contact {
      font-size: 11px;
      color: #3D6A9E;
      text-decoration: none;
    }
    @media print {
      .page { max-width: 100%; }
    }
  </style>
</head>
<body>
  <div class="page">
    <div class="header">
      <img src="${logoUrl}" alt="הייתרים" onerror="this.style.display='none'">
      <div class="header-text">
        <div class="header-title">הייתרים ארכיטקטים</div>
        <div class="header-sub">מערכת ניהול פרויקטים</div>
      </div>
    </div>
    <div class="body">
      <div class="welcome-line">ברוכה הבאה, ${name}!</div>
      <p class="welcome-sub">
        נוספת למערכת הניהול של הייתרים ארכיטקטים.<br>
        להלן פרטי הכניסה שלך — שמרי אותם במקום בטוח.
      </p>
      <div class="credentials-box">
        <div class="cred-row">
          <span class="cred-label">שם מלא</span>
          <span class="cred-value">${name}</span>
        </div>
        <div class="cred-row">
          <span class="cred-label">אימייל</span>
          <span class="cred-value">${email}</span>
        </div>
        <div class="cred-row">
          <span class="cred-label">סיסמה</span>
          <span class="cred-value password">${password}</span>
        </div>
      </div>
      <a href="${origin}/login" class="login-btn">כניסה למערכת ←</a>
    </div>
    <div class="footer">
      <span class="footer-note">מומלץ להחליף סיסמה לאחר הכניסה הראשונה.</span>
      <a href="mailto:office@heiterim.co.il" class="footer-contact">office@heiterim.co.il</a>
    </div>
  </div>
  <script>
    window.onload = function() {
      setTimeout(function() { window.print(); }, 500);
    };
  </script>
</body>
</html>`

  const win = window.open('', '_blank', 'width=600,height=800')
  if (win) {
    win.document.write(html)
    win.document.close()
  }
}

interface InviteResult {
  name: string
  email: string
  password: string
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
  const [inviteResult, setInviteResult] = useState<InviteResult | null>(null)

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
        setInviteResult({ name: inviteName, email: inviteEmail, password: invitePassword })
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
          onClick={() => { setShowInvite(true); setInviteResult(null) }}
          className="inline-flex items-center px-4 py-2 bg-[#3D6A9E] text-white text-[13px] font-semibold rounded-md hover:bg-[#2F5A8A] transition-colors"
        >
          + הזמן משתמש
        </button>
      </div>

      {/* Success card with credentials */}
      {inviteResult && (
        <div className="bg-white border border-emerald-200 rounded-lg overflow-hidden shadow-sm">
          <div className="bg-emerald-600 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-white text-lg">✓</span>
              <span className="text-white font-semibold text-[14px]">המשתמש נוצר בהצלחה</span>
            </div>
            <button
              onClick={() => setInviteResult(null)}
              className="text-white/70 hover:text-white text-[18px] leading-none"
            >
              ×
            </button>
          </div>
          <div className="px-6 py-5">
            <p className="text-[13px] text-[#6B7280] mb-4">
              שמרי את פרטי הכניסה ושלחי לעובד. לחצי על &quot;הורד PDF&quot; לקבלת דף מסודר עם פרטי הכניסה.
            </p>
            <div className="bg-[#F8FAFC] border border-[#E5E7EB] rounded-lg overflow-hidden mb-5">
              <div className="flex justify-between items-center px-4 py-3 border-b border-[#E5E7EB]">
                <span className="text-[11px] font-semibold uppercase tracking-widest text-[#6B7280]">שם</span>
                <span className="text-[13px] font-semibold text-[#0F172A]">{inviteResult.name}</span>
              </div>
              <div className="flex justify-between items-center px-4 py-3 border-b border-[#E5E7EB]">
                <span className="text-[11px] font-semibold uppercase tracking-widest text-[#6B7280]">אימייל</span>
                <span className="text-[13px] font-semibold text-[#0F172A]" dir="ltr">{inviteResult.email}</span>
              </div>
              <div className="flex justify-between items-center px-4 py-3">
                <span className="text-[11px] font-semibold uppercase tracking-widest text-[#6B7280]">סיסמה</span>
                <span className="text-[13px] font-bold bg-[#EBF1F9] text-[#3D6A9E] px-3 py-1 rounded-md font-mono" dir="ltr">
                  {inviteResult.password}
                </span>
              </div>
            </div>
            <button
              onClick={() => downloadCredentialsPDF(inviteResult.name, inviteResult.email, inviteResult.password, window.location.origin)}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#3D6A9E] text-white text-[13px] font-semibold rounded-md hover:bg-[#2F5A8A] transition-colors"
            >
              <span>↓</span>
              הורד PDF לשליחה לעובד
            </button>
          </div>
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
                  className="w-full border border-[#E5E7EB] rounded-md px-3 pr-10 py-2 text-[13px] text-[#0F172A] focus:outline-none focus:ring-1 focus:ring-[#3D6A9E] bg-white"
                  placeholder="לפחות 6 תווים"
                  dir="ltr"
                />
                <button
                  type="button"
                  onClick={() => setShowInvitePassword((v) => !v)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#64748B]"
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
