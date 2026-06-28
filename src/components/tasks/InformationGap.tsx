'use client'

import { InformationGapContent, ChatMessage } from '@/types'
import ChatInterface from '@/components/ui/ChatInterface'

interface Props {
  taskId: string
  content: InformationGapContent
  onComplete: (transcript: string) => void
}

export default function InformationGap({ content, onComplete }: Props) {
  const handleComplete = (messages: ChatMessage[]) => {
    const log = messages.map(m => `[${m.role === 'user' ? 'You' : 'AI'}] ${m.content}`).join('\n')
    onComplete(log)
  }

  return (
    <div className="space-y-4">
      <div className="text-xs text-gray-500 bg-gray-50 rounded-lg px-3 py-2">
        ✍️ Interactive — 質問を重ねて状況を解明してください（4往復以上）
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <p className="text-sm font-semibold text-blue-800 mb-1">Situation</p>
        <p className="text-sm text-gray-800 leading-relaxed">{content.user_prompt}</p>
        <p className="text-xs text-blue-600 mt-2">AIが全容を知っています。英語で質問して解明してください。</p>
      </div>

      <ChatInterface
        taskType="information_gap"
        taskContent={content as unknown as Record<string, unknown>}
        initialMessage="I know what's going on. Ask me questions and I'll tell you what I can."
        minExchanges={4}
        onComplete={handleComplete}
      />
    </div>
  )
}
