import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import nodemailer from 'nodemailer'

async function sendCredentialsEmail(email: string, full_name: string, password: string, origin: string) {
  const user = process.env.SMTP_USER
  const pass = process.env.SMTP_PASS
  if (!user || !pass) return // skip silently if not configured

  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: { user, pass },
  })

  await transporter.sendMail({
    from: `"הייתרים - ארכיטקטים" <${user}>`,
    to: email,
    subject: 'פרטי כניסה למערכת הייתרים',
    html: `
      <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
        <h2 style="color: #1a1a1a;">שלום ${full_name},</h2>
        <p style="color: #444;">נוסף/ת למערכת הניהול של הייתרים ארכיטקטים.</p>
        <p style="color: #444;">להלן פרטי הכניסה שלך:</p>
        <div style="background: #F0F2F5; border-radius: 8px; padding: 16px; margin: 16px 0;">
          <p style="margin: 4px 0;"><strong>אימייל:</strong> ${email}</p>
          <p style="margin: 4px 0;"><strong>סיסמה:</strong> ${password}</p>
        </div>
        <a href="${origin}/login" style="display: inline-block; background: #3D6A9E; color: white; padding: 10px 24px; border-radius: 8px; text-decoration: none; font-weight: bold;">כניסה למערכת</a>
        <p style="color: #999; font-size: 12px; margin-top: 24px;">מומלץ להחליף סיסמה לאחר הכניסה הראשונה.</p>
      </div>
    `,
  })
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { email, full_name, role, password } = (await req.json()) as {
    email: string
    full_name: string
    role: 'admin' | 'employee'
    password: string
  }

  if (!email || !full_name || !role || !password) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  }

  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!serviceRoleKey) {
    return NextResponse.json({ error: 'Service role key not configured' }, { status: 500 })
  }

  const adminSupabase = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceRoleKey
  )

  const origin = process.env.NEXT_PUBLIC_SITE_URL ?? new URL(req.url).origin

  // Step 1: send invite email via Supabase (uses configured SMTP)
  const { data: invited, error: inviteError } = await adminSupabase.auth.admin.inviteUserByEmail(
    email,
    { data: { full_name, role }, redirectTo: `${origin}/auth/callback` }
  )
  if (inviteError) {
    return NextResponse.json({ error: inviteError.message }, { status: 500 })
  }

  // Step 2: immediately set the admin-chosen password and confirm the email
  const { error: updateError } = await adminSupabase.auth.admin.updateUserById(
    invited.user.id,
    { password, email_confirm: true }
  )
  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 })
  }

  // Step 3: upsert profile row
  const { error: profileError } = await adminSupabase.from('profiles').upsert({
    id: invited.user.id,
    full_name,
    role,
    email,
  })
  if (profileError) {
    return NextResponse.json({ error: profileError.message }, { status: 500 })
  }

  // Step 4: send credentials email via Gmail SMTP
  await sendCredentialsEmail(email, full_name, password, origin)

  return NextResponse.json({ success: true })
}
