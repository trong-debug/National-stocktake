'use client'

import { usePathname, useRouter } from 'next/navigation'
import { BRANCHES } from '@/lib/constants'
import { LayoutDashboard } from 'lucide-react'
import { cn } from '@/lib/utils'

const BRANCH_COLORS: Record<string, string> = {
  NSW: '#dc2626',
  QLD: '#ea580c',
  VIC: '#4f46e5',
  ADL: '#059669',
  PER: '#ca8a04',
  CBR: '#0d9488',
  NTL: '#64748b',
}

const BRANCH_EMOJI: Record<string, string> = {
  NSW: '🌉',
  QLD: '☀️',
  VIC: '☕',
  ADL: '🌹',
  PER: '🌅',
  CBR: '🏛️',
  NTL: '⚓',
}

export default function TopNav() {
  const pathname = usePathname()
  const router = useRouter()

  const isDashboard = pathname === '/'
  const activeBranch = BRANCHES.find(b => pathname.startsWith(`/${b.value}`))?.value

  return (
    <div className="bg-white border-b border-slate-200 shrink-0">
      {/* Dashboard row */}
      <div className="flex items-stretch border-b border-slate-100">
        <button
          onClick={() => router.push('/')}
          className={cn(
            'flex items-center gap-2 px-4 h-10 text-sm font-medium border-b-2 whitespace-nowrap transition-colors cursor-pointer',
            isDashboard
              ? 'border-blue-600 text-blue-700 font-semibold'
              : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
          )}
        >
          <LayoutDashboard className="h-3.5 w-3.5 opacity-75" />
          Dashboard
        </button>
      </div>

      {/* Branch segment pill row */}
      <div
        className="flex items-center gap-1 px-2 py-1.5 overflow-x-auto"
        style={{ scrollbarWidth: 'none' }}
      >
        {BRANCHES.map(b => {
          const isActive = activeBranch === b.value
          const color = BRANCH_COLORS[b.value]
          return (
            <button
              key={b.value}
              onClick={() => router.push(`/${b.value}`)}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap shrink-0 transition-all cursor-pointer',
                isActive
                  ? 'bg-white shadow-sm font-semibold'
                  : 'text-slate-500 hover:bg-white/80 hover:text-slate-800'
              )}
              style={isActive ? { color } : undefined}
            >
              <span>{BRANCH_EMOJI[b.value]}</span>
              {b.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
