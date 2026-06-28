'use client'

import { useState, useRef, useEffect } from 'react'
import { Mic, MicOff, Square } from 'lucide-react'

interface VoiceRecorderProps {
  onTranscript: (text: string) => void
  onRecordingChange?: (isRecording: boolean) => void
  disabled?: boolean
}

export default function VoiceRecorder({ onTranscript, onRecordingChange, disabled }: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [supported, setSupported] = useState(true)
  const recognitionRef = useRef<SpeechRecognition | null>(null)

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) {
      setSupported(false)
      return
    }

    const recognition = new SpeechRecognition()
    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = 'en-US'

    recognition.onresult = (event) => {
      let finalTranscript = ''
      let interimTranscript = ''
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript
        } else {
          interimTranscript += event.results[i][0].transcript
        }
      }
      setTranscript(prev => {
        const updated = prev + finalTranscript
        return updated
      })
    }

    recognition.onerror = (event) => {
      if (event.error !== 'no-speech') {
        setError('音声認識エラー: ' + event.error)
      }
      setIsRecording(false)
      onRecordingChange?.(false)
    }

    recognition.onend = () => {
      if (isRecording) {
        try { recognition.start() } catch {}
      }
    }

    recognitionRef.current = recognition

    return () => {
      recognition.stop()
    }
  }, [])

  const startRecording = () => {
    if (!recognitionRef.current) return
    setTranscript('')
    setError(null)
    setIsRecording(true)
    onRecordingChange?.(true)
    recognitionRef.current.start()
  }

  const stopRecording = () => {
    if (!recognitionRef.current) return
    setIsRecording(false)
    onRecordingChange?.(false)
    recognitionRef.current.stop()
    setTimeout(() => {
      if (transcript) onTranscript(transcript)
    }, 300)
  }

  if (!supported) {
    return (
      <div className="rounded-xl border border-gray-200 p-4">
        <p className="text-sm text-gray-500 mb-2">
          お使いのブラウザは音声入力に対応していません。テキストで入力してください。
        </p>
        <textarea
          className="w-full rounded-lg border border-gray-300 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          rows={4}
          placeholder="英語でここに入力してください..."
          onChange={e => setTranscript(e.target.value)}
        />
        <button
          onClick={() => transcript && onTranscript(transcript)}
          className="mt-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700"
        >
          送信
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="min-h-[80px] rounded-xl border border-gray-200 bg-gray-50 p-4">
        {transcript ? (
          <p className="text-gray-800 text-sm leading-relaxed">{transcript}</p>
        ) : (
          <p className="text-gray-400 text-sm">
            {isRecording ? '話してください...' : 'マイクボタンを押して話し始めてください'}
          </p>
        )}
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <div className="flex gap-3 items-center">
        {!isRecording ? (
          <button
            onClick={startRecording}
            disabled={disabled}
            className="flex items-center gap-2 px-5 py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Mic className="w-5 h-5" />
            録音開始
          </button>
        ) : (
          <button
            onClick={stopRecording}
            className="flex items-center gap-2 px-5 py-3 bg-red-500 text-white rounded-xl font-medium hover:bg-red-600 transition-colors animate-pulse"
          >
            <Square className="w-5 h-5" />
            録音停止
          </button>
        )}

        {transcript && !isRecording && (
          <button
            onClick={() => onTranscript(transcript)}
            className="px-5 py-3 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 transition-colors"
          >
            送信 →
          </button>
        )}

        {transcript && (
          <button
            onClick={() => setTranscript('')}
            className="px-3 py-3 text-gray-500 hover:text-gray-700 transition-colors"
          >
            クリア
          </button>
        )}
      </div>

      {isRecording && (
        <div className="flex items-center gap-2 text-red-500 text-sm">
          <span className="inline-block w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          録音中...
        </div>
      )}
    </div>
  )
}
