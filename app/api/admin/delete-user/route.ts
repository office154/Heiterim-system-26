import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'

export async function DELETE(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase
    .from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin')
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { userId } = await req.json() as { userId: string }
  if (!userId) return NextResponse.json({ error: 'Missing userId' }, { status: 400 })
  if (userId === user.id)
    return NextResponse.json({ error: 'לא ניתן למחוק את עצמך' }, { status: 400 })

  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!serviceRoleKey)
    return NextResponse.json({ error: 'Service role key not configured' }, { status: 500 })

  const adminSupabase = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceRoleKey
  )

  const { error } = await adminSupabase.auth.admin.deleteUser(userId)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ success: true })
}
