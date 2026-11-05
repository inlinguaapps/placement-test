// src/components/test/QuestionRenderer.tsx

'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { AudioPlayerCard, VideoPlayerCard } from './MediaPlayers'

interface Question {
  id: string
  test_type: string
  level: string
  question_text: string
  options: Record<string, string>
  correct_answer: string
  q_type:
    | 'text_only'
    | 'image_context'
    | 'image_listen_choose'
    | 'listen_choose'
    | 'dialogue'
    | 'audio'
    | 'video'
    | 'reading'
  sort_order: number
  image_url?: string
  audio_url?: string
  video_url?: string
  transcript?: string
}

interface QuestionRendererProps {
  currentQuestion: Question
  mediaPlaying: boolean
  setMediaPlaying: (playing: boolean) => void
  playedMediaIds: string[]
  setPlayedMediaIds: React.Dispatch<React.SetStateAction<string[]>>
  handleAnswer: (isCorrect: boolean) => void
}

export function QuestionRenderer({
  currentQuestion,
  mediaPlaying,
  setMediaPlaying,
  playedMediaIds,
  setPlayedMediaIds,
  handleAnswer,
}: QuestionRendererProps) {
  const isListenChoose = currentQuestion.q_type === 'listen_choose'

  return (
    <div
      className={`flex flex-col ${
        isListenChoose ? 'justify-start' : 'justify-between'
      } w-full max-w-5xl mx-auto px-4 space-y-6 md:space-y-8 animate-in fade-in duration-500 pb-6 md:pb-10`}
    >
      {/* Top Section: Question & Media Context */}
      <div className="flex flex-col items-center space-y-4 md:space-y-6 w-full">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-semibold text-center leading-snug md:leading-normal">
          {currentQuestion.question_text}
        </h2>

        {/* Dialogue Type with Image & Transcript */}
        {currentQuestion.q_type === 'dialogue' && currentQuestion.image_url && (
          <div className="flex flex-col items-center w-full max-w-xl md:max-w-2xl">
            {currentQuestion.transcript && (
              <div className="self-start ml-2 mb-3 relative bg-white border border-zinc-200 rounded-2xl px-5 py-3 shadow-sm text-sm sm:text-base md:text-lg">
                <p className="text-zinc-700">{currentQuestion.transcript}</p>
                <div className="absolute -bottom-2 left-6 w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[8px] border-t-zinc-200" />
                <div className="absolute -bottom-[7px] left-6 w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[8px] border-t-white" />
              </div>
            )}

            <div className="rounded-xl overflow-hidden border bg-white max-h-[340px] md:max-h-[420px] w-full flex items-center justify-center">
              <img
                key={`img-${currentQuestion.id}`}
                src={currentQuestion.image_url}
                alt="Dialogue Context"
                className="w-full h-full object-contain max-h-[340px] md:max-h-[420px] mx-auto"
              />
            </div>
          </div>
        )}

        {/* Standard Image Context */}
        {currentQuestion.q_type === 'image_context' && currentQuestion.image_url && (
          <div className="rounded-xl overflow-hidden border bg-white max-h-[360px] md:max-h-[460px] max-w-xl md:max-w-2xl mx-auto w-full flex items-center justify-center">
            <img
              key={`img-${currentQuestion.id}`}
              src={currentQuestion.image_url}
              alt="Context"
              className="w-full h-full object-contain max-h-[360px] md:max-h-[460px] mx-auto"
            />
          </div>
        )}

        {/* Image Listen Choose Type */}
        {currentQuestion.q_type === 'image_listen_choose' && (
          <div className="space-y-6 w-full">
            {currentQuestion.image_url && (
              <div className="rounded-xl overflow-hidden border bg-white max-w-xl md:max-w-2xl mx-auto shadow-sm max-h-[280px] md:max-h-[360px] flex items-center justify-center">
                <img
                  src={currentQuestion.image_url}
                  alt="Context"
                  className="w-full h-full object-contain max-h-[280px] md:max-h-[360px] mx-auto"
                />
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
              {['a', 'b', 'c'].map((letter) => {
                const audioUrl = currentQuestion.options?.[letter]
                if (!audioUrl) return null

                return (
                  <div
                    key={`${currentQuestion.id}-${letter}`}
                    className="flex flex-col items-center gap-3 md:gap-4 p-4 md:p-5 border border-zinc-200 rounded-2xl bg-zinc-50/50 shadow-sm"
                  >
                    <div className="flex items-center justify-center w-full">
                      <audio
                        id={`opt-audio-${currentQuestion.id}-${letter}`}
                        src={audioUrl}
                        onPlay={() => setMediaPlaying(true)}
                        onEnded={() => setMediaPlaying(false)}
                        onPause={() => setMediaPlaying(false)}
                      />
                      <button
                        type="button"
                        disabled={mediaPlaying}
                        className="flex items-center justify-center w-12 h-12 md:w-16 md:h-16 rounded-full bg-amber-500 hover:bg-amber-600 transition-all shadow-md active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
                        onClick={() => {
                          if (mediaPlaying) return
                          const el = document.getElementById(
                            `opt-audio-${currentQuestion.id}-${letter}`,
                          ) as HTMLAudioElement
                          el?.play()
                        }}
                      >
                        <svg
                          className="w-6 h-6 md:w-8 md:h-8 text-white fill-current ml-1"
                          viewBox="0 0 24 24"
                        >
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </button>
                    </div>

                    <button
                      type="button"
                      className="w-full h-16 md:h-20 rounded-xl border border-zinc-200 bg-white hover:bg-emerald-600 hover:border-emerald-600 text-emerald-600 hover:text-white transition-all shadow-sm group active:scale-95 flex items-center justify-center p-0 overflow-hidden"
                      onClick={() =>
                        handleAnswer(letter === currentQuestion.correct_answer)
                      }
                    >
                      <svg
                        className="w-10 h-10 md:w-12 md:h-12 shrink-0 transition-transform group-hover:scale-110"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={3.5}
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </button>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Audio Players */}
        {(currentQuestion.q_type === 'audio' ||
          currentQuestion.q_type === 'listen_choose') &&
          currentQuestion.audio_url && (
            <div className="w-full max-w-md md:max-w-lg">
              <AudioPlayerCard
                questionId={currentQuestion.id}
                audioUrl={currentQuestion.audio_url}
                mediaPlaying={mediaPlaying}
                setMediaPlaying={setMediaPlaying}
                playedMediaIds={playedMediaIds}
                setPlayedMediaIds={setPlayedMediaIds}
              />
            </div>
          )}

        {/* Video Player */}
        {currentQuestion.q_type === 'video' && currentQuestion.video_url && (
          <div className="w-full max-w-md md:max-w-xl">
            <VideoPlayerCard
              questionId={currentQuestion.id}
              videoUrl={currentQuestion.video_url}
              mediaPlaying={mediaPlaying}
              setMediaPlaying={setMediaPlaying}
              playedMediaIds={playedMediaIds}
              setPlayedMediaIds={setPlayedMediaIds}
            />
          </div>
        )}
      </div>

      {/* Bottom Section: Options */}
      <div className="w-full">
        {currentQuestion.q_type === 'listen_choose' ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 md:gap-8">
            {['a', 'b', 'c'].map((letter) => (
              <button
                key={`${currentQuestion.id}-${letter}`}
                onClick={() =>
                  handleAnswer(letter === currentQuestion.correct_answer)
                }
                className="group relative aspect-square overflow-hidden rounded-2xl border-2 border-zinc-200 bg-white p-4 md:p-6 transition-all hover:border-zinc-900 hover:shadow-lg active:scale-95 shadow-sm"
              >
                <img
                  src={currentQuestion.options[letter]}
                  alt={`Option ${letter}`}
                  className="h-full w-full object-contain"
                />
                <div className="absolute bottom-3 right-3 md:bottom-4 md:right-4 flex h-8 w-8 md:h-10 md:w-10 items-center justify-center rounded-full bg-zinc-100 text-xs md:text-base font-bold uppercase text-zinc-500 group-hover:bg-zinc-900 group-hover:text-white transition-colors shadow-sm">
                  {letter}
                </div>
              </button>
            ))}
          </div>
        ) : currentQuestion.q_type === 'image_listen_choose' ? null : (
          <div
            className={
              currentQuestion.q_type === 'dialogue'
                ? 'flex flex-wrap gap-3 md:gap-4 justify-center bg-blue-50/20 p-6 md:p-8 rounded-2xl border border-blue-100/50'
                : 'grid gap-3 md:gap-4'
            }
          >
            {['a', 'b', 'c', 'd'].map((letter) => {
              const optionText = currentQuestion.options?.[letter]
              if (!optionText) return null

              if (currentQuestion.q_type === 'dialogue') {
                return (
                  <Button
                    key={`${currentQuestion.id}-${letter}`}
                    variant="outline"
                    className="h-auto py-3.5 md:py-4 px-6 md:px-8 rounded-full border-2 border-blue-200 text-blue-700 bg-white shadow-sm hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all text-base md:text-xl font-medium"
                    onClick={() =>
                      handleAnswer(letter === currentQuestion.correct_answer)
                    }
                  >
                    {optionText}
                  </Button>
                )
              }

              return (
                <Button
                  key={`${currentQuestion.id}-${letter}`}
                  variant="outline"
                  className="h-auto min-h-[4rem] md:min-h-[5rem] justify-start px-6 md:px-8 text-left text-lg md:text-xl py-4 hover:bg-zinc-50 hover:border-zinc-400 transition-all group"
                  onClick={() =>
                    handleAnswer(letter === currentQuestion.correct_answer)
                  }
                >
                  <span className="mr-4 shrink-0 flex items-center justify-center w-8 h-8 md:w-10 md:h-10 rounded-full border border-zinc-200 bg-zinc-50 group-hover:bg-zinc-900 group-hover:text-white text-sm md:text-base font-bold uppercase transition-colors">
                    {letter}
                  </span>
                  <span className="flex-1">{optionText}</span>
                </Button>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}