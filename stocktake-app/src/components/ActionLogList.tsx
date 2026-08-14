import { format, formatDistanceToNow } from 'date-fns'
import type { ActionLog, ActionType } from '@/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

const ACTION_LABELS: Record<ActionType, string> = {
  created: 'Item created',
  assigned: 'Assigned to department',
  transferred: 'Transferred to department',
  note_added: 'Note added',
  status_changed: 'Status changed',
  completed: 'Marked complete',
  imported: 'Imported from sheet',
}

const ACTION_COLORS: Record<ActionType, string> = {
  created: 'bg-blue-100 text-blue-700',
  assigned: 'bg-purple-100 text-purple-700',
  transferred: 'bg-amber-100 text-amber-700',
  note_added: 'bg-slate-100 text-slate-700',
  status_changed: 'bg-slate-100 text-slate-700',
  completed: 'bg-green-100 text-green-700',
  imported: 'bg-slate-100 text-slate-700',
}

const DEPT_COLORS: Record<string, string> = {
  RP: 'text-blue-700 font-semibold',
  CC: 'text-purple-700 font-semibold',
  WH: 'text-amber-700 font-semibold',
  DM: 'text-green-700 font-semibold',
}

interface Props {
  logs: ActionLog[]
}

export default function ActionLogList({ logs }: Props) {
  if (logs.length === 0) return null

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold text-slate-600 uppercase tracking-wide">
          Activity Log ({logs.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y">
          {logs.map(log => (
            <div key={log.id} className="px-4 py-3 flex gap-3 items-start">
              <span className={cn('text-xs rounded-full px-2 py-0.5 font-medium mt-0.5 whitespace-nowrap', ACTION_COLORS[log.action_type])}>
                {ACTION_LABELS[log.action_type] || log.action_type}
              </span>
              <div className="flex-1 min-w-0">
                {(log.from_dept || log.to_dept) && (
                  <p className="text-sm">
                    {log.from_dept && <span className={DEPT_COLORS[log.from_dept]}>{log.from_dept}</span>}
                    {log.from_dept && log.to_dept && <span className="text-slate-400 mx-1">→</span>}
                    {log.to_dept && <span className={DEPT_COLORS[log.to_dept]}>{log.to_dept}</span>}
                  </p>
                )}
                {log.note && (
                  <p className="text-sm text-slate-700 mt-0.5 whitespace-pre-wrap">{log.note}</p>
                )}
                {log.old_status && log.new_status && (
                  <p className="text-xs text-slate-500 mt-0.5">
                    {log.old_status} → {log.new_status}
                  </p>
                )}
              </div>
              <div className="text-right shrink-0">
                <p className="text-xs text-slate-500">
                  {formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}
                </p>
                {log.user_name && (
                  <p className="text-xs text-slate-400">{log.user_name}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
