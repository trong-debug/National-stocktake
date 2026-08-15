'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Branch, Dept, ImportRow } from '@/types'
import { BRANCHES } from '@/lib/constants'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Upload, CheckCircle2, AlertCircle } from 'lucide-react'

// Expected CSV column names (flexible matching)
const FIELD_MAP: Record<string, keyof ImportRow> = {
  'date listed': 'date_listed',
  'client': 'client',
  'serial': 'serial',
  'tracking': 'tracking',
  'customer name': 'customer_name',
  'status': 'status_code',
  'status code': 'status_code',
  'action required': 'action_required',
  'delivery depot': 'delivery_depot',
  'route planners': 'notes_rp',
  'route planner': 'notes_rp',
  'rp': 'notes_rp',
  'customer care': 'notes_cc',
  'cc': 'notes_cc',
  'warehouse': 'notes_wh',
  'wh': 'notes_wh',
  'driver management': 'notes_dm',
  'dm': 'notes_dm',
  'completed': 'status',
  'row': 'imported_row_id',
  'id': 'imported_row_id',
}

const DEPT_STATUS_MAP: Record<string, Dept | null> = {
  'rp': 'RP', 'ops': 'RP', 'saops': 'RP', 'qldops': 'RP', 'waops': 'RP', 'vicops': 'RP', 'cbrops': 'RP', 'nswops': 'RP', 'ntlops': 'RP',
  'cc': 'CC', 'sacc': 'CC', 'qldcc': 'CC', 'wacc': 'CC', 'viccc': 'CC', 'cbrcc': 'CC', 'nswcc': 'CC', 'ntlcc': 'CC',
  'wh': 'WH', 'sawh': 'WH', 'qldwh': 'WH', 'wawh': 'WH', 'vicwh': 'WH', 'cbrwh': 'WH', 'nswwh': 'WH', 'ntlwh': 'WH',
  'dm': 'DM', 'sadm': 'DM', 'qlddm': 'DM', 'wadm': 'DM', 'vicdm': 'DM', 'cbrdm': 'DM', 'nswdm': 'DM', 'ntldm': 'DM',
  'completed': null,
}

function parseCSV(text: string): Record<string, string>[] {
  const lines = text.split('\n').filter(l => l.trim())
  if (lines.length < 2) return []
  const headers = lines[0].split(',').map(h => h.replace(/^"|"$/g, '').trim())
  return lines.slice(1).map(line => {
    const values = line.match(/(".*?"|[^,]+|(?<=,)(?=,)|(?<=,)$|^(?=,))/g) || []
    const row: Record<string, string> = {}
    headers.forEach((h, i) => {
      row[h] = (values[i] || '').replace(/^"|"$/g, '').trim()
    })
    return row
  })
}

function mapRow(raw: Record<string, string>, branch: Branch): ImportRow {
  const row: ImportRow = {
    branch,
    status: 'in_progress',
    dept_assigned: null,
    date_listed: null,
    client: null,
    serial: null,
    tracking: null,
    customer_name: null,
    status_code: null,
    action_required: null,
    delivery_depot: null,
    notes_rp: null,
    notes_cc: null,
    notes_wh: null,
    notes_dm: null,
    imported_row_id: null,
  }

  for (const [rawKey, rawVal] of Object.entries(raw)) {
    if (!rawVal) continue
    const mapped = FIELD_MAP[rawKey.toLowerCase()]
    if (!mapped) continue

    if (mapped === 'status') {
      const lv = rawVal.toLowerCase()
      if (lv === 'true' || lv === 'completed' || lv === '1') {
        row.status = 'completed'
      }
    } else {
      (row as unknown as Record<string, unknown>)[mapped] = rawVal || null
    }
  }

  // Infer dept_assigned from STATUS column if it's a dept code
  const statusVal = raw['STATUS'] || raw['Status'] || ''
  if (statusVal) {
    const dept = DEPT_STATUS_MAP[statusVal.toLowerCase()]
    if (dept !== undefined) {
      row.dept_assigned = dept
      if (dept === null) row.status = 'completed'
    }
  }

  return row
}

