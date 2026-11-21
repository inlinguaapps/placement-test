// src/components/test/AdultListeningTestController.tsx
'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { updateTestResult } from '@/app/actions'

const LISTENING_INTRO_AUDIO_SRC =
  'https://brjzaznqgpmbuubrshlj.supabase.co/storage/v1/object/public/test_media/audio/adult/intro.mp3'

const LISTENING_QUESTIONS_AUDIO_SRC =
  'https://brjzaznqgpmbuubrshlj.supabase.co/storage/v1/object/public/test_media/audio/adult/questions.mp3'

export interface ListeningTestQuestion {
  id: string
  level?: string | null
  question_text: string
  options: string[] | Record<string, string> | string
  correct_answer: string
  q_type: string
  sort_order?: number | null
  image_url?: string | null
  audio_url?: string | null
  video_url?: string | null
}

interface OptionItem {
  id: string
  key: string
  label: string
}

type Stage = 'listening_intro' | 'listening' | 'grammar_intro' | 'grammar' | 'completed'

interface Props {
  sessionId: string
  listeningQuestions: ListeningTestQuestion[]
  readingQuestions: ListeningTestQuestion[]
}

function normalizeOptions(raw: ListeningTestQuestion['options']): OptionItem[] {
  if (Array.isArray(raw)) {
    return raw.map((val, idx) => ({
      id: `opt-${idx}`,
      key: String(val),
      label: String(val),
    }))
  }

  if (typeof raw === 'string') {
    try {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed)) {
        return parsed.map((val, idx) => ({
          id: `opt-${idx}`,
          key: String(val),
          label: String(val),
        }))
      }
      if (parsed && typeof parsed === 'object') {
        return Object.entries(parsed).map(([k, v], idx) => ({
          id: `opt-${idx}-${k}`,
          key: String(k),
          label: String(v),
        }))
      }
    } catch {
      return raw
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
        .map((val, idx) => ({
          id: `opt-${idx}`,
          key: val,
          label: val,
        }))
    }
  }

  if (raw && typeof raw === 'object') {
    return Object.entries(raw).map(([k, v], idx) => ({
      id: `opt-${idx}-${k}`,
      key: String(k),
      label: String(v),
    }))
  }

  return []
}

function isAnswerCorrect(selected: OptionItem, correctAnswer: string): boolean {
  const target = String(correctAnswer ?? '').trim().toLowerCase()
  if (!target) return false
  return (
    selected.key.trim().toLowerCase() === target ||
    selected.label.trim().toLowerCase() === target
  )
}

