import { createClient } from '@/lib/supabase/server'
import DashboardCards from './_components/dashboard-cards'

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
    <div className="space-y-6">
      <div>
        <h1 className="text-[20px] font-bold text-[#0F172A] tracking-tight">
          שלום, {profile?.full_name ?? 'משתמש'} 👋
        </h1>
        <p className="text-[13px] text-[#64748B] mt-1">ברוך הבא למערכת ניהול המשימות</p>
      </div>

      {profile?.role === 'admin' && <DashboardCards />}
    </div>
  )
}
