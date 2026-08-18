'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { StockItem, Profile } from '@/types'
import { Button } from '@/components/ui/button'
import { CheckCircle2 } from 'lucide-react'

interface Props {
  item: StockItem
  profile: Profile | null
}

export default function ItemActions({ item: initialItem, profile }: Props) {
  const [item, setItem] = useState(initialItem)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const isCompleted = item.status === 'completed'

  async function handleComplete() {
    setItem(i => ({ ...i, status: 'completed', completed_at: new Date().toISOString() }))
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
    setItem(i => ({ ...i, status: 'in_progress', completed_at: null }))
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
        <Button
          size="sm"
          className="bg-green-700 hover:bg-green-800"
          onClick={handleComplete}
          disabled={loading}
        >
          <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" />
          Mark Complete
        </Button>
      )}
      {isCompleted && (
        <Button variant="outline" size="sm" onClick={handleReopen} disabled={loading}>
          Reopen
        </Button>
      )}
    </div>
  )
}
