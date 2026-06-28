import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const { taskId, taskType, transcript, feedback } = await request.json()
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const today = new Date().toISOString().split('T')[0]

    // Record completion
    await supabase.from('task_completions').insert({
      user_id: user.id,
      task_id: taskId,
      task_type: taskType,
      transcript,
      feedback,
    })

    // Upsert activity log
    await supabase.rpc('increment_activity', { p_date: today })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Complete task error:', error)
    return NextResponse.json({ error: 'Failed to record completion' }, { status: 500 })
  }
}
