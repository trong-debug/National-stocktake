'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Branch, Dept, Profile } from '@/types'
import { DEPTS, STATUS_CODES } from '@/lib/constants'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus } from 'lucide-react'

interface Props {
  branch: Branch
  profile: Profile | null
}

export default function NewItemButton({ branch, profile }: Props) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const [form, setForm] = useState({
    date_listed: new Date().toISOString().split('T')[0],
    client: '',
    serial: '',
    tracking: '',
    customer_name: '',
    status_code: '',
    action_required: '',
    delivery_depot: '',
    dept_assigned: '' as string,
  })

  function set(field: string, value: string) {
    setForm(f => ({ ...f, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setSubmitError(null)

    const { data: item, error } = await supabase
      .from('stock_items')
      .insert({
        branch,
        status: 'in_progress',
        dept_assigned: form.dept_assigned || null,
        date_listed: form.date_listed || null,
        client: form.client || null,
        serial: form.serial || null,
        tracking: form.tracking || null,
        customer_name: form.customer_name || null,
        status_code: form.status_code || null,
        action_required: form.action_required || null,
        delivery_depot: form.delivery_depot || null,
      })
      .select()
      .single()

    if (error) {
      console.error('[NewItemButton] insert error:', error)
      setSubmitError(error.message)
      setLoading(false)
      return
    }

    if (item) {
      const { error: logError } = await supabase.from('action_logs').insert({
        item_id: item.id,
        user_id: profile?.id,
        user_name: profile?.full_name || profile?.email,
        action_type: 'created',
        to_dept: form.dept_assigned || null,
        note: form.action_required || null,
        new_status: 'in_progress',
      })
      if (logError) console.error('[NewItemButton] action_log error:', logError)
      setOpen(false)
      router.refresh()
    }
    setLoading(false)
  }

  return (
    <>
      <Button onClick={() => { setOpen(true); setSubmitError(null) }} className="bg-blue-800 hover:bg-blue-900">
        <Plus className="h-4 w-4 mr-1.5" />
        New Item
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Log New Item — {branch}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 mt-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Date Listed</Label>
                <Input type="date" value={form.date_listed} onChange={e => set('date_listed', e.target.value)} className="h-9 text-sm" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Delivery Depot</Label>
                <Input value={form.delivery_depot} onChange={e => set('delivery_depot', e.target.value)} placeholder="e.g. ABX" className="h-9 text-sm" />
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Client <span className="text-red-500">*</span></Label>
              <Input value={form.client} onChange={e => set('client', e.target.value)} required placeholder="Client name" className="h-9 text-sm" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Serial</Label>
                <Input value={form.serial} onChange={e => set('serial', e.target.value)} placeholder="Order / serial #" className="h-9 text-sm font-mono" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Tracking</Label>
                <Input value={form.tracking} onChange={e => set('tracking', e.target.value)} placeholder="Tracking code" className="h-9 text-sm font-mono" />
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Customer Name</Label>
              <Input value={form.customer_name} onChange={e => set('customer_name', e.target.value)} placeholder="End customer" className="h-9 text-sm" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Status Code</Label>
                <Select value={form.status_code} onValueChange={v => set('status_code', v ?? '')}>
                  <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Select code" /></SelectTrigger>
                  <SelectContent className="max-h-60">
                    {STATUS_CODES.map(s => (
                      <SelectItem key={s.code} value={s.code}>
                        <span className="font-mono font-semibold">{s.code}</span> — {s.description}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Assign to Department</Label>
                <Select value={form.dept_assigned} onValueChange={v => set('dept_assigned', v ?? '')}>
                  <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Select dept" /></SelectTrigger>
                  <SelectContent>
                    {DEPTS.map(d => <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Action Required <span className="text-red-500">*</span></Label>
              <textarea
                value={form.action_required}
                onChange={e => set('action_required', e.target.value)}
                required
                placeholder="Describe the action needed…"
                className="w-full border rounded-md px-3 py-2 text-sm min-h-[80px] focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {submitError && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
                Error: {submitError}
              </p>
            )}

            <div className="flex gap-2 justify-end pt-1">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={loading} className="bg-blue-800 hover:bg-blue-900">
                {loading ? 'Saving…' : 'Log Item'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
