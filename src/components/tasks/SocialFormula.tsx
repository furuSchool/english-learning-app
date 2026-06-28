'use client'

import { useState } from 'react'
import { SocialFormulaContent } from '@/types'
import VoiceRecorder from '@/components/ui/VoiceRecorder'
import { BookMarked } from 'lucide-react'

interface Props {
  taskId: string
  content: SocialFormulaContent
  onComplete: (transcript: string) => void
}

export default function SocialFormula({ content, onComplete }: Props) {
  const [answer, setAnswer] = useState('')
  const [saved, setSaved] = useState(false)

  const saveAll = async () => {
    if (saved) return
    setSaved(true)
    for (const phrase of content.useful_phrases) {
      await fetch('/api/save-phrase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phrase,
          meaning_ja: content.formula_focus,
          task_type: 'social_formula',
        }),
      }).catch(() => {})
    }
  }

  return (
    <div className="space-y-5">
      <div className="text-xs text-gray-500 bg-gray-50 rounded-lg px-3 py-2">
        🎤/✍️ Expression — 実践的なフレーズを練習します
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
        <p className="text-xs text-amber-600 font-semibold mb-0.5">Skill</p>
        <p className="font-bold text-gray-800">{content.formula_focus}</p>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Useful phrases</p>
          <button onClick={saveAll} disabled={saved}
            className={`flex items-center gap-1 text-xs px-2 py-1 rounded-lg ${saved ? 'text-emerald-500' : 'text-gray-400 hover:text-indigo-600'}`}>
            <BookMarked className="w-3.5 h-3.5" />
            全部保存
          </button>
        </div>
        {content.useful_phrases.map((p, i) => (
          <div key={i} className="bg-white border border-gray-100 rounded-xl px-4 py-2.5">
            <p className="text-sm text-gray-800">"{p}"</p>
          </div>
        ))}
      </div>

      <div className="bg-indigo-50 rounded-xl p-4">
        <p className="text-xs text-indigo-600 font-semibold mb-1">Scenario</p>
        <p className="text-sm text-gray-800 leading-relaxed">{content.scenario}</p>
      </div>

      <p className="text-sm text-gray-600">上のフレーズを使って、このシナリオに対応してください。</p>

      <VoiceRecorder onTranscript={text => setAnswer(text)} />

      {answer && (
        <button
          onClick={() => onComplete(answer)}
          className="w-full py-3 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 transition-colors"
        >
          完了 →
        </button>
      )}
    </div>
  )
}
