'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { LearnedExpression } from '@/types'
import { getTaskLabel } from '@/lib/tasks'
import { ArrowLeft, BookOpen, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'

export default function StockPage() {
  const [expressions, setExpressions] = useState<LearnedExpression[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadExpressions()
  }, [])

  async function loadExpressions() {
    const supabase = createClient()
    const { data } = await supabase
      .from('learned_expressions')
      .select('*')
      .order('created_at', { ascending: false })

    setExpressions(data || [])
    setLoading(false)
  }

  async function deleteExpression(id: string) {
    const supabase = createClient()
    await supabase.from('learned_expressions').delete().eq('id', id)
    setExpressions(prev => prev.filter(e => e.id !== id))
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <Link href="/dashboard" className="text-gray-500 hover:text-gray-700">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-indigo-600" />
            <span className="font-bold text-gray-900">表現ストック</span>
          </div>
          <span className="text-xs text-gray-400 ml-auto">{expressions.length}件</span>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6">
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : expressions.length === 0 ? (
          <div className="text-center py-16 space-y-3">
            <BookOpen className="w-12 h-12 text-gray-200 mx-auto" />
            <p className="text-gray-500 font-medium">まだストックがありません</p>
            <p className="text-sm text-gray-400">
              タスクを完了してフィードバックを受けると、<br />
              ここに表現が自動で保存されます。
            </p>
            <Link
              href="/dashboard"
              className="inline-block mt-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium"
            >
              タスクをやってみる
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {expressions.map(expr => (
              <div key={expr.id} className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    {expr.task_type && (
                      <span className="text-xs text-gray-400">{getTaskLabel(expr.task_type)}</span>
                    )}
                    <p className="text-xs text-gray-400">
                      {format(new Date(expr.created_at), 'yyyy/MM/dd')}
                    </p>
                  </div>
                  <button
                    onClick={() => deleteExpression(expr.id)}
                    className="text-gray-300 hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Original */}
                <div>
                  <p className="text-xs text-gray-400 mb-1">あなたの英語</p>
                  <p className="text-sm text-gray-700 bg-gray-50 rounded-lg p-3 leading-relaxed">
                    {expr.original_input}
                  </p>
                </div>

                {/* Corrected */}
                {expr.corrected_text && expr.corrected_text !== expr.original_input && (
                  <div>
                    <p className="text-xs text-indigo-500 mb-1">添削後</p>
                    <p className="text-sm text-indigo-800 bg-indigo-50 rounded-lg p-3 leading-relaxed">
                      {expr.corrected_text}
                    </p>
                  </div>
                )}

                {/* Error explanation */}
                {expr.error_explanation && (
                  <div className="rounded-lg bg-red-50 border border-red-100 p-3">
                    <p className="text-xs text-red-500 mb-1">解説</p>
                    <p className="text-sm text-red-800">{expr.error_explanation}</p>
                  </div>
                )}

                {/* Native expressions */}
                {expr.native_expressions && expr.native_expressions.length > 0 && (
                  <div>
                    <p className="text-xs text-emerald-600 mb-2">ネイティブ表現</p>
                    <ul className="space-y-1.5">
                      {expr.native_expressions.map((e, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          <span className="text-emerald-400 mt-0.5">→</span>
                          <span className="text-gray-700 italic">{e}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
