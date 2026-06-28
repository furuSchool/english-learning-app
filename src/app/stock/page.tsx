'use client'

import { useState, useEffect } from 'react'
import { LearnedExpression } from '@/types'
import { createClient } from '@/lib/supabase/client'
import { ChevronLeft, Trash2 } from 'lucide-react'
import Link from 'next/link'

export default function StockPage() {
  const [phrases, setPhrases] = useState<LearnedExpression[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()
    supabase
      .from('learned_expressions')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setPhrases(data ?? [])
        setLoading(false)
      })
  }, [])

  const deletePhrase = async (id: string) => {
    const supabase = createClient()
    await supabase.from('learned_expressions').delete().eq('id', id)
    setPhrases(prev => prev.filter(p => p.id !== id))
  }

  const grouped = phrases.reduce<Record<string, LearnedExpression[]>>((acc, p) => {
    const key = p.task_type ?? 'other'
    return { ...acc, [key]: [...(acc[key] ?? []), p] }
  }, {})

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <Link href="/dashboard" className="text-gray-400 hover:text-gray-600">
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <h1 className="font-bold text-gray-900">Saved Phrases</h1>
          <span className="ml-auto text-xs text-gray-400">{phrases.length}件</span>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-6 h-6 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : phrases.length === 0 ? (
          <div className="text-center py-20 space-y-2">
            <p className="text-gray-400 text-sm">保存したフレーズはまだありません</p>
            <p className="text-gray-300 text-xs">タスク中にブックマークアイコンを押すと保存されます</p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(grouped).map(([type, items]) => (
              <div key={type}>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2 px-1">
                  {type.replace(/_/g, ' ')}
                </p>
                <div className="flex flex-wrap gap-2">
                  {items.map(p => (
                    <PhraseCard key={p.id} phrase={p} onDelete={() => deletePhrase(p.id)} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

function PhraseCard({ phrase, onDelete }: { phrase: LearnedExpression; onDelete: () => void }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div
      onClick={() => setExpanded(e => !e)}
      className="cursor-pointer bg-white border border-gray-100 rounded-xl px-3 py-2 hover:border-indigo-200 transition-all group relative"
    >
      <p className="text-sm font-medium text-gray-800 pr-5">{phrase.phrase}</p>
      {expanded && phrase.meaning_ja && (
        <p className="text-xs text-gray-500 mt-1">{phrase.meaning_ja}</p>
      )}
      <button
        onClick={e => { e.stopPropagation(); onDelete() }}
        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-400 transition-all"
      >
        <Trash2 className="w-3 h-3" />
      </button>
    </div>
  )
}
