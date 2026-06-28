'use client'

import { useEffect, useState } from 'react'
import VoiceRecorder from '@/components/ui/VoiceRecorder'

interface Props {
  taskId: string
  onComplete: (transcript: string) => void
}

interface PodcastData {
  episode_title: string
  audio_url: string
  description: string
  questions: string[]
}

export default function PodcastListening({ onComplete }: Props) {
  const [pod, setPod] = useState<PodcastData | null>(null)
  const [loading, setLoading] = useState(true)
  const [qIndex, setQIndex] = useState(0)
  const [answers, setAnswers] = useState<string[]>([])
  const [currentAnswer, setCurrentAnswer] = useState('')
  const [listened, setListened] = useState(false)

  useEffect(() => {
    fetch('/api/fetch-podcast')
      .then(r => r.json())
      .then(setPod)
      .catch(() => setPod(null))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="flex items-center gap-2 text-sm text-gray-500 py-4">
      <div className="w-4 h-4 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
      ポッドキャストを取得中...
    </div>
  )

  if (!pod) return <p className="text-sm text-red-500">ポッドキャストの取得に失敗しました。</p>

  const nextQ = () => {
    const all = [...answers, currentAnswer]
    if (qIndex + 1 < pod.questions.length) {
      setAnswers(all)
      setCurrentAnswer('')
      setQIndex(i => i + 1)
    } else {
      onComplete(
        all.map((a, i) => `Q: ${pod.questions[i]}\nA: ${a}`).join('\n\n')
      )
    }
  }

  return (
    <div className="space-y-5">
      <div className="text-xs text-gray-500 bg-gray-50 rounded-lg px-3 py-2">
        🎤 Speaking — ポッドキャストを聞いて英語で答えてください
      </div>

      <div>
        <p className="text-xs text-gray-400 mb-1">BBC Global News Podcast</p>
        <p className="text-sm font-medium text-gray-800">{pod.episode_title}</p>
      </div>

      <audio controls src={pod.audio_url} className="w-full rounded-lg" />

      <p className="text-xs text-gray-500">
        全部聞く必要はありません。5〜10分聞いてから回答してください。
      </p>

      {!listened ? (
        <button
          onClick={() => setListened(true)}
          className="w-full py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors"
        >
          聴き終わった → 質問に答える
        </button>
      ) : (
        <div className="space-y-4">
          <div className="flex gap-1">
            {pod.questions.map((_, i) => (
              <div key={i} className={`h-1 flex-1 rounded-full ${
                i < qIndex ? 'bg-emerald-500' : i === qIndex ? 'bg-indigo-500' : 'bg-gray-200'
              }`} />
            ))}
          </div>

          <div className="bg-indigo-50 rounded-xl p-4">
            <p className="text-xs text-indigo-500 font-semibold mb-1">Q{qIndex + 1} / {pod.questions.length}</p>
            <p className="text-sm text-gray-800 leading-relaxed">{pod.questions[qIndex]}</p>
          </div>

          <VoiceRecorder onTranscript={text => setCurrentAnswer(text)} />

          {currentAnswer && (
            <button
              onClick={nextQ}
              className="w-full py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors"
            >
              {qIndex + 1 < pod.questions.length ? '次の質問へ' : '完了'} →
            </button>
          )}
        </div>
      )}
    </div>
  )
}
