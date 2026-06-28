'use client'

import { useState } from 'react'
import { EmotionSharingContent, Feedback } from '@/types'
import VoiceRecorder from '@/components/ui/VoiceRecorder'
import FeedbackPanel from '@/components/ui/FeedbackPanel'

interface Props {
  content: EmotionSharingContent
  taskId: string
  onComplete: (transcript: string, feedback: Feedback | null) => void
}

export default function EmotionSharing({ content, taskId, onComplete }: Props) {
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
          taskContext: `Emotion/Idea Sharing: ${content.prompt_en}`,
          taskType: 'emotion_sharing',
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
      <div className="rounded-xl bg-purple-50 border border-purple-100 p-5">
        <p className="text-sm text-gray-800 leading-relaxed">{content.prompt}</p>
        <p className="text-xs text-purple-500 mt-2 italic">{content.prompt_en}</p>
      </div>

      <p className="text-sm text-gray-600">自由に英語で話してください。正解はありません！</p>

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
