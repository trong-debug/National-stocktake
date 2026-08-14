import { createClient } from '@/lib/supabase/server'
import { BRANCH_MAP, DEPT_MAP } from '@/lib/constants'
import type { Branch, StockItem } from '@/types'
import { notFound } from 'next/navigation'
import BranchTable from '@/components/BranchTable'
import NewItemButton from '@/components/NewItemButton'

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
  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user!.id).single()

  const pageNum = parseInt(page || '1', 10)
  const pageSize = 50
  const from = (pageNum - 1) * pageSize
  const to = from + pageSize - 1

  let query = supabase
    .from('stock_items')
    .select('*, status_code_details:status_codes(code,description,dept_first)', { count: 'exact' })
    .eq('branch', branch)
    .order('created_at', { ascending: false })
    .range(from, to)

  if (status && status !== 'all') query = query.eq('status', status)
  if (dept && dept !== 'all') {
    if (dept === 'unassigned') query = query.is('dept_assigned', null)
    else query = query.eq('dept_assigned', dept)
  }
  if (q) {
    query = query.or(
      `client.ilike.%${q}%,serial.ilike.%${q}%,tracking.ilike.%${q}%,customer_name.ilike.%${q}%,action_required.ilike.%${q}%`
    )
  }

  const { data: items, count } = await query

  const totalPages = Math.ceil((count || 0) / pageSize)

  return (
    <div className="p-6 max-w-full space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold bg-blue-900 text-white rounded px-2 py-1">{branch}</span>
            <h1 className="text-xl font-bold text-slate-900">{BRANCH_MAP[branch]}</h1>
          </div>
          <p className="text-slate-500 text-sm mt-0.5">
            {count?.toLocaleString() ?? 0} items {q || status || dept ? '(filtered)' : ''}
          </p>
        </div>
        <NewItemButton branch={branch} profile={profile} />
      </div>

      <BranchTable
        items={(items as unknown as StockItem[]) || []}
        branch={branch}
        totalPages={totalPages}
        currentPage={pageNum}
        totalCount={count || 0}
        filters={{ status, dept, q }}
        profile={profile}
      />
    </div>
  )
}
