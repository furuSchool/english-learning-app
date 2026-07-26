'use client'

import { useState } from 'react'
import { BookMarked, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'
import type { FeedbackData } from '@/lib/useFeedback'

// Renders ~~wrong|correct~~ inline strikethrough diffs
// Format: ~~wrong phrase|corrected phrase~~ surrounding normal text
function InlineDiff({ text }: { text: string }) {
  const parts = text.split(/(~~[^~]+~~)/)
  return (
    <>
      {parts.map((part, i) => {
        const match = part.match(/^~~([^|~]+)\|([^~]*)~~$/)
        if (match) {
          return (
            <span key={i}>
              <del className="text-red-400 no-underline">{match[1]}</del>
              {' '}
              <span className="text-emerald-700 font-medium">{match[2]}</span>
            </span>
          )
        }
        return <span key={i}>{part}</span>
      })}
    </>
  )
}

interface FeedbackPanelProps {
  feedback: FeedbackData
  taskType: string
  onContinue: () => void
  continueLabel?: string
}

export default function FeedbackPanel({
  feedback,
  taskType,
  onContinue,
  continueLabel = '完了 →',
}: FeedbackPanelProps) {
  const [saved, setSaved] = useState<Set<string>>(new Set())

  const handleSave = async (key: string, phrase: string, meaning: string) => {
    if (saved.has(key)) return
    setSaved(prev => new Set([...prev, key]))
    await fetch('/api/save-phrase', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phrase, meaning_ja: meaning, task_type: taskType }),
    }).catch(() => {})
  }

  return (
    <div className="space-y-5 border-t border-gray-200 pt-5 mt-2">
      <p className="text-sm font-semibold text-indigo-600 uppercase tracking-wide">添削フィードバック</p>

      {/* corrected_text: inline diff with ~~wrong~~ → correct strikethrough */}
      {feedback.corrected_text && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">修正テキスト</p>
          <div className="bg-gray-50 rounded-xl px-4 py-3 text-base leading-relaxed text-gray-800">
            <InlineDiff text={feedback.corrected_text} />
          </div>
        </div>
      )}

      {/* corrections: bullet list */}
      {feedback.corrections && feedback.corrections.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">修正点</p>
          <ul className="space-y-2">
            {feedback.corrections.map((c, i) => (
              <li key={i} className="text-base leading-relaxed">
                <span className="line-through text-red-400">{c.original}</span>
                <span className="text-gray-400 mx-2">→</span>
                <span className="font-medium text-emerald-700">{c.corrected}</span>
                {c.reason_ja && (
                  <span className="block text-sm text-gray-500 mt-0.5 ml-1">{c.reason_ja}</span>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* overall comment */}
      {feedback.overall_comment_ja && (
        <div className="bg-indigo-50 rounded-xl px-4 py-3">
          <p className="text-base text-gray-700 leading-relaxed">{feedback.overall_comment_ja}</p>
        </div>
      )}

      {/* native expressions — each saveable individually */}
      {feedback.native_expressions && feedback.native_expressions.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">ネイティブ表現</p>
          <ul className="space-y-2">
            {feedback.native_expressions.map((expr, i) => {
              const key = `expr-${i}`
              return (
                <li key={i} className="flex items-center justify-between bg-emerald-50 rounded-xl px-4 py-2.5 gap-3">
                  <p className="text-base text-emerald-800 italic flex-1">"{expr}"</p>
                  <button
                    onClick={() => handleSave(key, expr, '')}
                    disabled={saved.has(key)}
                    title="フレーズをストック"
                    className={`p-1.5 rounded-lg shrink-0 transition-colors ${saved.has(key) ? 'text-emerald-500' : 'text-gray-400 hover:text-indigo-600'}`}
                  >
                    {saved.has(key) ? <CheckCircle className="w-4 h-4" /> : <BookMarked className="w-4 h-4" />}
                  </button>
                </li>
              )
            })}
          </ul>
        </div>
      )}

      {/* saveable_phrases */}
      {feedback.saveable_phrases && feedback.saveable_phrases.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">ストック候補</p>
          <ul className="space-y-2">
            {feedback.saveable_phrases.map((sp, i) => {
              const key = `sp-${i}`
              return (
                <li key={i} className="flex items-center justify-between bg-white border border-gray-200 rounded-xl px-4 py-2.5 gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-base font-medium text-gray-800">"{sp.phrase}"</p>
                    {sp.meaning_ja && <p className="text-sm text-gray-500">{sp.meaning_ja}</p>}
                  </div>
                  <button
                    onClick={() => handleSave(key, sp.phrase, sp.meaning_ja)}
                    disabled={saved.has(key)}
                    title="フレーズをストック"
                    className={`p-1.5 rounded-lg shrink-0 transition-colors ${saved.has(key) ? 'text-emerald-500' : 'text-gray-400 hover:text-indigo-600'}`}
                  >
                    {saved.has(key) ? <CheckCircle className="w-4 h-4" /> : <BookMarked className="w-4 h-4" />}
                  </button>
                </li>
              )
            })}
          </ul>
        </div>
      )}

      {/* ideal_answer */}
      {feedback.ideal_answer && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">正解例</p>
          <div className="bg-amber-50 border border-amber-100 rounded-xl px-4 py-3">
            <p className="text-base text-amber-900 leading-relaxed italic">"{feedback.ideal_answer}"</p>
          </div>
        </div>
      )}

      <button
        onClick={onContinue}
        className="w-full py-3 bg-indigo-600 text-white rounded-xl font-semibold text-base hover:bg-indigo-700 transition-colors"
      >
        {continueLabel}
      </button>
    </div>
  )
}

export function FeedbackLoading() {
  return (
    <div className="flex items-center justify-center gap-2 py-6 text-base text-gray-500">
      <Loader2 className="w-4 h-4 animate-spin text-indigo-500" />
      添削中...
    </div>
  )
}

export function FeedbackError({ error, onSkip }: { error: string; onSkip: () => void }) {
  return (
    <div className="space-y-3 border-t border-gray-100 pt-4">
      <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-base text-red-700">
        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
        <span>フィードバック取得に失敗しました: {error}</span>
      </div>
      <button
        onClick={onSkip}
        className="w-full py-3 bg-gray-600 text-white rounded-xl font-medium text-base hover:bg-gray-700 transition-colors"
      >
        スキップして完了 →
      </button>
    </div>
  )
}
