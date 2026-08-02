import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { createClient as createServerClient } from '@supabase/supabase-js'
import { buildGeneratePrompt } from '@/lib/prompts'
import { CURATED_VIDEOS, pickRandomVideo } from '@/lib/ted-talks'

function createAdminClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

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

// Task types available for AI generation, grouped by session category.
// video_listening is excluded — it comes from a curated list, no AI involved.
const CATEGORY_TASK_TYPES: Record<string, string[]> = {
  warmup: ['rapid_fire_qa', 'shadowing_drill'],
  input: ['quote_reaction'],
  interactive: ['ai_conversation', 'devils_advocate', 'information_gap'],
  expression: ['phrase_activation', 'collocation_builder', 'natural_expression', 'discourse_marker_drill', 'social_formula'],
  output: ['impromptu_speak', 'situation_survival'],
}

const GENERATION_ROUNDS = 10
const CATEGORIES_PER_ROUND = 2
const DELAY_BETWEEN_CALLS_MS = 500

function pickOne<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function pickDistinct<T>(arr: T[], n: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, n)
}

/** Generate 3 video_listening tasks from the curated list — no AI involved */
function buildVideoTasks() {
  const usedIds: string[] = []
  return Array.from({ length: 3 }, () => {
    const video = pickRandomVideo(usedIds)
    usedIds.push(video.youtube_id)
    return {
      type: 'video_listening',
      category: 'input',
      difficulty: 1,
      content: {
        youtube_id: video.youtube_id,
        title: video.title,
        speaker: video.speaker,
        channel: video.channel,
        question: video.question,
      },
    }
  })
}

function serializeError(e: unknown): string {
  if (e instanceof Error) return e.message
  if (typeof e === 'string') return e
  try { return JSON.stringify(e) } catch { return 'Unknown error' }
}

async function generateOneTask(
  model: ReturnType<InstanceType<typeof GoogleGenerativeAI>['getGenerativeModel']>,
  type: string
): Promise<{ type: string; category: string; content: unknown; difficulty: number }> {
  const prompt = buildGeneratePrompt(type)
  const result = await model.generateContent(prompt)
  const text = result.response.text().trim()

  const jsonStr = text
    .replace(/^```(?:json)?\s*/m, '')
    .replace(/\s*```$/m, '')
    .trim()

  const parsed = JSON.parse(jsonStr) as { difficulty?: number; content: unknown }

  return {
    type,
    category: CATEGORY_MAP[type],
    content: parsed.content,
    difficulty: parsed.difficulty ?? 1,
  }
}

export async function POST(_request: NextRequest) {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })
  const supabase = createAdminClient()

  let totalAdded = 0
  const errors: string[] = []

  // 1. Insert curated video_listening tasks (no AI — guaranteed correct IDs)
  const videoTasks = buildVideoTasks()
  const { error: videoInsertError } = await supabase
    .from('tasks')
    .insert(videoTasks.map(r => ({ ...r, active: true })))
  if (videoInsertError) {
    errors.push(`video_listening insert failed: ${serializeError(videoInsertError)}`)
  } else {
    totalAdded += videoTasks.length
  }

  // 2. 10 rounds: each round randomly picks 2 of the 5 session categories, and
  //    generates exactly 1 task (a random type within that category) for each —
  //    one Gemini call per task, so topics stay varied and prompts stay small.
  const categories = Object.keys(CATEGORY_TASK_TYPES)

  for (let round = 0; round < GENERATION_ROUNDS; round++) {
    const roundCategories = pickDistinct(categories, CATEGORIES_PER_ROUND)

    for (const category of roundCategories) {
      const type = pickOne(CATEGORY_TASK_TYPES[category])
      try {
        const row = await generateOneTask(model, type)
        const { error: insertError } = await supabase
          .from('tasks')
          .insert([{ ...row, active: true }])

        if (insertError) {
          errors.push(`Insert failed for [${type}]: ${serializeError(insertError)}`)
        } else {
          totalAdded += 1
        }
      } catch (e) {
        errors.push(`Generation failed for [${type}]: ${serializeError(e)}`)
      }

      await new Promise(r => setTimeout(r, DELAY_BETWEEN_CALLS_MS))
    }
  }

  if (totalAdded === 0) {
    return NextResponse.json(
      { error: errors.join('\n') || 'すべてのタスクで生成に失敗しました' },
      { status: 500 }
    )
  }

  return NextResponse.json({
    added: totalAdded,
    warnings: errors.length > 0 ? errors : undefined,
  })
}

// Export curated video count for admin info
export { CURATED_VIDEOS }
