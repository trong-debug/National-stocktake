'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Profile } from '@/types'
import { BRANCHES, DEPTS } from '@/lib/constants'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { useRouter } from 'next/navigation'

interface Props {
  users: Profile[]
  currentUserId: string
}

export default function AdminUserList({ users, currentUserId }: Props) {
  const [saving, setSaving] = useState<string | null>(null)
  const supabase = createClient()
  const router = useRouter()

  async function update(id: string, field: string, value: string | null) {
    setSaving(id)
    await supabase.from('profiles').update({ [field]: value || null }).eq('id', id)
    setSaving(null)
    router.refresh()
  }

  return (
    <div className="divide-y">
      {users.map(user => (
        <div key={user.id} className="px-4 py-3 flex items-center gap-4">
          <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center text-xs font-bold uppercase shrink-0">
            {user.full_name?.[0] || user.email[0]}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user.full_name || '—'}</p>
            <p className="text-xs text-slate-500 truncate">{user.email}</p>
          </div>

          <Select
            value={user.role}
            onValueChange={v => update(user.id, 'role', v ?? null)}
            disabled={saving === user.id || user.id === currentUserId}
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
            onValueChange={v => update(user.id, 'branch', v ?? null)}
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

          <Select
            value={user.dept || ''}
            onValueChange={v => update(user.id, 'dept', v ?? null)}
            disabled={saving === user.id}
          >
            <SelectTrigger className="h-8 w-36 text-xs">
              <SelectValue placeholder="Department" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ADMIN">Admin</SelectItem>
              {DEPTS.map(d => <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>)}
            </SelectContent>
          </Select>

          {saving === user.id && <span className="text-xs text-slate-400 animate-pulse">Saving…</span>}
        </div>
      ))}
    </div>
  )
}
