'use client'

import { useState } from 'react'
import { Task } from '@/types'
import { getTaskLabel, getCategoryLabel, getCategoryColor } from '@/lib/tasks'
import { RefreshCw } from 'lucide-react'

interface TaskShellProps {
  task: Task
  onSwap: () => void
  canSwap: boolean
  children: React.ReactNode
  isCompleted?: boolean
}

export default function TaskShell({ task, onSwap, canSwap, children, isCompleted }: TaskShellProps) {
  return (
    <div className={`rounded-2xl border-2 transition-all ${
      isCompleted ? 'border-emerald-300 bg-emerald-50' : 'border-gray-200 bg-white'
    } overflow-hidden`}>
      <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${getCategoryColor(task.category)}`}>
            {getCategoryLabel(task.category)}
          </span>
          <span className="text-sm font-medium text-gray-700">{getTaskLabel(task.type)}</span>
        </div>
        {!isCompleted && canSwap && (
          <button
            onClick={onSwap}
            className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-indigo-600 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            変更
          </button>
        )}
        {isCompleted && (
          <span className="text-xs font-semibold text-emerald-600">✓ 完了</span>
        )}
      </div>
      <div className="p-5">{children}</div>
    </div>
  )
}
