'use client'

import { useState } from 'react'
import { DiscourseMarkerContent } from '@/types'
import VoiceRecorder from '@/components/ui/VoiceRecorder'
import FeedbackPanel, { FeedbackLoading, FeedbackError } from '@/components/ui/FeedbackPanel'
import { useFeedback } from '@/lib/useFeedback'
import { BookMarked } from 'lucide-react'

interface Props {
  taskId: string
  content: DiscourseMarkerContent
  onComplete: (transcript: string) => void
}

export default function DiscourseMarkerDrill({ taskId, content, onComplete }: Props) {
  const [answer, setAnswer] = useState('')
  const [saved, setSaved] = useState(false)
  const { feedback, loading, error, getFeedback } = useFeedback()

  const saveAll = async () => {
    if (saved) return
    setSaved(true)
    for (const marker of content.markers) {
      await fetch('/api/save-phrase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phrase: marker,
          meaning_ja: content.marker_hints[marker] ?? null,
          task_type: 'discourse_marker_drill',
        }),
      }).catch(() => {})
    }
  }

  const handleSubmit = () => {
    getFeedback('discourse_marker_drill', {
      markers: content.markers,
      topic: content.topic,
      user_answer: answer,
    }, taskId)
  }

  return (
    <div className="space-y-5">
      <div className="text-xs text-gray-500 bg-gray-50 rounded-lg px-3 py-2">
        🎤 Speaking — 以下のマーカーから2つ以上を使いながら60秒間話してください
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Discourse markers to use</p>
          <button onClick={saveAll} disabled={saved}
            className={`flex items-center gap-1 text-xs px-2 py-1 rounded-lg ${saved ? 'text-emerald-500' : 'text-gray-400 hover:text-indigo-600'}`}>
            <BookMarked className="w-3.5 h-3.5" />
            全部保存
          </button>
        </div>
        {content.markers.map(m => (
          <div key={m} className="bg-indigo-50 rounded-xl px-4 py-2.5 flex items-center justify-between">
            <span className="font-bold text-indigo-700">"{m}"</span>
            <span className="text-xs text-gray-500">{content.marker_hints[m]}</span>
          </div>
        ))}
      </div>

      <div className="bg-gray-50 rounded-xl p-4">
        <p className="text-xs text-gray-500 mb-1">Topic</p>
        <p className="text-gray-800 font-medium">{content.topic}</p>
      </div>

      {!feedback && !loading && (
        <>
          <p className="text-sm text-gray-600">上のマーカーから<strong>2つ以上</strong>使いながら、60秒間意見を話してください。完璧じゃなくてOK。</p>
          <VoiceRecorder onTranscript={text => setAnswer(text)} />
          {answer && (
            <button
              onClick={handleSubmit}
              className="w-full py-3 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 transition-colors"
            >
              添削してもらう →
            </button>
          )}
        </>
      )}

      {loading && <FeedbackLoading />}
      {error && <FeedbackError error={error} onSkip={() => onComplete(answer)} />}
      {feedback && (
        <FeedbackPanel
          feedback={feedback}
          taskType="discourse_marker_drill"
          onContinue={() => onComplete(answer)}
        />
      )}
    </div>
  )
}
