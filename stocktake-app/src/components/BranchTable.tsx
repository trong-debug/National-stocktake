'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useCallback, useState, useTransition } from 'react'
import { format } from 'date-fns'
import type { Branch, Dept, StockItem, Profile } from '@/types'
import { DEPTS } from '@/lib/constants'
import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search, ChevronLeft, ChevronRight, X, LayoutGrid, ClipboardList, Headphones, Package, Truck, CircleDashed, CalendarClock, CornerUpRight } from 'lucide-react'

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

const DEPT_TABS = [
  { value: 'all',        label: 'All Depts',     color: '#334155', icon: LayoutGrid },
  { value: 'RP',         label: 'Route Planner', color: '#3b82f6', icon: ClipboardList },
  { value: 'CC',         label: 'Customer Care', color: '#9333ea', icon: Headphones },
  { value: 'WH',         label: 'Warehouse',     color: '#d97706', icon: Package },
  { value: 'DM',         label: 'Driver Management', color: '#16a34a', icon: Truck },
  { value: 'unassigned', label: 'Unassigned',    color: '#94a3b8', icon: CircleDashed },
]

export default function BranchTable({ items, branch, totalPages, currentPage, totalCount, filters, profile }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()
  const [search, setSearch] = useState(filters.q || '')
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const updateParams = useCallback((updates: Record<string, string | undefined>) => {
    const params = new URLSearchParams(searchParams.toString())
    Object.entries(updates).forEach(([k, v]) => {
      if (v === undefined || v === '') params.delete(k)
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

  const activeStatus = filters.status ?? 'in_progress'
  const activeDept = filters.dept ?? 'all'

  return (
    <div className={cn('space-y-0', isPending && 'opacity-60 pointer-events-none')}>

      {/* Dept tab strip — segment control */}
      <div className="bg-white border-b border-slate-200 px-3 py-2 overflow-x-auto">
        <div className="inline-flex items-center gap-1 bg-slate-100 rounded-xl p-1 min-w-max">
          {DEPT_TABS.map(tab => {
            const Icon = tab.icon
            const isActive = activeDept === tab.value
            return (
              <button
                key={tab.value}
                onClick={() => updateParams({ dept: tab.value })}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all shrink-0',
                  isActive
                    ? 'bg-white shadow-sm font-semibold'
                    : 'text-slate-500 hover:bg-white/60 hover:text-slate-800'
                )}
                style={isActive ? { color: tab.color } : undefined}
              >
                <Icon className="h-3.5 w-3.5 shrink-0" />
                {tab.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Selection action bar */}
      {selectedId && (
        <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 border-b border-blue-100">
          <span className="text-xs text-blue-700 font-medium flex-1">1 item selected</span>
          <Button size="sm" variant="outline" className="h-8 gap-1.5 text-xs border-blue-300 text-blue-700 hover:bg-blue-100">
            <CalendarClock className="h-3.5 w-3.5" />
            Reschedule
          </Button>
          <Button size="sm" variant="outline" className="h-8 gap-1.5 text-xs border-blue-300 text-blue-700 hover:bg-blue-100">
            <CornerUpRight className="h-3.5 w-3.5" />
            Redirect
          </Button>
          <button onClick={() => setSelectedId(null)} className="text-xs text-blue-400 hover:text-blue-700 ml-1">✕ Clear</button>
        </div>
      )}

      {/* Filter bar */}
      <div className="flex items-center gap-2 py-3 bg-white border-b border-slate-100 flex-wrap">
        {/* Status toggles */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => updateParams({ status: 'all' })}
            className={cn(
              'px-3 py-1.5 text-xs font-semibold rounded border transition-colors',
              activeStatus === 'all'
                ? 'bg-slate-700 text-white border-slate-700'
                : 'bg-white text-slate-500 border-slate-300 hover:border-slate-400'
            )}
          >
            ALL
          </button>
          <button
            onClick={() => updateParams({ status: 'in_progress' })}
            className={cn(
              'px-3 py-1.5 text-xs font-semibold rounded border transition-colors',
              activeStatus === 'in_progress'
                ? 'bg-orange-500 text-white border-orange-500'
                : 'bg-white text-orange-500 border-orange-300 hover:border-orange-400'
            )}
          >
            IN PROGRESS
          </button>
          <button
            onClick={() => updateParams({ status: 'completed' })}
            className={cn(
              'px-3 py-1.5 text-xs font-semibold rounded border transition-colors',
              activeStatus === 'completed'
                ? 'bg-green-600 text-white border-green-600'
                : 'bg-white text-green-600 border-green-300 hover:border-green-500'
            )}
          >
            COMPLETED
          </button>
        </div>

        {/* Search */}
        <form onSubmit={handleSearch} className="flex gap-1 ml-auto">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
            <Input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search client, serial, tracking…"
              className="pl-8 h-9 w-60 text-sm"
            />
          </div>
          {filters.q && (
            <Button type="button" size="sm" variant="ghost" className="h-9 px-2" onClick={() => { setSearch(''); updateParams({ q: undefined }) }}>
              <X className="h-4 w-4" />
            </Button>
          )}
          <Button type="submit" size="sm" variant="secondary" className="h-9">Search</Button>
        </form>

        <span className="text-xs text-slate-400 font-medium tabular-nums">
          Totals: {totalCount.toLocaleString()}
        </span>
      </div>

      {/* Table */}
      <div className="bg-white overflow-x-auto shadow-sm border border-slate-200 rounded-b-lg">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-slate-50 text-slate-500 text-xs uppercase tracking-wide">
              <th className="px-3 py-2.5 w-8"></th>
              <th className="text-left px-3 py-2.5 font-semibold">Date</th>
              <th className="text-left px-3 py-2.5 font-semibold">Client</th>
              <th className="text-left px-3 py-2.5 font-semibold">Serial</th>
              <th className="text-left px-3 py-2.5 font-semibold">Tracking</th>
              <th className="text-left px-3 py-2.5 font-semibold">Customer</th>
              <th className="text-left px-3 py-2.5 font-semibold">Code</th>
              <th className="text-left px-3 py-2.5 font-semibold">Depot</th>
              <th className="text-left px-3 py-2.5 font-semibold">Dept</th>
              <th className="text-left px-3 py-2.5 font-semibold">Status</th>
              <th className="text-left px-3 py-2.5 font-semibold">Action Required</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr>
                <td colSpan={11} className="text-center py-16 text-slate-400">
                  No items found{filters.q || filters.status || filters.dept ? ' for these filters' : ''}
                </td>
              </tr>
            ) : items.map((item, i) => (
              <tr
                key={item.id}
                onClick={() => router.push(`/item/${item.id}`)}
                className={cn(
                  'border-b last:border-0 hover:bg-blue-50/50 transition-colors cursor-pointer',
                  i % 2 === 1 && 'bg-slate-50/40',
                  selectedId === item.id && 'bg-blue-50'
                )}
              >
                <td className="px-3 py-2.5 w-8" onClick={e => e.stopPropagation()}>
                  <input
                    type="checkbox"
                    checked={selectedId === item.id}
                    onChange={() => setSelectedId(selectedId === item.id ? null : item.id)}
                    className="h-4 w-4 rounded border-slate-300 accent-blue-600 cursor-pointer"
                  />
                </td>
                <td className="px-3 py-2.5 text-slate-400 whitespace-nowrap text-xs">
                  {item.date_listed ? format(new Date(item.date_listed), 'd MMM yy') : '—'}
                </td>
                <td className="px-3 py-2.5 font-medium max-w-[160px] truncate" title={item.client ?? ''}>
                  {item.client || <span className="text-slate-300">—</span>}
                </td>
                <td className="px-3 py-2.5 text-slate-500 font-mono text-xs">{item.serial || '—'}</td>
                <td className="px-3 py-2.5 text-slate-500 font-mono text-xs">{item.tracking || '—'}</td>
                <td className="px-3 py-2.5 max-w-[130px] truncate text-slate-600 text-xs" title={item.customer_name ?? ''}>
                  {item.customer_name || '—'}
                </td>
                <td className="px-3 py-2.5">
                  {item.status_code ? (
                    <span className="inline-block bg-slate-100 text-slate-700 text-xs font-mono rounded px-1.5 py-0.5 font-semibold">
                      {item.status_code}
                    </span>
                  ) : <span className="text-slate-300">—</span>}
                </td>
                <td className="px-3 py-2.5 text-xs text-slate-500">{item.delivery_depot || '—'}</td>
                <td className="px-3 py-2.5">
                  {item.dept_assigned ? (
                    <span className={cn('text-xs font-semibold rounded px-1.5 py-0.5 border', DEPT_BADGE[item.dept_assigned])}>
                      {item.dept_assigned}
                    </span>
                  ) : (
                    <span className="text-xs text-slate-300">—</span>
                  )}
                </td>
                <td className="px-3 py-2.5">
                  {item.status === 'completed' ? (
                    <span className="text-xs font-bold text-green-600 uppercase tracking-wide">Completed</span>
                  ) : (
                    <span className="text-xs font-bold text-orange-500 uppercase tracking-wide">In Progress</span>
                  )}
                </td>
                <td className="px-3 py-2.5 max-w-[220px]">
                  <p className="truncate text-slate-600 text-xs" title={item.action_required || ''}>
                    {item.action_required || <span className="text-slate-300">—</span>}
                  </p>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-3">
          <p className="text-xs text-slate-400">
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