export default function ImportPage() {
  const [branch, setBranch] = useState<Branch | ''>('')
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<ImportRow[]>([])
  const [result, setResult] = useState<{ imported: number; errors: number } | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const supabase = createClient()

  function handleFile(f: File | null) {
    setFile(f)
    setPreview([])
    setResult(null)
    if (!f || !branch) return

    const reader = new FileReader()
    reader.onload = e => {
      const text = e.target?.result as string
      const rows = parseCSV(text)
      setPreview(rows.slice(0, 5).map(r => mapRow(r, branch as Branch)))
    }
    reader.readAsText(f)
  }

  async function handleImport() {
    if (!file || !branch) return
    setLoading(true)
    setError('')

    const reader = new FileReader()
    reader.onload = async e => {
      const text = e.target?.result as string
      const rows = parseCSV(text)
      const mapped = rows
        .map(r => mapRow(r, branch as Branch))
        .filter(r => r.client || r.serial || r.tracking || r.customer_name || r.action_required)

      const BATCH = 200
      let imported = 0, errors = 0

      for (let i = 0; i < mapped.length; i += BATCH) {
        const batch = mapped.slice(i, i + BATCH)
        const { data, error: err } = await supabase.from('stock_items').insert(batch).select('id')
        if (err) errors += batch.length
        else imported += (data?.length || 0)
      }

      setResult({ imported, errors })
      setLoading(false)
    }
    reader.readAsText(file)
  }

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-bold">Import from Google Sheet</h1>
        <p className="text-slate-500 text-sm mt-1">
          Export each branch tab as CSV from Google Sheets, then upload here.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Upload CSV</CardTitle>
          <CardDescription>
            Export the tab as <strong>File → Download → CSV</strong>. One branch at a time.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs">Branch <span className="text-red-500">*</span></Label>
            <Select value={branch} onValueChange={v => { setBranch((v ?? '') as Branch); handleFile(file) }}>
              <SelectTrigger className="w-48"><SelectValue placeholder="Select branch" /></SelectTrigger>
              <SelectContent>
                {BRANCHES.map(b => <SelectItem key={b.value} value={b.value}>{b.label} ({b.value})</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">CSV File <span className="text-red-500">*</span></Label>
            <div
              className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-blue-400 transition-colors"
              onClick={() => document.getElementById('csv-input')?.click()}
            >
              <Upload className="h-8 w-8 text-slate-400 mx-auto mb-2" />
              <p className="text-sm text-slate-600">
                {file ? file.name : 'Click to select CSV file'}
              </p>
              <input
                id="csv-input"
                type="file"
                accept=".csv"
                className="hidden"
                onChange={e => handleFile(e.target.files?.[0] || null)}
              />
            </div>
          </div>

          {preview.length > 0 && (
            <div>
              <p className="text-xs font-medium text-slate-500 mb-2">Preview (first 5 rows)</p>
              <div className="overflow-x-auto rounded border text-xs">
                <table className="w-full">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-2 py-1.5 text-left">Client</th>
                      <th className="px-2 py-1.5 text-left">Serial</th>
                      <th className="px-2 py-1.5 text-left">Code</th>
                      <th className="px-2 py-1.5 text-left">Dept</th>
                      <th className="px-2 py-1.5 text-left">Status</th>
                      <th className="px-2 py-1.5 text-left">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {preview.map((r, i) => (
                      <tr key={i} className="border-t">
                        <td className="px-2 py-1.5">{r.client || '—'}</td>
                        <td className="px-2 py-1.5 font-mono">{r.serial || '—'}</td>
                        <td className="px-2 py-1.5 font-mono font-semibold">{r.status_code || '—'}</td>
                        <td className="px-2 py-1.5">{r.dept_assigned || '—'}</td>
                        <td className="px-2 py-1.5">{r.status}</td>
                        <td className="px-2 py-1.5 max-w-[150px] truncate">{r.action_required || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 rounded-md px-3 py-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          {result && (
            <div className="flex items-center gap-2 text-green-700 text-sm bg-green-50 rounded-md px-3 py-2">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              Imported <strong>{result.imported.toLocaleString()}</strong> rows
              {result.errors > 0 && ` · ${result.errors} errors`}
            </div>
          )}

          <div className="flex gap-2">
            <Button
              onClick={handleImport}
              disabled={!file || !branch || loading}
              className="bg-blue-800 hover:bg-blue-900"
            >
              {loading ? 'Importing…' : 'Import'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Instructions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-slate-600">
          <p>1. Open the Google Sheet and navigate to the branch tab (e.g. <strong>NSW/SYD</strong>).</p>
          <p>2. Go to <strong>File → Download → Comma Separated Values (.csv)</strong>.</p>
          <p>3. Select the matching branch above and upload the downloaded CSV.</p>
          <p>4. Click <strong>Import</strong>. Repeat for each branch tab.</p>
          <p className="text-slate-400 text-xs pt-2">
            The importer reads columns: Date Listed, Client, Serial, Tracking, Customer Name, Status, Action Required,
            Delivery Depot, Route Planners, Customer Care, Warehouse, Driver Management.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
