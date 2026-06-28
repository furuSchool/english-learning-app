'use client'

import { Task, Feedback } from '@/types'
import RapidFireQA from './RapidFireQA'
import TabooParaphrase from './TabooParaphrase'
import TEDListening from './TEDListening'
import NewsHeadline from './NewsHeadline'
import VisualImpression from './VisualImpression'
import SituationSurvival from './SituationSurvival'
import EmotionSharing from './EmotionSharing'
import PatternPractice from './PatternPractice'
import {
  RapidFireQAContent, TabooParaphraseContent, TEDListeningContent,
  NewsHeadlineContent, VisualImpressionContent, SituationSurvivalContent,
  EmotionSharingContent, PatternPracticeContent
} from '@/types'

interface TaskRunnerProps {
  task: Task
  onComplete: (transcript: string, feedback: Feedback | null) => void
}

export default function TaskRunner({ task, onComplete }: TaskRunnerProps) {
  const props = { taskId: task.id, onComplete }

  switch (task.type) {
    case 'rapid_fire_qa':
      return <RapidFireQA content={task.content as RapidFireQAContent} {...props} />
    case 'taboo_paraphrase':
      return <TabooParaphrase content={task.content as TabooParaphraseContent} {...props} />
    case 'ted_listening':
      return <TEDListening content={task.content as TEDListeningContent} {...props} />
    case 'news_headline':
      return <NewsHeadline content={task.content as NewsHeadlineContent} {...props} />
    case 'visual_impression':
      return <VisualImpression content={task.content as VisualImpressionContent} {...props} />
    case 'situation_survival':
      return <SituationSurvival content={task.content as SituationSurvivalContent} {...props} />
    case 'emotion_sharing':
      return <EmotionSharing content={task.content as EmotionSharingContent} {...props} />
    case 'pattern_practice':
      return <PatternPractice content={task.content as PatternPracticeContent} {...props} />
    default:
      return <div className="text-gray-500 text-sm">未対応のタスクタイプです</div>
  }
}
