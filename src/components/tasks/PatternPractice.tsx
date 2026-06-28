'use client'

import { useState } from 'react'
import { PatternPracticeContent, Feedback } from '@/types'
import VoiceRecorder from '@/components/ui/VoiceRecorder'
import FeedbackPanel from '@/components/ui/FeedbackPanel'
import { Lightbulb } from 'lucide-react'

interface Props {
  content: PatternPracticeContent
  taskId: string
  onComplete: (transcript: string, feedback: Feedback | null) => void
}

export default function PatternPractice({ content, taskId, onComplete }: Props) {
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
          taskContext: `Pattern Practice: The user is expressing the Japanese concept "${content.japanese}" (${content.explanation}) in their own natural English.`,
          taskType: 'pattern_practice',
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
      <div className="text-center py-4 rounded-xl bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-100">
        <p className="text-xs text-indigo-500 font-medium mb-2">今日の表現</p>
        <p className="text-4xl font-bold text-gray-900 mb-2">{content.japanese}</p>
        <p className="text-sm text-gray-500 italic">{content.explanation}</p>
      </div>

      {!showHint ? (
        <button
          onClick={() => setShowHint(true)}
          className="flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-800"
        >
          <Lightbulb className="w-4 h-4" />
          ヒントを見る
        </button>
      ) : (
        <div className="flex items-start gap-2 rounded-xl bg-yellow-50 border border-yellow-100 p-4">
          <Lightbulb className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-yellow-800">{content.hint}</p>
        </div>
      )}

      <p className="text-sm text-gray-600">
        この日本語表現を自分の言葉で英語に言い換えて話してみましょう。直訳でなくOK！
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
