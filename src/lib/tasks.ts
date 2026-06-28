import { Task, SessionTaskSet, TaskCategory } from '@/types'
import { createClient } from '@/lib/supabase/client'

const WARMUP_TYPES = ['rapid_fire_qa', 'shadowing_drill']
const INPUT_TYPES = ['video_listening', 'tech_news_react', 'podcast_listening', 'quote_reaction']
const INTERACTIVE_TYPES = ['ai_conversation', 'devils_advocate', 'information_gap', 'news_discussion']
const EXPRESSION_TYPES = ['phrase_activation', 'collocation_builder', 'natural_expression', 'discourse_marker_drill', 'social_formula', 'impromptu_speak', 'situation_survival']

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function pickDistinct<T extends { id: string }>(arr: T[], n: number, exclude: Set<string>): T[] {
  const pool = arr.filter(t => !exclude.has(t.id))
  const shuffled = [...pool].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, n)
}

export async function buildSession(): Promise<SessionTaskSet> {
  const supabase = createClient()
  const { data: tasks, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('active', true)

  if (error || !tasks || tasks.length === 0) {
    throw new Error('タスクが見つかりません。ダッシュボードからタスクを生成してください。')
  }

  const byType = (types: string[]) => tasks.filter((t: Task) => types.includes(t.type))

  const warmupPool = byType(WARMUP_TYPES)
  const inputPool = byType(INPUT_TYPES)
  const interactivePool = byType(INTERACTIVE_TYPES)
  const expressionPool = byType(EXPRESSION_TYPES)

  if (!warmupPool.length || !inputPool.length || interactivePool.length < 2 || !expressionPool.length) {
    throw new Error('タスクが不足しています。ダッシュボードからタスクを生成してください。')
  }

  const warmup = pick(warmupPool)
  const input = pick(inputPool)
  const used = new Set([warmup.id, input.id])
  const [interactive1, interactive2] = pickDistinct(interactivePool, 2, used)
  used.add(interactive1.id)
  used.add(interactive2.id)
  const [expression] = pickDistinct(expressionPool, 1, used)

  return { warmup, input, interactive1, interactive2, expression }
}

export async function getTaskCount(): Promise<number> {
  const supabase = createClient()
  const { count } = await supabase
    .from('tasks')
    .select('*', { count: 'exact', head: true })
    .eq('active', true)
  return count ?? 0
}

export function getTaskLabel(type: string): string {
  const labels: Record<string, string> = {
    rapid_fire_qa: 'Rapid-Fire Q&A',
    shadowing_drill: 'Shadowing Drill',
    video_listening: 'Video Listening',
    tech_news_react: 'Tech News React',
    podcast_listening: 'Podcast Listening',
    quote_reaction: 'Quote Reaction',
    ai_conversation: 'AI Conversation',
    devils_advocate: "Devil's Advocate",
    information_gap: 'Information Gap',
    news_discussion: 'News Discussion',
    phrase_activation: 'Phrase Activation',
    collocation_builder: 'Collocation Builder',
    natural_expression: 'Natural Expression',
    discourse_marker_drill: 'Discourse Marker Drill',
    social_formula: 'Social Formula',
    impromptu_speak: 'Impromptu Speak',
    situation_survival: 'Situation Survival',
  }
  return labels[type] || type
}

export function getCategoryLabel(category: TaskCategory): string {
  const labels: Record<TaskCategory, string> = {
    warmup: 'Warmup',
    input: 'Input',
    interactive: 'Interactive',
    expression: 'Expression',
    output: 'Output',
  }
  return labels[category]
}

export function getCategoryColor(category: TaskCategory): string {
  const colors: Record<TaskCategory, string> = {
    warmup: 'bg-amber-100 text-amber-800 border-amber-200',
    input: 'bg-blue-100 text-blue-800 border-blue-200',
    interactive: 'bg-purple-100 text-purple-800 border-purple-200',
    expression: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    output: 'bg-rose-100 text-rose-800 border-rose-200',
  }
  return colors[category]
}
