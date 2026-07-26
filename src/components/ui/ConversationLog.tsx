'use client'

import { ChatMessage } from '@/types'

interface ConversationLogProps {
  messages: ChatMessage[]
  /** Labels for each role. Defaults: user="You", assistant="AI" */
  labels?: { user?: string; assistant?: string }
}

export default function ConversationLog({ messages, labels }: ConversationLogProps) {
  const userLabel = labels?.user ?? 'You'
  const assistantLabel = labels?.assistant ?? 'AI'

  // Skip the very first assistant message (opening line) to avoid redundancy — it's already shown in the task header
  const displayMessages = messages.slice(1)

  if (displayMessages.length === 0) return null

  return (
    <div className="space-y-2 border border-gray-100 rounded-2xl p-4 bg-gray-50 max-h-72 overflow-y-auto">
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">会話ログ</p>
      {messages.map((m, i) => (
        <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
          <div className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm leading-relaxed ${
            m.role === 'user'
              ? 'bg-indigo-600 text-white rounded-br-sm'
              : 'bg-white border border-gray-200 text-gray-700 rounded-bl-sm'
          }`}>
            <span className="block text-[10px] opacity-60 mb-0.5 font-medium">
              {m.role === 'user' ? userLabel : assistantLabel}
            </span>
            {m.content}
          </div>
        </div>
      ))}
    </div>
  )
}
