'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Profile } from '@/types'
import { BRANCHES } from '@/lib/constants'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'

interface Props {
  users: Profile[]
  currentUserId: string
}

const DEPTS = [
  { value: 'RP', label: 'Route Planners', color: 'bg-blue-600 text-white border-blue-600' },
  { value: 'CC', label: 'Customer Care',  color: 'bg-purple-600 text-white border-purple-600' },
  { value: 'WH', label: 'Warehouse',      color: 'bg-amber-500 text-white border-amber-500' },
  { value: 'DM', label: 'Driver Mgmt',    color: 'bg-green-600 text-white border-green-600' },
]

const BRANCH_COLORS: Record<string, string> = {
  NSW: 'bg-red-600 text-white border-red-600',
  QLD: 'bg-orange-500 text-white border-orange-500',
  VIC: 'bg-blue-700 text-white border-blue-700',
  ADL: 'bg-emerald-600 text-white border-emerald-600',
  PER: 'bg-yellow-500 text-white border-yellow-500',
  CBR: 'bg-teal-600 text-white border-teal-600',
  NTL: 'bg-slate-500 text-white border-slate-500',
}

export default function AdminUserList({ users: initialUsers, currentUserId }: Props) {
  // Local optimistic state — updated immediately on toggle, no server wait
  const [users, setUsers] = useState<Profile[]>(initialUsers)
  const [roleSaving, setRoleSaving] = useState<string | null>(null)
  const supabase = createClient()
  const router = useRouter()

  async function updateRole(id: string, value: string) {
    setRoleSaving(id)
    await supabase.from('profiles').update({ role: value }).eq('id', id)
    setRoleSaving(null)
    router.refresh()
  }

  function toggleItem(userId: string, field: 'depts' | 'branches', item: string) {
    // Update UI instantly
    setUsers(prev => prev.map(u => {
      if (u.id !== userId) return u
      const current: string[] = (u[field] as string[] | null) || []
      const next = current.includes(item)
        ? current.filter(x => x !== item)
        : [...current, item]
      return { ...u, [field]: next }
    }))

    // Sync to DB in background — no await, no refresh
    const user = users.find(u => u.id === userId)
    if (!user) return
    const current: string[] = (user[field] as string[] | null) || []
    const next = current.includes(item)
      ? current.filter(x => x !== item)
      : [...current, item]
    supabase.from('profiles').update({ [field]: next }).eq('id', userId).then(({ error }) => {
      if (error) {
        // Revert on failure
        setUsers(prev => prev.map(u => u.id === userId ? { ...u, [field]: current } : u))
      }
    })
  }

  return (
    <div className="divide-y">
      {users.map(user => {
        const assignedDepts    = user.depts    || []
        const assignedBranches = user.branches || []
        const isSelf = user.id === currentUserId

        return (
          <div key={user.id} className="px-5 py-5 flex flex-col gap-4">

            {/* User header */}
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center text-sm font-bold uppercase shrink-0">
                {user.full_name?.[0] || user.email[0]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">{user.full_name || '—'}</p>
                <p className="text-xs text-slate-500 truncate">{user.email}</p>
              </div>
              <Select
                value={user.role}
                onValueChange={v => v && updateRole(user.id, v)}
                disabled={roleSaving === user.id || isSelf}
              >
                <SelectTrigger className="h-8 w-24 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="staff">Staff</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
              {roleSaving === user.id && (
                <span className="text-xs text-slate-400 animate-pulse shrink-0">Saving…</span>
              )}
            </div>

            {/* Section 1: Branches */}
            <div className="flex items-start gap-3 pl-12">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide w-24 shrink-0 pt-1">Branches</span>
              <div className="flex flex-wrap gap-2">
                {BRANCHES.map(b => {
                  const active = assignedBranches.includes(b.value)
                  return (
                    <button
                      key={b.value}
                      onClick={() => toggleItem(user.id, 'branches', b.value)}
                      title={b.label}
                      className={cn(
                        'text-xs px-3 py-1.5 rounded-md border font-medium transition-colors',
                        active
                          ? BRANCH_COLORS[b.value]
                          : 'bg-white text-slate-500 border-slate-300 hover:border-slate-400'
                      )}
                    >
                      {b.value}
                    </button>
                  )
                })}
                {assignedBranches.length === 0 && (
                  <span className="text-xs text-slate-400 italic pt-1">No branches — won't receive notifications</span>
                )}
              </div>
            </div>

            {/* Section 2: Departments */}
            <div className="flex items-start gap-3 pl-12">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide w-24 shrink-0 pt-1">Departments</span>
              <div className="flex flex-wrap gap-2">
                {DEPTS.map(d => {
                  const active = assignedDepts.includes(d.value)
                  return (
                    <button
                      key={d.value}
                      onClick={() => toggleItem(user.id, 'depts', d.value)}
                      title={d.label}
                      className={cn(
                        'text-xs px-3 py-1.5 rounded-md border font-medium transition-colors',
                        active
                          ? d.color
                          : 'bg-white text-slate-500 border-slate-300 hover:border-slate-400'
                      )}
                    >
                      {d.value}
                      <span className={cn('ml-1.5 font-normal', active ? 'opacity-80' : 'text-slate-400')}>
                        {d.label}
                      </span>
                    </button>
                  )
                })}
                {assignedDepts.length === 0 && (
                  <span className="text-xs text-slate-400 italic pt-1">No departments — won't receive notifications</span>
                )}
              </div>
            </div>

          </div>
        )
      })}
    </div>
  )
}
