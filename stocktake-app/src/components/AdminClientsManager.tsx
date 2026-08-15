'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Trash2, Users } from 'lucide-react'

interface Client { id: string; name: string; active: boolean }

export default function AdminClientsManager({ initialClients }: { initialClients: Client[] }) {
  const [clients, setClients] = useState<Client[]>(initialClients)
  const [text, setText] = useState('')
  const [importing, setImporting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const supabase = createClient()

  const preview = text.split('\n').map(l => l.trim()).filter(Boolean)

  async function handleImport() {
    if (!preview.length) return
    setImporting(true)
    setError(null)
    setSuccess(null)

    const rows = preview.map(name => ({ name, active: true }))
    const { data, error: err } = await supabase
      .from('clients')
      .upsert(rows, { onConflict: 'name', ignoreDuplicates: true })
      .select('id, name, active')

    if (err) {
      setError(err.message)
    } else {
      const added = data?.length ?? 0
      setSuccess(`Added ${added} new client${added === 1 ? '' : 's'}${preview.length - added > 0 ? ` (${preview.length - added} already existed)` : ''}.`)
      setText('')
      // Re-fetch full sorted list
      const { data: all } = await supabase.from('clients').select('id, name, active').order('name')
      if (all) setClients(all)
    }
    setImporting(false)
  }

  async function handleToggle(id: string, active: boolean) {
    await supabase.from('clients').update({ active: !active }).eq('id', id)
    setClients(cs => cs.map(c => c.id === id ? { ...c, active: !active } : c))
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Remove "${name}" from the client list?`)) return
    await supabase.from('clients').delete().eq('id', id)
    setClients(cs => cs.filter(c => c.id !== id))
  }

  const active = clients.filter(c => c.active)
  const disabled = clients.filter(c => !c.active)

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-bold">Client List</h1>
        <p className="text-slate-500 text-sm mt-1">
          Manage the clients available in the Log Item dropdown. Disabled clients are hidden from the dropdown but kept in history.
        </p>
      </div>

      {/* Import */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Import Clients</CardTitle>
          <CardDescription>Paste one client name per line. Existing names are skipped automatically.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <textarea
            value={text}
            onChange={e => { setText(e.target.value); setSuccess(null); setError(null) }}
            placeholder={"Youfoodz\nAmazon\nDHL\nFedEx\nOzHarvest"}
            className="w-full border rounded-md px-3 py-2 text-sm min-h-[140px] font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {preview.length > 0 && (
            <p className="text-xs text-slate-500">{preview.length} name{preview.length !== 1 ? 's' : ''} ready to import</p>
          )}
          {error && <p className="text-sm text-red-600">{error}</p>}
          {success && <p className="text-sm text-green-600">{success}</p>}
          <Button
            onClick={handleImport}
            disabled={importing || preview.length === 0}
            className="bg-blue-800 hover:bg-blue-900"
          >
            {importing ? 'Importing…' : `Import${preview.length > 0 ? ` ${preview.length} Client${preview.length !== 1 ? 's' : ''}` : ''}`}
          </Button>
        </CardContent>
      </Card>

      {/* Active clients */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Users className="h-4 w-4" />
            {active.length} Active Client{active.length !== 1 ? 's' : ''}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {active.length === 0 ? (
            <p className="px-6 py-4 text-sm text-slate-500">No active clients. Import some above.</p>
          ) : (
            <ul className="divide-y">
              {active.map(c => (
                <li key={c.id} className="flex items-center justify-between px-6 py-2.5">
                  <span className="text-sm">{c.name}</span>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" className="text-xs h-7 text-slate-500" onClick={() => handleToggle(c.id, c.active)}>
                      Disable
                    </Button>
                    <Button variant="ghost" size="sm" className="h-7 text-red-500 hover:text-red-700 hover:bg-red-50" onClick={() => handleDelete(c.id, c.name)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {/* Disabled clients */}
      {disabled.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base text-slate-500">{disabled.length} Disabled</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ul className="divide-y">
              {disabled.map(c => (
                <li key={c.id} className="flex items-center justify-between px-6 py-2.5">
                  <span className="text-sm text-slate-400 line-through">{c.name}</span>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" className="text-xs h-7 text-slate-500" onClick={() => handleToggle(c.id, c.active)}>
                      Enable
                    </Button>
                    <Button variant="ghost" size="sm" className="h-7 text-red-500 hover:text-red-700 hover:bg-red-50" onClick={() => handleDelete(c.id, c.name)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
