export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { format } from 'date-fns'
import type { StockItem, ActionLog } from '@/types'
import { BRANCH_MAP, DEPT_MAP } from '@/lib/constants'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import ItemActions from '@/components/ItemActions'
import InlineDeptTransfer from '@/components/InlineDeptTransfer'
import ActionLogList from '@/components/ActionLogList'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function ItemPage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user!.id).single()

  const { data: item } = await supabase
    .from('stock_items')
    .select('*, status_code_details:status_codes(code,description,dept_first,dept_notes)')
    .eq('id', id)
    .single()

  if (!item) notFound()

  const { data: logs } = await supabase
    .from('action_logs')
    .select('*')
    .eq('item_id', id)
    .order('created_at', { ascending: false })

  const typedItem = item as unknown as StockItem
  const typedLogs = (logs || []) as ActionLog[]

  const deptInfo = typedItem.dept_assigned ? DEPT_MAP[typedItem.dept_assigned] : null

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-4">
      {/* Back */}
      <Link
        href={`/${typedItem.branch}`}
        className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-900"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to {BRANCH_MAP[typedItem.branch]}
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold bg-blue-900 text-white rounded px-2 py-0.5">{typedItem.branch}</span>
            <h1 className="text-xl font-bold">{typedItem.client || 'Unknown Client'}</h1>
            {typedItem.status_code && (
              <span className="bg-slate-100 text-slate-700 text-xs font-mono font-semibold rounded px-2 py-0.5 border">
                {typedItem.status_code}
              </span>
            )}
            <span className={cn(
              'text-xs rounded-full px-2.5 py-0.5 font-medium',
              typedItem.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'
            )}>
              {typedItem.status === 'completed' ? 'Completed' : 'In Progress'}
            </span>
          </div>
          {deptInfo && (
            <p className="text-sm text-slate-500 mt-1">
              Assigned to <span className="font-semibold text-slate-700">{deptInfo.label}</span>
            </p>
          )}
        </div>
        <ItemActions item={typedItem} profile={profile} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Detail card */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-slate-600 uppercase tracking-wide">Delivery Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <DetailRow label="Date Listed" value={typedItem.date_listed ? format(new Date(typedItem.date_listed), 'd MMMM yyyy') : null} />
            <DetailRow label="Client" value={typedItem.client} />
            <DetailRow label="Serial" value={typedItem.serial} mono />
            <DetailRow label="Tracking" value={typedItem.tracking} mono />
            <DetailRow label="Customer Name" value={typedItem.customer_name} />
            <DetailRow label="Delivery Depot" value={typedItem.delivery_depot} />
            <Separator />
            <DetailRow
              label="Status Code"
              value={typedItem.status_code_details
                ? `${typedItem.status_code} — ${(typedItem.status_code_details as unknown as { description: string }).description}`
                : typedItem.status_code}
            />
            {typedItem.status_code_details && (typedItem.status_code_details as unknown as { dept_notes: string | null }).dept_notes && (
              <DetailRow label="Dept Notes" value={(typedItem.status_code_details as unknown as { dept_notes: string }).dept_notes} />
            )}
            <Separator />
            <div>
              <p className="text-xs font-medium text-slate-500 mb-1">Action Required</p>
              <p className="text-sm bg-blue-50 border border-blue-100 rounded-md px-3 py-2 text-slate-800 whitespace-pre-wrap">
                {typedItem.action_required || <span className="text-slate-400 italic">No action note</span>}
              </p>
            </div>
            {typedItem.status !== 'completed' && (
              <>
                <Separator />
                <InlineDeptTransfer item={typedItem} profile={profile} />
              </>
            )}
          </CardContent>
        </Card>

        {/* Department notes */}
        <div className="space-y-3">
          <DeptNoteCard dept="RP" label="Route Planner" note={typedItem.notes_rp} color="border-blue-300 bg-blue-50" />
          <DeptNoteCard dept="CC" label="Customer Care" note={typedItem.notes_cc} color="border-purple-300 bg-purple-50" />
          <DeptNoteCard dept="WH" label="Warehouse" note={typedItem.notes_wh} color="border-amber-300 bg-amber-50" />
          <DeptNoteCard dept="DM" label="Driver Mgmt" note={typedItem.notes_dm} color="border-green-300 bg-green-50" />
        </div>
      </div>

      {/* Action log */}
      <ActionLogList logs={typedLogs} />
    </div>
  )
}

function DetailRow({ label, value, mono }: { label: string; value: string | null | undefined; mono?: boolean }) {
  return (
    <div className="flex gap-4">
      <span className="text-xs font-medium text-slate-500 w-32 shrink-0 pt-0.5">{label}</span>
      <span className={cn('text-sm text-slate-900', mono && 'font-mono', !value && 'text-slate-400 italic')}>
        {value || '—'}
      </span>
    </div>
  )
}

function DeptNoteCard({ dept, label, note, color }: { dept: string; label: string; note: string | null; color: string }) {
  if (!note) return null
  return (
    <div className={cn('rounded-lg border p-3 text-sm', color)}>
      <p className="text-xs font-bold text-slate-600 mb-1">{dept} · {label}</p>
      <p className="text-slate-800 whitespace-pre-wrap">{note}</p>
    </div>
  )
}
