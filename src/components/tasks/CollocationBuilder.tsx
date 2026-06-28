'use client'

import { useState } from 'react'
import { CollocationContent } from '@/types'
import { ChevronRight, BookMarked } from 'lucide-react'

interface Props {
  taskId: string
  content: CollocationContent
  onComplete: (transcript: string) => void
}

export default function CollocationBuilder({ content, onComplete }: Props) {
  const [index, setIndex] = useState(0)
  const [answers, setAnswers] = useState<string[]>([])
  const [current, setCurrent] = useState('')
  const [saved, setSaved] = useState(false)

  const col = content.collocations[index]
  const total = content.collocations.length

  const savePhrase = async () => {
    if (saved) return
    setSaved(true)
    await fetch('/api/save-phrase', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        phrase: col.correct,
        meaning_ja: col.trap_note,
        task_type: 'collocation_builder',
      }),
    }).catch(() => {})
  }

  const next = () => {
    const all = [...answers, current]
    if (index + 1 < total) {
      setAnswers(all)
      setCurrent('')
      setSaved(false)
      setIndex(i => i + 1)
    } else {
      onComplete(
        all.map((a, i) => `Collocation: ${content.collocations[i].correct}\nMy sentence: ${a}`).join('\n\n')
      )
    }
  }

  return (
    <div className="space-y-5">
      <div className="text-xs text-gray-500 bg-gray-50 rounded-lg px-3 py-2">
        ✍️ Writing — 正しい表現を使って英文を作ってください
      </div>

      <div className="flex gap-1">
        {content.collocations.map((_, i) => (
          <div key={i} className={`h-1.5 flex-1 rounded-full ${
            i < index ? 'bg-emerald-500' : i === index ? 'bg-indigo-500' : 'bg-gray-200'
          }`} />
        ))}
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <span className="line-through text-red-400 text-sm">"{col.wrong}"</span>
          <span className="text-gray-400">→</span>
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-emerald-700">"{col.correct}"</span>
            <button onClick={savePhrase} disabled={saved}
              className={`p-1 rounded-lg ${saved ? 'text-emerald-500' : 'text-gray-400 hover:text-indigo-600'}`}>
              <BookMarked className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div className="bg-amber-50 border border-amber-100 rounded-xl p-3">
          <p className="text-xs text-amber-700">{col.trap_note}</p>
        </div>

        <div className="bg-gray-50 rounded-xl p-3">
          <p className="text-xs text-gray-400 mb-1">Example</p>
          <p className="text-sm text-gray-700 italic">"{col.context}"</p>
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-sm text-gray-600">"{col.correct}" を使った英文を書いてください（自分の経験・意見）</p>
        <textarea
          value={current}
          onChange={e => setCurrent(e.target.value)}
          rows={3}
          placeholder="Write your sentence here..."
          className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
        />
      </div>

      {current.trim() && (
        <button onClick={next}
          className="w-full flex items-center justify-center gap-2 py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors">
          {index + 1 < total ? '次へ' : '完了'}
          <ChevronRight className="w-4 h-4" />
        </button>
      )}
    </div>
  )
}
