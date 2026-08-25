'use client'

import { useState } from 'react'
import { CalendarClock, CornerUpRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import BranchTable from '@/components/BranchTable'
import NewItemButton from '@/components/NewItemButton'
import ClearBranchButton from '@/components/ClearBranchButton'
import ExportCSVButton from '@/components/ExportCSVButton'
import type { Branch, StockItem, Profile } from '@/types'

interface Props {
  branch: Branch
  items: StockItem[]
  totalPages: number
  currentPage: number
  totalCount: number
  filters: { status?: string; dept?: string; q?: string }
  profile: Profile | null
  branchTotal: number
  branchOpen: number
  branchDone: number
}

export default function BranchPageClient({
  branch, items, totalPages, currentPage, totalCount, filters,
  profile, branchTotal, branchOpen, branchDone,
}: Props) {
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const hasSelection = selectedId !== null

  return (
    <div className="p-6 max-w-full space-y-4">
      <div className="flex items-center justify-end">
        <div className="flex items-center gap-6">
          {/* Stats chips */}
          <div className="flex items-center gap-4 text-sm">
            <div className="text-right">
              <p className="text-xs text-slate-400 uppercase tracking-wide font-medium leading-none mb-0.5">Total</p>
              <p className="font-bold text-slate-800 tabular-nums">{branchTotal.toLocaleString()}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-blue-500 uppercase tracking-wide font-medium leading-none mb-0.5">Open</p>
              <p className="font-bold text-blue-700 tabular-nums">{branchOpen.toLocaleString()}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-400 uppercase tracking-wide font-medium leading-none mb-0.5">Done</p>
              <p className="font-bold text-slate-500 tabular-nums">{branchDone.toLocaleString()}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 border-l pl-6">
            {branchTotal > 0 && <ExportCSVButton branch={branch} />}
            {profile?.role === 'admin' && branchTotal > 0 && (
              <ClearBranchButton branch={branch} totalCount={branchTotal} />
            )}
            <Button
              size="sm"
              variant="outline"
              disabled={!hasSelection}
              className="h-9 gap-1.5 text-xs border-slate-300 transition-opacity"
              style={{ opacity: hasSelection ? 1 : 0.4 }}
            >
              <CalendarClock className="h-3.5 w-3.5" />
              Reschedule
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={!hasSelection}
              className="h-9 gap-1.5 text-xs border-slate-300 transition-opacity"
              style={{ opacity: hasSelection ? 1 : 0.4 }}
            >
              <CornerUpRight className="h-3.5 w-3.5" />
              Redirect
            </Button>
            <NewItemButton branch={branch} profile={profile} />
          </div>
        </div>
      </div>

      <BranchTable
        items={items}
        branch={branch}
        totalPages={totalPages}
        currentPage={currentPage}
        totalCount={totalCount}
        filters={filters}
        profile={profile}
        selectedId={selectedId}
        onSelectId={setSelectedId}
      />
    </div>
  )
}
