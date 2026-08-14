'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { StockItem, Dept, Profile } from '@/types'
import { DEPTS } from '@/lib/constants'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { CheckCircle2, Send, ArrowRightLeft } from 'lucide-react'

interface Props {
  item: StockItem
  profile: Profile | null
}

export default function ItemActions({ item, profile }: Props) {
  const [assignOpen, setAssignOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [newDept, setNewDept] = useState<Dept | ''>('')
  const [note, setNote] = useState('')
  const [sendEmail, setSendEmail] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  const isCompleted = item.status === 'completed'

  async function handleAssign(e: React.FormEvent) {
    e.preventDefault()
    if (!newDept) return
    setLoading(true)

    const noteField = `notes_${newDept.toLowerCase()}` as `notes_${'rp'|'cc'|'wh'|'dm'}`

    await supabase.from('stock_items').update({
      dept_assigned: newDept,
      action_required: note || item.action_required,
      [noteField]: note || null,
      updated_by: profile?.id,
    }).eq('id', item.id)

    await supabase.from('action_logs').insert({
      item_id: item.id,
      user_id: profile?.id,
      user_name: profile?.full_name || profile?.email,
      action_type: item.dept_assigned ? 'transferred' : 'assigned',
      from_dept: item.dept_assigned,
      to_dept: newDept,
      note,
    })

    if (sendEmail) {
      await fetch('/api/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId: item.id, dept: newDept, note, assignedBy: profile?.full_name || profile?.email }),
      })
    }

    setAssignOpen(false)
    setLoading(false)
    router.refresh()
  }

  async function handleComplete() {
    setLoading(true)
    await supabase.from('stock_items').update({
      status: 'completed',
      completed_at: new Date().toISOString(),
      completed_by: profile?.id,
      updated_by: profile?.id,
    }).eq('id', item.id)

    await supabase.from('action_logs').insert({
      item_id: item.id,
      user_id: profile?.id,
      user_name: profile?.full_name || profile?.email,
      action_type: 'completed',
      old_status: 'in_progress',
      new_status: 'completed',
    })

    setLoading(false)
    router.refresh()
  }

  async function handleReopen() {
    setLoading(true)
    await supabase.from('stock_items').update({
      status: 'in_progress',
      completed_at: null,
      completed_by: null,
      updated_by: profile?.id,
    }).eq('id', item.id)

    await supabase.from('action_logs').insert({
      item_id: item.id,
      user_id: profile?.id,
      user_name: profile?.full_name || profile?.email,
      action_type: 'status_changed',
      old_status: 'completed',
      new_status: 'in_progress',
      note: 'Reopened',
    })

    setLoading(false)
    router.refresh()
  }

  return (
    <div className="flex gap-2 shrink-0">
      {!isCompleted && (
        <>
          <Button
            variant="outline"
            size="sm"
            onClick={() => { setNewDept(item.dept_assigned || ''); setNote(''); setAssignOpen(true) }}
            disabled={loading}
          >
            <ArrowRightLeft className="h-3.5 w-3.5 mr-1.5" />
            {item.dept_assigned ? 'Transfer' : 'Assign Dept'}
          </Button>
          <Button
            size="sm"
            className="bg-green-700 hover:bg-green-800"
            onClick={handleComplete}
            disabled={loading}
          >
            <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" />
            Mark Complete
          </Button>
        </>
      )}
      {isCompleted && (
        <Button variant="outline" size="sm" onClick={handleReopen} disabled={loading}>
          Reopen
        </Button>
      )}

      <Dialog open={assignOpen} onOpenChange={setAssignOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{item.dept_assigned ? 'Transfer to Department' : 'Assign to Department'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAssign} className="space-y-4 mt-2">
            <div className="space-y-1.5">
              <Label className="text-xs">Department <span className="text-red-500">*</span></Label>
              <Select value={newDept} onValueChange={v => setNewDept((v ?? '') as Dept)} required>
                <SelectTrigger><SelectValue placeholder="Select department" /></SelectTrigger>
                <SelectContent>
                  {DEPTS.map(d => <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Action note for {newDept || 'department'}</Label>
              <textarea
                value={note}
                onChange={e => setNote(e.target.value)}
                placeholder="What does this department need to do?"
                className="w-full border rounded-md px-3 py-2 text-sm min-h-[80px] focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={sendEmail}
                onChange={e => setSendEmail(e.target.checked)}
                className="rounded"
              />
              <Send className="h-3.5 w-3.5 text-slate-400" />
              Send email notification to department
            </label>

            <div className="flex gap-2 justify-end">
              <Button type="button" variant="outline" onClick={() => setAssignOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={loading || !newDept} className="bg-blue-800 hover:bg-blue-900">
                {loading ? 'Saving…' : item.dept_assigned ? 'Transfer' : 'Assign'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
