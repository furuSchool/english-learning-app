export type TaskType =
  | 'rapid_fire_qa'
  | 'shadowing_drill'
  | 'video_listening'
  | 'tech_news_react'
  | 'podcast_listening'
  | 'quote_reaction'
  | 'ai_conversation'
  | 'devils_advocate'
  | 'information_gap'
  | 'news_discussion'
  | 'phrase_activation'
  | 'collocation_builder'
  | 'natural_expression'
  | 'discourse_marker_drill'
  | 'social_formula'
  | 'impromptu_speak'
  | 'situation_survival'

export type TaskCategory = 'warmup' | 'input' | 'interactive' | 'expression' | 'output'

// ── Task content types ─────────────────────────────────────────────────────

export interface RapidFireQAContent {
  questions: string[]
}

export interface ShadowingDrillContent {
  text: string
  source_context: string
  focus_point: string
}

export interface VideoListeningContent {
  youtube_id: string
  title: string
  channel: string
  speaker?: string
  question: string
}

export interface LiveContent {
  live: true
}

export interface TechNewsReactContent {
  live?: true
  // populated at runtime by /api/fetch-news
  title?: string
  summary?: string
  source_url?: string
}

export interface PodcastListeningContent {
  live?: true
  // populated at runtime by /api/fetch-podcast
  episode_title?: string
  audio_url?: string
  description?: string
  questions?: string[]
}

export interface QuoteReactionContent {
  quote: string
  author: string
  prompt: string
}

export interface AIConversationContent {
  character: string
  character_description: string
  opening_line: string
  topic_hint: string
}

export interface DevilsAdvocateContent {
  topic: string
  user_prompt: string
}

export interface InformationGapContent {
  scenario_description: string
  user_prompt: string
  reveal_hints: string[]
  final_reveal: string
}

export interface NewsMeta {
  title: string
  summary: string
  source_url?: string
}

export interface NewsDiscussionContent {
  live?: true
  // populated at runtime
  news?: NewsMeta
}

export interface PhraseActivationContent {
  phrases: {
    phrase: string
    meaning_ja: string
    example: string
  }[]
}

export interface CollocationContent {
  collocations: {
    wrong: string
    correct: string
    context: string
    trap_note: string
  }[]
}

export interface NaturalExpressionContent {
  japanese: string
  literal_translation: string
  explanation_ja: string
  natural_expressions: {
    english: string
    context: string
  }[]
}

export interface DiscourseMarkerContent {
  markers: string[]
  marker_hints: Record<string, string>
  topic: string
}

export interface SocialFormulaContent {
  formula_focus: string
  useful_phrases: string[]
  scenario: string
}

export interface ImpromtuSpeakContent {
  topic: string
  category: string
  starter_hint: string
}

export interface SituationSurvivalContent {
  situation: string
  scenario_en: string
  opening_line: string
  context?: string
}

export type TaskContent =
  | RapidFireQAContent
  | ShadowingDrillContent
  | VideoListeningContent
  | TechNewsReactContent
  | PodcastListeningContent
  | QuoteReactionContent
  | AIConversationContent
  | DevilsAdvocateContent
  | InformationGapContent
  | NewsDiscussionContent
  | PhraseActivationContent
  | CollocationContent
  | NaturalExpressionContent
  | DiscourseMarkerContent
  | SocialFormulaContent
  | ImpromtuSpeakContent
  | SituationSurvivalContent

export interface Task {
  id: string
  type: TaskType
  category: TaskCategory
  content: TaskContent
  difficulty: number
  created_at: string
  active: boolean
}

// ── Session ────────────────────────────────────────────────────────────────

export interface SessionTaskSet {
  warmup: Task
  input: Task
  interactive: Task
  expression: Task
  output: Task
}

// ── Chat (interactive tasks) ───────────────────────────────────────────────

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

// ── Learned expressions ────────────────────────────────────────────────────

export interface LearnedExpression {
  id: string
  user_id: string
  phrase: string
  meaning_ja: string | null
  task_type: string | null
  created_at: string
}

// ── Activity ───────────────────────────────────────────────────────────────

export interface ActivityLog {
  id: string
  user_id: string
  date: string
  task_count: number
  created_at: string
}
