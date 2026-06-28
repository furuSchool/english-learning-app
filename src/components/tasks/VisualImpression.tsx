'use client'

import { useState } from 'react'
import Image from 'next/image'
import { VisualImpressionContent, Feedback } from '@/types'
import VoiceRecorder from '@/components/ui/VoiceRecorder'
import FeedbackPanel from '@/components/ui/FeedbackPanel'

interface Props {
  content: VisualImpressionContent
  taskId: string
  onComplete: (transcript: string, feedback: Feedback | null) => void
}

export default function VisualImpression({ content, taskId, onComplete }: Props) {
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
          taskContext: `Visual Impression: The user is describing their feelings and thoughts about an image. Prompt: ${content.prompt}`,
          taskType: 'visual_impression',
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
      <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-gray-100">
        <img
          src={content.image_url}
          alt="Visual prompt"
          className="w-full h-full object-cover"
        />
      </div>

      <div className="rounded-xl bg-gray-50 border border-gray-200 p-4">
        <p className="text-sm text-gray-700">{content.prompt}</p>
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
    </div>
  )
}
