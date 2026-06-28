'use client'

import { useState, useEffect } from 'react'
import { Task, SessionTaskSet } from '@/types'
import { buildSession, getTaskLabel, getCategoryLabel, getCategoryColor } from '@/lib/tasks'
import TaskRunner from '@/components/tasks/TaskRunner'
import Link from 'next/link'
import { ChevronLeft, CheckCircle2 } from 'lucide-react'

type SessionStep = 'warmup' | 'input' | 'interactive1' | 'interactive2' | 'expression'
const STEPS: SessionStep[] = ['warmup', 'input', 'interactive1', 'interactive2', 'expression']
const STEP_LABELS: Record<SessionStep, string> = {
  warmup: 'Warmup',
  input: 'Input',
  interactive1: 'Interactive 1',
  interactive2: 'Interactive 2',
  expression: 'Expression',
}

export default function SessionPage() {
  const [session, setSession] = useState<SessionTaskSet | null>(null)
  const [stepIndex, setStepIndex] = useState(0)
  const [completedSteps, setCompletedSteps] = useState<Set<SessionStep>>(new Set())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    buildSession()
      .then(setSession)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  const currentStep = STEPS[stepIndex]
  const currentTask: Task | null = session ? session[currentStep] : null
  const allDone = completedSteps.size === STEPS.length

  const handleComplete = async (transcript: string) => {
    if (!currentTask) return

    setCompletedSteps(prev => new Set([...prev, currentStep]))

    await fetch('/api/complete-task', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        taskId: currentTask.id,
        taskType: currentTask.type,
        transcript,
      }),
    }).catch(() => {})

    if (stepIndex + 1 < STEPS.length) {
      setStepIndex(i => i + 1)
    }
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-3">
        <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-gray-500 text-sm">セッションを準備中...</p>
      </div>
    </div>
  )

  if (error) return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="text-center space-y-4 max-w-sm">
        <p className="text-red-600 font-medium">{error}</p>
        <Link href="/dashboard" className="inline-block px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm">
          ダッシュボードに戻る
        </Link>
      </div>
    </div>
  )

  if (allDone) return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <div className="text-center space-y-6 max-w-sm">
        <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-8 h-8 text-emerald-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">セッション完了！</h1>
          <p className="text-gray-500 mt-2 text-sm">5タスクを完了しました。お疲れ様でした。</p>
        </div>
        <div className="space-y-2">
          <Link href="/dashboard"
            className="block w-full py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors text-center">
            ホームに戻る
          </Link>
          <Link href="/stock"
            className="block w-full py-3 bg-white border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors text-center text-sm">
            保存したフレーズを確認する
          </Link>
        </div>
      </div>
    </div>
  )

  if (!currentTask) return null

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-xl mx-auto px-4 py-3 flex items-center gap-3">
          <Link href="/dashboard" className="text-gray-400 hover:text-gray-600">
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <div className="flex-1 flex gap-1">
            {STEPS.map((s, i) => (
              <div key={s} className={`h-1.5 flex-1 rounded-full transition-colors ${
                completedSteps.has(s) ? 'bg-emerald-500' : i === stepIndex ? 'bg-indigo-500' : 'bg-gray-200'
              }`} />
            ))}
          </div>
          <span className="text-xs text-gray-500 whitespace-nowrap">
            {stepIndex + 1} / {STEPS.length}
          </span>
        </div>
      </header>

      <main className="max-w-xl mx-auto px-4 py-6">
        {/* Task header */}
        <div className="mb-4 flex items-center gap-2">
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${getCategoryColor(currentTask.category)}`}>
            {getCategoryLabel(currentTask.category)}
          </span>
          <span className="text-sm font-medium text-gray-700">{getTaskLabel(currentTask.type)}</span>
          <span className="ml-auto text-xs text-gray-400">{STEP_LABELS[currentStep]}</span>
        </div>

        {/* Task */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <TaskRunner task={currentTask} onComplete={handleComplete} />
        </div>
      </main>
    </div>
  )
}
