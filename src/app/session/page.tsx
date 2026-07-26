'use client'

import { useState, useEffect } from 'react'
import { Task, SessionTaskSet } from '@/types'
import { buildSession, getTaskLabel, getCategoryLabel, getCategoryColor } from '@/lib/tasks'
import TaskRunner from '@/components/tasks/TaskRunner'
import Link from 'next/link'
import { ChevronLeft, CheckCircle2, ChevronRight } from 'lucide-react'

type SessionStep = 'warmup' | 'input' | 'interactive' | 'expression' | 'output'

const STEPS: SessionStep[] = ['warmup', 'input', 'interactive', 'expression', 'output']

const STEP_META: Record<SessionStep, { label: string; emoji: string; desc: string }> = {
  warmup:      { label: 'ウォームアップ',   emoji: '🔥', desc: '声を出して脳を英語モードに切り替える' },
  input:       { label: 'インプット',       emoji: '📥', desc: '動画・ポッドキャスト・ニュースを聞いて意見を述べる' },
  interactive: { label: 'インタラクティブ', emoji: '💬', desc: 'AIとリアルタイムで英語の会話練習' },
  expression:  { label: 'エクスプレッション', emoji: '🧩', desc: 'フレーズ・表現を自分の言葉で使いこなす' },
  output:      { label: 'アウトプット',     emoji: '✨', desc: 'まとまった英語で自分の考えを話す' },
}

export default function SessionPage() {
  const [session, setSession] = useState<SessionTaskSet | null>(null)
  const [activeStep, setActiveStep] = useState<SessionStep | null>(null)
  const [completedSteps, setCompletedSteps] = useState<Set<SessionStep>>(new Set())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    buildSession()
      .then(setSession)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  const handleComplete = async (transcript: string) => {
    if (!activeStep || !session) return
    const task: Task = session[activeStep]

    setCompletedSteps(prev => new Set([...prev, activeStep]))
    setActiveStep(null)  // back to picker

    await fetch('/api/complete-task', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ taskId: task.id, taskType: task.type, transcript }),
    }).catch(() => {})
  }

  // ── Loading ───────────────────────────────────────────────────────────────
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

  if (!session) return null

  // ── Task running ─────────────────────────────────────────────────────────
  if (activeStep) {
    const currentTask = session[activeStep]
    const meta = STEP_META[activeStep]
    const stepNum = STEPS.indexOf(activeStep) + 1

    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
          <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
            <button
              onClick={() => setActiveStep(null)}
              className="text-gray-400 hover:text-gray-600"
              title="フェーズ選択に戻る"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="flex-1">
              <p className="text-xs text-gray-400">{meta.emoji} フェーズ {stepNum} — {meta.label}</p>
              <p className="text-sm font-semibold text-gray-800">{getTaskLabel(currentTask.type)}</p>
            </div>
            <div className="flex gap-1">
              {STEPS.map(s => (
                <div key={s} className={`h-1.5 w-6 rounded-full transition-colors ${
                  completedSteps.has(s)
                    ? 'bg-emerald-500'
                    : s === activeStep
                    ? 'bg-indigo-500'
                    : 'bg-gray-200'
                }`} />
              ))}
            </div>
          </div>
        </header>

        <main className="max-w-2xl mx-auto px-4 py-6">
          <div className="mb-4">
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${getCategoryColor(currentTask.category)}`}>
              {getCategoryLabel(currentTask.category)}
            </span>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <TaskRunner task={currentTask} onComplete={handleComplete} />
          </div>
        </main>
      </div>
    )
  }

  // ── Phase picker ─────────────────────────────────────────────────────────
  const allDone = completedSteps.size === STEPS.length
  const doneCount = completedSteps.size

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <Link href="/dashboard" className="text-gray-400 hover:text-gray-600">
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <div className="flex-1">
            <p className="text-sm font-semibold text-gray-800">今日のセッション</p>
            <p className="text-xs text-gray-400">{doneCount} / {STEPS.length} 完了</p>
          </div>
          {/* Progress dots */}
          <div className="flex gap-1">
            {STEPS.map(s => (
              <div key={s} className={`h-1.5 w-6 rounded-full transition-colors ${
                completedSteps.has(s) ? 'bg-emerald-500' : 'bg-gray-200'
              }`} />
            ))}
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-4">
        {allDone ? (
          <div className="text-center py-10 space-y-5">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8 text-emerald-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">全フェーズ完了！</h1>
              <p className="text-gray-500 mt-1 text-sm">5タスクをやりきりました。お疲れ様でした。</p>
            </div>
            <div className="space-y-2">
              <Link href="/dashboard"
                className="block w-full py-3 bg-indigo-600 text-white rounded-xl font-semibold text-base hover:bg-indigo-700 transition-colors text-center">
                ホームに戻る
              </Link>
              <Link href="/stock"
                className="block w-full py-3 bg-white border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors text-center text-sm">
                保存したフレーズを確認する
              </Link>
            </div>
          </div>
        ) : (
          <>
            <p className="text-sm text-gray-500">
              やりたいフェーズを選んでください。順番は問いません。
            </p>

            <div className="space-y-3">
              {STEPS.map((step, i) => {
                const task = session[step]
                const meta = STEP_META[step]
                const done = completedSteps.has(step)

                return (
                  <button
                    key={step}
                    onClick={() => !done && setActiveStep(step)}
                    disabled={done}
                    className={`w-full text-left rounded-2xl border p-4 transition-all ${
                      done
                        ? 'bg-emerald-50 border-emerald-200 opacity-70 cursor-default'
                        : 'bg-white border-gray-200 hover:border-indigo-400 hover:shadow-sm active:scale-[0.99]'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      {/* Step number / check */}
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 text-base font-bold ${
                        done
                          ? 'bg-emerald-500 text-white'
                          : 'bg-indigo-50 text-indigo-600'
                      }`}>
                        {done ? <CheckCircle2 className="w-5 h-5" /> : i + 1}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-xs text-gray-400">{meta.emoji} {meta.label}</span>
                          <span className={`text-xs font-semibold px-1.5 py-0 rounded-full border ${getCategoryColor(task.category)}`}>
                            {getCategoryLabel(task.category)}
                          </span>
                        </div>
                        <p className="text-base font-semibold text-gray-800">{getTaskLabel(task.type)}</p>
                        <p className="text-xs text-gray-400 mt-0.5 truncate">{meta.desc}</p>
                      </div>

                      {/* Arrow */}
                      {!done && <ChevronRight className="w-4 h-4 text-gray-300 shrink-0" />}
                    </div>
                  </button>
                )
              })}
            </div>

            {doneCount > 0 && (
              <Link href="/dashboard"
                className="block w-full py-3 text-center text-sm text-gray-400 hover:text-gray-600 mt-2">
                今日はここまで → ホームに戻る
              </Link>
            )}
          </>
        )}
      </main>
    </div>
  )
}
