'use client'

import { useState } from 'react'
import { AIConversationContent, ChatMessage } from '@/types'
import ChatInterface from '@/components/ui/ChatInterface'
import ConversationLog from '@/components/ui/ConversationLog'
import FeedbackPanel, { FeedbackLoading, FeedbackError } from '@/components/ui/FeedbackPanel'
import { useFeedback } from '@/lib/useFeedback'

interface Props {
  taskId: string
  content: AIConversationContent
  onComplete: (transcript: string) => void
}

export default function AIConversation({ taskId, content, onComplete }: Props) {
  const [chatDone, setChatDone] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [chatLog, setChatLog] = useState('')
  const { feedback, loading, error, getFeedback } = useFeedback()

  const handleChatComplete = (msgs: ChatMessage[]) => {
    const log = msgs
      .map(m => `[${m.role === 'user' ? 'You' : content.character}] ${m.content}`)
      .join('\n')
    setMessages(msgs)
    setChatLog(log)
    setChatDone(true)
    getFeedback('ai_conversation', { character: content.character, chat_log: log })
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

      {!chatDone && (
        <ChatInterface
          taskId={taskId}
          taskType="ai_conversation"
          taskContent={content as unknown as Record<string, unknown>}
          initialMessage={content.opening_line}
          minExchanges={3}
          onComplete={handleChatComplete}
        />
      )}

      {chatDone && (
        <ConversationLog
          messages={messages}
          labels={{ user: 'You', assistant: content.character }}
        />
      )}

      {chatDone && loading && <FeedbackLoading />}
      {chatDone && error && <FeedbackError error={error} onSkip={() => onComplete(chatLog)} />}
      {chatDone && feedback && (
        <FeedbackPanel
          feedback={feedback}
          taskType="ai_conversation"
          onContinue={() => onComplete(chatLog)}
        />
      )}
    </div>
  )
}
