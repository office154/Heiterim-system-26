import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'

export async function POST(req: NextRequest) {
  // Verify caller is admin
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { email, full_name, role } = (await req.json()) as {
    email: string
    full_name: string
    role: 'admin' | 'employee'
  }

  if (!email || !full_name || !role) {
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

  // Invite user — Supabase sends a magic-link email
  const origin = new URL(req.url).origin
  const { data: invited, error: inviteError } = await adminSupabase.auth.admin.inviteUserByEmail(
    email,
    { data: { full_name, role }, redirectTo: `${origin}/auth/callback` }
  )

  if (inviteError) {
    return NextResponse.json({ error: inviteError.message }, { status: 500 })
  }

  // Upsert profile row immediately so the name + role are set
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
