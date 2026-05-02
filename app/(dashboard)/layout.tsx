import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Sidebar from '@/components/sidebar'
import { ResizableLayout } from '@/components/resizable-layout'

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
    <ResizableLayout
      sidebar={
        <Sidebar
          role={profile?.role ?? 'employee'}
          fullName={profile?.full_name ?? user.email ?? ''}
        />
      }
    >
      {children}
    </ResizableLayout>
  )
}
