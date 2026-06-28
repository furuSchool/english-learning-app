'use client'

import { useState } from 'react'
import { RapidFireQAContent, Feedback } from '@/types'
import VoiceRecorder from '@/components/ui/VoiceRecorder'
import FeedbackPanel from '@/components/ui/FeedbackPanel'
import { ChevronRight } from 'lucide-react'

interface Props {
  content: RapidFireQAContent
  taskId: string
  onComplete: (transcript: string, feedback: Feedback | null) => void
}

export default function RapidFireQA({ content, taskId, onComplete }: Props) {
  const [currentQ, setCurrentQ] = useState(0)
  const [answers, setAnswers] = useState<{ q: string; answer: string; feedback: Feedback | null }[]>([])
  const [loading, setLoading] = useState(false)
  const [currentFeedback, setCurrentFeedback] = useState<Feedback | null>(null)
  const [currentTranscript, setCurrentTranscript] = useState('')
  const [done, setDone] = useState(false)

  const question = content.questions[currentQ]
  const isLastQ = currentQ === content.questions.length - 1

  const handleTranscript = async (text: string) => {
    setCurrentTranscript(text)
    setLoading(true)
    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transcript: text,
          taskContext: `Rapid-Fire Q&A: Answer the question "${question}" briefly and naturally.`,
          taskType: 'rapid_fire_qa',
        }),
      })
      const fb = await res.json()
      setCurrentFeedback(fb)
    } catch {
      setCurrentFeedback(null)
    } finally {
      setLoading(false)
    }
  }

  const handleNext = () => {
    const updated = [...answers, { q: question, answer: currentTranscript, feedback: currentFeedback }]
    setAnswers(updated)
    setCurrentFeedback(null)
    setCurrentTranscript('')

    if (isLastQ) {
      setDone(true)
      const allAnswers = updated.map(a => a.answer).join(' | ')
      onComplete(allAnswers, updated[updated.length - 1]?.feedback)
    } else {
      setCurrentQ(q => q + 1)
    }
  }

  if (done) {
    return (
      <div className="text-center py-4">
        <p className="text-2xl mb-2">🎉</p>
        <p className="font-semibold text-gray-800">全問回答完了！</p>
        <p className="text-sm text-gray-500 mt-1">{answers.length}問に回答しました</p>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2 mb-1">
        {content.questions.map((_, i) => (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded-full ${
              i < currentQ ? 'bg-indigo-500' : i === currentQ ? 'bg-indigo-300' : 'bg-gray-200'
            }`}
          />
        ))}
      </div>

      <div className="text-xs text-gray-400">
        {currentQ + 1} / {content.questions.length}
      </div>

      <div className="rounded-xl bg-indigo-600 text-white p-5">
        <p className="text-lg font-medium leading-snug">{question}</p>
        <p className="text-indigo-200 text-xs mt-1">3秒以内に直感で回答！</p>
      </div>

      <VoiceRecorder
        onTranscript={handleTranscript}
        disabled={loading}
      />

      {loading && (
        <p className="text-sm text-gray-500 animate-pulse">添削中...</p>
      )}

      {currentFeedback && currentTranscript && (
        <FeedbackPanel feedback={currentFeedback} originalText={currentTranscript} />
      )}

      {currentTranscript && !loading && (
        <button
          onClick={handleNext}
          className="w-full flex items-center justify-center gap-2 py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors"
        >
          {isLastQ ? '完了' : '次の質問へ'}
          <ChevronRight className="w-4 h-4" />
        </button>
      )}
    </div>
  )
}
