'use client'

import { useState } from 'react'
import { TabooParaphraseContent, Feedback } from '@/types'
import VoiceRecorder from '@/components/ui/VoiceRecorder'
import FeedbackPanel from '@/components/ui/FeedbackPanel'
import { XCircle } from 'lucide-react'

interface Props {
  content: TabooParaphraseContent
  taskId: string
  onComplete: (transcript: string, feedback: Feedback | null) => void
}

export default function TabooParaphrase({ content, taskId, onComplete }: Props) {
  const [transcript, setTranscript] = useState('')
  const [feedback, setFeedback] = useState<Feedback | null>(null)
  const [loading, setLoading] = useState(false)
  const [showHint, setShowHint] = useState(false)

  const handleTranscript = async (text: string) => {
    setTranscript(text)
    setLoading(true)
    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transcript: text,
          taskContext: `Taboo Paraphrase: Explain "${content.word}" WITHOUT using these words: ${content.forbidden.join(', ')}`,
          taskType: 'taboo_paraphrase',
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
      <div className="text-center">
        <p className="text-xs text-gray-500 mb-1">お題</p>
        <p className="text-4xl font-bold text-indigo-700 mb-3">{content.word}</p>
        {showHint && (
          <p className="text-sm text-gray-500 italic">{content.hint}</p>
        )}
        {!showHint && (
          <button
            onClick={() => setShowHint(true)}
            className="text-xs text-indigo-400 hover:text-indigo-600 underline"
          >
            ヒントを見る
          </button>
        )}
      </div>

      <div>
        <p className="text-xs font-semibold text-red-500 mb-2 uppercase tracking-wide">NGワード（使用禁止）</p>
        <div className="flex flex-wrap gap-2">
          {content.forbidden.map(word => (
            <span key={word} className="flex items-center gap-1 px-3 py-1 bg-red-50 border border-red-200 text-red-600 rounded-full text-sm font-medium">
              <XCircle className="w-3.5 h-3.5" />
              {word}
            </span>
          ))}
        </div>
      </div>

      <p className="text-sm text-gray-600 bg-gray-50 rounded-xl p-3">
        このワードをNGワードを使わずに英語で説明してください。知っている言葉で言い換えてOK！
      </p>

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
    </div>
  )
}
