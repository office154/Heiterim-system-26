import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'

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
  // so the employee can log in right away without clicking the invite link
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

  return NextResponse.json({ success: true })
}
