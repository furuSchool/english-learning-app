'use client'

import { useState, useEffect, useRef } from 'react'
import { ImpromtuSpeakContent } from '@/types'
import VoiceRecorder from '@/components/ui/VoiceRecorder'

interface Props {
  taskId: string
  content: ImpromtuSpeakContent
  onComplete: (transcript: string) => void
}

export default function ImpromtuSpeak({ content, onComplete }: Props) {
  const [started, setStarted] = useState(false)
  const [seconds, setSeconds] = useState(0)
  const [answer, setAnswer] = useState('')
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (started) {
      timerRef.current = setInterval(() => setSeconds(s => s + 1), 1000)
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [started])

  const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`

  return (
    <div className="space-y-5">
      <div className="text-xs text-gray-500 bg-gray-50 rounded-lg px-3 py-2">
        🎤 Speaking — 止まらず60〜90秒間話してください
      </div>

      <div className="bg-indigo-50 rounded-xl p-4">
        <p className="text-xs text-indigo-500 font-semibold mb-1 uppercase">{content.category}</p>
        <p className="text-gray-900 font-semibold leading-relaxed text-base">{content.topic}</p>
      </div>

      <div className="bg-gray-50 rounded-xl px-4 py-3">
        <p className="text-xs text-gray-500 mb-1">How to start</p>
        <p className="text-sm text-gray-700 italic">"{content.starter_hint}"</p>
      </div>

      {started && (
        <div className="text-center">
          <span className={`text-3xl font-mono font-bold ${seconds >= 60 ? 'text-emerald-600' : 'text-indigo-600'}`}>
            {fmt(seconds)}
          </span>
          {seconds >= 60 && <p className="text-xs text-emerald-600 mt-1">いつでも止めてOK</p>}
        </div>
      )}

      {!started ? (
        <button
          onClick={() => setStarted(true)}
          className="w-full py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors"
        >
          話し始める →
        </button>
      ) : (
        <div className="space-y-3">
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
      )}
    </div>
  )
}
