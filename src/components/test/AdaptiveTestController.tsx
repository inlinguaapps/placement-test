'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/client'
import { Button } from '@/components/ui/button'
import { updateTestResult } from '@/app/actions'

interface InitialSession {
  sessionId: string
  testType: string
  startingLevel: string
}

interface Props {
  initialSession: InitialSession
}

export default function AdaptiveTestController({ initialSession }: Props) {
  const supabase = createClient()

  const [loading, setLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState<any>(null)
  const [stats, setStats] = useState({
    currentLevel: initialSession.startingLevel,
    correctStreak: 0,
    totalAnswered: 0,
    isFinished: false,
  })

  useEffect(() => {
    fetchQuestion(initialSession.testType, initialSession.startingLevel)
  }, [initialSession])

  async function fetchQuestion(testType: string, level: string) {
    setLoading(true)
    const { data, error } = await supabase
      .from('test_questions')
      .select('*')
      .eq('test_type', testType)
      .eq('level', level)
      .limit(1)
      .maybeSingle()

    if (error) console.error('Fetch error:', error)
    setCurrentQuestion(data)
    setLoading(false)
  }

  const handleAnswer = async (isCorrect: boolean) => {
    let nextLevel = stats.currentLevel
    let nextStreak = isCorrect ? stats.correctStreak + 1 : 0
    let total = stats.totalAnswered + 1

    if (nextStreak >= 3) {
      nextLevel = getNextLevel(stats.currentLevel)
      nextStreak = 0
    }

    // Logic for finishing the test (20 questions)
    if (total >= 20) {
      setIsSaving(true)
      // Call with 'true' to set status to 'completed'
      await updateTestResult(initialSession.sessionId, nextLevel, true)

      setStats((prev) => ({
        ...prev,
        isFinished: true,
        totalAnswered: total,
        currentLevel: nextLevel,
      }))
      setIsSaving(false)
      return
    }

    setStats((prev) => ({
      ...prev,
      currentLevel: nextLevel,
      correctStreak: nextStreak,
      totalAnswered: total,
    }))

    // Heartbeat update every 5 questions (status: in_progress)
    if (total % 5 === 0) {
      updateTestResult(initialSession.sessionId, nextLevel, false)
    }

    fetchQuestion(initialSession.testType, nextLevel)
  }

  if (stats.isFinished) {
    return (
      <div className='text-center space-y-4 py-10'>
        <h2 className='text-3xl font-bold'>Test Complete!</h2>
        <div className='p-8 bg-zinc-100 dark:bg-zinc-800 rounded-2xl inline-block'>
          <p className='text-sm uppercase tracking-widest text-zinc-500 mb-1'>
            Estimated Level
          </p>
          <span className='text-5xl font-black text-blue-600'>
            {stats.currentLevel}
          </span>
        </div>
        <p className='text-zinc-500 max-w-xs mx-auto'>
          Your results have been sent to the branch. You can close this window
          or return home.
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

  return (
    <div className='space-y-8'>
      {/* Test Track Header - Clean and prominent */}
      <div className='border-b pb-4'>
        <h1 className='text-xl font-bold uppercase tracking-tight text-zinc-400'>
          {initialSession.testType} Placement Test
        </h1>
      </div>

      {loading || isSaving || !currentQuestion ? (
        <div className='text-center p-20 space-y-4'>
          <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto'></div>
          <p className='text-zinc-500 italic'>
            {isSaving ? 'Finalizing...' : 'Preparing next question...'}
          </p>
        </div>
      ) : (
        <>
          <div className='space-y-6'>
            <div className='text-sm font-medium text-zinc-400'>
              Question {stats.totalAnswered + 1}
            </div>
            <h2 className='text-2xl font-semibold leading-snug'>
              {currentQuestion.question_text}
            </h2>
          </div>

          <div className='grid gap-4'>
            {['a', 'b', 'c', 'd'].map((letter) => {
              const option = currentQuestion[`option_${letter}`]
              if (!option) return null
              return (
                <Button
                  key={letter}
                  variant='outline'
                  className='h-auto min-h-[4.5rem] justify-start px-6 text-left text-lg py-4 hover:bg-zinc-50 hover:border-zinc-400 transition-all group'
                  onClick={() =>
                    handleAnswer(letter === currentQuestion.correct_answer)
                  }
                >
                  <span className='mr-4 shrink-0 flex items-center justify-center w-8 h-8 rounded-full border border-zinc-200 bg-zinc-50 group-hover:bg-zinc-900 group-hover:text-white group-hover:border-zinc-900 text-sm font-bold uppercase transition-colors'>
                    {letter}
                  </span>
                  <span className='flex-1'>{option}</span>
                </Button>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}

function getNextLevel(current: string): string {
  const levels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']
  const idx = levels.indexOf(current)
  return idx < levels.length - 1 ? levels[idx + 1] : current
}
