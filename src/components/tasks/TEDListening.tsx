'use client'

import { useState } from 'react'
import { TEDListeningContent, Feedback } from '@/types'
import VoiceRecorder from '@/components/ui/VoiceRecorder'
import FeedbackPanel from '@/components/ui/FeedbackPanel'

interface Props {
  content: TEDListeningContent
  taskId: string
  onComplete: (transcript: string, feedback: Feedback | null) => void
}

export default function TEDListening({ content, taskId, onComplete }: Props) {
  const [phase, setPhase] = useState<'watch' | 'speak'>('watch')
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
          taskContext: `TED Talk retelling for "${content.title}". Question: ${content.question}`,
          taskType: 'ted_listening',
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
      {phase === 'watch' ? (
        <>
          <div className="aspect-video w-full rounded-xl overflow-hidden bg-black">
            <iframe
              src={`https://www.youtube.com/embed/${content.youtube_id}`}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-800 mb-1">{content.title}</p>
            <p className="text-xs text-gray-500">動画を視聴したら「回答する」ボタンを押してください</p>
          </div>
          <button
            onClick={() => setPhase('speak')}
            className="w-full py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors"
          >
            回答する →
          </button>
        </>
      ) : (
        <>
          <div className="rounded-xl bg-indigo-50 border border-indigo-100 p-4">
            <p className="text-xs text-indigo-500 font-medium mb-1">質問</p>
            <p className="text-sm text-indigo-800 font-medium">{content.question}</p>
          </div>

          <p className="text-sm text-gray-600">
            3文以内で英語で回答してください。動画に戻りたい場合は
            <button
              onClick={() => setPhase('watch')}
              className="text-indigo-600 underline mx-1"
            >
              こちら
            </button>
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
        </>
      )}
    </div>
  )
}
