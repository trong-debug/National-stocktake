export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { DEPT_MAP } from '@/lib/constants'
import type { Branch, StockItem } from '@/types'
import { notFound } from 'next/navigation'
import BranchTable from '@/components/BranchTable'
import NewItemButton from '@/components/NewItemButton'
import ClearBranchButton from '@/components/ClearBranchButton'
import ExportCSVButton from '@/components/ExportCSVButton'

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

  // Run all queries in parallel — stats queries are unfiltered for the summary bar
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
    <div className="p-6 max-w-full space-y-4">
      <div className="flex items-center justify-end">
        <div className="flex items-center gap-6">
          {/* Stats chips */}
          <div className="flex items-center gap-4 text-sm">
            <div className="text-right">
              <p className="text-xs text-slate-400 uppercase tracking-wide font-medium leading-none mb-0.5">Total</p>
              <p className="font-bold text-slate-800 tabular-nums">{(branchTotal ?? 0).toLocaleString()}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-blue-500 uppercase tracking-wide font-medium leading-none mb-0.5">Open</p>
              <p className="font-bold text-blue-700 tabular-nums">{(branchOpen ?? 0).toLocaleString()}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-400 uppercase tracking-wide font-medium leading-none mb-0.5">Done</p>
              <p className="font-bold text-slate-500 tabular-nums">{branchDone.toLocaleString()}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 border-l pl-6">
            {branchTotal != null && branchTotal > 0 && <ExportCSVButton branch={branch} />}
            {profile?.role === 'admin' && branchTotal != null && branchTotal > 0 && (
              <ClearBranchButton branch={branch} totalCount={branchTotal} />
            )}
            <NewItemButton branch={branch} profile={profile} />
          </div>
        </div>
      </div>

      <BranchTable
        items={(items as unknown as StockItem[]) || []}
        branch={branch}
        totalPages={totalPages}
        currentPage={pageNum}
        totalCount={count || 0}
        filters={{ status: effectiveStatus, dept, q }}
        profile={profile}
      />
    </div>
  )
}