export default function AdultListeningTestController({
  sessionId,
  listeningQuestions,
  readingQuestions,
}: Props) {
  const cappedListening = useMemo(
    () => listeningQuestions.slice(0, 100),
    [listeningQuestions]
  )
  const cappedGrammar = useMemo(
    () => readingQuestions.slice(0, 50),
    [readingQuestions]
  )

  const [stage, setStage] = useState<Stage>('listening_intro')
  const [questionIndex, setQuestionIndex] = useState(0)
  const [selectedOptionId, setSelectedOptionId] = useState<string>('')
  const [listeningCorrect, setListeningCorrect] = useState(0)
  const [grammarCorrect, setGrammarCorrect] = useState(0)
  const [history, setHistory] = useState<Array<{ level: string; correct: boolean }>>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  const introAudioRef = useRef<HTMLAudioElement | null>(null)
  const questionsAudioRef = useRef<HTMLAudioElement | null>(null)

  const playAudioFromStart = (audio: HTMLAudioElement | null) => {
    if (!audio) return
    audio.currentTime = 0
    const playPromise = audio.play()
    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(() => {
        // Ignore browser autoplay rejection if audio stream isn't ready yet
      })
    }
  }

  const stopAudio = (audio: HTMLAudioElement | null) => {
    if (!audio) return
    audio.pause()
    audio.currentTime = 0
  }

  const stopAllListeningAudio = () => {
    stopAudio(introAudioRef.current)
    stopAudio(questionsAudioRef.current)
  }

  // Play intro audio on listening_intro; stop intro audio once leaving listening_intro;
  // stop questions audio whenever leaving listening stage.
  useEffect(() => {
    if (stage === 'listening_intro') {
      stopAudio(questionsAudioRef.current)
      playAudioFromStart(introAudioRef.current)
    } else {
      stopAudio(introAudioRef.current)
    }

    if (stage !== 'listening') {
      stopAudio(questionsAudioRef.current)
    }
  }, [stage])

  useEffect(() => {
    return () => {
      stopAllListeningAudio()
    }
  }, [])

  const activeList =
    stage === 'listening'
      ? cappedListening
      : stage === 'grammar'
        ? cappedGrammar
        : []

  const currentQuestion = activeList[questionIndex]

  const listeningScore = Math.min(100, listeningCorrect)
  const grammarScore = Math.min(100, grammarCorrect * 2)

  // Hidden audio players with no student controls
  const audioPlayers = (
    <>
      <audio
        ref={introAudioRef}
        src={LISTENING_INTRO_AUDIO_SRC}
        preload="auto"
        className="hidden"
      />
      <audio
        ref={questionsAudioRef}
        src={LISTENING_QUESTIONS_AUDIO_SRC}
        preload="auto"
        className="hidden"
      />
    </>
  )

  // 1. Listening Test Instruction Screen
  if (stage === 'listening_intro') {
    return (
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 sm:p-8 space-y-6 shadow-sm text-center">
        {audioPlayers}

        <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
          Listening Test
        </h1>

        <div className="space-y-1 text-sm sm:text-base text-foreground">
          <p>
            Listen to the audio. Look at the example on the screen. You will hear the example{' '}
            <em className="italic">once</em> only.
          </p>
          <p>Decide which word you hear, &quot;soap&quot; or &quot;soup&quot;</p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4 pt-1">
          <div className="min-w-36 px-6 py-3 rounded-lg border-2 border-blue-600 bg-white dark:bg-zinc-900 text-foreground font-medium">
            soap
          </div>
          <div className="min-w-36 px-6 py-3 rounded-lg border-2 border-blue-600 bg-blue-500 text-white font-medium shadow-sm">
            soup
          </div>
        </div>

        <p className="text-sm sm:text-base font-medium text-foreground">
          The correct answer was &apos;soup&apos;, so &apos;soup&apos; should be selected.
        </p>

        <div className="pt-2 flex justify-center">
          <Button
            type="button"
            onClick={() => {
              stopAudio(introAudioRef.current)
              setQuestionIndex(0)
              setSelectedOptionId('')
              setSaveError(null)
              setStage('listening')
              playAudioFromStart(questionsAudioRef.current)
            }}
            className="min-w-52 h-11 bg-blue-600 hover:bg-blue-700 text-white font-semibold"
          >
            Start Test
          </Button>
        </div>
      </div>
    )
  }

  // 2. Grammar Test Instruction Screen
  if (stage === 'grammar_intro') {
    return (
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 sm:p-8 space-y-6 shadow-sm text-center">
        {audioPlayers}

        <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
          Grammar Test
        </h1>

        <p className="text-sm sm:text-base font-medium text-foreground">
          Look at the example below. The correct answer is selected.
        </p>

        <p className="text-lg sm:text-xl text-foreground">
          In warm climates people{' '}
          <span className="inline-block min-w-20 border-b-2 border-foreground align-baseline" />{' '}
          sitting outside in the sun.
        </p>

        <div className="flex flex-col items-center gap-3 max-w-xs mx-auto w-full">
          <div className="w-full py-2.5 px-4 rounded-lg border-2 border-blue-600 bg-white dark:bg-zinc-900 text-foreground font-medium">
            likes
          </div>
          <div className="w-full py-2.5 px-4 rounded-lg border-2 border-blue-600 bg-blue-500 text-white font-medium shadow-sm">
            like
          </div>
          <div className="w-full py-2.5 px-4 rounded-lg border-2 border-blue-600 bg-white dark:bg-zinc-900 text-foreground font-medium">
            are liking
          </div>
        </div>

        <div className="pt-2 flex justify-center">
          <Button
            type="button"
            onClick={() => {
              setQuestionIndex(0)
              setSelectedOptionId('')
              setSaveError(null)
              setStage('grammar')
            }}
            className="min-w-52 h-11 bg-blue-600 hover:bg-blue-700 text-white font-semibold"
          >
            Start Grammar Test
          </Button>
        </div>
      </div>
    )
  }

  // 3. Final Score Screen
  if (stage === 'completed') {
    return (
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 sm:p-8 space-y-6 text-center shadow-sm">
        {audioPlayers}

        <div className="space-y-1">
          <h1 className="text-2xl font-bold">Adult with Listening — Results</h1>
          <p className="text-sm text-muted-foreground">
            Test completed
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-md mx-auto">
          <div className="p-5 rounded-lg border bg-zinc-50 dark:bg-zinc-950">
            <p className="text-xs uppercase tracking-wide text-muted-foreground font-medium">
              Listening Score
            </p>
            <p className="text-3xl font-bold mt-1">
              {listeningScore}{' '}
              <span className="text-base font-normal text-muted-foreground">/ 100</span>
            </p>
            <p className="text-xs text-muted-foreground mt-1">1 pt per question</p>
          </div>

          <div className="p-5 rounded-lg border bg-zinc-50 dark:bg-zinc-950">
            <p className="text-xs uppercase tracking-wide text-muted-foreground font-medium">
              Grammar Score
            </p>
            <p className="text-3xl font-bold mt-1">
              {grammarScore}{' '}
              <span className="text-base font-normal text-muted-foreground">/ 100</span>
            </p>
            <p className="text-xs text-muted-foreground mt-1">2 pts per question</p>
          </div>
        </div>

        <Button asChild>
          <Link href="/" onClick={stopAllListeningAudio}>
            Finish &amp; Return Home
          </Link>
        </Button>
      </div>
    )
  }

  // 4. Question View (Listening or Grammar)
  if (!currentQuestion) {
    const isListening = stage === 'listening'
    return (
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 text-center space-y-4 shadow-sm">
        {audioPlayers}

        <h2 className="text-lg font-bold">
          No {isListening ? 'Listening' : 'Grammar'} Questions Found
        </h2>
        <p className="text-sm text-muted-foreground">
          No {isListening ? 'listening' : 'grammar'} questions are available for adult_listening.
        </p>
        <div className="flex justify-center gap-3">
          {isListening && cappedGrammar.length > 0 ? (
            <Button
              type="button"
              onClick={() => {
                stopAllListeningAudio()
                setQuestionIndex(0)
                setSelectedOptionId('')
                setStage('grammar_intro')
              }}
            >
              Continue to Grammar Test
            </Button>
          ) : (
            <Button
              type="button"
              onClick={() => {
                stopAllListeningAudio()
                setStage('completed')
              }}
            >
              View Results
            </Button>
          )}
        </div>
      </div>
    )
  }

  const options = normalizeOptions(currentQuestion.options)
  const isListeningSection = stage === 'listening'
  const isLastInListening = isListeningSection && questionIndex + 1 >= cappedListening.length
  const isLastInGrammar = !isListeningSection && questionIndex + 1 >= cappedGrammar.length
  const isFinalTestSubmission = isLastInGrammar || (isLastInListening && cappedGrammar.length === 0)

  const handleSelectOption = async (option: OptionItem) => {
    if (isSubmitting) return
    setSelectedOptionId(option.id)
    setIsSubmitting(true)
    setSaveError(null)

    const isCorrect = isAnswerCorrect(option, currentQuestion.correct_answer)

    const nextListeningCorrect =
      isListeningSection && isCorrect ? listeningCorrect + 1 : listeningCorrect
    const nextGrammarCorrect =
      !isListeningSection && isCorrect ? grammarCorrect + 1 : grammarCorrect

    const nextHistory = [
      ...history,
      {
        level: isListeningSection ? 'Listening' : 'Grammar',
        correct: isCorrect,
      },
    ]

    const finalListeningScore = Math.min(100, nextListeningCorrect)
    const finalGrammarScore = Math.min(100, nextGrammarCorrect * 2)
    const summaryResult = `Listening: ${finalListeningScore}/100 | Grammar: ${finalGrammarScore}/100`

    try {
      const res = await updateTestResult(
        sessionId,
        summaryResult,
        isFinalTestSubmission,
        nextHistory,
        []
      )

      if (!res?.success) {
        setSaveError('Could not save your answer. Please try again.')
        setSelectedOptionId('')
        setIsSubmitting(false)
        return
      }
    } catch {
      setSaveError('Network error while saving answer. Please try again.')
      setSelectedOptionId('')
      setIsSubmitting(false)
      return
    }

    setListeningCorrect(nextListeningCorrect)
    setGrammarCorrect(nextGrammarCorrect)
    setHistory(nextHistory)
    setSelectedOptionId('')
    setIsSubmitting(false)

    if (isListeningSection) {
      if (isLastInListening) {
        stopAllListeningAudio()
        setQuestionIndex(0)
        setStage(cappedGrammar.length > 0 ? 'grammar_intro' : 'completed')
      } else {
        setQuestionIndex((prev) => prev + 1)
      }
    } else {
      if (isLastInGrammar) {
        setStage('completed')
      } else {
        setQuestionIndex((prev) => prev + 1)
      }
    }
  }

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 sm:p-7 space-y-6 shadow-sm">
      {audioPlayers}

      <div className="flex items-center justify-between text-xs sm:text-sm text-muted-foreground border-b pb-3">
        <span className="font-semibold text-foreground">
          {isListeningSection ? 'Listening Section' : 'Grammar Section'}
        </span>
        <span>
          Question {questionIndex + 1} of {activeList.length}
        </span>
      </div>

      {saveError && (
        <p className="text-sm text-red-500 font-medium">{saveError}</p>
      )}

      {currentQuestion.image_url && (
        <img
          src={currentQuestion.image_url}
          alt="Question visual"
          className="max-h-64 rounded-lg object-contain mx-auto"
        />
      )}

      <p className="text-base sm:text-lg font-medium text-foreground">
        {currentQuestion.question_text}
      </p>

      <div className="space-y-2.5">
        {options.map((opt) => {
          const active = selectedOptionId === opt.id
          return (
            <button
              key={opt.id}
              type="button"
              disabled={isSubmitting}
              onClick={() => handleSelectOption(opt)}
              className={`w-full text-left px-4 py-3 rounded-lg border text-sm sm:text-base transition-colors disabled:opacity-70 ${
                active
                  ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/40 font-medium'
                  : 'border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/50'
              }`}
            >
              {opt.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}