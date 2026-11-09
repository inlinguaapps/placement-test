// // src/components/test/AdaptiveTestController.tsx

// 'use client'

// import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
// import { createClient } from '@/lib/client'
// import { Button } from '@/components/ui/button'
// import { updateTestResult } from '@/app/actions'
// import { 
//   processAdaptiveAnswer, 
//   STRATEGIES as TEST_STRATEGIES 
// } from '@/logic/adaptive/adaptiveEngine'
// import { StrategyName } from '@/types/test'
// import { 
//   CEFR_LEVELS, 
//   getLevelsForCategory as getLevelsForTestType 
// } from '@/types/level-config'
// import { TestCompletionView } from './TestCompletionView'
// import { QuestionRenderer } from './QuestionRenderer'

// interface Question {
//   id: string
//   test_type: string
//   level: string
//   question_text: string
//   options: Record<string, string>
//   correct_answer: string
//   q_type:
//     | 'text_only'
//     | 'image_context'
//     | 'image_listen_choose'
//     | 'listen_choose'
//     | 'dialogue'
//     | 'audio'
//     | 'video'
//     | 'reading'
//   sort_order: number
//   image_url?: string
//   audio_url?: string
//   video_url?: string
//   transcript?: string
// }

// interface HistoryEntry {
//   level: string
//   correct: boolean
// }

// interface InitialSession {
//   sessionId: string
//   testType: string
//   startingLevel: string
// }

// interface Props {
//   initialSession: InitialSession
//   strategyName?: StrategyName
// }

// export default function AdaptiveTestController({
//   initialSession,
//   strategyName = 'SIX_QUESTION_DYNAMIC',
// }: Props) {
//   const supabase = useMemo(() => createClient(), [])
//   const hasInitialized = useRef(false)

//   // Retrieve category-specific level ladder
//   const categoryLevels = useMemo(
//     () => getLevelsForTestType(initialSession.testType),
//     [initialSession.testType],
//   )

//   const strategy = useMemo(
//     () =>
//       TEST_STRATEGIES[strategyName] || TEST_STRATEGIES['SIX_QUESTION_DYNAMIC'],
//     [strategyName],
//   )

//   const [loading, setLoading] = useState(true)
//   const [isSaving, setIsSaving] = useState(false)
//   const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null)
//   const [error, setError] = useState<string | null>(null)
//   const [usedQuestionIds, setUsedQuestionIds] = useState<string[]>([])
//   const [currentLevelHistory, setCurrentLevelHistory] = useState<boolean[]>([])
//   const [fullHistory, setFullHistory] = useState<HistoryEntry[]>([])
//   const [mediaPlaying, setMediaPlaying] = useState(false)
//   const [playedMediaIds, setPlayedMediaIds] = useState<string[]>([])
//   const [recommendedBooks, setRecommendedBooks] = useState<
//     { id: string; name: string; inlingua_level: number | null }[]
//   >([])

//   const [highestPassedLevel, setHighestPassedLevel] = useState<string | null>(
//     null,
//   )
//   const [isLevelEstablished, setIsLevelEstablished] = useState(false)

//   const [stats, setStats] = useState({
//     currentLevel: initialSession.startingLevel,
//     totalAnswered: 0,
//     isFinished: false,
//   })

//   const stopAllMedia = useCallback(() => {
//     setMediaPlaying(false)
//     const mediaElements = document.querySelectorAll('audio, video')
//     mediaElements.forEach((el) => {
//       const media = el as HTMLMediaElement
//       media.pause()
//       media.currentTime = 0
//     })
//   }, [])

//   const finalizeTest = useCallback(
//     async (finalLevel: string, total: number, history: HistoryEntry[]) => {
//       stopAllMedia()
//       setIsSaving(true)

//       const { data: booksData } = await supabase
//         .from('books')
//         .select('id, name, inlingua_level')
//         .eq('cefr_level', finalLevel)
//         .eq('test_identity', initialSession.testType)
//         .order('inlingua_level', { ascending: true })

//       if (booksData) {
//         setRecommendedBooks(booksData)
//       }

//       await updateTestResult(
//         initialSession.sessionId,
//         finalLevel,
//         true,
//         history,
//       )

//       setStats((prev) => ({
//         ...prev,
//         isFinished: true,
//         totalAnswered: total,
//         currentLevel: finalLevel,
//       }))
//       setIsSaving(false)
//     },
//     [initialSession.sessionId, initialSession.testType, stopAllMedia, supabase],
//   )

//   const fetchQuestion = useCallback(
//     async (
//       testType: string,
//       level: string,
//       excludeIds: string[],
//       currentTotalAnswered: number,
//       historyEntries: HistoryEntry[],
//     ) => {
//       setLoading(true)
//       setError(null)

//       let query = supabase
//         .from('test_questions')
//         .select('*')
//         .eq('test_type', testType)
//         .eq('level', level)

