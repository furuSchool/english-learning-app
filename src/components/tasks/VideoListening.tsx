'use client'

import { VideoListeningContent } from '@/types'
import VoiceRecorder from '@/components/ui/VoiceRecorder'
import FeedbackPanel, { FeedbackLoading, FeedbackError } from '@/components/ui/FeedbackPanel'
import { useFeedback } from '@/lib/useFeedback'
import { useState } from 'react'
import { ExternalLink, PlayCircle } from 'lucide-react'

interface Props {
  taskId: string
  content: VideoListeningContent
  onComplete: (transcript: string) => void
}

export default function VideoListening({ content, onComplete }: Props) {
  const [watched, setWatched] = useState(false)
  const [answer, setAnswer] = useState('')
  const { feedback, loading, error, getFeedback } = useFeedback()

  const youtubeUrl = `https://www.youtube.com/watch?v=${content.youtube_id}`
  const thumbnailUrl = `https://img.youtube.com/vi/${content.youtube_id}/hqdefault.jpg`

  const handleSubmit = () => {
    getFeedback('video_listening', {
      video_title: content.title,
      question: content.question,
      user_answer: answer,
    })
  }

  return (
    <div className="space-y-5">
      <div className="text-xs text-gray-500 bg-gray-50 rounded-lg px-3 py-2">
        🎤 Speaking — 動画を見てから英語で答えてください
      </div>

      {/* Thumbnail + open in YouTube */}
      <div className="space-y-2">
        <div className="relative rounded-xl overflow-hidden aspect-video bg-gray-900 group">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={thumbnailUrl}
            alt={content.title}
            className="w-full h-full object-cover opacity-90"
          />
          <a
            href={youtubeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/40 group-hover:bg-black/55 transition-colors"
          >
            <PlayCircle className="w-16 h-16 text-white drop-shadow-lg" />
            <span className="text-white text-sm font-semibold drop-shadow">YouTubeで開く</span>
          </a>
        </div>

        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs text-gray-400">{content.channel}{content.speaker ? ` — ${content.speaker}` : ''}</p>
            <p className="text-base font-medium text-gray-800 leading-snug">{content.title}</p>
          </div>
          <a
            href={youtubeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 flex items-center gap-1 text-xs text-indigo-500 hover:text-indigo-700 mt-1"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            YouTube
          </a>
        </div>
      </div>

      <p className="text-sm text-gray-500 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
        💡 サムネイルをクリックしてYouTubeで動画を視聴してください。視聴後、このページに戻って回答してください。
      </p>

      {!watched && (
        <button
          onClick={() => setWatched(true)}
          className="w-full py-3 bg-indigo-600 text-white rounded-xl font-medium text-base hover:bg-indigo-700 transition-colors"
        >
          視聴完了 → 質問に答える
        </button>
      )}

      {watched && !feedback && !loading && (
        <div className="space-y-3">
          <div className="bg-indigo-50 rounded-xl p-4">
            <p className="text-base text-gray-800 leading-relaxed">{content.question}</p>
          </div>
          <VoiceRecorder onTranscript={text => setAnswer(text)} />
          <button
            onClick={handleSubmit}
            disabled={!answer.trim()}
            className="w-full py-3 bg-emerald-600 text-white rounded-xl font-medium text-base hover:bg-emerald-700 disabled:opacity-40 transition-colors"
          >
            添削してもらう →
          </button>
        </div>
      )}

      {loading && <FeedbackLoading />}
      {error && <FeedbackError error={error} onSkip={() => onComplete(answer)} />}
      {feedback && (
        <FeedbackPanel
          feedback={feedback}
          taskType="video_listening"
          onContinue={() => onComplete(answer)}
        />
      )}
    </div>
  )
}
