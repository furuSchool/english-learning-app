'use client'

import { useState } from 'react'
import { NewsHeadlineContent, Feedback } from '@/types'
import VoiceRecorder from '@/components/ui/VoiceRecorder'
import FeedbackPanel from '@/components/ui/FeedbackPanel'

interface Props {
  content: NewsHeadlineContent
  taskId: string
  onComplete: (transcript: string, feedback: Feedback | null) => void
}

export default function NewsHeadline({ content, taskId, onComplete }: Props) {
  const [selected, setSelected] = useState<string | null>(null)
  const [transcript, setTranscript] = useState('')
  const [feedback, setFeedback] = useState<Feedback | null>(null)
  const [loading, setLoading] = useState(false)

  const handleTranscript = async (text: string) => {
    setTranscript(text)
    setLoading(true)
    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transcript: text,
          taskContext: `News Headline Reaction: The user chose headline "${selected}" and is sharing their reaction — why it caught their attention and what they predict the article is about.`,
          taskType: 'news_headline',
        }),
      })
      const fb = await res.json()
      setFeedback(fb)
    } catch {
      setFeedback(null)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-5">
      <p className="text-sm text-gray-600">
        気になる見出しを1つ選び、「なぜ気になったか」と「内容の予想」を英語で話してください。
      </p>

      <div className="space-y-3">
        {content.headlines.map((headline, i) => (
          <button
            key={i}
            onClick={() => { setSelected(headline); setTranscript(''); setFeedback(null) }}
            className={`w-full text-left p-4 rounded-xl border-2 transition-all text-sm font-medium leading-snug ${
              selected === headline
                ? 'border-indigo-500 bg-indigo-50 text-indigo-900'
                : 'border-gray-200 bg-white text-gray-800 hover:border-gray-300'
            }`}
          >
            <span className="text-gray-400 mr-2 text-xs">{i + 1}</span>
            {headline}
          </button>
        ))}
      </div>

      {selected && (
        <>
          <div className="rounded-xl bg-amber-50 border border-amber-100 p-3">
            <p className="text-xs text-amber-600 font-medium mb-0.5">選択した見出し</p>
            <p className="text-sm text-amber-900">{selected}</p>
          </div>

          <VoiceRecorder
            onTranscript={handleTranscript}
            disabled={loading}
          />

          {loading && (
            <p className="text-sm text-gray-500 animate-pulse">添削中...</p>
          )}

          {feedback && transcript && (
            <>
              <FeedbackPanel feedback={feedback} originalText={transcript} />
              <button
                onClick={() => onComplete(transcript, feedback)}
                className="w-full py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors"
              >
                完了 ✓
              </button>
            </>
          )}
        </>
      )}
    </div>
  )
}