//       if (excludeIds.length > 0) {
//         query = query.not('id', 'in', `(${excludeIds.join(',')})`)
//       }

//       const { data, error: fetchError } = await query
//         .order('sort_order', { ascending: true })
//         .limit(1)
//         .maybeSingle()

//       if (fetchError) {
//         console.error('Fetch error:', fetchError)
//         setError('Technical error loading question.')
//         setLoading(false)
//       } else if (!data) {
//         finalizeTest(level, currentTotalAnswered, historyEntries)
//       } else {
//         setCurrentQuestion(data as Question)
//         setLoading(false)
//       }
//     },
//     [supabase, finalizeTest],
//   )

//   useEffect(() => {
//     if (hasInitialized.current) return
//     hasInitialized.current = true

//     async function loadInitialQuestion() {
//       const { data, error: fetchError } = await supabase
//         .from('test_questions')
//         .select('*')
//         .eq('test_type', initialSession.testType)
//         .eq('level', initialSession.startingLevel)
//         .order('sort_order', { ascending: true })
//         .limit(1)
//         .maybeSingle()

//       if (fetchError) {
//         setError('Technical error loading initial question.')
//       } else if (!data) {
//         setError('No questions found for this test type.')
//       } else {
//         setCurrentQuestion(data as Question)
//       }
//       setLoading(false)
//     }

//     loadInitialQuestion()
//   }, [initialSession, supabase])

//   const handleAnswer = async (isCorrect: boolean) => {
//     if (!currentQuestion) return

//     stopAllMedia()

//     const newEntry: HistoryEntry = {
//       level: currentQuestion.level,
//       correct: isCorrect,
//     }
//     const updatedFullHistory = [...fullHistory, newEntry]
//     setFullHistory(updatedFullHistory)

//     const updatedUsedIds = [...usedQuestionIds, currentQuestion.id]
//     setUsedQuestionIds(updatedUsedIds)

//     const total = stats.totalAnswered + 1

//     // Delegate step progression entirely to our unified engine
//     const engineResult = processAdaptiveAnswer({
//       strategyName,
//       isCorrect,
//       categoryLevels,
//       state: {
//         currentLevel: stats.currentLevel,
//         totalAnswered: stats.totalAnswered,
//         highestPassedLevel,
//         isLevelEstablished,
//         currentLevelHistory,
//       },
//     })

//     setCurrentLevelHistory(engineResult.newLevelHistory)
//     setHighestPassedLevel(engineResult.updatedFloor)
//     setIsLevelEstablished(engineResult.isLevelEstablished)

//     if (engineResult.isFinished) {
//       await finalizeTest(engineResult.nextLevel, total, updatedFullHistory)
//       return
//     }

//     setStats((prev) => ({
//       ...prev,
//       currentLevel: engineResult.nextLevel,
//       totalAnswered: total,
//     }))

//     if (total % 5 === 0) {
//       updateTestResult(
//         initialSession.sessionId,
//         engineResult.nextLevel,
//         false,
//         updatedFullHistory,
//       )
//     }

//     fetchQuestion(
//       initialSession.testType,
//       engineResult.nextLevel,
//       updatedUsedIds,
//       total,
//       updatedFullHistory,
//     )
//   }

//   if (stats.isFinished) {
//     return (
//       <TestCompletionView
//         testType={initialSession.testType}
//         recommendedBooks={recommendedBooks}
//         onFinish={() => (window.location.href = '/')}
//       />
//     )
//   }

//   if (error) {
//     return (
//       <div className="text-center p-10 border-2 border-dashed rounded-xl">
//         <p className="text-red-500 font-medium mb-4">{error}</p>
//         <Button onClick={() => window.location.reload()}>Retry</Button>
//       </div>
//     )
//   }

//   return (
//     <div className="space-y-8">
//       <div className="border-b pb-4">
//         <div className="flex justify-between items-end">
//           <div>
//             <h1 className="text-xl font-bold uppercase tracking-tight text-zinc-400">
//               {initialSession.testType} Placement Test
//             </h1>
//             <div className="text-sm font-medium text-zinc-400 mt-1">
//               Question {stats.totalAnswered + 1}
//             </div>
//           </div>

//           {/* {currentQuestion && !loading && (
//             <div className="px-2 py-1 bg-amber-100 text-amber-700 text-[12px] font-bold rounded border border-amber-200 uppercase tracking-tighter mb-1">
//               Dev Mode: Level {currentQuestion.level}
//             </div>
//           )} */}
//         </div>
//       </div>

