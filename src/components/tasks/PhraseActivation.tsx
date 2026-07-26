'use client'

import { useState } from 'react'
import { PhraseActivationContent } from '@/types'
import VoiceRecorder from '@/components/ui/VoiceRecorder'
import FeedbackPanel, { FeedbackLoading, FeedbackError } from '@/components/ui/FeedbackPanel'
import { useFeedback } from '@/lib/useFeedback'
import { ChevronRight, BookMarked } from 'lucide-react'

interface Props {
  taskId: string
  content: PhraseActivationContent
  onComplete: (transcript: string) => void
}

export default function PhraseActivation({ content, onComplete }: Props) {
  const [index, setIndex] = useState(0)
  const [answers, setAnswers] = useState<string[]>([])
  const [current, setCurrent] = useState('')
  const [saved, setSaved] = useState(false)
  const { feedback, loading, error, getFeedback, clearFeedback } = useFeedback()

  const phrase = content.phrases[index]
  const total = content.phrases.length

  const savePhrase = async () => {
    if (saved) return
    setSaved(true)
    await fetch('/api/save-phrase', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        phrase: phrase.phrase,
        meaning_ja: phrase.meaning_ja,
        task_type: 'phrase_activation',
      }),
    }).catch(() => {})
  }

  const handleSubmit = () => {
    getFeedback('phrase_activation', {
      phrase: phrase.phrase,
      user_sentence: current,
    })
  }

  const handleNext = () => {
    const all = [...answers, current]
    clearFeedback()
    if (index + 1 < total) {
      setAnswers(all)
      setCurrent('')
      setSaved(false)
      setIndex(i => i + 1)
    } else {
      onComplete(
        all.map((a, i) => `Phrase: ${content.phrases[i].phrase}\nMy sentence: ${a}`).join('\n\n')
      )
    }
  }

  return (
    <div className="space-y-5">
      <div className="text-xs text-gray-500 bg-gray-50 rounded-lg px-3 py-2">
        🎤/✍️ Expression — フレーズを使って自分の文を作ってください
      </div>

      <div className="flex gap-1">
        {content.phrases.map((_, i) => (
          <div key={i} className={`h-1.5 flex-1 rounded-full ${
            i < index ? 'bg-emerald-500' : i === index ? 'bg-indigo-500' : 'bg-gray-200'
          }`} />
        ))}
      </div>

      <div className="bg-indigo-50 rounded-xl p-4 space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-lg font-bold text-indigo-700">"{phrase.phrase}"</p>
          <button onClick={savePhrase} disabled={saved}
            className={`p-1.5 rounded-lg transition-colors ${saved ? 'text-emerald-500' : 'text-gray-400 hover:text-indigo-600'}`}>
            <BookMarked className="w-4 h-4" />
          </button>
        </div>
        <p className="text-sm text-gray-600">{phrase.meaning_ja}</p>
        <div className="bg-white rounded-lg px-3 py-2 border border-indigo-100">
          <p className="text-xs text-gray-400 mb-0.5">Example</p>
          <p className="text-sm text-gray-700 italic">"{phrase.example}"</p>
        </div>
      </div>

      {!feedback && !loading && (
        <>
          <p className="text-sm text-gray-600">このフレーズを使って、自分の経験や意見を英語で話してみてください。</p>
          <VoiceRecorder onTranscript={text => setCurrent(text)} />
          {current && (
            <button onClick={handleSubmit}
              className="w-full flex items-center justify-center gap-2 py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors">
              添削してもらう
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </>
      )}

      {loading && <FeedbackLoading />}
      {error && (
        <FeedbackError
          error={error}
          onSkip={handleNext}
        />
      )}
      {feedback && (
        <FeedbackPanel
          feedback={feedback}
          taskType="phrase_activation"
          onContinue={handleNext}
          continueLabel={index + 1 < total ? '次のフレーズ →' : '完了 →'}
        />
      )}
    </div>
  )
}
