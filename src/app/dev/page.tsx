'use client'

import { useState } from 'react'
import { Task } from '@/types'
import { DEV_FIXTURES } from '@/lib/dev-fixtures'
import { getTaskLabel, getCategoryLabel, getCategoryColor } from '@/lib/tasks'
import TaskRunner from '@/components/tasks/TaskRunner'
import { ChevronRight, RotateCcw } from 'lucide-react'

const CATEGORIES = [
  { key: 'warmup',      label: 'Warmup',       color: 'text-amber-700  bg-amber-50  border-amber-200' },
  { key: 'input',       label: 'Input',        color: 'text-blue-700   bg-blue-50   border-blue-200' },
  { key: 'interactive', label: 'Interactive',  color: 'text-purple-700 bg-purple-50 border-purple-200' },
  { key: 'expression',  label: 'Expression',   color: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
  { key: 'output',      label: 'Output',       color: 'text-rose-700   bg-rose-50   border-rose-200' },
]

export default function DevPage() {
  const [selected, setSelected] = useState<Task>(DEV_FIXTURES[0])
  const [key, setKey] = useState(0)
  const [doneTypes, setDoneTypes] = useState<Set<string>>(new Set())

  const handleComplete = (transcript: string) => {
    setDoneTypes(prev => new Set([...prev, selected.type]))
    console.log('[dev] complete:', selected.type, transcript.slice(0, 200))
  }

  const selectTask = (task: Task) => {
    setSelected(task)
    setKey(k => k + 1)
  }

  const reset = () => setKey(k => k + 1)

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-56 shrink-0 bg-white border-r border-gray-100 sticky top-0 h-screen overflow-y-auto">
        <div className="px-4 py-4 border-b border-gray-100">
          <p className="font-bold text-gray-900 text-sm">Dev — タスク確認</p>
          <p className="text-xs text-gray-400 mt-0.5">{doneTypes.size}/{DEV_FIXTURES.length} 確認済み</p>
        </div>

        <nav className="py-2">
          {CATEGORIES.map(cat => {
            const tasks = DEV_FIXTURES.filter(t => t.category === cat.key)
            if (!tasks.length) return null
            return (
              <div key={cat.key} className="mb-3">
                <p className={`text-xs font-semibold mx-3 mb-1 px-2 py-0.5 rounded border w-fit ${cat.color}`}>
                  {cat.label}
                </p>
                {tasks.map(task => (
                  <button
                    key={task.type}
                    onClick={() => selectTask(task)}
                    className={`w-full text-left px-4 py-2 text-sm transition-colors flex items-center justify-between group
                      ${selected.type === task.type
                        ? 'bg-indigo-50 text-indigo-700 font-medium'
                        : 'text-gray-600 hover:bg-gray-50'
                      }`}
                  >
                    <span className="truncate">{getTaskLabel(task.type)}</span>
                    {doneTypes.has(task.type)
                      ? <span className="text-emerald-500 text-xs shrink-0">✓</span>
                      : <ChevronRight className="w-3 h-3 text-gray-300 group-hover:text-gray-500 shrink-0" />
                    }
                  </button>
                ))}
              </div>
            )
          })}
        </nav>
      </aside>

      {/* Main */}
      <div className="flex-1 min-w-0">
        {/* Header */}
        <header className="bg-white border-b border-gray-100 sticky top-0 z-10 px-6 py-3 flex items-center gap-3">
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${getCategoryColor(selected.category)}`}>
            {getCategoryLabel(selected.category)}
          </span>
          <span className="font-medium text-gray-800">{getTaskLabel(selected.type)}</span>
          <code className="ml-auto text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded">{selected.type}</code>
          <button
            onClick={reset}
            className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-indigo-600 border border-gray-200 rounded-lg px-2.5 py-1 transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            リセット
          </button>
        </header>

        <main className="max-w-2xl mx-auto px-4 py-8 space-y-4">
          {/* Task UI */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <TaskRunner
              key={key}
              task={selected}
              onComplete={handleComplete}
            />
          </div>

          {/* Raw JSON */}
          <details className="bg-white rounded-xl border border-gray-100">
            <summary className="px-4 py-3 text-sm text-gray-500 cursor-pointer font-medium select-none">
              Raw content (JSON)
            </summary>
            <pre className="px-4 pb-4 text-xs text-gray-600 overflow-auto leading-relaxed">
              {JSON.stringify(selected.content, null, 2)}
            </pre>
          </details>

          {/* Nav buttons */}
          <div className="flex gap-3">
            {(() => {
              const idx = DEV_FIXTURES.findIndex(t => t.type === selected.type)
              const prev = DEV_FIXTURES[idx - 1]
              const next = DEV_FIXTURES[idx + 1]
              return (
                <>
                  {prev && (
                    <button onClick={() => selectTask(prev)}
                      className="flex-1 py-2.5 text-sm text-gray-600 bg-white border border-gray-200 rounded-xl hover:border-indigo-300 transition-colors">
                      ← {getTaskLabel(prev.type)}
                    </button>
                  )}
                  {next && (
                    <button onClick={() => selectTask(next)}
                      className="flex-1 py-2.5 text-sm text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-xl hover:bg-indigo-100 transition-colors">
                      {getTaskLabel(next.type)} →
                    </button>
                  )}
                </>
              )
            })()}
          </div>
        </main>
      </div>
    </div>
  )
}
