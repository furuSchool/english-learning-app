'use client'

import { useState } from 'react'
import { SituationSurvivalContent, Feedback } from '@/types'
import VoiceRecorder from '@/components/ui/VoiceRecorder'
import FeedbackPanel from '@/components/ui/FeedbackPanel'
import { AlertCircle } from 'lucide-react'

interface Props {
  content: SituationSurvivalContent
  taskId: string
  onComplete: (transcript: string, feedback: Feedback | null) => void
}

export default function SituationSurvival({ content, taskId, onComplete }: Props) {
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
          taskContext: `Situation Survival: The user is responding to this situation in English: "${content.scenario_en}"`,
          taskType: 'situation_survival',
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
      <div className="rounded-xl bg-amber-50 border-2 border-amber-200 p-5">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-xs font-semibold text-amber-600 mb-1">シチュエーション</p>
            <p className="text-gray-800 text-sm leading-relaxed">{content.situation}</p>
          </div>
        </div>
      </div>

      <p className="text-sm text-gray-600">
        このシチュエーションで英語でどう対応するか、即興で話してみましょう！
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
