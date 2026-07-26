'use client'

import { useState, useRef, useEffect } from 'react'
import { Mic, Square, RotateCcw } from 'lucide-react'

interface VoiceRecorderProps {
  onTranscript: (text: string) => void
  disabled?: boolean
  placeholder?: string
}

export default function VoiceRecorder({ onTranscript, disabled, placeholder }: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [text, setText] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [supported, setSupported] = useState(true)
  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const textRef = useRef('')
  const isRecordingRef = useRef(false)
  // Keep onTranscript in a ref so the effect never needs to re-run when it changes
  const onTranscriptRef = useRef(onTranscript)
  useEffect(() => { onTranscriptRef.current = onTranscript }, [onTranscript])

  useEffect(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SR) { setSupported(false); return }

    const r = new SR()
    r.continuous = true
    r.interimResults = true
    r.lang = 'en-US'

    r.onresult = (event) => {
      let final = ''
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) final += event.results[i][0].transcript
      }
      if (final) {
        const updated = textRef.current + final
        textRef.current = updated
        setText(updated)
        onTranscriptRef.current(updated)
      }
    }

    r.onerror = (event) => {
      if (event.error !== 'no-speech') setError('音声認識エラー: ' + event.error)
      setIsRecording(false)
      isRecordingRef.current = false
    }

    r.onend = () => {
      if (recognitionRef.current && isRecordingRef.current) {
        try { r.start() } catch {}
      }
    }

    recognitionRef.current = r
    return () => r.stop()
  }, []) // no dependency on onTranscript — use ref instead

  const startRecording = () => {
    if (!recognitionRef.current || disabled) return
    textRef.current = text
    setError(null)
    isRecordingRef.current = true
    setIsRecording(true)
    recognitionRef.current.start()
  }

  const stopRecording = () => {
    if (!recognitionRef.current) return
    isRecordingRef.current = false
    setIsRecording(false)
    recognitionRef.current.stop()
  }

  const reset = () => {
    textRef.current = ''
    setText('')
    setError(null)
    setIsRecording(false)
    isRecordingRef.current = false
    onTranscriptRef.current('')
    try { recognitionRef.current?.stop() } catch {}
  }

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value
    textRef.current = val
    setText(val)
    onTranscriptRef.current(val)
  }

  if (!supported) {
    return (
      <div className="space-y-3">
        <p className="text-sm text-gray-500">音声入力非対応ブラウザです。テキストで入力してください。</p>
        <textarea
          rows={4}
          value={text}
          onChange={handleTextChange}
          placeholder={placeholder ?? '英語でここに入力してください...'}
          className="w-full rounded-xl border border-gray-200 px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
        />
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="relative">
        <textarea
          rows={4}
          value={text}
          onChange={handleTextChange}
          readOnly={isRecording}
          placeholder={
            isRecording
              ? '話してください...'
              : (placeholder ?? 'マイクボタンを押して話し始めるか、ここに直接入力できます')
          }
          className={`w-full rounded-xl border px-4 py-3 text-base leading-relaxed focus:outline-none resize-none transition-colors ${
            isRecording
              ? 'border-red-300 bg-red-50 text-gray-700 cursor-default'
              : 'border-gray-200 bg-white focus:ring-2 focus:ring-indigo-500'
          }`}
        />
        {isRecording && (
          <span className="absolute top-3 right-3 flex items-center gap-1 text-red-500 text-xs font-medium">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            REC
          </span>
        )}
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <div className="flex items-center gap-3">
        {!isRecording ? (
          <button
            onClick={startRecording}
            disabled={disabled}
            className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-semibold text-base hover:bg-indigo-700 disabled:opacity-40 transition-colors"
          >
            <Mic className="w-4 h-4" />
            {text ? '追加録音' : '録音開始'}
          </button>
        ) : (
          <button
            onClick={stopRecording}
            className="flex items-center gap-2 px-5 py-2.5 bg-red-500 text-white rounded-xl font-semibold text-base hover:bg-red-600 transition-colors"
          >
            <Square className="w-4 h-4" />
            録音停止
          </button>
        )}

        {text && !isRecording && (
          <button onClick={reset} className="p-2.5 text-gray-400 hover:text-gray-600 transition-colors" title="クリア">
            <RotateCcw className="w-4 h-4" />
          </button>
        )}
      </div>

      {!isRecording && !text && (
        <p className="text-xs text-gray-400">録音後にテキストを編集できます</p>
      )}
    </div>
  )
}
