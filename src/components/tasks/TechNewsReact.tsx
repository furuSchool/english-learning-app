'use client'

import { useEffect, useState } from 'react'
import VoiceRecorder from '@/components/ui/VoiceRecorder'
import { ExternalLink } from 'lucide-react'

interface Props {
  taskId: string
  onComplete: (transcript: string) => void
}

interface NewsData {
  title: string
  summary: string
  source_url: string
}

export default function TechNewsReact({ onComplete }: Props) {
  const [news, setNews] = useState<NewsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [read, setRead] = useState(false)
  const [answer, setAnswer] = useState('')

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
      最新ニュースを取得中...
    </div>
  )

  if (!news) return (
    <p className="text-sm text-red-500">ニュースの取得に失敗しました。</p>
  )

  return (
    <div className="space-y-5">
      <div className="text-xs text-gray-500 bg-gray-50 rounded-lg px-3 py-2">
        🎤 Speaking — 記事を読んで英語で意見を述べてください
      </div>

      <div className="space-y-3">
        <div className="flex items-start gap-2">
          <h3 className="font-semibold text-gray-900 text-sm leading-snug flex-1">{news.title}</h3>
          {news.source_url && (
            <a href={news.source_url} target="_blank" rel="noopener noreferrer"
              className="text-gray-400 hover:text-indigo-600 shrink-0">
              <ExternalLink className="w-4 h-4" />
            </a>
          )}
        </div>
        <p className="text-sm text-gray-700 leading-relaxed">{news.summary}</p>
      </div>

      {!read ? (
        <button
          onClick={() => setRead(true)}
          className="w-full py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors"
        >
          読了 → 意見を話す
        </button>
      ) : (
        <div className="space-y-3">
          <div className="bg-indigo-50 rounded-xl p-4">
            <p className="text-sm text-gray-800">What's the key point of this story? What do you think about it? (60 seconds)</p>
          </div>
          <VoiceRecorder onTranscript={text => setAnswer(text)} />
          {answer && (
            <button
              onClick={() => onComplete(answer)}
              className="w-full py-3 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 transition-colors"
            >
              完了 →
            </button>
          )}
        </div>
      )}
    </div>
  )
}
