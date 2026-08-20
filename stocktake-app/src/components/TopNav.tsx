'use client'

import { usePathname, useRouter } from 'next/navigation'
import { BRANCHES } from '@/lib/constants'
import { LayoutDashboard } from 'lucide-react'
import { cn } from '@/lib/utils'

const BRANCH_COLORS: Record<string, string> = {
  NSW: '#dc2626',
  QLD: '#ea580c',
  VIC: '#1d4ed8',
  SA:  '#059669',
  WA:  '#ca8a04',
  CBR: '#0d9488',
  NTL: '#64748b',
}

export default function TopNav() {
  const pathname = usePathname()
  const router = useRouter()

  const isDashboard = pathname === '/'
  const activeBranch = BRANCHES.find(b => pathname.startsWith(`/${b.value}`))?.value

  return (
    <div
      className="flex items-stretch bg-white border-b border-slate-200 shrink-0 overflow-x-auto"
      style={{ scrollbarWidth: 'none' }}
    >
      {/* Dashboard */}
      <button
        onClick={() => router.push('/')}
        className={cn(
          'flex items-center gap-2 px-4 h-11 text-sm font-medium border-b-2 whitespace-nowrap shrink-0 transition-colors cursor-pointer',
          isDashboard
            ? 'border-blue-600 text-blue-700 font-semibold'
            : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
        )}
      >
        <LayoutDashboard className="h-3.5 w-3.5 opacity-75" />
        Dashboard
      </button>

      {/* Divider */}
      <div className="w-px bg-slate-200 my-2 mx-1 shrink-0" />

      {/* Branch tabs */}
      {BRANCHES.map(b => (
        <button
          key={b.value}
          onClick={() => router.push(`/${b.value}`)}
          className={cn(
            'flex items-center gap-2 px-3 h-11 text-sm font-medium border-b-2 whitespace-nowrap shrink-0 transition-colors cursor-pointer',
            activeBranch === b.value
              ? 'border-blue-600 text-blue-700 font-semibold'
              : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
          )}
        >
          <span
            className="text-white rounded font-bold"
            style={{
              backgroundColor: BRANCH_COLORS[b.label],
              fontSize: '9px',
              padding: '2px 5px',
              letterSpacing: '0.03em',
            }}
          >
            {b.label}
          </span>
        </button>
      ))}
    </div>
  )
}
