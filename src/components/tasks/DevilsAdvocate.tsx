'use client'

import { useState } from 'react'
import { DevilsAdvocateContent, ChatMessage } from '@/types'
import ChatInterface from '@/components/ui/ChatInterface'
import ConversationLog from '@/components/ui/ConversationLog'
import FeedbackPanel, { FeedbackLoading, FeedbackError } from '@/components/ui/FeedbackPanel'
import { useFeedback } from '@/lib/useFeedback'

interface Props {
  taskId: string
  content: DevilsAdvocateContent
  onComplete: (transcript: string) => void
}

export default function DevilsAdvocate({ content, onComplete }: Props) {
  const [chatDone, setChatDone] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [chatLog, setChatLog] = useState('')
  const { feedback, loading, error, getFeedback } = useFeedback()

  const opening = `Interesting topic. Before I ask your view — I should warn you, I'm going to argue the opposite of whatever you say. So: ${content.user_prompt}`

  const handleChatComplete = (msgs: ChatMessage[]) => {
    const log = msgs.map(m => `[${m.role === 'user' ? 'You' : 'AI'}] ${m.content}`).join('\n')
    setMessages(msgs)
    setChatLog(log)
    setChatDone(true)
    getFeedback('devils_advocate', { topic: content.topic, chat_log: log })
  }

  return (
    <div className="space-y-4">
      <div className="text-xs text-gray-500 bg-gray-50 rounded-lg px-3 py-2">
        🎤/✍️ Interactive — 何を言っても反論されます。意見を守ってください（3往復以上）
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
        <p className="text-sm font-semibold text-amber-800 mb-1">Topic</p>
        <p className="text-gray-800 leading-relaxed">"{content.topic}"</p>
      </div>

      {!chatDone && (
        <ChatInterface
          taskType="devils_advocate"
          taskContent={content as unknown as Record<string, unknown>}
          initialMessage={opening}
          minExchanges={3}
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
          taskType="devils_advocate"
          onContinue={() => onComplete(chatLog)}
        />
      )}
    </div>
  )
}
