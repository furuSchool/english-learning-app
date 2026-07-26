'use client'

import { useState } from 'react'
import { RapidFireQAContent } from '@/types'
import VoiceRecorder from '@/components/ui/VoiceRecorder'
import FeedbackPanel, { FeedbackLoading, FeedbackError } from '@/components/ui/FeedbackPanel'
import { useFeedback } from '@/lib/useFeedback'

interface Props {
  taskId: string
  content: RapidFireQAContent
  onComplete: (transcript: string) => void
}

export default function RapidFireQA({ content, onComplete }: Props) {
  const [index, setIndex] = useState(0)
  const [currentAnswer, setCurrentAnswer] = useState('')
  const [allAnswers, setAllAnswers] = useState<string[]>([])
  const { feedback, loading, error, getFeedback, clearFeedback } = useFeedback()

  const total = content.questions.length
  const question = content.questions[index]
  const isLast = index + 1 >= total

  const handleSubmit = () => {
    getFeedback('rapid_fire_qa', {
      questions: [question],
      user_answers: [currentAnswer.trim() || '(no answer)'],
    })
  }

  const handleNext = () => {
    const newAnswers = [...allAnswers, currentAnswer]
    if (isLast) {
      const log = newAnswers.map((a, i) => `Q${i + 1}: ${content.questions[i]}\nA: ${a}`).join('\n\n')
      onComplete(log)
    } else {
      setAllAnswers(newAnswers)
      setCurrentAnswer('')
      setIndex(i => i + 1)
      clearFeedback()
    }
  }

  return (
    <div className="space-y-5">
      {/* Progress bar */}
      <div className="flex items-center gap-1.5">
        {content.questions.map((_, i) => (
          <div key={i} className={`h-1.5 flex-1 rounded-full transition-colors ${
            i < index ? 'bg-emerald-500' : i === index ? 'bg-indigo-500' : 'bg-gray-200'
          }`} />
        ))}
      </div>

      {/* Question */}
      <div className="bg-indigo-50 rounded-xl p-4">
        <p className="text-xs text-indigo-500 font-semibold mb-1">Q{index + 1} / {total}</p>
        <p className="text-gray-900 font-medium leading-relaxed">{question}</p>
      </div>

      <p className="text-xs text-gray-500">🎤 Speaking — 2〜3文で答えてください</p>

      {/* Input — always shown unless feedback is loading/displayed */}
      {!feedback && !loading && (
        <>
          <VoiceRecorder key={index} onTranscript={text => setCurrentAnswer(text)} />

          <div className="flex gap-2">
            <button
              onClick={handleSubmit}
              className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-medium text-base hover:bg-indigo-700 transition-colors"
            >
              添削してもらう
            </button>
            <button
              onClick={handleNext}
              className="px-4 py-3 text-sm text-gray-400 hover:text-gray-600 rounded-xl border border-gray-200 hover:border-gray-300 transition-colors"
            >
              スキップ
            </button>
          </div>
        </>
      )}

      {loading && <FeedbackLoading />}

      {error && (
        <FeedbackError
          error={error}
          onSkip={handleNext}
        />
      )}

      {feedback && (
        <FeedbackPanel
          feedback={feedback}
          taskType="rapid_fire_qa"
          onContinue={handleNext}
          continueLabel={isLast ? '完了 →' : '次の質問へ →'}
        />
      )}
    </div>
  )
}
