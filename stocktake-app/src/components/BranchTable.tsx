'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useCallback, useState, useTransition } from 'react'
import { format } from 'date-fns'
import type { Branch, Dept, ItemStatus, StockItem, Profile } from '@/types'
import { DEPT_MAP, DEPTS } from '@/lib/constants'
import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Search, ChevronLeft, ChevronRight } from 'lucide-react'

interface Props {
  items: StockItem[]
  branch: Branch
  totalPages: number
  currentPage: number
  totalCount: number
  filters: { status?: string; dept?: string; q?: string }
  profile: Profile | null
}

const DEPT_BADGE: Record<Dept, string> = {
  RP: 'bg-blue-100 text-blue-800 border-blue-200',
  CC: 'bg-purple-100 text-purple-800 border-purple-200',
  WH: 'bg-amber-100 text-amber-800 border-amber-200',
  DM: 'bg-green-100 text-green-800 border-green-200',
}

export default function BranchTable({ items, branch, totalPages, currentPage, totalCount, filters, profile }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()
  const [search, setSearch] = useState(filters.q || '')

  const updateParams = useCallback((updates: Record<string, string | undefined>) => {
    const params = new URLSearchParams(searchParams.toString())
    Object.entries(updates).forEach(([k, v]) => {
      if (v === undefined || v === '' || v === 'all') params.delete(k)
      else params.set(k, v)
    })
    params.delete('page')
    startTransition(() => router.push(`${pathname}?${params.toString()}`))
  }, [searchParams, pathname, router])

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    updateParams({ q: search || undefined })
  }

  function goToPage(p: number) {
    const params = new URLSearchParams(searchParams.toString())
    params.set('page', String(p))
    startTransition(() => router.push(`${pathname}?${params.toString()}`))
  }

  return (
    <div className={cn('space-y-3', isPending && 'opacity-60 pointer-events-none')}>
      {/* Filters */}
      <div className="flex flex-wrap gap-2 items-center">
        <form onSubmit={handleSearch} className="flex gap-1">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
            <Input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search client, serial, tracking…"
              className="pl-8 h-9 w-64 text-sm"
            />
          </div>
          <Button type="submit" size="sm" variant="secondary" className="h-9">Search</Button>
          {filters.q && (
            <Button type="button" size="sm" variant="ghost" className="h-9" onClick={() => { setSearch(''); updateParams({ q: undefined }) }}>
              Clear
            </Button>
          )}
        </form>

        <Select value={filters.status ?? 'all'} onValueChange={v => updateParams({ status: v ?? undefined })}>
          <SelectTrigger className="h-9 w-36 text-sm">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filters.dept ?? 'all'} onValueChange={v => updateParams({ dept: v ?? undefined })}>
          <SelectTrigger className="h-9 w-44 text-sm">
            <SelectValue placeholder="Department" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All departments</SelectItem>
            {DEPTS.map(d => (
              <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>
            ))}
            <SelectItem value="unassigned">Unassigned</SelectItem>
          </SelectContent>
        </Select>

        <span className="text-xs text-slate-500 ml-auto">{totalCount.toLocaleString()} items</span>
      </div>

      {/* Table */}
      <div className="border rounded-lg bg-white overflow-x-auto shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-slate-50 text-slate-600">
              <th className="text-left px-3 py-2.5 font-medium">Date Listed</th>
              <th className="text-left px-3 py-2.5 font-medium">Client</th>
              <th className="text-left px-3 py-2.5 font-medium">Serial</th>
              <th className="text-left px-3 py-2.5 font-medium">Tracking</th>
              <th className="text-left px-3 py-2.5 font-medium">Customer</th>
              <th className="text-left px-3 py-2.5 font-medium">Code</th>
              <th className="text-left px-3 py-2.5 font-medium">Depot</th>
              <th className="text-left px-3 py-2.5 font-medium">Dept</th>
              <th className="text-left px-3 py-2.5 font-medium">Status</th>
              <th className="text-left px-3 py-2.5 font-medium">Action Required</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr>
                <td colSpan={11} className="text-center py-12 text-slate-400">
                  No items found{filters.q || filters.status || filters.dept ? ' for these filters' : ''}
                </td>
              </tr>
            ) : items.map((item, i) => (
              <tr
                key={item.id}
                onClick={() => router.push(`/item/${item.id}`)}
                className={cn(
                  'border-b hover:bg-blue-50 transition-colors cursor-pointer',
                  item.status === 'completed' && 'opacity-60',
                  i % 2 === 1 && 'bg-slate-50/40'
                )}
              >
                <td className="px-3 py-2.5 text-slate-500 whitespace-nowrap text-xs">
                  {item.date_listed ? format(new Date(item.date_listed), 'd MMM yy') : '—'}
                </td>
                <td className="px-3 py-2.5 font-medium max-w-[180px] truncate" title={item.client ?? ''}>
                  {item.client || <span className="text-slate-400">—</span>}
                </td>
                <td className="px-3 py-2.5 text-slate-600 font-mono text-xs">{item.serial || '—'}</td>
                <td className="px-3 py-2.5 text-slate-600 font-mono text-xs">{item.tracking || '—'}</td>
                <td className="px-3 py-2.5 max-w-[140px] truncate text-slate-600" title={item.customer_name ?? ''}>
                  {item.customer_name || '—'}
                </td>
                <td className="px-3 py-2.5">
                  {item.status_code ? (
                    <span className="inline-block bg-slate-100 text-slate-700 text-xs font-mono rounded px-1.5 py-0.5 font-semibold">
                      {item.status_code}
                    </span>
                  ) : '—'}
                </td>
                <td className="px-3 py-2.5 text-xs text-slate-600">{item.delivery_depot || '—'}</td>
                <td className="px-3 py-2.5">
                  {item.dept_assigned ? (
                    <span className={cn('text-xs font-semibold rounded px-1.5 py-0.5 border', DEPT_BADGE[item.dept_assigned])}>
                      {item.dept_assigned}
                    </span>
                  ) : (
                    <span className="text-xs text-slate-400 italic">none</span>
                  )}
                </td>
                <td className="px-3 py-2.5">
                  <span className={cn(
                    'text-xs rounded-full px-2 py-0.5 font-medium',
                    item.status === 'completed'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-amber-100 text-amber-800'
                  )}>
                    {item.status === 'completed' ? 'Completed' : 'In Progress'}
                  </span>
                </td>
                <td className="px-3 py-2.5 max-w-[220px]">
                  <p className="truncate text-slate-700 text-xs" title={item.action_required || ''}>
                    {item.action_required || <span className="text-slate-400">—</span>}
                  </p>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-slate-500">
            Page {currentPage} of {totalPages}
          </p>
          <div className="flex gap-1">
            <Button
              variant="outline" size="sm" onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage <= 1} className="h-8 w-8 p-0"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const p = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i
              return (
                <Button
                  key={p} variant={p === currentPage ? 'default' : 'outline'} size="sm"
                  onClick={() => goToPage(p)} className="h-8 w-8 p-0 text-xs"
                >
                  {p}
                </Button>
              )
            })}
            <Button
              variant="outline" size="sm" onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage >= totalPages} className="h-8 w-8 p-0"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
