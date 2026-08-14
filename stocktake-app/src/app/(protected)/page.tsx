import { createClient } from '@/lib/supabase/server'
import { BRANCH_MAP } from '@/lib/constants'
import type { Branch, BranchStats } from '@/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { ArrowRight, CheckCircle2, Clock, Package } from 'lucide-react'

export const revalidate = 30

export default async function DashboardPage() {
  const supabase = await createClient()

  const { data: stats } = await supabase
    .from('dashboard_stats')
    .select('*')

  const rows: BranchStats[] = (stats || []).map((s: Record<string, unknown>) => ({
    branch: s.branch as Branch,
    label: BRANCH_MAP[s.branch as Branch] ?? String(s.branch),
    rp: Number(s.rp) || 0,
    cc: Number(s.cc) || 0,
    wh: Number(s.wh) || 0,
    dm: Number(s.dm) || 0,
    unassigned: Number(s.unassigned) || 0,
    in_progress: Number(s.in_progress) || 0,
    completed: Number(s.completed) || 0,
    total: Number(s.total) || 0,
  }))

  const totalInProgress = rows.reduce((a, r) => a + r.in_progress, 0)
  const totalCompleted  = rows.reduce((a, r) => a + r.completed, 0)
  const totalItems      = rows.reduce((a, r) => a + r.total, 0)

  // Sort branches by in_progress desc
  const sorted = [...rows].sort((a, b) => b.in_progress - a.in_progress)

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">National Stocktake 2026</h1>
        <p className="text-slate-500 text-sm mt-1">Live across all branches · open items split by department</p>
      </div>

      {/* Top-level totals */}
      <div className="grid grid-cols-3 gap-4">
        <StatCard
          label="Open (In Progress)"
          value={totalInProgress.toLocaleString()}
          icon={<Clock className="h-5 w-5 text-amber-500" />}
          color="border-l-amber-400"
        />
        <StatCard
          label="Completed"
          value={totalCompleted.toLocaleString()}
          icon={<CheckCircle2 className="h-5 w-5 text-green-500" />}
          color="border-l-green-400"
        />
        <StatCard
          label="Total Items"
          value={totalItems.toLocaleString()}
          icon={<Package className="h-5 w-5 text-blue-500" />}
          color="border-l-blue-400"
        />
      </div>

      {/* Branch table */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">By Branch</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-slate-50">
                  <th className="text-left px-4 py-3 text-slate-600 font-medium">Branch</th>
                  <th className="text-right px-4 py-3 text-blue-600 font-medium">RP</th>
                  <th className="text-right px-4 py-3 text-purple-600 font-medium">CC</th>
                  <th className="text-right px-4 py-3 text-amber-600 font-medium">WH</th>
                  <th className="text-right px-4 py-3 text-green-600 font-medium">DM</th>
                  <th className="text-right px-4 py-3 text-slate-500 font-medium">Unassigned</th>
                  <th className="text-right px-4 py-3 text-slate-600 font-medium">In Progress</th>
                  <th className="text-right px-4 py-3 text-slate-600 font-medium">Completed</th>
                  <th className="text-right px-4 py-3 text-slate-600 font-medium">Total</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {sorted.map((row, i) => (
                  <tr key={row.branch} className={`border-b hover:bg-slate-50 transition-colors ${i % 2 === 0 ? '' : 'bg-slate-50/50'}`}>
                    <td className="px-4 py-3 font-medium text-slate-900">
                      <span className="inline-flex items-center gap-2">
                        <span className="text-xs font-bold bg-blue-900 text-white rounded px-1.5 py-0.5">{row.branch}</span>
                        {row.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-blue-700 font-medium">{row.rp.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right text-purple-700 font-medium">{row.cc.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right text-amber-700 font-medium">{row.wh.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right text-green-700 font-medium">{row.dm.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right text-slate-500">{row.unassigned.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right font-semibold text-amber-700">{row.in_progress.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right text-green-700">{row.completed.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right font-semibold">{row.total.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/${row.branch}`}
                        className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 text-xs font-medium"
                      >
                        View <ArrowRight className="h-3 w-3" />
                      </Link>
                    </td>
                  </tr>
                ))}
                {/* Totals row */}
                <tr className="bg-slate-100 font-semibold border-t-2 border-slate-300">
                  <td className="px-4 py-3 text-slate-900">TOTAL</td>
                  <td className="px-4 py-3 text-right text-blue-700">{rows.reduce((a,r)=>a+r.rp,0).toLocaleString()}</td>
                  <td className="px-4 py-3 text-right text-purple-700">{rows.reduce((a,r)=>a+r.cc,0).toLocaleString()}</td>
                  <td className="px-4 py-3 text-right text-amber-700">{rows.reduce((a,r)=>a+r.wh,0).toLocaleString()}</td>
                  <td className="px-4 py-3 text-right text-green-700">{rows.reduce((a,r)=>a+r.dm,0).toLocaleString()}</td>
                  <td className="px-4 py-3 text-right text-slate-500">{rows.reduce((a,r)=>a+r.unassigned,0).toLocaleString()}</td>
                  <td className="px-4 py-3 text-right text-amber-700">{totalInProgress.toLocaleString()}</td>
                  <td className="px-4 py-3 text-right text-green-700">{totalCompleted.toLocaleString()}</td>
                  <td className="px-4 py-3 text-right">{totalItems.toLocaleString()}</td>
                  <td />
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function StatCard({ label, value, icon, color }: { label: string; value: string; icon: React.ReactNode; color: string }) {
  return (
    <Card className={`border-l-4 ${color}`}>
      <CardContent className="pt-4 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wider font-medium">{label}</p>
            <p className="text-3xl font-bold text-slate-900 mt-1">{value}</p>
          </div>
          {icon}
        </div>
      </CardContent>
    </Card>
  )
}
