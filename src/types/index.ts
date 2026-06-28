export type TaskType =
  | 'rapid_fire_qa'
  | 'taboo_paraphrase'
  | 'ted_listening'
  | 'news_headline'
  | 'visual_impression'
  | 'situation_survival'
  | 'emotion_sharing'
  | 'pattern_practice'

export type TaskCategory = 'warmup' | 'input' | 'output'

export interface RapidFireQAContent {
  questions: string[]
}

export interface TabooParaphraseContent {
  word: string
  forbidden: string[]
  hint: string
}

export interface TEDListeningContent {
  youtube_id: string
  title: string
  question: string
}

export interface NewsHeadlineContent {
  headlines: string[]
}

export interface VisualImpressionContent {
  image_url: string
  prompt: string
}

export interface SituationSurvivalContent {
  situation: string
  scenario_en: string
}

export interface EmotionSharingContent {
  prompt: string
  prompt_en: string
}

export interface PatternPracticeContent {
  japanese: string
  explanation: string
  hint: string
}

export type TaskContent =
  | RapidFireQAContent
  | TabooParaphraseContent
  | TEDListeningContent
  | NewsHeadlineContent
  | VisualImpressionContent
  | SituationSurvivalContent
  | EmotionSharingContent
  | PatternPracticeContent

export interface Task {
  id: string
  type: TaskType
  category: TaskCategory
  content: TaskContent
  difficulty: number
  created_at: string
  active: boolean
}

export interface InlineCorrection {
  original: string
  corrected: string
  explanation: string
}

export interface Feedback {
  corrected_text: string
  inline_corrections: InlineCorrection[]
  error_explanation: string
  native_expressions: string[]
}

export interface LearnedExpression {
  id: string
  user_id: string
  original_input: string
  corrected_text: string | null
  inline_correction: InlineCorrection[] | null
  native_expressions: string[] | null
  error_explanation: string | null
  task_type: string | null
  created_at: string
}

export interface ActivityLog {
  id: string
  user_id: string
  date: string
  task_count: number
  created_at: string
}

export interface DailyTaskSet {
  warmup: Task
  input: Task
  output: Task
  spares: Task[]
}
