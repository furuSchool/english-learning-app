import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const { taskId, taskType, transcript } = await request.json()
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const today = new Date().toISOString().split('T')[0]

    await Promise.all([
      supabase.from('task_completions').insert({
        user_id: user.id,
        task_id: taskId ?? null,
        task_type: taskType,
        transcript: transcript ?? null,
      }),
      supabase.rpc('increment_activity', { p_date: today }),
    ])

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('complete-task error:', error)
    return NextResponse.json({ error: 'Failed to record completion' }, { status: 500 })
  }
}
