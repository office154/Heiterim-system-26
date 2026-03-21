import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Sidebar from '@/components/sidebar'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, role')
    .eq('id', user.id)
    .single()

  return (
    <div className="flex min-h-screen">
      <Sidebar
        role={profile?.role ?? 'employee'}
        fullName={profile?.full_name ?? user.email ?? ''}
      />
      <main className="flex-1 p-8 overflow-auto bg-[#f0f0f0] min-h-screen">{children}</main>
    </div>
  )
}
