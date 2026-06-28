'use client'

import { Feedback, InlineCorrection } from '@/types'

interface FeedbackPanelProps {
  feedback: Feedback
  originalText: string
}

function HighlightedText({ text, corrections }: { text: string; corrections: InlineCorrection[] }) {
  if (corrections.length === 0) {
    return <span className="text-gray-800">{text}</span>
  }

  let result = text
  const parts: Array<{ type: 'text' | 'correction'; content: string; corrected?: string }> = []

  let remaining = text
  for (const correction of corrections) {
    const idx = remaining.indexOf(correction.original)
    if (idx === -1) continue
    if (idx > 0) {
      parts.push({ type: 'text', content: remaining.slice(0, idx) })
    }
    parts.push({ type: 'correction', content: correction.original, corrected: correction.corrected })
    remaining = remaining.slice(idx + correction.original.length)
  }
  if (remaining) {
    parts.push({ type: 'text', content: remaining })
  }

  if (parts.length === 0) {
    return <span className="text-gray-800">{text}</span>
  }

  return (
    <>
      {parts.map((part, i) =>
        part.type === 'text' ? (
          <span key={i} className="text-gray-800">{part.content}</span>
        ) : (
          <span key={i}>
            <span className="line-through text-red-400">{part.content}</span>
            {' '}
            <span className="text-red-600 font-medium">{part.corrected}</span>
          </span>
        )
      )}
    </>
  )
}

export default function FeedbackPanel({ feedback, originalText }: FeedbackPanelProps) {
  return (
    <div className="space-y-4 rounded-2xl border border-indigo-100 bg-indigo-50 p-5">
      <h3 className="font-semibold text-indigo-900 text-sm uppercase tracking-wide">フィードバック</h3>

      {/* Inline corrections */}
      <div>
        <p className="text-xs text-indigo-600 font-medium mb-2">あなたの英語（修正付き）</p>
        <div className="bg-white rounded-xl p-4 text-sm leading-relaxed">
          <HighlightedText text={originalText} corrections={feedback.inline_corrections} />
        </div>
      </div>

      {/* Error explanation */}
      {feedback.error_explanation && (
        <div className="bg-red-50 border border-red-100 rounded-xl p-4">
          <p className="text-xs text-red-600 font-medium mb-1">解説</p>
          <p className="text-sm text-red-800">{feedback.error_explanation}</p>
        </div>
      )}

      {/* No errors */}
      {feedback.inline_corrections.length === 0 && !feedback.error_explanation && (
        <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4">
          <p className="text-sm text-emerald-800">
            Great job! 大きな問題はありませんでした。
          </p>
        </div>
      )}

      {/* Native expressions */}
      {feedback.native_expressions.length > 0 && (
        <div>
          <p className="text-xs text-indigo-600 font-medium mb-2">より自然な表現</p>
          <ul className="space-y-2">
            {feedback.native_expressions.map((expr, i) => (
              <li key={i} className="flex items-start gap-2 text-sm">
                <span className="text-indigo-400 mt-0.5">→</span>
                <span className="text-gray-700 italic">{expr}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
