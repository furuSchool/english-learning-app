'use client'

import { useState } from 'react'
import { NaturalExpressionContent } from '@/types'
import VoiceRecorder from '@/components/ui/VoiceRecorder'
import FeedbackPanel, { FeedbackLoading, FeedbackError } from '@/components/ui/FeedbackPanel'
import { useFeedback } from '@/lib/useFeedback'
import { BookMarked } from 'lucide-react'

interface Props {
  taskId: string
  content: NaturalExpressionContent
  onComplete: (transcript: string) => void
}

export default function NaturalExpression({ taskId, content, onComplete }: Props) {
  const [answer, setAnswer] = useState('')
  const [saved, setSaved] = useState<number | null>(null)
  const { feedback, loading, error, getFeedback } = useFeedback()

  const savePhrase = async (index: number) => {
    if (saved === index) return
    setSaved(index)
    const expr = content.natural_expressions[index]
    await fetch('/api/save-phrase', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        phrase: expr.english,
        meaning_ja: content.japanese,
        task_type: 'natural_expression',
      }),
    }).catch(() => {})
  }

  const handleSubmit = () => {
    getFeedback('natural_expression', {
      japanese_expression: content.japanese,
      user_answer: answer,
    }, taskId)
  }

  return (
    <div className="space-y-5">
      <div className="text-xs text-gray-500 bg-gray-50 rounded-lg px-3 py-2">
        🎤/✍️ Expression — 日本語表現を自然な英語で言ってみてください
      </div>

      <div className="bg-indigo-50 rounded-xl p-4 space-y-1">
        <p className="text-2xl font-bold text-gray-900">{content.japanese}</p>
        <p className="text-xs text-red-400 line-through">{content.literal_translation}</p>
        <p className="text-sm text-gray-600 mt-2">{content.explanation_ja}</p>
      </div>

      <div className="space-y-2">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Natural English versions</p>
        {content.natural_expressions.map((expr, i) => (
          <div key={i} className="bg-white border border-gray-100 rounded-xl p-3 flex items-start justify-between gap-2">
            <div>
              <p className="text-sm font-medium text-emerald-700">"{expr.english}"</p>
              <p className="text-xs text-gray-500 mt-0.5">{expr.context}</p>
            </div>
            <button onClick={() => savePhrase(i)} disabled={saved === i}
              className={`p-1.5 shrink-0 rounded-lg ${saved === i ? 'text-emerald-500' : 'text-gray-300 hover:text-indigo-600'}`}>
              <BookMarked className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      {!feedback && !loading && (
        <div className="space-y-3">
          <p className="text-sm text-gray-600">上の表現のどれかを使って、自分の状況・経験を英語で話してみてください。</p>
          <VoiceRecorder onTranscript={text => setAnswer(text)} />
          {answer && (
            <button
              onClick={handleSubmit}
              className="w-full py-3 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 transition-colors"
            >
              添削してもらう →
            </button>
          )}
        </div>
      )}

      {loading && <FeedbackLoading />}
      {error && (
        <FeedbackError
          error={error}
          onSkip={() => onComplete(`[${content.japanese}]\n${answer}`)}
        />
      )}
      {feedback && (
        <FeedbackPanel
          feedback={feedback}
          taskType="natural_expression"
          onContinue={() => onComplete(`[${content.japanese}]\n${answer}`)}
        />
      )}
    </div>
  )
}
