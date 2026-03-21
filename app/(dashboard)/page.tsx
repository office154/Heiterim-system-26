import { createClient } from '@/lib/supabase/server'
import { DashboardContent } from './_components/dashboard-content'

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, role')
    .eq('id', user!.id)
    .single()

  return (
    <DashboardContent
      role={profile?.role ?? 'employee'}
      fullName={profile?.full_name ?? user?.email ?? 'משתמש'}
    />
  )
}
