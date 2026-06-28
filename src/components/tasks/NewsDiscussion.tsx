'use client'

import { useEffect, useState } from 'react'
import { ChatMessage } from '@/types'
import ChatInterface from '@/components/ui/ChatInterface'

interface Props {
  taskId: string
  onComplete: (transcript: string) => void
}

interface NewsData {
  title: string
  summary: string
  source_url?: string
}

export default function NewsDiscussion({ onComplete }: Props) {
  const [news, setNews] = useState<NewsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/fetch-news')
      .then(r => r.json())
      .then(setNews)
      .catch(() => setNews(null))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="flex items-center gap-2 text-sm text-gray-500 py-4">
      <div className="w-4 h-4 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
      ニュースを取得中...
    </div>
  )

  if (!news) return <p className="text-sm text-red-500">ニュースの取得に失敗しました。</p>

  const opening = `Hey, did you catch this story? "${news.title}" — ${news.summary.split('.')[0]}. What do you make of it?`

  const handleComplete = (messages: ChatMessage[]) => {
    const log = messages.map(m => `[${m.role === 'user' ? 'You' : 'AI'}] ${m.content}`).join('\n')
    onComplete(log)
  }

  return (
    <div className="space-y-4">
      <div className="text-xs text-gray-500 bg-gray-50 rounded-lg px-3 py-2">
        🎤/✍️ Interactive — ニュースについてAIと話し合ってください（3往復以上）
      </div>

      <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
        <p className="text-xs text-gray-400 mb-1">Today's topic</p>
        <p className="text-sm font-medium text-gray-800">{news.title}</p>
      </div>

      <ChatInterface
        taskType="news_discussion"
        taskContent={news as unknown as Record<string, unknown>}
        initialMessage={opening}
        minExchanges={3}
        onComplete={handleComplete}
      />
    </div>
  )
}
