'use client'

import { useState, useRef, useEffect } from 'react'
import { ChatMessage } from '@/types'
import { Send, Mic, Square, AlertCircle, Loader2 } from 'lucide-react'

interface PerTurnCorrection {
  corrections: { original: string; corrected: string; reason_ja: string }[]
}

interface ChatInterfaceProps {
  taskType: string
  taskContent: Record<string, unknown>
  initialMessage: string
  minExchanges?: number
  onComplete: (messages: ChatMessage[]) => void
}

export default function ChatInterface({
  taskType,
  taskContent,
  initialMessage,
  minExchanges = 3,
  onComplete,
}: ChatInterfaceProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'assistant', content: initialMessage },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)

  // per-turn corrections: keyed by user message index in messages array
  const [corrections, setCorrections] = useState<Record<number, PerTurnCorrection | null>>({})
  const [correcting, setCorrecting] = useState<Record<number, boolean>>({})

  // Voice state
  const [isRecording, setIsRecording] = useState(false)
  const [voiceSupported, setVoiceSupported] = useState(false)
  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const isRecordingRef = useRef(false)

  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const userTurns = messages.filter(m => m.role === 'user').length

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, corrections])

  useEffect(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SR) return
    setVoiceSupported(true)

    const r = new SR()
    r.continuous = true
    r.interimResults = false
    r.lang = 'en-US'

    r.onresult = (event) => {
      let text = ''
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) text += event.results[i][0].transcript
      }
      if (text) {
        setInput(prev => (prev ? prev + ' ' + text : text))
        // auto-grow textarea
        setTimeout(() => {
          if (textareaRef.current) {
            textareaRef.current.style.height = 'auto'
            textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px'
          }
        }, 0)
      }
    }

    r.onerror = () => { setIsRecording(false); isRecordingRef.current = false }
    r.onend = () => {
      if (isRecordingRef.current) { try { r.start() } catch {} }
    }

    recognitionRef.current = r
    return () => r.stop()
  }, [])

  const toggleVoice = () => {
    if (!recognitionRef.current) return
    if (isRecording) {
      isRecordingRef.current = false
      setIsRecording(false)
      recognitionRef.current.stop()
    } else {
      isRecordingRef.current = true
      setIsRecording(true)
      recognitionRef.current.start()
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value)
    e.target.style.height = 'auto'
    e.target.style.height = Math.min(e.target.scrollHeight, 160) + 'px'
  }

  const fetchPerTurnCorrection = async (userMessage: string, userMsgIndex: number, priorAiMessage: string) => {
    setCorrecting(prev => ({ ...prev, [userMsgIndex]: true }))
    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          task_type: 'per_turn_correction',
          context: {
            user_message: userMessage,
            prior_ai_message: priorAiMessage,
          },
        }),
      })
      const data = await res.json()
      if (res.ok && data.corrections) {
        setCorrections(prev => ({ ...prev, [userMsgIndex]: data as PerTurnCorrection }))
      }
    } catch {}
    finally {
      setCorrecting(prev => ({ ...prev, [userMsgIndex]: false }))
    }
  }

  const send = async () => {
    const text = input.trim()
    if (!text || loading) return
    if (isRecording) { isRecordingRef.current = false; setIsRecording(false); recognitionRef.current?.stop() }

    const userMsgIndex = messages.length
    const priorAiMessage = messages[messages.length - 1]?.content ?? initialMessage
    const next: ChatMessage[] = [...messages, { role: 'user', content: text }]
    setMessages(next)
    setInput('')
    if (textareaRef.current) textareaRef.current.style.height = 'auto'
    setLoading(true)
    setApiError(null)

    // fire per-turn correction async (don't await — runs in parallel with AI response)
    fetchPerTurnCorrection(text, userMsgIndex, priorAiMessage)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskType, taskContent, messages: next }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? `HTTP ${res.status}`)
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply }])
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e)
      setApiError(`AIの応答取得に失敗しました: ${msg}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {apiError && (
        <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-base text-red-700">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{apiError}</span>
        </div>
      )}

      <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
        {messages.map((m, i) => (
          <div key={i}>
            <div className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-base leading-relaxed ${
                m.role === 'user'
                  ? 'bg-indigo-600 text-white rounded-br-sm'
                  : 'bg-gray-100 text-gray-800 rounded-bl-sm'
              }`}>
                {m.content}
              </div>
            </div>

            {/* Per-turn correction: show below AI bubble for the user message that preceded it */}
            {m.role === 'assistant' && i > 0 && messages[i - 1]?.role === 'user' && (() => {
              const userIdx = i - 1
              const isCorrectingNow = correcting[userIdx]
              const correction = corrections[userIdx]
              if (isCorrectingNow) {
                return (
                  <div className="flex justify-start mt-1">
                    <div className="flex items-center gap-1.5 text-xs text-gray-400 pl-1">
                      <Loader2 className="w-3 h-3 animate-spin" />
                      添削確認中...
                    </div>
                  </div>
                )
              }
              if (correction && correction.corrections.length > 0) {
                return (
                  <div className="mt-1.5 ml-1 space-y-1">
                    {correction.corrections.map((c, ci) => (
                      <div key={ci} className="text-sm text-gray-600">
                        <span className="line-through text-red-400">{c.original}</span>
                        <span className="text-gray-400 mx-1">→</span>
                        <span className="text-emerald-700 font-medium">{c.corrected}</span>
                        {c.reason_ja && <span className="text-gray-400 ml-1">({c.reason_ja})</span>}
                      </div>
                    ))}
                  </div>
                )
              }
              return null
            })()}
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-2xl rounded-bl-sm px-4 py-3">
              <span className="flex gap-1 items-center">
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </span>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input row */}
      <div className="flex gap-2 items-end">
        {voiceSupported && (
          <button
            onClick={toggleVoice}
            disabled={loading}
            className={`p-3 rounded-xl transition-colors shrink-0 ${
              isRecording
                ? 'bg-red-500 text-white hover:bg-red-600'
                : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
            } disabled:opacity-40`}
            title={isRecording ? '録音停止' : '音声入力'}
          >
            {isRecording ? <Square className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>
        )}
        <textarea
          ref={textareaRef}
          rows={1}
          value={input}
          onChange={handleInputChange}
          onKeyDown={e => {
            if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() }
          }}
          placeholder={isRecording ? '録音中... (停止後に編集可)' : 'Type your response in English...'}
          disabled={loading}
          style={{ minHeight: '48px', maxHeight: '160px' }}
          className="flex-1 rounded-xl border border-gray-200 px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 resize-none overflow-y-auto"
        />
        <button
          onClick={send}
          disabled={loading || !input.trim()}
          className="p-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-40 transition-colors shrink-0"
        >
          <Send className="w-5 h-5" />
        </button>
      </div>

      {isRecording && (
        <p className="text-xs text-red-500 flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          録音中 — もう一度マイクボタンを押して停止してください
        </p>
      )}

      {userTurns >= minExchanges && (
        <button
          onClick={() => onComplete(messages)}
          className="w-full py-3 bg-emerald-600 text-white rounded-xl font-semibold text-base hover:bg-emerald-700 transition-colors"
        >
          会話を終了して完了 →
        </button>
      )}
      {userTurns > 0 && userTurns < minExchanges && (
        <p className="text-sm text-gray-400 text-center">
          あと{minExchanges - userTurns}回やり取りすると完了できます
        </p>
      )}
    </div>
  )
}
