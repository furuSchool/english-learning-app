'use client'

import { useState, useEffect } from 'react'
import { getActivityLogs } from '@/lib/activity'
import { getTaskCount } from '@/lib/tasks'
import ActivityHeatmap from '@/components/ui/ActivityHeatmap'
import { createClient } from '@/lib/supabase/client'
import { BookMarked, LogOut, Play, RefreshCw, Zap } from 'lucide-react'
import Link from 'next/link'

export default function DashboardPage() {
  const [taskCount, setTaskCount] = useState<number | null>(null)
  const [activityData, setActivityData] = useState<{ date: string; task_count: number }[]>([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [generateMsg, setGenerateMsg] = useState<string | null>(null)

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    setLoading(true)
    try {
      const [count, activity] = await Promise.all([
        getTaskCount(),
        getActivityLogs(365),
      ])
      setTaskCount(count)
      setActivityData(activity)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  const handleGenerate = async () => {
    setGenerating(true)
    setGenerateMsg(null)
    try {
      const res = await fetch('/api/generate-tasks', { method: 'POST' })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setGenerateMsg(`✓ ${data.added}件のタスクを追加しました`)
      await loadData()
    } catch (e) {
      setGenerateMsg(`エラー: ${e instanceof Error ? e.message : '生成に失敗しました'}`)
    } finally {
      setGenerating(false)
    }
  }

  const totalSessions = activityData.reduce((s, d) => s + Math.floor(d.task_count / 5), 0)
  const streak = (() => {
    if (!activityData.length) return 0
    const dates = new Set(activityData.map(d => d.date))
    let s = 0
    const d = new Date()
    while (dates.has(d.toISOString().split('T')[0])) {
      s++
      d.setDate(d.getDate() - 1)
    }
    return s
  })()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <span className="text-lg font-bold text-indigo-700">SpeakFlow</span>
          <div className="flex items-center gap-3">
            <Link href="/stock" className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-indigo-600">
              <BookMarked className="w-4 h-4" />
              <span className="hidden sm:inline">Phrases</span>
            </Link>
            <button onClick={handleLogout} className="text-gray-400 hover:text-gray-600">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white rounded-2xl border border-gray-100 p-4 text-center">
            <p className="text-2xl font-bold text-indigo-600">{streak}</p>
            <p className="text-xs text-gray-500 mt-0.5">日連続</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 p-4 text-center">
            <p className="text-2xl font-bold text-indigo-600">{totalSessions}</p>
            <p className="text-xs text-gray-500 mt-0.5">セッション</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 p-4 text-center">
            <p className={`text-2xl font-bold ${taskCount !== null && taskCount < 20 ? 'text-amber-500' : 'text-indigo-600'}`}>
              {taskCount ?? '—'}
            </p>
            <p className="text-xs text-gray-500 mt-0.5">残タスク</p>
          </div>
        </div>

        {/* Start session CTA */}
        <Link href="/session"
          className="flex items-center justify-between bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl px-6 py-5 transition-colors group">
          <div>
            <p className="font-bold text-lg">今日のセッションを始める</p>
            <p className="text-indigo-200 text-sm mt-0.5">5タスク · 約15分</p>
          </div>
          <Play className="w-8 h-8 text-indigo-200 group-hover:text-white transition-colors" />
        </Link>

        {/* Task count warning */}
        {taskCount !== null && taskCount < 20 && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <p className="text-sm text-amber-800 font-medium">
              タスクが残り{taskCount}件です。Geminiで新しいタスクを生成してください。
            </p>
          </div>
        )}

        {/* Generate tasks */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-indigo-600" />
              <h2 className="font-semibold text-gray-800">タスクを補充する</h2>
            </div>
            <span className="text-xs text-gray-400">Gemini AI が生成</span>
          </div>
          <p className="text-sm text-gray-500 mb-4">
            14種類のタスクタイプについて各3問（計42問）をGeminiが自動生成します。
          </p>
          <button
            onClick={handleGenerate}
            disabled={generating}
            className="w-full flex items-center justify-center gap-2 py-3 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-xl font-medium hover:bg-indigo-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {generating ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                生成中... (30秒ほどかかります)
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4" />
                タスクを生成する
              </>
            )}
          </button>
          {generateMsg && (
            <p className={`text-sm mt-3 text-center ${generateMsg.startsWith('エラー') ? 'text-red-500' : 'text-emerald-600'}`}>
              {generateMsg}
            </p>
          )}
        </div>

        {/* Heatmap */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">学習履歴</h2>
          {loading ? (
            <div className="h-24 flex items-center justify-center">
              <div className="w-5 h-5 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <ActivityHeatmap data={activityData} />
          )}
        </div>
      </main>
    </div>
  )
}
