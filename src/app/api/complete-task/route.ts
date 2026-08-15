import { NextRequest, NextResponse } from 'next/server'
import { createClient as createServerClient } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/server'

// `tasks` only has a SELECT RLS policy — deleting requires the service role, same as task insertion.
function createAdminClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function POST(request: NextRequest) {
  try {
    const { taskId, taskType, transcript } = await request.json()
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const today = new Date().toISOString().split('T')[0]

    const pending: PromiseLike<unknown>[] = [
      supabase.from('task_completions').insert({
        user_id: user.id,
        task_id: taskId ?? null,
        task_type: taskType,
        transcript: transcript ?? null,
      }),
      supabase.rpc('increment_activity', { p_date: today }),
    ]

    // Primary removal happens earlier, via /api/consume-task, as soon as the learner
    // submits the first part of the task (see requirements §8.1). This is a defensive
    // fallback for the "skip every part" path, where consume-task is never called —
    // idempotent, since the row is usually already gone by the time we get here.
    if (taskId) {
      pending.push(createAdminClient().from('tasks').delete().eq('id', taskId))
    }

    await Promise.all(pending)

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('complete-task error:', error)
    return NextResponse.json({ error: 'Failed to record completion' }, { status: 500 })
  }
}
