import { Task, DailyTaskSet, TaskCategory } from '@/types'
import { createClient } from '@/lib/supabase/client'

export async function fetchDailyTasks(): Promise<DailyTaskSet> {
  const supabase = createClient()
  const { data: tasks, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('active', true)
    .order('created_at', { ascending: false })

  if (error || !tasks || tasks.length === 0) {
    throw new Error('Failed to fetch tasks')
  }

  const byCategory = {
    warmup: tasks.filter((t: Task) => t.category === 'warmup'),
    input: tasks.filter((t: Task) => t.category === 'input'),
    output: tasks.filter((t: Task) => t.category === 'output'),
  }

  const pick = (arr: Task[]) => arr[Math.floor(Math.random() * arr.length)]
  const pickN = (arr: Task[], n: number): Task[] => {
    const shuffled = [...arr].sort(() => Math.random() - 0.5)
    return shuffled.slice(0, n)
  }

  const warmup = pick(byCategory.warmup)
  const input = pick(byCategory.input)
  const output = pick(byCategory.output)

  const usedIds = new Set([warmup.id, input.id, output.id])
  const remaining = tasks.filter((t: Task) => !usedIds.has(t.id))
  const spares = pickN(remaining, 8)

  return { warmup, input, output, spares }
}

export function getTaskLabel(type: string): string {
  const labels: Record<string, string> = {
    rapid_fire_qa: 'Rapid-Fire Q&A',
    taboo_paraphrase: 'Taboo Paraphrase',
    ted_listening: 'TED Listening',
    news_headline: 'News Headline',
    visual_impression: 'Visual Impression',
    situation_survival: 'Situation Survival',
    emotion_sharing: 'Emotion Sharing',
    pattern_practice: 'Pattern Practice',
  }
  return labels[type] || type
}

export function getCategoryLabel(category: TaskCategory): string {
  const labels: Record<TaskCategory, string> = {
    warmup: 'ウォーミングアップ',
    input: 'インプット',
    output: 'アウトプット',
  }
  return labels[category]
}

export function getCategoryColor(category: TaskCategory): string {
  const colors: Record<TaskCategory, string> = {
    warmup: 'bg-amber-100 text-amber-800 border-amber-200',
    input: 'bg-blue-100 text-blue-800 border-blue-200',
    output: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  }
  return colors[category]
}
