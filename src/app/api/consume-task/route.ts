import { NextRequest, NextResponse } from 'next/server'
import { createClient as createServerClient } from '@supabase/supabase-js'

// `tasks` only has a SELECT RLS policy — deleting requires the service role.
function createAdminClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

// Removes a task from the pool as soon as the learner engages with its first
// part (first sub-answer submitted / first chat message sent) — not just on
// full completion — so a partially-seen task never resurfaces in a later
// session. Idempotent: deleting an already-gone id is a silent no-op.
export async function POST(request: NextRequest) {
  const { taskId } = await request.json()
  if (!taskId) return NextResponse.json({ error: 'taskId required' }, { status: 400 })

  await createAdminClient().from('tasks').delete().eq('id', taskId)
  return NextResponse.json({ ok: true })
}
