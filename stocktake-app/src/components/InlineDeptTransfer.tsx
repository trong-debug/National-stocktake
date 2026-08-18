'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { StockItem, Dept, Profile } from '@/types'
import { DEPTS } from '@/lib/constants'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ArrowRightLeft } from 'lucide-react'

interface Props {
  item: StockItem
  profile: Profile | null
}

export default function InlineDeptTransfer({ item: initialItem, profile }: Props) {
  const [currentDept, setCurrentDept] = useState<Dept | null>(initialItem.dept_assigned || null)
  const [selectedDept, setSelectedDept] = useState<Dept | null>(initialItem.dept_assigned || null)
  const [note, setNote] = useState('')
  const [saving, setSaving] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const isDirty = selectedDept !== currentDept

  async function handleTransfer() {
    if (!selectedDept || !isDirty) return

    const noteField = `notes_${selectedDept.toLowerCase()}` as `notes_${'rp'|'cc'|'wh'|'dm'}`
    const prevDept = currentDept

    setSaving(true)

    await supabase.from('stock_items').update({
      dept_assigned: selectedDept,
      action_required: note || initialItem.action_required,
      [noteField]: note || null,
      updated_by: profile?.id,
    }).eq('id', initialItem.id)

    await supabase.from('action_logs').insert({
      item_id: initialItem.id,
      user_id: profile?.id,
      user_name: profile?.full_name || profile?.email,
      action_type: prevDept ? 'transferred' : 'assigned',
      from_dept: prevDept,
      to_dept: selectedDept,
      note,
    })

    fetch('/api/notify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        itemId: initialItem.id,
        dept: selectedDept,
        note,
        assignedBy: profile?.full_name || profile?.email,
      }),
    })

    setCurrentDept(selectedDept)
    setNote('')
    setSaving(false)
    router.refresh()
  }

  function handleCancel() {
    setSelectedDept(currentDept)
    setNote('')
  }

  return (
    <div className="space-y-3">
      {/* Dropdown + Transfer button row */}
      <div className="flex items-center gap-4">
        <span className="text-xs font-medium text-slate-500 w-32 shrink-0">Department</span>
        <div className="flex items-center gap-2">
          <Select
            value={selectedDept || ''}
            onValueChange={v => setSelectedDept((v || null) as Dept | null)}
          >
            <SelectTrigger className="w-52 h-8 text-sm">
              <SelectValue placeholder="No department assigned" />
            </SelectTrigger>
            <SelectContent>
              {DEPTS.map(d => (
                <SelectItem key={d.value} value={d.value}>
                  {d.value} — {d.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {isDirty && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={handleTransfer}
                disabled={saving || !selectedDept}
              >
                <ArrowRightLeft className="h-3.5 w-3.5 mr-1.5" />
                {saving ? 'Saving…' : 'Transfer'}
              </Button>
              <button
                onClick={handleCancel}
                className="text-xs text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              >
                Cancel
              </button>
            </>
          )}
        </div>
      </div>

      {/* Note textarea — only shown when selection changed */}
      {isDirty && (
        <div className="flex items-start gap-4">
          <span className="text-xs font-medium text-slate-500 w-32 shrink-0 pt-1">Action Note</span>
          <textarea
            value={note}
            onChange={e => setNote(e.target.value)}
            placeholder={`Note for ${DEPTS.find(d => d.value === selectedDept)?.label || 'department'}…`}
            className="flex-1 border border-slate-200 rounded-md px-3 py-2 text-sm min-h-[72px] focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
        </div>
      )}
    </div>
  )
}
