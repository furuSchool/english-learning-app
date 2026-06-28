'use client'

import { useState } from 'react'
import { QuoteReactionContent } from '@/types'
import VoiceRecorder from '@/components/ui/VoiceRecorder'

interface Props {
  taskId: string
  content: QuoteReactionContent
  onComplete: (transcript: string) => void
}

export default function QuoteReaction({ content, onComplete }: Props) {
  const [answer, setAnswer] = useState('')

  return (
    <div className="space-y-5">
      <div className="text-xs text-gray-500 bg-gray-50 rounded-lg px-3 py-2">
        🎤 Speaking または ✍️ Writing — 引用に対して意見を述べてください
      </div>

      <blockquote className="border-l-4 border-indigo-400 pl-4 py-1">
        <p className="text-gray-800 font-medium leading-relaxed italic">"{content.quote}"</p>
        <footer className="text-sm text-gray-500 mt-2">— {content.author}</footer>
      </blockquote>

      <div className="bg-indigo-50 rounded-xl p-4">
        <p className="text-sm text-gray-700 leading-relaxed">{content.prompt}</p>
      </div>

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
