import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { createClient } from '@/lib/supabase/server'
import { buildGeneratePrompt } from '@/lib/prompts'

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

// Split into batches of 4 types to stay well within Gemini output token limits
const BATCHES = [
  ['rapid_fire_qa', 'shadowing_drill', 'quote_reaction', 'video_listening'],
  ['ai_conversation', 'devils_advocate', 'information_gap'],
  ['phrase_activation', 'collocation_builder', 'natural_expression'],
  ['discourse_marker_drill', 'social_formula', 'impromptu_speak', 'situation_survival'],
]

function serializeError(e: unknown): string {
  if (e instanceof Error) return e.message
  if (typeof e === 'string') return e
  try { return JSON.stringify(e) } catch { return 'Unknown error' }
}

async function generateBatch(
  model: ReturnType<InstanceType<typeof GoogleGenerativeAI>['getGenerativeModel']>,
  types: string[]
): Promise<Array<{ type: string; category: string; content: unknown; difficulty: number }>> {
  const prompt = buildGeneratePrompt(types)
  const result = await model.generateContent(prompt)
  const text = result.response.text().trim()

  // Strip markdown code fences (Gemini sometimes wraps response)
  const jsonStr = text
    .replace(/^```(?:json)?\s*/m, '')
    .replace(/\s*```$/m, '')
    .trim()

  const tasks = JSON.parse(jsonStr) as Array<{
    type: string; category?: string; content: unknown; difficulty?: number
  }>

  return tasks.map(t => ({
    type: t.type,
    category: CATEGORY_MAP[t.type] ?? t.category ?? 'output',
    content: t.content,
    difficulty: t.difficulty ?? 1,
  }))
}

export async function POST(_request: NextRequest) {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })
  const supabase = await createClient()

  let totalAdded = 0
  const errors: string[] = []

  for (const batch of BATCHES) {
    try {
      const rows = await generateBatch(model, batch)

      const { error: insertError } = await supabase
        .from('tasks')
        .insert(rows.map(r => ({ ...r, active: true })))

      if (insertError) {
        errors.push(`Insert failed for [${batch.join(', ')}]: ${serializeError(insertError)}`)
      } else {
        totalAdded += rows.length
      }
    } catch (e) {
      errors.push(`Generation failed for [${batch.join(', ')}]: ${serializeError(e)}`)
    }

    // Small delay between batches to avoid rate limits
    await new Promise(r => setTimeout(r, 1000))
  }

  if (totalAdded === 0) {
    return NextResponse.json(
      { error: errors.join('\n') || 'すべてのバッチで生成に失敗しました' },
      { status: 500 }
    )
  }

  return NextResponse.json({
    added: totalAdded,
    warnings: errors.length > 0 ? errors : undefined,
  })
}
