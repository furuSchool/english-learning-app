'use client'

import { Task } from '@/types'
import RapidFireQA from './RapidFireQA'
import ShadowingDrill from './ShadowingDrill'
import VideoListening from './VideoListening'
import TechNewsReact from './TechNewsReact'
import PodcastListening from './PodcastListening'
import QuoteReaction from './QuoteReaction'
import AIConversation from './AIConversation'
import DevilsAdvocate from './DevilsAdvocate'
import InformationGap from './InformationGap'
import NewsDiscussion from './NewsDiscussion'
import PhraseActivation from './PhraseActivation'
import CollocationBuilder from './CollocationBuilder'
import NaturalExpression from './NaturalExpression'
import DiscourseMarkerDrill from './DiscourseMarkerDrill'
import SocialFormula from './SocialFormula'
import ImpromtuSpeak from './ImpromtuSpeak'
import SituationSurvival from './SituationSurvival'
import type {
  RapidFireQAContent, ShadowingDrillContent, VideoListeningContent,
  QuoteReactionContent, AIConversationContent, DevilsAdvocateContent,
  InformationGapContent, PhraseActivationContent, CollocationContent,
  NaturalExpressionContent, DiscourseMarkerContent, SocialFormulaContent,
  ImpromtuSpeakContent, SituationSurvivalContent,
} from '@/types'

interface TaskRunnerProps {
  task: Task
  onComplete: (transcript: string) => void
}

export default function TaskRunner({ task, onComplete }: TaskRunnerProps) {
  const p = { taskId: task.id, onComplete }

  switch (task.type) {
    case 'rapid_fire_qa':
      return <RapidFireQA content={task.content as RapidFireQAContent} {...p} />
    case 'shadowing_drill':
      return <ShadowingDrill content={task.content as ShadowingDrillContent} {...p} />
    case 'video_listening':
      return <VideoListening content={task.content as VideoListeningContent} {...p} />
    case 'tech_news_react':
      return <TechNewsReact {...p} />
    case 'podcast_listening':
      return <PodcastListening {...p} />
    case 'quote_reaction':
      return <QuoteReaction content={task.content as QuoteReactionContent} {...p} />
    case 'ai_conversation':
      return <AIConversation content={task.content as AIConversationContent} {...p} />
    case 'devils_advocate':
      return <DevilsAdvocate content={task.content as DevilsAdvocateContent} {...p} />
    case 'information_gap':
      return <InformationGap content={task.content as InformationGapContent} {...p} />
    case 'news_discussion':
      return <NewsDiscussion {...p} />
    case 'phrase_activation':
      return <PhraseActivation content={task.content as PhraseActivationContent} {...p} />
    case 'collocation_builder':
      return <CollocationBuilder content={task.content as CollocationContent} {...p} />
    case 'natural_expression':
      return <NaturalExpression content={task.content as NaturalExpressionContent} {...p} />
    case 'discourse_marker_drill':
      return <DiscourseMarkerDrill content={task.content as DiscourseMarkerContent} {...p} />
    case 'social_formula':
      return <SocialFormula content={task.content as SocialFormulaContent} {...p} />
    case 'impromptu_speak':
      return <ImpromtuSpeak content={task.content as ImpromtuSpeakContent} {...p} />
    case 'situation_survival':
      return <SituationSurvival content={task.content as SituationSurvivalContent} {...p} />
    default:
      return <div className="text-gray-500 text-sm">未対応のタスクタイプです</div>
  }
}
