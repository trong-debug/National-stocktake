'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { StockItem, Dept, Profile } from '@/types'
import { DEPTS } from '@/lib/constants'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface Props {
  item: StockItem
  profile: Profile | null
}

const DEPT_COLORS: Record<string, string> = {
  RP: 'bg-blue-600 text-white border-blue-600',
  CC: 'bg-purple-600 text-white border-purple-600',
  WH: 'bg-amber-500 text-white border-amber-500',
  DM: 'bg-green-600 text-white border-green-600',
}

export default function InlineDeptTransfer({ item: initialItem, profile }: Props) {
  const [currentDept, setCurrentDept] = useState<Dept | null>(initialItem.dept_assigned || null)
  const [selectedDept, setSelectedDept] = useState<Dept | null>(initialItem.dept_assigned || null)
  const [note, setNote] = useState('')
  const [saving, setSaving] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const isDirty = selectedDept !== currentDept

  async function handleSave() {
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
      {/* Dept selector row */}
      <div className="flex items-start gap-4">
        <span className="text-xs font-medium text-slate-500 w-32 shrink-0 pt-1.5">Department</span>
        <div className="flex flex-wrap gap-2">
          {DEPTS.map(d => {
            const isSelected = selectedDept === d.value
            return (
              <button
                key={d.value}
                onClick={() => setSelectedDept(d.value as Dept)}
                className={cn(
                  'text-xs px-3 py-1.5 rounded-md border font-medium transition-colors cursor-pointer',
                  isSelected
                    ? DEPT_COLORS[d.value]
                    : 'bg-white text-slate-500 border-slate-300 hover:border-slate-400'
                )}
              >
                {d.value}
                <span className={cn('ml-1.5 font-normal', isSelected ? 'opacity-80' : 'text-slate-400')}>
                  {d.label}
                </span>
              </button>
            )
          })}
          {!selectedDept && (
            <span className="text-xs text-slate-400 italic pt-1">No department assigned</span>
          )}
        </div>
      </div>

      {/* Note + save — only shown when selection changed */}
      {isDirty && (
        <>
          <div className="flex items-start gap-4">
            <span className="text-xs font-medium text-slate-500 w-32 shrink-0 pt-1">Action Note</span>
            <textarea
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder={`Note for ${DEPTS.find(d => d.value === selectedDept)?.label || 'department'}…`}
              className="flex-1 border border-slate-200 rounded-md px-3 py-2 text-sm min-h-[72px] focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" size="sm" onClick={handleCancel}>
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleSave}
              disabled={saving}
              className="bg-blue-800 hover:bg-blue-900"
            >
              {saving ? 'Saving…' : currentDept ? 'Transfer' : 'Assign'}
            </Button>
          </div>
        </>
      )}
    </div>
  )
}
