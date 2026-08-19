'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Branch, Dept, Profile } from '@/types'
import { DEPTS } from '@/lib/constants'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import ClientCombobox from '@/components/ClientCombobox'
import DeliveryDepotCombobox from '@/components/DeliveryDepotCombobox'
import StatusCodeCombobox from '@/components/StatusCodeCombobox'
import { Plus, Search } from 'lucide-react'

interface Props {
  branch: Branch
  profile: Profile | null
}

export default function NewItemButton({ branch, profile }: Props) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [searching, setSearching] = useState(false)
  const [searchMsg, setSearchMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [clientList, setClientList] = useState<string[]>([])
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    supabase.from('clients').select('name').eq('active', true).order('name')
      .then(({ data }) => { if (data) setClientList(data.map(r => r.name)) })
  }, [])

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

  async function handleSearch() {
    const tracking = form.tracking.trim()
    if (!tracking) return
    setSearching(true)
    setSearchMsg(null)

    const { data } = await supabase
      .from('stock_items')
      .select('client, serial, customer_name, status_code, delivery_depot, dept_assigned, action_required')
      .ilike('tracking', tracking)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (data) {
      setForm(f => ({
        ...f,
        client: data.client || f.client,
        serial: data.serial || f.serial,
        customer_name: data.customer_name || f.customer_name,
        status_code: data.status_code || f.status_code,
        delivery_depot: data.delivery_depot || f.delivery_depot,
        dept_assigned: data.dept_assigned || f.dept_assigned,
        action_required: data.action_required || f.action_required,
      }))
      setSearchMsg({ type: 'ok', text: 'Fields pre-filled from existing record.' })
    } else {
      setSearchMsg({ type: 'err', text: 'No existing item found with that tracking number.' })
    }

    setSearching(false)
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
      // Close immediately — don't make the user wait for the log insert or refresh
      setOpen(false)
      setLoading(false)

      // Background: log the action then sync the page
      supabase.from('action_logs').insert({
        item_id: item.id,
        user_id: profile?.id,
        user_name: profile?.full_name || profile?.email,
        action_type: 'created',
        to_dept: form.dept_assigned || null,
        note: form.action_required || null,
        new_status: 'in_progress',
      }).then(({ error: logError }) => {
        if (logError) console.error('[NewItemButton] action_log error:', logError)
      })

      router.refresh()
      return
    }
    setLoading(false)
  }

  return (
    <>
      <Button onClick={() => {
        setForm({ date_listed: new Date().toISOString().split('T')[0], client: '', serial: '', tracking: '', customer_name: '', status_code: '', action_required: '', delivery_depot: '', dept_assigned: '' })
        setSubmitError(null)
        setSearchMsg(null)
        setOpen(true)
      }} className="bg-blue-800 hover:bg-blue-900">
        <Plus className="h-4 w-4 mr-1.5" />
        New Item
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-4xl w-[900px]">
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
                <DeliveryDepotCombobox value={form.delivery_depot} onChange={v => set('delivery_depot', v)} />
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Client <span className="text-red-500">*</span></Label>
              <ClientCombobox
                value={form.client}
                onChange={v => set('client', v)}
                clients={clientList}
                placeholder="Type or select client"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Serial</Label>
                <Input value={form.serial} onChange={e => set('serial', e.target.value)} placeholder="Order / serial #" className="h-9 text-sm font-mono" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Tracking</Label>
                <div className="flex gap-1.5">
                  <Input
                    value={form.tracking}
                    onChange={e => { set('tracking', e.target.value); setSearchMsg(null) }}
                    placeholder="Tracking code"
                    className="h-9 text-sm font-mono flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-9 px-3 shrink-0"
                    disabled={searching || !form.tracking.trim()}
                    onClick={handleSearch}
                  >
                    <Search className="h-3.5 w-3.5 mr-1" />
                    {searching ? 'Searching…' : 'Search'}
                  </Button>
                </div>
                {searchMsg && (
                  <p className={`text-xs mt-1 ${searchMsg.type === 'ok' ? 'text-green-600' : 'text-amber-600'}`}>
                    {searchMsg.text}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Customer Name</Label>
              <Input value={form.customer_name} onChange={e => set('customer_name', e.target.value)} placeholder="End customer" className="h-9 text-sm" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Status Code</Label>
                <StatusCodeCombobox value={form.status_code} onChange={v => set('status_code', v)} />
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
