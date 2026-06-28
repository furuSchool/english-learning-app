'use client'

import { AIConversationContent, ChatMessage } from '@/types'
import ChatInterface from '@/components/ui/ChatInterface'

interface Props {
  taskId: string
  content: AIConversationContent
  onComplete: (transcript: string) => void
}

export default function AIConversation({ content, onComplete }: Props) {
  const handleComplete = (messages: ChatMessage[]) => {
    const log = messages
      .map(m => `[${m.role === 'user' ? 'You' : content.character}] ${m.content}`)
      .join('\n')
    onComplete(log)
  }

  return (
    <div className="space-y-4">
      <div className="text-xs text-gray-500 bg-gray-50 rounded-lg px-3 py-2">
        🎤/✍️ Interactive — 自然な会話を楽しんでください（3往復以上）
      </div>

      <div className="flex items-center gap-2 text-sm text-gray-600">
        <span className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-base">👤</span>
        <div>
          <span className="font-medium">{content.character}</span>
          <p className="text-xs text-gray-400">{content.character_description}</p>
        </div>
      </div>

      <ChatInterface
        taskType="ai_conversation"
        taskContent={content as unknown as Record<string, unknown>}
        initialMessage={content.opening_line}
        minExchanges={3}
        onComplete={handleComplete}
      />
    </div>
  )
}
