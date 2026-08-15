'use client'

import { useEffect, useState } from 'react'
import VoiceRecorder from '@/components/ui/VoiceRecorder'
import FeedbackPanel, { FeedbackLoading, FeedbackError } from '@/components/ui/FeedbackPanel'
import { useFeedback } from '@/lib/useFeedback'

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

export default function PodcastListening({ taskId, onComplete }: Props) {
  const [pod, setPod] = useState<PodcastData | null>(null)
  const [fetchLoading, setFetchLoading] = useState(true)
  const [listened, setListened] = useState(false)
  const [qIndex, setQIndex] = useState(0)
  const [currentAnswer, setCurrentAnswer] = useState('')
  const [log, setLog] = useState<string[]>([])
  const { feedback, loading: fbLoading, error, getFeedback, clearFeedback } = useFeedback()

  useEffect(() => {
    fetch('/api/fetch-podcast')
      .then(r => r.json())
      .then(setPod)
      .catch(() => setPod(null))
      .finally(() => setFetchLoading(false))
  }, [])

  if (fetchLoading) return (
    <div className="flex items-center gap-2 text-base text-gray-500 py-4">
      <div className="w-4 h-4 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
      ポッドキャストを取得中...
    </div>
  )

  if (!pod) return <p className="text-base text-red-500">ポッドキャストの取得に失敗しました。</p>

  const submitAnswer = () => {
    const q = pod.questions[qIndex]
    setLog(prev => [...prev, `Q: ${q}\nA: ${currentAnswer}`])
    getFeedback('podcast_listening', { question: q, user_answer: currentAnswer }, taskId)
  }

  const nextQuestion = () => {
    clearFeedback()
    setCurrentAnswer('')
    setQIndex(i => i + 1)
  }

  const completeAll = () => {
    clearFeedback()
    onComplete(log.join('\n\n'))
  }

  const isLastQ = qIndex === pod.questions.length - 1

  return (
    <div className="space-y-5">
      <div className="text-xs text-gray-500 bg-gray-50 rounded-lg px-3 py-2">
        🎤 Speaking — ポッドキャストを聞いて英語で答えてください
      </div>

      <div>
        <p className="text-xs text-gray-400 mb-1">BBC 6 Minute English</p>
        <p className="text-base font-medium text-gray-800">{pod.episode_title}</p>
      </div>

      <audio controls src={pod.audio_url} className="w-full rounded-lg" />

      <p className="text-sm text-gray-500">
        全部聞く必要はありません。数分聞いてから回答してください。
      </p>

      {!listened && (
        <button
          onClick={() => setListened(true)}
          className="w-full py-3 bg-indigo-600 text-white rounded-xl font-medium text-base hover:bg-indigo-700 transition-colors"
        >
          聴き終わった → 質問に答える
        </button>
      )}

      {listened && !feedback && !fbLoading && qIndex < pod.questions.length && (
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
            <p className="text-base text-gray-800 leading-relaxed">{pod.questions[qIndex]}</p>
          </div>

          <VoiceRecorder onTranscript={text => setCurrentAnswer(text)} />

          <button
            onClick={submitAnswer}
            disabled={!currentAnswer.trim()}
            className="w-full py-3 bg-indigo-600 text-white rounded-xl font-medium text-base hover:bg-indigo-700 disabled:opacity-40 transition-colors"
          >
            添削してもらう →
          </button>
        </div>
      )}

      {fbLoading && <FeedbackLoading />}
      {error && (
        <FeedbackError
          error={error}
          onSkip={isLastQ ? completeAll : nextQuestion}
        />
      )}
      {feedback && (
        <FeedbackPanel
          feedback={feedback}
          taskType="podcast_listening"
          onContinue={isLastQ ? completeAll : nextQuestion}
          continueLabel={isLastQ ? '完了 →' : '次の質問へ →'}
        />
      )}
    </div>
  )
}
