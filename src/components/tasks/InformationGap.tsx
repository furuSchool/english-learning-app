'use client'

import { useState } from 'react'
import { InformationGapContent, ChatMessage } from '@/types'
import ChatInterface from '@/components/ui/ChatInterface'
import ConversationLog from '@/components/ui/ConversationLog'
import FeedbackPanel, { FeedbackLoading, FeedbackError } from '@/components/ui/FeedbackPanel'
import { useFeedback } from '@/lib/useFeedback'

interface Props {
  taskId: string
  content: InformationGapContent
  onComplete: (transcript: string) => void
}

export default function InformationGap({ taskId, content, onComplete }: Props) {
  const [chatDone, setChatDone] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [chatLog, setChatLog] = useState('')
  const { feedback, loading, error, getFeedback } = useFeedback()

  const handleChatComplete = (msgs: ChatMessage[]) => {
    const log = msgs.map(m => `[${m.role === 'user' ? 'You' : 'AI'}] ${m.content}`).join('\n')
    setMessages(msgs)
    setChatLog(log)
    setChatDone(true)
    getFeedback('information_gap', { chat_log: log })
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

      {!chatDone && (
        <ChatInterface
          taskId={taskId}
          taskType="information_gap"
          taskContent={content as unknown as Record<string, unknown>}
          initialMessage="I know what's going on. Ask me questions and I'll tell you what I can."
          minExchanges={4}
          onComplete={handleChatComplete}
        />
      )}

      {chatDone && (
        <ConversationLog messages={messages} />
      )}

      {chatDone && loading && <FeedbackLoading />}
      {chatDone && error && <FeedbackError error={error} onSkip={() => onComplete(chatLog)} />}
      {chatDone && feedback && (
        <FeedbackPanel
          feedback={feedback}
          taskType="information_gap"
          onContinue={() => onComplete(chatLog)}
        />
      )}
    </div>
  )
}
