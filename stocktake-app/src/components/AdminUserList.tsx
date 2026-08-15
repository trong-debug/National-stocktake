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
  { value: 'RP', label: 'Route Planners',  color: 'bg-blue-600 text-white border-blue-600' },
  { value: 'CC', label: 'Customer Care',   color: 'bg-purple-600 text-white border-purple-600' },
  { value: 'WH', label: 'Warehouse',       color: 'bg-amber-500 text-white border-amber-500' },
  { value: 'DM', label: 'Driver Mgmt',     color: 'bg-green-600 text-white border-green-600' },
]

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
          <div key={user.id} className="px-5 py-4 flex flex-col gap-4">

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
              {saving === user.id && (
                <span className="text-xs text-slate-400 animate-pulse shrink-0">Saving…</span>
              )}
            </div>

            {/* Section 1: Branch */}
            <div className="flex items-center gap-3 pl-12">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide w-24 shrink-0">Branch</span>
              <Select
                value={user.branch || ''}
                onValueChange={v => updateField(user.id, 'branch', v ?? null)}
                disabled={saving === user.id}
              >
                <SelectTrigger className="h-8 w-44 text-xs">
                  <SelectValue placeholder="Select branch…" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All branches</SelectItem>
                  {BRANCHES.map(b => (
                    <SelectItem key={b.value} value={b.value}>{b.label} ({b.value})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
                      onClick={() => toggleDept(user, d.value)}
                      disabled={saving === user.id}
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
                  <span className="text-xs text-slate-400 italic pt-1">None — user won't receive notifications</span>
                )}
              </div>
            </div>

          </div>
        )
      })}
    </div>
  )
}
