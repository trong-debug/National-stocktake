export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import type { Branch, StockItem } from '@/types'
import { notFound } from 'next/navigation'
import BranchPageClient from '@/components/BranchPageClient'

const VALID_BRANCHES = ['PER', 'ADL', 'QLD', 'VIC', 'CBR', 'NSW', 'NTL']

interface PageProps {
  params: Promise<{ branch: string }>
  searchParams: Promise<{ status?: string; dept?: string; q?: string; page?: string }>
}

export default async function BranchPage({ params, searchParams }: PageProps) {
  const { branch: branchParam } = await params
  const { status, dept, q, page } = await searchParams

  const branch = branchParam.toUpperCase() as Branch
  if (!VALID_BRANCHES.includes(branch)) notFound()

  const supabase = await createClient()

  const pageNum = parseInt(page || '1', 10)
  const pageSize = 50
  const from = (pageNum - 1) * pageSize
  const to = from + pageSize - 1

  let itemsQuery = supabase
    .from('stock_items')
    .select('*, status_code_details:status_codes(code,description,dept_first)', { count: 'exact' })
    .eq('branch', branch)
    .order('created_at', { ascending: false })
    .range(from, to)

  const effectiveStatus = status ?? 'in_progress'
  if (effectiveStatus !== 'all') itemsQuery = itemsQuery.eq('status', effectiveStatus)
  if (dept && dept !== 'all') {
    if (dept === 'unassigned') itemsQuery = itemsQuery.is('dept_assigned', null)
    else itemsQuery = itemsQuery.eq('dept_assigned', dept)
  }
  if (q) {
    itemsQuery = itemsQuery.or(
      `client.ilike.%${q}%,serial.ilike.%${q}%,tracking.ilike.%${q}%,customer_name.ilike.%${q}%,action_required.ilike.%${q}%`
    )
  }

  const [
    { data: { user } },
    { data: items, count },
    { count: branchTotal },
    { count: branchOpen },
  ] = await Promise.all([
    supabase.auth.getUser(),
    itemsQuery,
    supabase.from('stock_items').select('*', { count: 'exact', head: true }).eq('branch', branch),
    supabase.from('stock_items').select('*', { count: 'exact', head: true }).eq('branch', branch).eq('status', 'in_progress'),
  ])

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user!.id).single()

  const totalPages = Math.ceil((count || 0) / pageSize)
  const branchDone = (branchTotal ?? 0) - (branchOpen ?? 0)

  return (
    <BranchPageClient
      branch={branch}
      items={(items as unknown as StockItem[]) || []}
      totalPages={totalPages}
      currentPage={pageNum}
      totalCount={count || 0}
      filters={{ status: effectiveStatus, dept, q }}
      profile={profile}
      branchTotal={branchTotal ?? 0}
      branchOpen={branchOpen ?? 0}
      branchDone={branchDone}
    />
  )
}
