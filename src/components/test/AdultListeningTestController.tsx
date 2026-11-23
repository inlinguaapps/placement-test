// src/components/test/AdultListeningTestController.tsx
'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { updateTestResult } from '@/app/actions'

const LISTENING_INTRO_AUDIO_SRC =
  'https://brjzaznqgpmbuubrshlj.supabase.co/storage/v1/object/public/test_media/audio/adult/intro.mp3'

const LISTENING_AUDIO_BASE_URL =
  'https://brjzaznqgpmbuubrshlj.supabase.co/storage/v1/object/public/test_media/audio/adult'

const QUESTIONS_PER_PAGE = 10

function getListeningPageAudioSrc(pageIndex: number): string {
  const start = pageIndex * QUESTIONS_PER_PAGE + 1
  const end = start + QUESTIONS_PER_PAGE - 1
  return `${LISTENING_AUDIO_BASE_URL}/${start}-${end}.mp3`
}

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
  const [pageIndex, setPageIndex] = useState(0)
  // Maps question.id -> selected OptionItem.id
  const [selections, setSelections] = useState<Record<string, string>>({})
  const [listeningCorrect, setListeningCorrect] = useState(0)
  const [grammarCorrect, setGrammarCorrect] = useState(0)
  const [history, setHistory] = useState<Array<{ level: string; correct: boolean }>>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [pageWarning, setPageWarning] = useState<string | null>(null)
  const [showUnansweredHighlight, setShowUnansweredHighlight] = useState(false)

  const introAudioRef = useRef<HTMLAudioElement | null>(null)
  const pageAudioRef = useRef<HTMLAudioElement | null>(null)

  const playAudioFromStart = useCallback((audio: HTMLAudioElement | null, src?: string) => {
    if (!audio) return
    try {
      if (src && audio.getAttribute('src') !== src) {
        audio.setAttribute('src', src)
        audio.load()
      }
      audio.currentTime = 0
      const playPromise = audio.play()
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(() => {
          // Safe guard when audio file is missing/untrimmed or autoplay is blocked
        })
      }
    } catch {
      // Safe guard against media element state errors
    }
  }, [])

  const stopAudio = useCallback((audio: HTMLAudioElement | null) => {
    if (!audio) return
    try {
      audio.pause()
      if (audio.readyState > 0) {
        audio.currentTime = 0
      }
    } catch {
      // Safe guard if source hasn't loaded metadata yet
    }
  }, [])

  const stopAllListeningAudio = useCallback(() => {
    stopAudio(introAudioRef.current)
    stopAudio(pageAudioRef.current)
  }, [stopAudio])

  const currentPageAudioSrc = getListeningPageAudioSrc(pageIndex)

  useEffect(() => {
    if (stage === 'listening_intro') {
      stopAudio(pageAudioRef.current)
      playAudioFromStart(introAudioRef.current, LISTENING_INTRO_AUDIO_SRC)
      return
    }

    stopAudio(introAudioRef.current)

    if (stage === 'listening') {
      playAudioFromStart(pageAudioRef.current, currentPageAudioSrc)
    } else {
      stopAudio(pageAudioRef.current)
    }
  }, [stage, pageIndex, currentPageAudioSrc, playAudioFromStart, stopAudio])

  useEffect(() => {
    return () => {
      stopAllListeningAudio()
    }
  }, [stopAllListeningAudio])

  const activeList =
    stage === 'listening'
      ? cappedListening
      : stage === 'grammar'
        ? cappedGrammar
        : []

  const totalPages = Math.max(1, Math.ceil(activeList.length / QUESTIONS_PER_PAGE))
  const startIdx = pageIndex * QUESTIONS_PER_PAGE
  const pageQuestions = useMemo(
    () => activeList.slice(startIdx, startIdx + QUESTIONS_PER_PAGE),
    [activeList, startIdx]
  )

  const listeningCompletedCount = useMemo(
    () => cappedListening.filter((q) => Boolean(selections[q.id])).length,
    [cappedListening, selections]
  )

  const answeredOnPageCount = pageQuestions.filter((q) => Boolean(selections[q.id])).length
  const remainingOnPageCount = Math.max(0, pageQuestions.length - answeredOnPageCount)
  const isPageComplete =
    pageQuestions.length > 0 && answeredOnPageCount === pageQuestions.length
  const isLastPageInSection = pageIndex + 1 >= totalPages

  const isListeningSection = stage === 'listening'
  const isFinalTestSubmission =
    (!isListeningSection && isLastPageInSection) ||
    (isListeningSection && isLastPageInSection && cappedGrammar.length === 0)

  const listeningScore = Math.min(100, listeningCorrect)
  const grammarScore = Math.min(100, grammarCorrect * 2)

  const audioPlayers = (
    <>
      <audio
        ref={introAudioRef}
        src={LISTENING_INTRO_AUDIO_SRC}
        preload="none"
        onError={() => {
          // Ignore missing/untrimmed audio source while testing UI
        }}
        className="hidden"
      />
      <audio
        ref={pageAudioRef}
        src={currentPageAudioSrc}
        preload="none"
        onError={() => {
          // Ignore missing/untrimmed audio source while testing UI
        }}
        className="hidden"
      />
    </>
  )

  const handleSelectOption = (questionId: string, optionId: string) => {
    if (isSubmitting) return
    setSelections((prev) => ({
      ...prev,
      [questionId]: optionId,
    }))
    if (saveError) setSaveError(null)
    if (pageWarning) setPageWarning(null)
    if (showUnansweredHighlight) setShowUnansweredHighlight(false)
  }

  const handleAdvancePage = async () => {
    if (isSubmitting || pageQuestions.length === 0) return

    if (!isPageComplete) {
      setShowUnansweredHighlight(true)
      setPageWarning(
        `Answer all ${pageQuestions.length} (${remainingOnPageCount} left)`
      )
      return
    }

    setShowUnansweredHighlight(false)
    setPageWarning(null)
    stopAudio(pageAudioRef.current)
    setSaveError(null)

    let pageCorrectCount = 0
    const pageHistoryEntries: Array<{ level: string; correct: boolean }> = []

    for (const q of pageQuestions) {
      const opts = normalizeOptions(q.options)
      const chosen = opts.find((o) => o.id === selections[q.id])
      const correct = chosen ? isAnswerCorrect(chosen, q.correct_answer) : false
      if (correct) pageCorrectCount += 1
      pageHistoryEntries.push({
        level: isListeningSection ? 'Listening' : 'Grammar',
        correct,
      })
    }

    const nextListeningCorrect = isListeningSection
      ? listeningCorrect + pageCorrectCount
      : listeningCorrect
    const nextGrammarCorrect = !isListeningSection
      ? grammarCorrect + pageCorrectCount
      : grammarCorrect

    const nextHistory = [...history, ...pageHistoryEntries]

    const finalListeningScore = Math.min(100, nextListeningCorrect)
    const finalGrammarScore = Math.min(100, nextGrammarCorrect * 2)
    const summaryResult = `Listening: ${finalListeningScore}/100 | Grammar: ${finalGrammarScore}/100`

    // Final submission: await save so results are guaranteed persisted before completion screen
    if (isFinalTestSubmission) {
      setIsSubmitting(true)
      try {
        const res = await updateTestResult(
          sessionId,
          summaryResult,
          true,
          nextHistory,
          []
        )

        if (!res?.success) {
          setSaveError('Could not save your final answers. Please try again.')
          setIsSubmitting(false)
          return
        }
      } catch {
        setSaveError('Network error while saving answers. Please try again.')
        setIsSubmitting(false)
        return
      }

      setListeningCorrect(nextListeningCorrect)
      setGrammarCorrect(nextGrammarCorrect)
      setHistory(nextHistory)
      setIsSubmitting(false)
      stopAllListeningAudio()
      setStage('completed')
      return
    }

    // Intermediate pages: advance immediately and persist progress in background
    setListeningCorrect(nextListeningCorrect)
    setGrammarCorrect(nextGrammarCorrect)
    setHistory(nextHistory)

    if (isListeningSection) {
      if (isLastPageInSection) {
        stopAllListeningAudio()
        setPageIndex(0)
        setStage('grammar_intro')
      } else {
        setPageIndex((prev) => prev + 1)
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }
    } else {
      setPageIndex((prev) => prev + 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    updateTestResult(sessionId, summaryResult, false, nextHistory, []).catch(() => {
      // Background checkpoint failed; final submission sends full cumulative nextHistory
    })
  }

  // 1. Listening Test Instruction Screen
  if (stage === 'listening_intro') {
    return (
      <div className="bg-white dark:bg-zinc-900 border border-blue-200 dark:border-zinc-800 rounded-2xl p-6 sm:p-8 space-y-6 shadow-sm text-center">
        {audioPlayers}

        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-foreground">
          Listening Test
        </h1>

        <div className="space-y-1 text-base sm:text-lg text-slate-700 dark:text-foreground">
          <p>
            Listen to the audio. Look at the example below. You will hear the example{' '}
            <em className="italic">once</em> only.
          </p>
          <p>Decide which word you hear, &quot;soap&quot; or &quot;soup&quot;</p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4 pt-1">
          <div className="min-w-36 px-6 py-3 rounded-xl border border-blue-300 bg-sky-100/80 dark:bg-zinc-900 text-slate-800 dark:text-foreground text-base sm:text-lg font-medium">
            soap
          </div>
          <div className="min-w-36 px-6 py-3 rounded-xl border-2 border-blue-600 bg-blue-500 text-white text-base sm:text-lg font-semibold shadow-xs">
            soup
          </div>
        </div>

        <p className="text-base sm:text-lg font-medium text-slate-800 dark:text-foreground">
          The correct answer was &apos;soup&apos;, so &apos;soup&apos; is selected.
        </p>

        <div className="pt-2 flex justify-center">
          <Button
            type="button"
            onClick={() => {
              stopAudio(introAudioRef.current)
              setPageIndex(0)
              setSelections({})
              setSaveError(null)
              setPageWarning(null)
              setShowUnansweredHighlight(false)
              setStage('listening')
              playAudioFromStart(pageAudioRef.current, getListeningPageAudioSrc(0))
            }}
            className="min-w-52 h-11 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-base font-semibold shadow-xs"
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
      <div className="bg-white dark:bg-zinc-900 border border-blue-200 dark:border-zinc-800 rounded-2xl p-6 sm:p-8 space-y-6 shadow-sm text-center">
        {audioPlayers}

        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-foreground">
          Grammar Test
        </h1>

        <p className="text-base sm:text-lg font-medium text-slate-700 dark:text-foreground">
          Look at the example below. The correct answer is selected.
        </p>

        <p className="text-lg sm:text-xl text-slate-900 dark:text-foreground">
          In warm climates people{' '}
          <span className="inline-block min-w-20 border-b-2 border-slate-900 dark:border-foreground align-baseline" />{' '}
          sitting outside in the sun.
        </p>

        <div className="flex flex-col items-center gap-3 max-w-xs mx-auto w-full text-base sm:text-lg">
          <div className="w-full py-2.5 px-4 rounded-xl border border-blue-300 bg-sky-100/80 dark:bg-zinc-900 text-slate-800 dark:text-foreground font-medium">
            likes
          </div>
          <div className="w-full py-2.5 px-4 rounded-xl border-2 border-blue-600 bg-blue-500 text-white font-semibold shadow-xs">
            like
          </div>
          <div className="w-full py-2.5 px-4 rounded-xl border border-blue-300 bg-sky-100/80 dark:bg-zinc-900 text-slate-800 dark:text-foreground font-medium">
            are liking
          </div>
        </div>

        <div className="pt-2 flex justify-center">
          <Button
            type="button"
            onClick={() => {
              setPageIndex(0)
              setSelections({})
              setSaveError(null)
              setPageWarning(null)
              setShowUnansweredHighlight(false)
              setStage('grammar')
            }}
            className="min-w-52 h-11 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-base font-semibold shadow-xs"
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
      <div className="bg-white dark:bg-zinc-900 border border-blue-200 dark:border-zinc-800 rounded-2xl p-6 sm:p-8 space-y-6 text-center shadow-sm">
        {audioPlayers}

        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-foreground">
            Adult with Listening — Results
          </h1>
          <p className="text-base text-muted-foreground">
            Test completed
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-md mx-auto">
          <div className="p-5 rounded-xl border border-blue-200 bg-sky-100/75 dark:bg-zinc-950">
            <p className="text-xs uppercase tracking-wide text-muted-foreground font-medium">
              Listening Score
            </p>
            <p className="text-3xl font-bold mt-1 text-slate-900 dark:text-foreground">
              {listeningScore}{' '}
              <span className="text-base font-normal text-muted-foreground">/ 100</span>
            </p>
            <p className="text-xs text-muted-foreground mt-1">1 pt per question</p>
          </div>

          <div className="p-5 rounded-xl border border-blue-200 bg-sky-100/75 dark:bg-zinc-950">
            <p className="text-xs uppercase tracking-wide text-muted-foreground font-medium">
              Grammar Score
            </p>
            <p className="text-3xl font-bold mt-1 text-slate-900 dark:text-foreground">
              {grammarScore}{' '}
              <span className="text-base font-normal text-muted-foreground">/ 100</span>
            </p>
            <p className="text-xs text-muted-foreground mt-1">2 pts per question</p>
          </div>
        </div>

        <Button
          asChild
          className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-base font-semibold shadow-xs"
        >
          <Link href="/" onClick={stopAllListeningAudio}>
            Finish &amp; Return Home
          </Link>
        </Button>
      </div>
    )
  }

  // 4. Empty Section Fallback
  if (pageQuestions.length === 0) {
    return (
      <div className="bg-white dark:bg-zinc-900 border border-blue-200 dark:border-zinc-800 rounded-2xl p-6 text-center space-y-4 shadow-sm">
        {audioPlayers}

        <h2 className="text-xl font-bold">
          No {isListeningSection ? 'Listening' : 'Grammar'} Questions Found
        </h2>
        <p className="text-base text-muted-foreground">
          No {isListeningSection ? 'listening' : 'grammar'} questions are available for adult_listening.
        </p>
        <div className="flex justify-center gap-3">
          {isListeningSection && cappedGrammar.length > 0 ? (
            <Button
              type="button"
              className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-base font-semibold"
              onClick={() => {
                stopAllListeningAudio()
                setPageIndex(0)
                setStage('grammar_intro')
              }}
            >
              Continue to Grammar Test
            </Button>
          ) : (
            <Button
              type="button"
              className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-base font-semibold"
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

  // 5. 10-Question Page View: bumped typography, balanced max-w-4xl on PC, instant page turns
  const endIdx = Math.min(startIdx + QUESTIONS_PER_PAGE, activeList.length)
  const overallProgressPercent = isListeningSection
    ? Math.round((listeningCompletedCount / Math.max(1, cappedListening.length)) * 100)
    : Math.round(((pageIndex + 1) / totalPages) * 100)

  const nextButtonLabel = isSubmitting
    ? 'Saving...'
    : !isLastPageInSection
      ? 'Next'
      : isListeningSection && cappedGrammar.length > 0
        ? 'Continue to Grammar'
        : 'Finish Test'

  return (
    <div className="w-full max-w-4xl mx-auto lg:my-auto bg-white dark:bg-zinc-900 border border-blue-200 dark:border-zinc-800 rounded-2xl p-3.5 sm:p-5 md:p-6 lg:px-6 lg:py-4 space-y-2.5 md:space-y-5 lg:space-y-3 shadow-sm">
      {audioPlayers}

      {/* Header + Progress Strip */}
      <div className="space-y-2 md:space-y-2.5 lg:space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2 text-sm sm:text-base md:text-lg lg:text-base">
          <span className="font-bold text-slate-900 dark:text-foreground">
            {isListeningSection ? 'Listening Section' : 'Grammar Section'}
          </span>

          {isListeningSection ? (
            <div className="flex flex-wrap items-center gap-3 text-slate-700 dark:text-muted-foreground">
              <span className="font-semibold text-slate-900 dark:text-foreground">
                {listeningCompletedCount} / {cappedListening.length} questions completed
              </span>
              <span className="rounded-full bg-sky-100 dark:bg-zinc-800 px-2.5 py-0.5 text-xs sm:text-sm md:text-base lg:text-sm font-medium text-sky-950 dark:text-foreground">
                Page {pageIndex + 1} of {totalPages} ({startIdx + 1}–{endIdx})
              </span>
            </div>
          ) : (
            <span className="text-slate-700 dark:text-muted-foreground">
              Questions {startIdx + 1}–{endIdx} of {activeList.length} (Page {pageIndex + 1} of{' '}
              {totalPages})
            </span>
          )}
        </div>

        <div className="h-1.5 w-full overflow-hidden rounded-full bg-sky-100 dark:bg-zinc-800">
          <div
            className="h-full rounded-full bg-blue-500 transition-all duration-300"
            style={{ width: `${overallProgressPercent}%` }}
          />
        </div>
      </div>

      {/* 2 columns on tablet/PC; 1 column on mobile */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 md:gap-4 lg:gap-2.5">
        {pageQuestions.map((q) => {
          const options = normalizeOptions(q.options)
          const selectedOptId = selections[q.id]
          const isUnanswered = !selectedOptId
          const highlightMissing = showUnansweredHighlight && isUnanswered
          const displayNum = q.sort_order ?? activeList.indexOf(q) + 1
          const isSideBySidePair = isListeningSection && options.length === 2

          return (
            <div
              key={q.id}
              className={`rounded-xl border p-2.5 md:p-4 lg:px-3 lg:py-2 md:min-h-[6.75rem] lg:min-h-0 flex flex-col justify-between lg:justify-center gap-1.5 md:gap-3 lg:gap-1.5 transition-colors ${
                highlightMissing
                  ? 'border-amber-500 bg-amber-50/90 dark:bg-amber-950/30 ring-2 ring-amber-300/70'
                  : 'border-blue-300 dark:border-blue-800 bg-sky-100/80 dark:bg-sky-950/35'
              }`}
            >
              <div className="flex items-center gap-2">
                <span
                  className={`inline-flex h-6.5 md:h-7.5 lg:h-6.5 min-w-6.5 md:min-w-7.5 lg:min-w-6.5 px-1.5 items-center justify-center rounded-md text-xs sm:text-sm md:text-base lg:text-sm font-bold shrink-0 ${
                    highlightMissing
                      ? 'bg-amber-200 text-amber-950 dark:bg-amber-900 dark:text-amber-100'
                      : 'bg-blue-200/80 dark:bg-zinc-800 text-slate-900 dark:text-foreground'
                  }`}
                >
                  {displayNum}
                </span>

                {q.image_url && (
                  <img
                    src={q.image_url}
                    alt={`Question ${displayNum}`}
                    className="max-h-20 rounded object-contain"
                  />
                )}
                {q.question_text && (
                  <p className="text-sm sm:text-base md:text-lg lg:text-base font-medium text-slate-900 dark:text-foreground leading-snug">
                    {q.question_text}
                  </p>
                )}
              </div>

              <div
                className={
                  isSideBySidePair
                    ? 'grid grid-cols-2 gap-2 md:gap-3 lg:gap-2'
                    : 'space-y-1.5'
                }
              >
                {options.map((opt) => {
                  const active = selectedOptId === opt.id
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      disabled={isSubmitting}
                      onClick={() => handleSelectOption(q.id, opt.id)}
                      className={`min-h-10.5 md:h-12 lg:h-10 px-3 py-1.5 rounded-lg border text-sm sm:text-base md:text-lg lg:text-base text-center transition-colors disabled:opacity-70 ${
                        isSideBySidePair ? '' : 'w-full text-left'
                      } ${
                        active
                          ? 'border-blue-600 bg-blue-500 text-white font-semibold shadow-2xs'
                          : highlightMissing
                            ? 'border-amber-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-slate-800 dark:text-foreground hover:border-amber-500 hover:bg-amber-100/50'
                            : 'border-blue-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-slate-800 dark:text-foreground hover:border-blue-400 hover:bg-blue-50'
                      }`}
                    >
                      {opt.label}
                    </button>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      {/* Footer Bar: warning sits beside Next button without shifting questions */}
      <div className="flex items-center justify-between gap-3 pt-2 md:pt-4 lg:pt-2.5 border-t border-blue-200 dark:border-zinc-800">
        <span className="text-sm sm:text-base md:text-lg lg:text-base text-slate-600 dark:text-muted-foreground font-medium">
          {answeredOnPageCount} of {pageQuestions.length} answered on this page
        </span>

        <div className="flex items-center gap-2.5">
          {(pageWarning || saveError) && (
            <span className="text-sm sm:text-base font-medium text-amber-700 dark:text-amber-400">
              {saveError ?? pageWarning}
            </span>
          )}

          <Button
            type="button"
            disabled={isSubmitting}
            onClick={handleAdvancePage}
            className="min-w-32 h-10 sm:h-11 md:h-12 lg:h-10 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm sm:text-base font-semibold shadow-xs shrink-0"
          >
            {nextButtonLabel}
          </Button>
        </div>
      </div>
    </div>
  )
}