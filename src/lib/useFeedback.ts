'use client'

import { useState } from 'react'

export interface FeedbackCorrection {
  original: string
  corrected: string
  reason_ja: string
}

export interface SaveablePhrase {
  phrase: string
  meaning_ja: string
}

export interface FeedbackData {
  corrected_text?: string
  corrections: FeedbackCorrection[]
  saveable_phrases: SaveablePhrase[]
  overall_comment_ja: string
  ideal_answer?: string
}

export function useFeedback() {
  const [feedback, setFeedback] = useState<FeedbackData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const getFeedback = async (taskType: string, context: Record<string, unknown>) => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ task_type: taskType, context }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? `HTTP ${res.status}`)
      setFeedback(data)
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setLoading(false)
    }
  }

  const clearFeedback = () => {
    setFeedback(null)
    setError(null)
  }

  return { feedback, loading, error, getFeedback, clearFeedback }
}
