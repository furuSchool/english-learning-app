import { NextRequest, NextResponse } from 'next/server'
import { getFeedback } from '@/lib/gemini'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const { transcript, taskContext, taskType } = await request.json()

    if (!transcript?.trim()) {
      return NextResponse.json({ error: 'No transcript provided' }, { status: 400 })
    }

    const feedback = await getFeedback(transcript, taskContext)

    // Save to learned_expressions if there are corrections
    if (feedback.inline_corrections.length > 0 || feedback.native_expressions.length > 0) {
      const supabase = await createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        await supabase.from('learned_expressions').insert({
          user_id: user.id,
          original_input: transcript,
          corrected_text: feedback.corrected_text,
          inline_correction: feedback.inline_corrections,
          native_expressions: feedback.native_expressions,
          error_explanation: feedback.error_explanation,
          task_type: taskType,
        })
      }
    }

    return NextResponse.json(feedback)
  } catch (error) {
    console.error('Feedback error:', error)
    return NextResponse.json({ error: 'Failed to generate feedback' }, { status: 500 })
  }
}
