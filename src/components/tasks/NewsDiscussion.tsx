'use client'

import { useEffect, useState } from 'react'
import { ChatMessage } from '@/types'
import ChatInterface from '@/components/ui/ChatInterface'
import ConversationLog from '@/components/ui/ConversationLog'
import FeedbackPanel, { FeedbackLoading, FeedbackError } from '@/components/ui/FeedbackPanel'
import { useFeedback } from '@/lib/useFeedback'

interface Props {
  taskId: string
  onComplete: (transcript: string) => void
}

interface NewsData {
  title: string
  summary: string
  source_url?: string
}

export default function NewsDiscussion({ taskId, onComplete }: Props) {
  const [news, setNews] = useState<NewsData | null>(null)
  const [fetchLoading, setFetchLoading] = useState(true)
  const [chatStarted, setChatStarted] = useState(false)
  const [chatDone, setChatDone] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [chatLog, setChatLog] = useState('')
  const { feedback, loading: fbLoading, error, getFeedback } = useFeedback()

  useEffect(() => {
    fetch('/api/fetch-news')
      .then(r => r.json())
      .then(setNews)
      .catch(() => setNews(null))
      .finally(() => setFetchLoading(false))
  }, [])

  if (fetchLoading) return (
    <div className="flex items-center gap-2 text-base text-gray-500 py-4">
      <div className="w-4 h-4 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
      ニュースを取得中...
    </div>
  )

  if (!news) return <p className="text-base text-red-500">ニュースの取得に失敗しました。</p>

  const opening = `Hey, so I came across this story about "${news.title}". Have you heard about it? What do you think?`

  const handleChatComplete = (msgs: ChatMessage[]) => {
    const log = msgs.map(m => `[${m.role === 'user' ? 'You' : 'AI'}] ${m.content}`).join('\n')
    setMessages(msgs)
    setChatLog(log)
    setChatDone(true)
    getFeedback('news_discussion', { news_title: news.title, chat_log: log })
  }

  return (
    <div className="space-y-4">
      <div className="text-xs text-gray-500 bg-gray-50 rounded-lg px-3 py-2">
        🎤/✍️ Interactive — ニュースを読んでAIとディスカッション（3往復以上）
      </div>

      {/* Article summary — always visible */}
      <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 space-y-2">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Today's topic</p>
        <p className="text-base font-semibold text-gray-800 leading-snug">{news.title}</p>
        <p className="text-base text-gray-600 leading-relaxed">{news.summary}</p>
        {news.source_url && (
          <a href={news.source_url} target="_blank" rel="noopener noreferrer"
            className="text-xs text-indigo-500 hover:underline">
            元記事を読む →
          </a>
        )}
      </div>

      {!chatStarted && !chatDone && (
        <button
          onClick={() => setChatStarted(true)}
          className="w-full py-3 bg-indigo-600 text-white rounded-xl font-medium text-base hover:bg-indigo-700 transition-colors"
        >
          ディスカッションを始める →
        </button>
      )}

      {chatStarted && !chatDone && (
        <ChatInterface
          taskId={taskId}
          taskType="news_discussion"
          taskContent={news as unknown as Record<string, unknown>}
          initialMessage={opening}
          minExchanges={3}
          onComplete={handleChatComplete}
        />
      )}

      {chatDone && (
        <ConversationLog messages={messages} />
      )}

      {chatDone && fbLoading && <FeedbackLoading />}
      {chatDone && error && <FeedbackError error={error} onSkip={() => onComplete(chatLog)} />}
      {chatDone && feedback && (
        <FeedbackPanel
          feedback={feedback}
          taskType="news_discussion"
          onContinue={() => onComplete(chatLog)}
        />
      )}
    </div>
  )
}
