'use client'

import { DevilsAdvocateContent, ChatMessage } from '@/types'
import ChatInterface from '@/components/ui/ChatInterface'

interface Props {
  taskId: string
  content: DevilsAdvocateContent
  onComplete: (transcript: string) => void
}

export default function DevilsAdvocate({ content, onComplete }: Props) {
  const opening = `Interesting topic. Before I ask your view — I should warn you, I'm going to argue the opposite of whatever you say. So: ${content.user_prompt}`

  const handleComplete = (messages: ChatMessage[]) => {
    const log = messages.map(m => `[${m.role === 'user' ? 'You' : 'AI'}] ${m.content}`).join('\n')
    onComplete(log)
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

      <ChatInterface
        taskType="devils_advocate"
        taskContent={content as unknown as Record<string, unknown>}
        initialMessage={opening}
        minExchanges={3}
        onComplete={handleComplete}
      />
    </div>
  )
}
