import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { buildFeedbackPrompt } from '@/lib/prompts'

export async function POST(request: NextRequest) {
  try {
    const { task_type, context } = await request.json() as {
      task_type: string
      context: Record<string, unknown>
    }

    const prompt = buildFeedbackPrompt(task_type, context)
    console.log('\n[DEBUG /api/feedback] task_type:', task_type)
    console.log('[DEBUG /api/feedback] prompt:\n' + prompt)
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

    const result = await model.generateContent(prompt)
    const text = result.response.text().trim()

    // Extract JSON block
    const match = text.match(/\{[\s\S]*\}/)
    if (!match) throw new Error('No JSON in response')

    const feedback = JSON.parse(match[0])
    return NextResponse.json(feedback)
  } catch (error) {
    console.error('feedback error:', error)
    return NextResponse.json({ error: 'Failed to get feedback' }, { status: 500 })
  }
}