//       <div className="min-h-[500px] flex flex-col">
//         {loading || isSaving || !currentQuestion ? (
//           <div className="flex-1 flex flex-col items-center justify-center space-y-4">
//             <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
//             <p className="text-zinc-500 italic">
//               {isSaving ? 'Finalizing...' : 'Loading question...'}
//             </p>
//           </div>
//         ) : (
//           <QuestionRenderer
//             currentQuestion={currentQuestion}
//             mediaPlaying={mediaPlaying}
//             setMediaPlaying={setMediaPlaying}
//             playedMediaIds={playedMediaIds}
//             setPlayedMediaIds={setPlayedMediaIds}
//             handleAnswer={handleAnswer}
//           />
//         )}
//       </div>
//     </div>
//   )
// }



// src/components/test/AdaptiveTestController.tsx

'use client'

import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { createClient } from '@/lib/client'
import { Button } from '@/components/ui/button'
import { updateTestResult } from '@/app/actions'
import { 
  processAdaptiveAnswer, 
  STRATEGIES as TEST_STRATEGIES 
} from '@/logic/adaptive/adaptiveEngine'
import { StrategyName } from '@/types/test'
import { 
  getLevelsForCategory as getLevelsForTestType 
} from '@/types/level-config'
import { TestCompletionView } from './TestCompletionView'
import { QuestionRenderer } from './QuestionRenderer'

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

// Mathayom levels that a bridged Prathom student can step into (skipping Mathayom A1+)
const MATHAYOM_BRIDGED_LEVELS = new Set(['A2', 'A2+', 'B1', 'B1+', 'B2', 'C1', 'C2'])

function resolveQueryTestType(initialTestType: string, level: string): string {
  if (initialTestType === 'Prathom' && MATHAYOM_BRIDGED_LEVELS.has(level)) {
    return 'Mathayom'
  }
  return initialTestType
}

