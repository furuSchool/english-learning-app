import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const { phrase, meaning_ja, task_type } = await request.json()
    if (!phrase?.trim()) return NextResponse.json({ error: 'No phrase' }, { status: 400 })

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    await supabase.from('learned_expressions').insert({
      user_id: user.id,
      phrase: phrase.trim(),
      meaning_ja: meaning_ja ?? null,
      task_type: task_type ?? null,
    })

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('save-phrase error:', error)
    return NextResponse.json({ error: 'Failed to save' }, { status: 500 })
  }
}
