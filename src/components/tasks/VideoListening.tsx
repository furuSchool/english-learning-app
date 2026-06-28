'use client'

import { VideoListeningContent } from '@/types'
import VoiceRecorder from '@/components/ui/VoiceRecorder'
import { useState } from 'react'

interface Props {
  taskId: string
  content: VideoListeningContent
  onComplete: (transcript: string) => void
}

export default function VideoListening({ content, onComplete }: Props) {
  const [watched, setWatched] = useState(false)
  const [answer, setAnswer] = useState('')

  return (
    <div className="space-y-5">
      <div className="text-xs text-gray-500 bg-gray-50 rounded-lg px-3 py-2">
        🎤 Speaking — 動画を見てから英語で答えてください
      </div>

      <div className="rounded-xl overflow-hidden aspect-video bg-black">
        <iframe
          src={`https://www.youtube.com/embed/${content.youtube_id}?cc_load_policy=0`}
          className="w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          title={content.title}
        />
      </div>

      <div>
        <p className="text-xs text-gray-400">{content.channel}</p>
        <p className="text-sm font-medium text-gray-800">{content.title}</p>
      </div>

      {!watched ? (
        <button
          onClick={() => setWatched(true)}
          className="w-full py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors"
        >
          視聴完了 → 答える
        </button>
      ) : (
        <div className="space-y-3">
          <div className="bg-indigo-50 rounded-xl p-4">
            <p className="text-sm text-gray-800 leading-relaxed">{content.question}</p>
          </div>
          <VoiceRecorder onTranscript={text => setAnswer(text)} />
          {answer && (
            <button
              onClick={() => onComplete(answer)}
              className="w-full py-3 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 transition-colors"
            >
              完了 →
            </button>
          )}
        </div>
      )}
    </div>
  )
}
