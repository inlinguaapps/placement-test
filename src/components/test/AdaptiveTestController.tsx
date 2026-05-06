// // src\components\test\AdaptiveTestController.tsx
'use client'

import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { createClient } from '@/lib/client'
import { Button } from '@/components/ui/button'
import { updateTestResult } from '@/app/actions'
import { TEST_STRATEGIES } from '@/logic/adaptive/strategies'
import { StrategyName } from '@/types/test'

interface Question {
  id: string
  test_type: string
  level: string
  question_text: string
  options: Record<string, string> // For listen_choose, these will be Image URLs
  correct_answer: string
  q_type: 'text_only' | 'image_context' | 'listen_choose'
  image_url?: string
  audio_url?: string
  video_url?: string
  transcript?: string
}

interface HistoryEntry {
  level: string
  correct: boolean
}

interface InitialSession {
  sessionId: string
  testType: string
  startingLevel: string
}

interface Props {
  initialSession: InitialSession
  strategyName?: StrategyName
}

export default function AdaptiveTestController({
  initialSession,
  strategyName = 'STRICT_ACADEMIC',
}: Props) {
  const supabase = createClient()
  const hasInitialized = useRef(false)

  const strategy = useMemo(
    () => TEST_STRATEGIES[strategyName] || TEST_STRATEGIES['STRICT_ACADEMIC'],
    [strategyName],
  )

  const [loading, setLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [usedQuestionIds, setUsedQuestionIds] = useState<string[]>([])
  const [currentLevelHistory, setCurrentLevelHistory] = useState<boolean[]>([])
  const [fullHistory, setFullHistory] = useState<HistoryEntry[]>([])

  const [stats, setStats] = useState({
    currentLevel: initialSession.startingLevel,
    totalAnswered: 0,
    isFinished: false,
  })

  const finalizeTest = useCallback(
    async (finalLevel: string, total: number, history: HistoryEntry[]) => {
      setIsSaving(true)
      await updateTestResult(
        initialSession.sessionId,
        finalLevel,
        true,
        history,
      )
      setStats((prev) => ({
        ...prev,
        isFinished: true,
        totalAnswered: total,
        currentLevel: finalLevel,
      }))
      setIsSaving(false)
    },
    [initialSession.sessionId],
  )

  const fetchQuestion = useCallback(
    async (testType: string, level: string, excludeIds: string[]) => {
      setLoading(true)
      setError(null)

      let query = supabase
        .from('test_questions')
        .select('*')
        .eq('test_type', testType)
        .eq('level', level)

      if (excludeIds.length > 0) {
        query = query.not('id', 'in', `(${excludeIds.join(',')})`)
      }

      const { data, error: fetchError } = await query.limit(1).maybeSingle()

      if (fetchError) {
        console.error('Fetch error:', fetchError)
        setError('Technical error loading question.')
      } else if (!data) {
        finalizeTest(level, stats.totalAnswered, fullHistory)
      } else {
        setCurrentQuestion(data as Question)
      }
      setLoading(false)
    },
    [supabase, finalizeTest, stats.totalAnswered, fullHistory],
  )

  useEffect(() => {
    if (hasInitialized.current) return
    hasInitialized.current = true

    async function loadInitialQuestion() {
      const { data, error: fetchError } = await supabase
        .from('test_questions')
        .select('*')
        .eq('test_type', initialSession.testType)
        .eq('level', initialSession.startingLevel)
        .limit(1)
        .maybeSingle()

      if (fetchError) {
        setError('Technical error loading initial question.')
      } else if (!data) {
        setError('No questions found for this test type.')
      } else {
        setCurrentQuestion(data as Question)
      }
      setLoading(false)
    }

    loadInitialQuestion()
  }, [initialSession, supabase])

  const handleAnswer = async (isCorrect: boolean) => {
    if (!currentQuestion) return

    const newEntry: HistoryEntry = {
      level: currentQuestion.level,
      correct: isCorrect,
    }
    const updatedFullHistory = [...fullHistory, newEntry]
    setFullHistory(updatedFullHistory)

    const newLevelHistory = [...currentLevelHistory, isCorrect]
    const updatedUsedIds = [...usedQuestionIds, currentQuestion.id]
    const total = stats.totalAnswered + 1

    setUsedQuestionIds(updatedUsedIds)

    let nextLevel = stats.currentLevel
    let levelChanged = false

    if (strategy.shouldMoveUp(newLevelHistory)) {
      nextLevel = getLevelChange(stats.currentLevel, 'up')
      levelChanged = nextLevel !== stats.currentLevel
    } else if (strategy.shouldMoveDown(newLevelHistory)) {
      nextLevel = getLevelChange(stats.currentLevel, 'down')
      levelChanged = nextLevel !== stats.currentLevel
    }

    const isAtMax = total >= strategy.maxQuestions
    const isAtMin = total >= strategy.minQuestions
    const isStable = !levelChanged && newLevelHistory.length >= 3

    if (isAtMax || (isAtMin && isStable)) {
      await finalizeTest(nextLevel, total, updatedFullHistory)
      return
    }

    setStats((prev) => ({
      ...prev,
      currentLevel: nextLevel,
      totalAnswered: total,
    }))

    setCurrentLevelHistory(levelChanged ? [] : newLevelHistory)

    if (total % 5 === 0) {
      updateTestResult(
        initialSession.sessionId,
        nextLevel,
        false,
        updatedFullHistory,
      )
    }

    fetchQuestion(initialSession.testType, nextLevel, updatedUsedIds)
  }

  if (stats.isFinished) {
    return (
      <div className='text-center space-y-4 py-10'>
        <h2 className='text-3xl font-bold'>Test Complete!</h2>
        <div className='p-8 bg-amber-100 text-amber-700 rounded-2xl inline-block'>
          <p className='text-sm uppercase tracking-widest mb-1'>
            DEV MODE: Estimated Level
          </p>
          <span className='text-5xl font-black'>{stats.currentLevel}</span>
        </div>
        <p className='text-zinc-500 max-w-xs mx-auto text-balance'>
          Your results have been recorded. Our team will review your score
          shortly.
        </p>
        <Button
          size='lg'
          className='w-full max-w-xs'
          onClick={() => (window.location.href = '/')}
        >
          Finish
        </Button>
      </div>
    )
  }

  if (error) {
    return (
      <div className='text-center p-10 border-2 border-dashed rounded-xl'>
        <p className='text-red-500 font-medium mb-4'>{error}</p>
        <Button onClick={() => window.location.reload()}>Retry</Button>
      </div>
    )
  }

  return (
    <div className='space-y-8'>
      <div className='border-b pb-4'>
        <div className='flex justify-between items-end'>
          <div>
            <h1 className='text-xl font-bold uppercase tracking-tight text-zinc-400'>
              {initialSession.testType} Placement Test
            </h1>
            <div className='text-sm font-medium text-zinc-400 mt-1'>
              Question {stats.totalAnswered + 1}
            </div>
          </div>

          {currentQuestion && !loading && (
            <div className='px-2 py-1 bg-amber-100 text-amber-700 text-[12px] font-bold rounded border border-amber-200 uppercase tracking-tighter mb-1'>
              Dev Mode: Level {currentQuestion.level}
            </div>
          )}
        </div>
      </div>

      <div className='min-h-[500px] flex flex-col'>
        {loading || isSaving || !currentQuestion ? (
          <div className='flex-1 flex flex-col items-center justify-center space-y-4'>
            <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600'></div>
            <p className='text-zinc-500 italic'>
              {isSaving ? 'Finalizing...' : 'Loading question...'}
            </p>
          </div>
        ) : (
          <div className='animate-in fade-in duration-500 space-y-6'>
            {/* Image Context Layout */}
            {currentQuestion.q_type === 'image_context' &&
              currentQuestion.image_url && (
                <div className='rounded-xl overflow-hidden border bg-white mb-4'>
                  <img
                    key={`img-${currentQuestion.id}`}
                    src={currentQuestion.image_url}
                    alt='Context'
                    className='w-full h-auto object-contain max-h-[400px] mx-auto'
                  />
                </div>
              )}

            {/* Audio Player (Required for listen_choose) */}
            {currentQuestion.audio_url && (
              <div
                className='bg-zinc-50 p-4 rounded-xl border mb-2'
                key={`audio-${currentQuestion.id}`}
              >
                <audio controls className='w-full'>
                  <source src={currentQuestion.audio_url} type='audio/mpeg' />
                </audio>
              </div>
            )}

            <h2 className='text-2xl font-semibold leading-snug'>
              {currentQuestion.question_text}
            </h2>

            {/* Conditional Options Rendering */}
            <div className='grid gap-4'>
              {currentQuestion.q_type === 'listen_choose' ? (
                /* 3-Column Image Grid Layout */
                <div className='grid grid-cols-1 sm:grid-cols-3 gap-4'>
                  {['a', 'b', 'c'].map((letter) => (
                    <button
                      key={`${currentQuestion.id}-${letter}`}
                      onClick={() =>
                        handleAnswer(letter === currentQuestion.correct_answer)
                      }
                      className='group relative aspect-square overflow-hidden rounded-2xl border-2 border-zinc-200 bg-white p-3 transition-all hover:border-zinc-900 hover:shadow-md active:scale-95'
                    >
                      <img
                        src={currentQuestion.options[letter]}
                        alt={`Option ${letter}`}
                        className='h-full w-full object-contain'
                      />
                      <div className='absolute bottom-3 right-3 flex h-7 w-7 items-center justify-center rounded-full bg-zinc-100 text-xs font-bold uppercase text-zinc-400 group-hover:bg-zinc-900 group-hover:text-white transition-colors'>
                        {letter}
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                /* Standard Text List Layout */
                ['a', 'b', 'c', 'd'].map((letter) => {
                  const optionText = currentQuestion.options?.[letter]
                  if (!optionText) return null
                  return (
                    <Button
                      key={`${currentQuestion.id}-${letter}`}
                      variant='outline'
                      className='h-auto min-h-[4.5rem] justify-start px-6 text-left text-lg py-4 hover:bg-zinc-50 hover:border-zinc-400 transition-all group'
                      onClick={() =>
                        handleAnswer(letter === currentQuestion.correct_answer)
                      }
                    >
                      <span className='mr-4 shrink-0 flex items-center justify-center w-8 h-8 rounded-full border border-zinc-200 bg-zinc-50 group-hover:bg-zinc-900 group-hover:text-white text-sm font-bold uppercase transition-colors'>
                        {letter}
                      </span>
                      <span className='flex-1'>{optionText}</span>
                    </Button>
                  )
                })
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function getLevelChange(current: string, direction: 'up' | 'down'): string {
  const levels = ['Pre-A1', 'A1', 'A2', 'B1', 'B2', 'C1', 'C2']
  const idx = levels.findIndex((l) => l.toLowerCase() === current.toLowerCase())

  if (idx === -1) return current
  if (direction === 'up')
    return idx < levels.length - 1 ? levels[idx + 1] : levels[idx]
  return idx > 0 ? levels[idx - 1] : levels[idx]
}
