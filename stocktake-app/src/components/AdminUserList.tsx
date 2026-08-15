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

const ALL_DEPTS = [
  { value: 'RP', label: 'Route Planners' },
  { value: 'CC', label: 'Customer Care' },
  { value: 'WH', label: 'Warehouse' },
  { value: 'DM', label: 'Driver Mgmt' },
  { value: 'ADMIN', label: 'Admin' },
]

const DEPT_COLORS: Record<string, string> = {
  RP:    'bg-blue-600 text-white border-blue-600',
  CC:    'bg-purple-600 text-white border-purple-600',
  WH:    'bg-amber-500 text-white border-amber-500',
  DM:    'bg-green-600 text-white border-green-600',
  ADMIN: 'bg-slate-700 text-white border-slate-700',
}

export default function AdminUserList({ users, currentUserId }: Props) {
  const [saving, setSaving] = useState<string | null>(null)
  const supabase = createClient()
  const router = useRouter()

  async function updateField(id: string, field: string, value: string | null) {
    setSaving(id)
    await supabase.from('profiles').update({ [field]: value || null }).eq('id', id)
    setSaving(null)
    router.refresh()
  }

  async function toggleDept(user: Profile, dept: string) {
    const current = user.depts || []
    const next = current.includes(dept)
      ? current.filter(d => d !== dept)
      : [...current, dept]
    if (next.length > 7) return
    setSaving(user.id)
    await supabase.from('profiles').update({ depts: next }).eq('id', user.id)
    setSaving(null)
    router.refresh()
  }

  return (
    <div className="divide-y">
      {users.map(user => {
        const assignedDepts = user.depts || []
        const isSelf = user.id === currentUserId

        return (
          <div key={user.id} className="px-4 py-4 flex flex-col gap-3">
            {/* Row 1: avatar + name + role + branch */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center text-xs font-bold uppercase shrink-0">
                {user.full_name?.[0] || user.email[0]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{user.full_name || '—'}</p>
                <p className="text-xs text-slate-500 truncate">{user.email}</p>
              </div>

              <Select
                value={user.role}
                onValueChange={v => updateField(user.id, 'role', v ?? null)}
                disabled={saving === user.id || isSelf}
              >
                <SelectTrigger className="h-8 w-24 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="staff">Staff</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={user.branch || ''}
                onValueChange={v => updateField(user.id, 'branch', v ?? null)}
                disabled={saving === user.id}
              >
                <SelectTrigger className="h-8 w-32 text-xs">
                  <SelectValue placeholder="Branch" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All branches</SelectItem>
                  {BRANCHES.map(b => <SelectItem key={b.value} value={b.value}>{b.value}</SelectItem>)}
                </SelectContent>
              </Select>

              {saving === user.id && (
                <span className="text-xs text-slate-400 animate-pulse">Saving…</span>
              )}
            </div>

            {/* Row 2: dept checkboxes */}
            <div className="flex items-center gap-2 pl-11">
              <span className="text-xs text-slate-400 shrink-0">Departments:</span>
              <div className="flex flex-wrap gap-1.5">
                {ALL_DEPTS.map(d => {
                  const active = assignedDepts.includes(d.value)
                  return (
                    <button
                      key={d.value}
                      onClick={() => toggleDept(user, d.value)}
                      disabled={saving === user.id}
                      title={d.label}
                      className={cn(
                        'text-xs px-2.5 py-1 rounded-md border font-medium transition-colors',
                        active
                          ? DEPT_COLORS[d.value]
                          : 'bg-white text-slate-500 border-slate-300 hover:border-slate-400'
                      )}
                    >
                      {d.value}
                    </button>
                  )
                })}
                {assignedDepts.length === 0 && (
                  <span className="text-xs text-slate-400 italic">No departments assigned</span>
                )}
              </div>
              <span className="text-xs text-slate-300 ml-auto">{assignedDepts.length}/7</span>
            </div>
          </div>
        )
      })}
    </div>
  )
}
