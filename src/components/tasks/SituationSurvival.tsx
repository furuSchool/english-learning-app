'use client'

import { useState } from 'react'
import { SituationSurvivalContent, ChatMessage } from '@/types'
import ChatInterface from '@/components/ui/ChatInterface'
import ConversationLog from '@/components/ui/ConversationLog'
import FeedbackPanel, { FeedbackLoading, FeedbackError } from '@/components/ui/FeedbackPanel'
import { useFeedback } from '@/lib/useFeedback'

interface Props {
  taskId: string
  content: SituationSurvivalContent
  onComplete: (transcript: string) => void
}

export default function SituationSurvival({ taskId, content, onComplete }: Props) {
  const [started, setStarted] = useState(false)
  const [chatDone, setChatDone] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [chatLog, setChatLog] = useState('')
  const { feedback, loading, error, getFeedback } = useFeedback()

  const handleChatComplete = (msgs: ChatMessage[]) => {
    const log = msgs.map(m => `[${m.role === 'user' ? 'You' : 'Other person'}] ${m.content}`).join('\n')
    setMessages(msgs)
    setChatLog(log)
    setChatDone(true)
    getFeedback('situation_survival', { situation: content.situation, chat_log: log })
  }

  return (
    <div className="space-y-5">
      <div className="text-xs text-gray-500 bg-gray-50 rounded-lg px-3 py-2">
        🎤/✍️ Output — この状況を英語で乗り切ってください（2往復以上）
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-2">
        <p className="text-xs text-amber-700 font-semibold">{content.scenario_en}</p>
        <p className="text-sm text-gray-800 leading-relaxed">{content.situation}</p>
        {content.context && <p className="text-xs text-gray-500">{content.context}</p>}
      </div>

      {!started && !chatDone && (
        <button
          onClick={() => setStarted(true)}
          className="w-full py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors"
        >
          シナリオ開始 →
        </button>
      )}

      {started && !chatDone && (
        <ChatInterface
          taskId={taskId}
          taskType="situation_survival"
          taskContent={{
            character: 'Person in the scenario',
            character_description: content.scenario_en,
            opening_line: content.opening_line,
            topic_hint: content.situation,
          }}
          initialMessage={content.opening_line}
          minExchanges={2}
          onComplete={handleChatComplete}
        />
      )}

      {chatDone && (
        <ConversationLog
          messages={messages}
          labels={{ user: 'You', assistant: 'Other person' }}
        />
      )}

      {chatDone && loading && <FeedbackLoading />}
      {chatDone && error && <FeedbackError error={error} onSkip={() => onComplete(chatLog)} />}
      {chatDone && feedback && (
        <FeedbackPanel
          feedback={feedback}
          taskType="situation_survival"
          onContinue={() => onComplete(chatLog)}
        />
      )}
    </div>
  )
}
