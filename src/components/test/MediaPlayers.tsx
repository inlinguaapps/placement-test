'use client'

import React, { useRef } from 'react'

interface MediaProps {
  questionId: string
  mediaPlaying: boolean
  setMediaPlaying: (playing: boolean) => void
  playedMediaIds: string[]
  setPlayedMediaIds: React.Dispatch<React.SetStateAction<string[]>>
}

export function AudioPlayerCard({
  questionId,
  audioUrl,
  mediaPlaying,
  setMediaPlaying,
  playedMediaIds,
  setPlayedMediaIds,
}: MediaProps & { audioUrl: string }) {
  const isPlayed = playedMediaIds.includes(questionId)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  return (
    <div className="bg-zinc-50 p-6 sm:p-8 rounded-2xl border mb-6 max-w-xl mx-auto w-full text-center space-y-4 shadow-sm">
      <audio
        ref={audioRef}
        key={audioUrl}
        src={audioUrl}
        onEnded={() => {
          setMediaPlaying(false)
          setPlayedMediaIds((prev) => [...prev, questionId])
        }}
      >
        <source src={audioUrl} type="audio/mpeg" />
      </audio>

      <div className="flex justify-center items-center py-2">
        <button
          type="button"
          disabled={mediaPlaying || isPlayed}
          className={`relative flex items-center justify-center w-20 h-20 rounded-full transition-all duration-300 shadow-md ${
            isPlayed
              ? 'bg-zinc-200 text-zinc-400 cursor-not-allowed shadow-none'
              : mediaPlaying
                ? 'bg-amber-500 text-white cursor-default scale-95'
                : 'bg-amber-500 hover:bg-amber-600 text-white hover:scale-105 active:scale-95'
          }`}
          onClick={() => {
            if (audioRef.current) {
              audioRef.current.play()
              setMediaPlaying(true)
            }
          }}
        >
          {mediaPlaying && (
            <span className="absolute inset-0 rounded-full bg-amber-400/40 animate-ping pointer-events-none" />
          )}

          {isPlayed ? (
            <svg className="w-8 h-8 fill-current" viewBox="0 0 24 24">
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
            </svg>
          ) : (
            <svg className="w-8 h-8 fill-current ml-1" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          )}
        </button>
      </div>
    </div>
  )
}

export function VideoPlayerCard({
  questionId,
  videoUrl,
  mediaPlaying,
  setMediaPlaying,
  playedMediaIds,
  setPlayedMediaIds,
}: MediaProps & { videoUrl: string }) {
  const isPlayed = playedMediaIds.includes(questionId)
  const videoRef = useRef<HTMLVideoElement | null>(null)

  return (
    <div className="bg-zinc-50 p-3 sm:p-4 rounded-2xl border mb-6 max-w-xl mx-auto w-full text-center space-y-4 shadow-sm">
      <div className="relative rounded-xl overflow-hidden bg-black aspect-video max-h-[350px]">
        <video
          ref={videoRef}
          key={videoUrl}
          src={videoUrl}
          className="w-full h-full max-h-[350px] object-contain"
          onEnded={() => {
            setMediaPlaying(false)
            setPlayedMediaIds((prev) => [...prev, questionId])
          }}
        />
        {!mediaPlaying && !isPlayed && (
          <button
            type="button"
            className="absolute inset-0 m-auto w-16 h-16 rounded-full bg-amber-500 hover:bg-amber-600 text-white flex items-center justify-center shadow-lg transition-transform hover:scale-110 active:scale-95"
            onClick={() => {
              if (videoRef.current) {
                videoRef.current.play()
                setMediaPlaying(true)
              }
            }}
          >
            <svg className="w-8 h-8 fill-current ml-1" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </button>
        )}
      </div>
    </div>
  )
}