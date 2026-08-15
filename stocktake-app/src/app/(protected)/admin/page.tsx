export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import AdminUserList from '@/components/AdminUserList'

export default async function AdminPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user!.id).single()

  if (profile?.role !== 'admin') redirect('/')

  const { data: users } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-bold">Admin Panel</h1>
        <p className="text-slate-500 text-sm mt-1">Manage user roles, branches, and departments.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Users</CardTitle>
          <CardDescription>Set each user's role, branch, and department to control what they can see and do.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <AdminUserList users={users || []} currentUserId={user!.id} />
        </CardContent>
      </Card>
    </div>
  )
}
