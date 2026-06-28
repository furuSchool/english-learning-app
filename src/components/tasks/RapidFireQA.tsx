'use client'

import { useState } from 'react'
import { RapidFireQAContent } from '@/types'
import VoiceRecorder from '@/components/ui/VoiceRecorder'
import { ChevronRight } from 'lucide-react'

interface Props {
  taskId: string
  content: RapidFireQAContent
  onComplete: (transcript: string) => void
}

export default function RapidFireQA({ content, onComplete }: Props) {
  const [index, setIndex] = useState(0)
  const [answers, setAnswers] = useState<string[]>([])
  const [currentAnswer, setCurrentAnswer] = useState('')

  const total = content.questions.length
  const question = content.questions[index]

  const next = () => {
    const all = [...answers, currentAnswer]
    if (index + 1 < total) {
      setAnswers(all)
      setCurrentAnswer('')
      setIndex(i => i + 1)
    } else {
      onComplete(
        all.map((a, i) => `Q${i + 1}: ${content.questions[i]}\nA: ${a}`).join('\n\n')
      )
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-1.5 mb-1">
        {content.questions.map((_, i) => (
          <div key={i} className={`h-1.5 flex-1 rounded-full transition-colors ${
            i < index ? 'bg-emerald-500' : i === index ? 'bg-indigo-500' : 'bg-gray-200'
          }`} />
        ))}
      </div>

      <div className="bg-indigo-50 rounded-xl p-4">
        <p className="text-xs text-indigo-500 font-semibold mb-1">Q{index + 1} / {total}</p>
        <p className="text-gray-900 font-medium leading-relaxed">{question}</p>
      </div>

      <p className="text-xs text-gray-500">🎤 Speaking — 2〜3文で答えてください</p>

      <VoiceRecorder onTranscript={text => setCurrentAnswer(text)} />

      {currentAnswer && (
        <button
          onClick={next}
          className="w-full flex items-center justify-center gap-2 py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors"
        >
          {index + 1 < total ? '次の質問へ' : '完了'}
          <ChevronRight className="w-4 h-4" />
        </button>
      )}
    </div>
  )
}
