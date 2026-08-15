'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Branch } from '@/types'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Trash2 } from 'lucide-react'

interface Props {
  branch: Branch
  totalCount: number
}

export default function ClearBranchButton({ branch, totalCount }: Props) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = createClient()

  async function handleClear() {
    setLoading(true)
    setError('')

    const { error: err } = await supabase
      .from('stock_items')
      .delete()
      .eq('branch', branch)

    if (err) {
      setError(err.message)
      setLoading(false)
      return
    }

    setOpen(false)
    setLoading(false)
    router.refresh()
  }

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className="border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-400 h-9"
        onClick={() => { setError(''); setOpen(true) }}
      >
        <Trash2 className="h-3.5 w-3.5 mr-1.5" />
        Clear All
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-red-600">Clear all items — {branch}?</DialogTitle>
            <DialogDescription>
              This will permanently delete all <strong>{totalCount.toLocaleString()}</strong> items
              in this branch. This cannot be undone.
            </DialogDescription>
          </DialogHeader>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">{error}</p>
          )}

          <div className="flex gap-2 justify-end mt-2">
            <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>
              Cancel
            </Button>
            <Button
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={handleClear}
              disabled={loading}
            >
              {loading ? 'Clearing…' : `Delete all ${totalCount.toLocaleString()} items`}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
