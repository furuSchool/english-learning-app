'use client'

import { useState } from 'react'
import { SituationSurvivalContent, ChatMessage } from '@/types'
import ChatInterface from '@/components/ui/ChatInterface'

interface Props {
  taskId: string
  content: SituationSurvivalContent
  onComplete: (transcript: string) => void
}

export default function SituationSurvival({ content, onComplete }: Props) {
  const [started, setStarted] = useState(false)

  const handleComplete = (messages: ChatMessage[]) => {
    const log = messages.map(m => `[${m.role === 'user' ? 'You' : 'Other person'}] ${m.content}`).join('\n')
    onComplete(log)
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

      {!started ? (
        <button
          onClick={() => setStarted(true)}
          className="w-full py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors"
        >
          シナリオ開始 →
        </button>
      ) : (
        <ChatInterface
          taskType="ai_conversation"
          taskContent={{
            character: 'Person in the scenario',
            character_description: content.scenario_en,
            opening_line: content.opening_line,
            topic_hint: content.situation,
          }}
          initialMessage={content.opening_line}
          minExchanges={2}
          onComplete={handleComplete}
        />
      )}
    </div>
  )
}
