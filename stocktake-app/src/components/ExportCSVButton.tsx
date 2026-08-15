'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Branch } from '@/types'
import { Button } from '@/components/ui/button'
import { Download } from 'lucide-react'

interface Props {
  branch: Branch
}

const HEADERS = [
  'Date Listed',
  'Client',
  'Serial',
  'Tracking',
  'Customer Name',
  'Status Code',
  'Action Required',
  'Delivery Depot',
  'Route Planners',
  'Customer Care',
  'Warehouse',
  'Driver Management',
  'Dept',
  'Status',
]

function escapeCSV(val: string | null | undefined): string {
  if (val == null || val === '') return ''
  const s = String(val)
  if (s.includes(',') || s.includes('"') || s.includes('\n')) {
    return `"${s.replace(/"/g, '""')}"`
  }
  return s
}

export default function ExportCSVButton({ branch }: Props) {
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  async function handleExport() {
    setLoading(true)

    const { data: items, error } = await supabase
      .from('stock_items')
      .select('date_listed,client,serial,tracking,customer_name,status_code,action_required,delivery_depot,notes_rp,notes_cc,notes_wh,notes_dm,dept_assigned,status')
      .eq('branch', branch)
      .order('created_at', { ascending: false })

    if (error || !items) {
      console.error(error)
      setLoading(false)
      return
    }

    const rows = [
      HEADERS.join(','),
      ...items.map(r => [
        escapeCSV(r.date_listed),
        escapeCSV(r.client),
        escapeCSV(r.serial),
        escapeCSV(r.tracking),
        escapeCSV(r.customer_name),
        escapeCSV(r.status_code),
        escapeCSV(r.action_required),
        escapeCSV(r.delivery_depot),
        escapeCSV(r.notes_rp),
        escapeCSV(r.notes_cc),
        escapeCSV(r.notes_wh),
        escapeCSV(r.notes_dm),
        escapeCSV(r.dept_assigned),
        escapeCSV(r.status),
      ].join(',')),
    ]

    const blob = new Blob([rows.join('\n')], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `stocktake-${branch}-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
    setLoading(false)
  }

  return (
    <Button
      variant="outline"
      size="sm"
      className="h-9"
      onClick={handleExport}
      disabled={loading}
    >
      <Download className="h-3.5 w-3.5 mr-1.5" />
      {loading ? 'Exporting…' : 'Export CSV'}
    </Button>
  )
}