export default function AdaptiveTestController({
  initialSession,
  strategyName = 'SIX_QUESTION_DYNAMIC',
}: Props) {
  const supabase = useMemo(() => createClient(), [])
  const hasInitialized = useRef(false)

  // Retrieve category-specific level ladder; extend Prathom dynamically to allow bridging past A1+
  const categoryLevels = useMemo(() => {
    if (initialSession.testType === 'Prathom') {
      return ['Pre-A1', 'A1', 'A1+', 'A2', 'A2+', 'B1', 'B1+', 'B2']
    }
    return getLevelsForTestType(initialSession.testType)
  }, [initialSession.testType])

  const isPrathomTrack = initialSession.testType === 'Prathom'

  const strategy = useMemo(
    () =>
      TEST_STRATEGIES[strategyName] || TEST_STRATEGIES['SIX_QUESTION_DYNAMIC'],
    [strategyName],
  )

  const [loading, setLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [usedQuestionIds, setUsedQuestionIds] = useState<string[]>([])
  const [currentLevelHistory, setCurrentLevelHistory] = useState<boolean[]>([])
  const [fullHistory, setFullHistory] = useState<HistoryEntry[]>([])
  const [mediaPlaying, setMediaPlaying] = useState(false)
  const [playedMediaIds, setPlayedMediaIds] = useState<string[]>([])
  const [recommendedBooks, setRecommendedBooks] = useState<
    { id: string; name: string; inlingua_level: number | null }[]
  >([])

  const [highestPassedLevel, setHighestPassedLevel] = useState<string | null>(
    null,
  )
  const [isLevelEstablished, setIsLevelEstablished] = useState(false)

  const [stats, setStats] = useState({
    currentLevel: initialSession.startingLevel,
    totalAnswered: 0,
    isFinished: false,
  })

  const stopAllMedia = useCallback(() => {
    setMediaPlaying(false)
    const mediaElements = document.querySelectorAll('audio, video')
    mediaElements.forEach((el) => {
      const media = el as HTMLMediaElement
      media.pause()
      media.currentTime = 0
    })
  }, [])

  const finalizeTest = useCallback(
    async (finalLevel: string, total: number, history: HistoryEntry[]) => {
      stopAllMedia()
      setIsSaving(true)

      const bookTestIdentity = resolveQueryTestType(
        initialSession.testType,
        finalLevel,
      )

      const { data: booksData } = await supabase
        .from('books')
        .select('id, name, inlingua_level')
        .eq('cefr_level', finalLevel)
        .eq('test_identity', bookTestIdentity)
        .order('inlingua_level', { ascending: true })

      if (booksData) {
        setRecommendedBooks(booksData)
      }

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
    [initialSession.sessionId, initialSession.testType, stopAllMedia, supabase],
  )

  const fetchQuestion = useCallback(
    async (
      testType: string,
      level: string,
      excludeIds: string[],
      currentTotalAnswered: number,
      historyEntries: HistoryEntry[],
    ) => {
      setLoading(true)
      setError(null)

      const queryTestType = resolveQueryTestType(testType, level)

      let query = supabase
        .from('test_questions')
        .select('*')
        .eq('test_type', queryTestType)
        .eq('level', level)

      if (excludeIds.length > 0) {
        query = query.not('id', 'in', `(${excludeIds.join(',')})`)
      }

      const { data, error: fetchError } = await query
        .order('sort_order', { ascending: true })
        .limit(1)
        .maybeSingle()

      if (fetchError) {
        console.error('Fetch error:', fetchError)
        setError('Technical error loading question.')
        setLoading(false)
      } else if (!data) {
        finalizeTest(level, currentTotalAnswered, historyEntries)
      } else {
        setCurrentQuestion(data as Question)
        setLoading(false)
      }
    },
    [supabase, finalizeTest],
  )

  useEffect(() => {
    if (hasInitialized.current) return
    hasInitialized.current = true

    async function loadInitialQuestion() {
      const queryTestType = resolveQueryTestType(
        initialSession.testType,
        initialSession.startingLevel,
      )

      const { data, error: fetchError } = await supabase
        .from('test_questions')
        .select('*')
        .eq('test_type', queryTestType)
        .eq('level', initialSession.startingLevel)
        .order('sort_order', { ascending: true })
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

    stopAllMedia()

    const newEntry: HistoryEntry = {
      level: currentQuestion.level,
      correct: isCorrect,
    }
    const updatedFullHistory = [...fullHistory, newEntry]
    setFullHistory(updatedFullHistory)

    const updatedUsedIds = [...usedQuestionIds, currentQuestion.id]
    setUsedQuestionIds(updatedUsedIds)

    const total = stats.totalAnswered + 1

    // Delegate step progression entirely to our unified engine
    let engineResult = processAdaptiveAnswer({
      strategyName,
      isCorrect,
      categoryLevels,
      state: {
        currentLevel: stats.currentLevel,
        totalAnswered: stats.totalAnswered,
        highestPassedLevel,
        isLevelEstablished,
        currentLevelHistory,
      },
    })

    // BRIDGE ADJUSTMENT: If a Prathom student passes A1+, skip Mathayom A1+ and jump straight to A2.
    // Also establish 'A1+' as their passed floor so the engine correctly recognizes A2 as secured ground.
    if (isPrathomTrack && stats.currentLevel === 'A1+' && isCorrect) {
      engineResult.nextLevel = 'A2'
      engineResult.updatedFloor = 'A1+'
    }

    setCurrentLevelHistory(engineResult.newLevelHistory)
    setHighestPassedLevel(engineResult.updatedFloor)
    setIsLevelEstablished(engineResult.isLevelEstablished)

    if (engineResult.isFinished) {
      await finalizeTest(engineResult.nextLevel, total, updatedFullHistory)
      return
    }

    setStats((prev) => ({
      ...prev,
      currentLevel: engineResult.nextLevel,
      totalAnswered: total,
    }))

    if (total % 5 === 0) {
      updateTestResult(
        initialSession.sessionId,
        engineResult.nextLevel,
        false,
        updatedFullHistory,
      )
    }

    fetchQuestion(
      initialSession.testType,
      engineResult.nextLevel,
      updatedUsedIds,
      total,
      updatedFullHistory,
    )
  }

  if (stats.isFinished) {
    return (
      <TestCompletionView
        testType={initialSession.testType}
        recommendedBooks={recommendedBooks}
        onFinish={() => (window.location.href = '/')}
      />
    )
  }

  if (error) {
    return (
      <div className="text-center p-10 border-2 border-dashed rounded-xl">
        <p className="text-red-500 font-medium mb-4">{error}</p>
        <Button onClick={() => window.location.reload()}>Retry</Button>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="border-b pb-4">
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-xl font-bold uppercase tracking-tight text-zinc-400">
              {initialSession.testType} Placement Test
            </h1>
            <div className="text-sm font-medium text-zinc-400 mt-1">
              Question {stats.totalAnswered + 1}
            </div>
          </div>

          {currentQuestion && !loading && (
            <div className="px-2 py-1 bg-amber-100 text-amber-700 text-[12px] font-bold rounded border border-amber-200 uppercase tracking-tighter mb-1">
              Dev Mode: Level {currentQuestion.level}
            </div>
          )} 
        </div>
      </div>

      <div className="min-h-[500px] flex flex-col">
        {loading || isSaving || !currentQuestion ? (
          <div className="flex-1 flex flex-col items-center justify-center space-y-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
            <p className="text-zinc-500 italic">
              {isSaving ? 'Finalizing...' : 'Loading question...'}
            </p>
          </div>
        ) : (
          <QuestionRenderer
            currentQuestion={currentQuestion}
            mediaPlaying={mediaPlaying}
            setMediaPlaying={setMediaPlaying}
            playedMediaIds={playedMediaIds}
            setPlayedMediaIds={setPlayedMediaIds}
            handleAnswer={handleAnswer}
          />
        )}
      </div>
    </div>
  )
}