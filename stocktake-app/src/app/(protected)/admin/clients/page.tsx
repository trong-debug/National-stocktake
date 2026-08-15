export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import AdminClientsManager from '@/components/AdminClientsManager'

export default async function AdminClientsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user!.id).single()

  if (profile?.role !== 'admin') redirect('/')

  const { data: clients } = await supabase
    .from('clients')
    .select('id, name, active')
    .order('name')

  return <AdminClientsManager initialClients={clients || []} />
}
