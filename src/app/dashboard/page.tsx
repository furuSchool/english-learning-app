'use client'

import { useState, useEffect } from 'react'
import { Task, DailyTaskSet, Feedback } from '@/types'
import { fetchDailyTasks, getCategoryLabel, getCategoryColor } from '@/lib/tasks'
import { getActivityLogs } from '@/lib/activity'
import TaskShell from '@/components/tasks/TaskShell'
import TaskRunner from '@/components/tasks/TaskRunner'
import ActivityHeatmap from '@/components/ui/ActivityHeatmap'
import { createClient } from '@/lib/supabase/client'
import { BookMarked, LogOut, RefreshCw } from 'lucide-react'
import Link from 'next/link'

interface CompletedTask {
  taskId: string
  transcript: string
  feedback: Feedback | null
}

export default function DashboardPage() {
  const [taskSet, setTaskSet] = useState<DailyTaskSet | null>(null)
  const [spareIndex, setSpareIndex] = useState(0)
  const [currentTasks, setCurrentTasks] = useState<{ warmup: Task; input: Task; output: Task } | null>(null)
  const [completed, setCompleted] = useState<Map<string, CompletedTask>>(new Map())
  const [activityData, setActivityData] = useState<{ date: string; task_count: number }[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [user, setUser] = useState<{ email?: string } | null>(null)

  useEffect(() => {
    loadDashboard()
  }, [])

  async function loadDashboard() {
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)

      const [tasks, activity] = await Promise.all([
        fetchDailyTasks(),
        getActivityLogs(365),
      ])

      setTaskSet(tasks)
      setCurrentTasks({ warmup: tasks.warmup, input: tasks.input, output: tasks.output })
      setActivityData(activity)
    } catch (e) {
      setError('データの読み込みに失敗しました。Supabaseの設定を確認してください。')
    } finally {
      setLoading(false)
    }
  }

  const handleSwap = (category: 'warmup' | 'input' | 'output') => {
    if (!taskSet || !currentTasks) return
    const spare = taskSet.spares[spareIndex]
    if (!spare) return

    setCurrentTasks(prev => prev ? { ...prev, [category]: spare } : null)
    setSpareIndex(i => i + 1)
  }

  const handleComplete = async (category: 'warmup' | 'input' | 'output', task: Task, transcript: string, feedback: Feedback | null) => {
    const completedEntry: CompletedTask = { taskId: task.id, transcript, feedback }
    setCompleted(prev => new Map(prev).set(task.id, completedEntry))

    // Record completion in backend
    try {
      await fetch('/api/complete-task', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taskId: task.id,
          taskType: task.type,
          transcript,
          feedback,
        }),
      })
      // Refresh activity data
      const activity = await getActivityLogs(365)
      setActivityData(activity)
    } catch {}
  }

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  const completedCount = completed.size
  const allDone = completedCount >= 3

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-gray-500 text-sm">タスクを準備中...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center space-y-4 max-w-md">
          <p className="text-red-600 font-medium">エラーが発生しました</p>
          <p className="text-gray-500 text-sm">{error}</p>
          <p className="text-xs text-gray-400">
            .env.localにSUPABASEとGEMINIのAPIキーを設定してください。
          </p>
          <button onClick={loadDashboard} className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm">
            再試行
          </button>
        </div>
      </div>
    )
  }

  if (!currentTasks) return null

  const taskCategories: Array<{ key: 'warmup' | 'input' | 'output'; task: Task }> = [
    { key: 'warmup', task: currentTasks.warmup },
    { key: 'input', task: currentTasks.input },
    { key: 'output', task: currentTasks.output },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-indigo-700">SpeakFlow</span>
            <span className="text-xs bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full font-medium">
              今日のタスク
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/stock"
              className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-indigo-600"
            >
              <BookMarked className="w-4 h-4" />
              表現ストック
            </Link>
            <button
              onClick={handleLogout}
              className="text-gray-400 hover:text-gray-600"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Progress */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold text-gray-700">
              今日の進捗 {completedCount}/3
            </span>
            {allDone && (
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                🎉 今日のセッション完了！
              </span>
            )}
          </div>
          <div className="flex gap-2">
            {taskCategories.map(({ key, task }) => (
              <div
                key={key}
                className={`flex-1 h-2 rounded-full ${
                  completed.has(task.id) ? 'bg-emerald-500' : 'bg-gray-200'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Tasks */}
        {taskCategories.map(({ key, task }) => (
          <TaskShell
            key={`${key}-${task.id}`}
            task={task}
            onSwap={() => handleSwap(key)}
            canSwap={spareIndex < (taskSet?.spares.length ?? 0)}
            isCompleted={completed.has(task.id)}
          >
            {!completed.has(task.id) ? (
              <TaskRunner
                task={task}
                onComplete={(transcript, feedback) => handleComplete(key, task, transcript, feedback)}
              />
            ) : (
              <div className="text-center py-3 text-emerald-600 font-medium text-sm">
                このタスクは完了しました ✓
              </div>
            )}
          </TaskShell>
        ))}

        {/* Activity Heatmap */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">学習履歴</h2>
          <ActivityHeatmap data={activityData} />
        </div>
      </main>
    </div>
  )
}
