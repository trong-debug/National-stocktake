import { createClient } from '@/lib/supabase/server'
import { sendDeptNotification } from '@/lib/email/resend'
import type { Dept } from '@/types'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { itemId, dept, note, assignedBy } = await request.json()

    if (!itemId || !dept) {
      return NextResponse.json({ error: 'Missing itemId or dept' }, { status: 400 })
    }

    const supabase = await createClient()
    const { data: item } = await supabase
      .from('stock_items')
      .select('*')
      .eq('id', itemId)
      .single()

    if (!item) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 })
    }

    await sendDeptNotification(item, dept as Dept, note || item.action_required || '', assignedBy || 'System')

    await supabase.from('stock_items').update({ sent_at: new Date().toISOString() }).eq('id', itemId)

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('Notify error:', err)
    return NextResponse.json({ error: 'Failed to send notification' }, { status: 500 })
  }
}
