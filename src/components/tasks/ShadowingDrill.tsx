'use client'

import { useState } from 'react'
import { ShadowingDrillContent } from '@/types'
import VoiceRecorder from '@/components/ui/VoiceRecorder'

interface Props {
  taskId: string
  content: ShadowingDrillContent
  onComplete: (transcript: string) => void
}

export default function ShadowingDrill({ content, onComplete }: Props) {
  const [phase, setPhase] = useState<'read' | 'shadow' | 'paraphrase'>('read')
  const [paraphrase, setParaphrase] = useState('')

  return (
    <div className="space-y-5">
      <div className="text-xs text-gray-500 bg-gray-50 rounded-lg px-3 py-2">
        🎤 Speaking — シャドーイング練習
      </div>

      {/* Context */}
      <div className="text-xs text-gray-500 italic">
        Context: {content.source_context}
      </div>

      {/* Passage */}
      <div className="bg-indigo-50 rounded-xl p-4">
        <p className="text-gray-800 leading-relaxed text-sm font-medium">{content.text}</p>
      </div>

      <div className="text-xs text-amber-700 bg-amber-50 rounded-lg px-3 py-2">
        💡 {content.focus_point}
      </div>

      {phase === 'read' && (
        <div className="space-y-3">
          <p className="text-sm text-gray-600">まず声に出して読んでみてください。リズムとイントネーションを意識して。</p>
          <button
            onClick={() => setPhase('shadow')}
            className="w-full py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors"
          >
            シャドーイングを録音する →
          </button>
        </div>
      )}

      {phase === 'shadow' && (
        <div className="space-y-3">
          <p className="text-sm text-gray-600">テキストを見ながら、できるだけ自然に声に出して読んでください。</p>
          <VoiceRecorder onTranscript={() => setPhase('paraphrase')} />
          <button
            onClick={() => setPhase('paraphrase')}
            className="w-full py-2 text-sm text-gray-500 hover:text-gray-700"
          >
            録音せずにスキップ →
          </button>
        </div>
      )}

      {phase === 'paraphrase' && (
        <div className="space-y-3">
          <p className="text-sm text-gray-600">テキストを見ずに、同じ内容を自分の言葉で英語で話してください。</p>
          <VoiceRecorder onTranscript={text => setParaphrase(text)} />
          {paraphrase && (
            <button
              onClick={() => onComplete(`[Shadowed passage]\n${content.text}\n\n[My paraphrase]\n${paraphrase}`)}
              className="w-full py-3 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 transition-colors"
            >
              完了 →
            </button>
          )}
        </div>
      )}
    </div>
  )
}
