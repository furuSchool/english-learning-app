import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { createClient } from '@/lib/supabase/server'
import { buildGeneratePrompt } from '@/lib/prompts'

const STATIC_TYPES = [
  'rapid_fire_qa',
  'shadowing_drill',
  'video_listening',
  'quote_reaction',
  'ai_conversation',
  'devils_advocate',
  'information_gap',
  'phrase_activation',
  'collocation_builder',
  'natural_expression',
  'discourse_marker_drill',
  'social_formula',
  'impromptu_speak',
  'situation_survival',
]

const CATEGORY_MAP: Record<string, string> = {
  rapid_fire_qa: 'warmup',
  shadowing_drill: 'warmup',
  video_listening: 'input',
  quote_reaction: 'input',
  ai_conversation: 'interactive',
  devils_advocate: 'interactive',
  information_gap: 'interactive',
  phrase_activation: 'expression',
  collocation_builder: 'expression',
  natural_expression: 'expression',
  discourse_marker_drill: 'expression',
  social_formula: 'expression',
  impromptu_speak: 'output',
  situation_survival: 'output',
}

export async function POST(_request: NextRequest) {
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })
    const supabase = await createClient()

    const prompt = buildGeneratePrompt(STATIC_TYPES)
    const result = await model.generateContent(prompt)
    const text = result.response.text().trim()

    const jsonStr = text.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim()
    const tasks: Array<{ type: string; category?: string; content: unknown; difficulty: number }> = JSON.parse(jsonStr)

    const rows = tasks.map(t => ({
      type: t.type,
      category: CATEGORY_MAP[t.type] ?? t.category ?? 'output',
      content: t.content,
      difficulty: t.difficulty ?? 1,
      active: true,
    }))

    const { error, count } = await supabase
      .from('tasks')
      .insert(rows)
      .select('id', { count: 'exact', head: true })

    if (error) throw error

    return NextResponse.json({ added: count ?? rows.length })
  } catch (error) {
    console.error('generate-tasks error:', error)
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
