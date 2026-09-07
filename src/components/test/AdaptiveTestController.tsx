// // // src\components\test\AdaptiveTestController.tsx

// 'use client'

// import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
// import { createClient } from '@/lib/client'
// import { Button } from '@/components/ui/button'
// import { updateTestResult } from '@/app/actions'
// import { TEST_STRATEGIES } from '@/logic/adaptive/strategies'
// import { StrategyName } from '@/types/test'

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

// const CEFR_LEVELS = [
//   'Pre-A1',
//   'A1',
//   'A1+',
//   'A2',
//   'A2+',
//   'B1',
//   'B1+',
//   'B2',
//   'C1',
//   'C2',
// ]

// export default function AdaptiveTestController({
//   initialSession,
//   strategyName = 'SIX_QUESTION_DYNAMIC',
// }: Props) {
//   // Memoize client to prevent recreation on every render pass
//   const supabase = useMemo(() => createClient(), [])
//   const hasInitialized = useRef(false)

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

//   const [stats, setStats] = useState({
//     currentLevel: initialSession.startingLevel,
//     totalAnswered: 0,
//     isFinished: false,
//   })

//   const calculateNextLevel = useCallback(
//     (
//       current: string,
//       direction: 'up' | 'down',
//       floorLevel: string | null,
//     ): string => {
//       const idx = CEFR_LEVELS.findIndex(
//         (l) => l.toLowerCase() === current.toLowerCase(),
//       )
//       if (idx === -1) return current

//       if (direction === 'up') {
//         return idx < CEFR_LEVELS.length - 1
//           ? CEFR_LEVELS[idx + 1]
//           : CEFR_LEVELS[idx]
//       }

//       if (direction === 'down') {
//         if (floorLevel) {
//           const floorIdx = CEFR_LEVELS.findIndex(
//             (l) => l.toLowerCase() === floorLevel.toLowerCase(),
//           )
//           if (idx <= floorIdx) return CEFR_LEVELS[idx]
//         }
//         return idx > 0 ? CEFR_LEVELS[idx - 1] : CEFR_LEVELS[idx]
//       }

//       return current
//     },
//     [],
//   )

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
//       } else if (!data) {
//         // Fall back gracefully using direct arguments to prevent stale state issues
//         await finalizeTest(level, currentTotalAnswered, historyEntries)
//       } else {
//         setCurrentQuestion(data as Question)
//       }
//       setLoading(false)
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

//     if (total >= strategy.maxQuestions) {
//       await finalizeTest(stats.currentLevel, total, updatedFullHistory)
//       return
//     }

//     const newLevelHistory = [...currentLevelHistory, isCorrect]
//     let nextLevel = stats.currentLevel
//     let levelChanged = false
//     let updatedFloor = highestPassedLevel

//     if (strategy.shouldMoveUp(newLevelHistory)) {
//       const currentIdx = CEFR_LEVELS.findIndex(
//         (l) => l.toLowerCase() === stats.currentLevel.toLowerCase(),
//       )
//       const prevFloorIdx = CEFR_LEVELS.findIndex(
//         (l) => l.toLowerCase() === (highestPassedLevel || '').toLowerCase(),
//       )

//       if (currentIdx > prevFloorIdx) {
//         updatedFloor = stats.currentLevel
//         setHighestPassedLevel(updatedFloor)
//       }

//       nextLevel = calculateNextLevel(stats.currentLevel, 'up', updatedFloor)
//       levelChanged = nextLevel !== stats.currentLevel
//     } else if (strategy.shouldMoveDown(newLevelHistory)) {
//       nextLevel = calculateNextLevel(
//         stats.currentLevel,
//         'down',
//         highestPassedLevel,
//       )
//       levelChanged = nextLevel !== stats.currentLevel
//     }

//     setStats((prev) => ({
//       ...prev,
//       currentLevel: nextLevel,
//       totalAnswered: total,
//     }))

//     setCurrentLevelHistory(levelChanged ? [] : newLevelHistory)

//     if (total % 5 === 0) {
//       updateTestResult(
//         initialSession.sessionId,
//         nextLevel,
//         false,
//         updatedFullHistory,
//       )
//     }

//     fetchQuestion(
//       initialSession.testType,
//       nextLevel,
//       updatedUsedIds,
//       total,
//       updatedFullHistory,
//     )
//   }

//   if (stats.isFinished) {
//     return (
//       <div className='text-center space-y-6 py-10 max-w-md mx-auto'>
//         <h2 className='text-3xl font-bold'>Test Complete!</h2>

//         <div className='p-8 bg-amber-100 text-amber-800 rounded-2xl w-full shadow-sm'>
//           <p className='text-xs uppercase tracking-widest font-bold text-amber-600 mb-1'>
//             DEV MODE: Estimated Level
//           </p>
//           <span className='text-6xl font-black'>{stats.currentLevel}</span>
//         </div>

//         {recommendedBooks.length > 0 && (
//           <div className='p-6 bg-zinc-50 border border-zinc-200 rounded-2xl text-left space-y-3 shadow-sm'>
//             <h3 className='text-xs font-bold uppercase tracking-wider text-zinc-500'>
//               Recommended Coursebooks ({initialSession.testType})
//             </h3>
//             <ul className='space-y-2.5'>
//               {recommendedBooks.map((book) => (
//                 <li
//                   key={book.id}
//                   className='flex items-center justify-between text-zinc-800 font-medium text-sm'
//                 >
//                   <div className='flex items-center gap-2'>
//                     <span className='text-amber-500'>📖</span>
//                     <span>{book.name}</span>
//                   </div>
//                   {book.inlingua_level !== null && (
//                     <span className='text-xs bg-zinc-200 text-zinc-700 px-2 py-0.5 rounded font-mono'>
//                       Level {book.inlingua_level}
//                     </span>
//                   )}
//                 </li>
//               ))}
//             </ul>
//           </div>
//         )}

//         <p className='text-zinc-500 text-sm text-balance'>
//           Your results have been recorded. Our team will review your score shortly.
//         </p>

//         <Button
//           size='lg'
//           className='w-full'
//           onClick={() => (window.location.href = '/')}
//         >
//           Finish
//         </Button>
//       </div>
//     )
//   }

//   if (error) {
//     return (
//       <div className='text-center p-10 border-2 border-dashed rounded-xl'>
//         <p className='text-red-500 font-medium mb-4'>{error}</p>
//         <Button onClick={() => window.location.reload()}>Retry</Button>
//       </div>
//     )
//   }

//   return (
//     <div className='space-y-8'>
//       <div className='border-b pb-4'>
//         <div className='flex justify-between items-end'>
//           <div>
//             <h1 className='text-xl font-bold uppercase tracking-tight text-zinc-400'>
//               {initialSession.testType} Placement Test
//             </h1>
//             <div className='text-sm font-medium text-zinc-400 mt-1'>
//               Question {stats.totalAnswered + 1}
//             </div>
//           </div>

//           {currentQuestion && !loading && (
//             <div className='px-2 py-1 bg-amber-100 text-amber-700 text-[12px] font-bold rounded border border-amber-200 uppercase tracking-tighter mb-1'>
//               Dev Mode: Level {currentQuestion.level}
//             </div>
//           )}
//         </div>
//       </div>

//       <div className='min-h-[500px] flex flex-col'>
//         {loading || isSaving || !currentQuestion ? (
//           <div className='flex-1 flex flex-col items-center justify-center space-y-4'>
//             <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600' />
//             <p className='text-zinc-500 italic'>
//               {isSaving ? 'Finalizing...' : 'Loading question...'}
//             </p>
//           </div>
//         ) : (
//           <div className='animate-in fade-in duration-500 space-y-6'>
//             <h2 className='text-2xl font-semibold leading-snug'>
//               {currentQuestion.question_text}
//             </h2>

//             {currentQuestion.q_type === 'dialogue' &&
//               currentQuestion.image_url && (
//                 <div className='flex flex-col w-full mb-4'>
//                   {currentQuestion.transcript && (
//                     <div className='self-start ml-4 mb-3 relative bg-white border border-zinc-200 rounded-2xl px-6 py-3 shadow-sm'>
//                       <p className='text-lg text-zinc-700'>
//                         {currentQuestion.transcript}
//                       </p>
//                       <div className='absolute -bottom-2 left-6 w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[8px] border-t-zinc-200' />
//                       <div className='absolute -bottom-[7px] left-6 w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[8px] border-t-white' />
//                     </div>
//                   )}

//                   <div className='rounded-xl overflow-hidden border bg-white'>
//                     <img
//                       key={`img-${currentQuestion.id}`}
//                       src={currentQuestion.image_url}
//                       alt='Dialogue Context'
//                       className='w-full h-auto object-contain max-h-[400px] mx-auto'
//                     />
//                   </div>

//                   <div className='self-end mr-12 mt-3 relative bg-white border border-zinc-200 rounded-2xl w-28 h-12 flex items-center justify-center shadow-sm'>
//                     <div className='flex gap-1.5'>
//                       <span className='w-1.5 h-1.5 bg-zinc-300 rounded-full animate-bounce [animation-delay:-0.3s]' />
//                       <span className='w-1.5 h-1.5 bg-zinc-300 rounded-full animate-bounce [animation-delay:-0.15s]' />
//                       <span className='w-1.5 h-1.5 bg-zinc-300 rounded-full animate-bounce' />
//                     </div>
//                     <div className='absolute -top-2 right-8 w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-b-[8px] border-b-zinc-200' />
//                     <div className='absolute -top-[7px] right-8 w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-b-[8px] border-b-white' />
//                   </div>
//                 </div>
//               )}

//             {currentQuestion.q_type === 'image_listen_choose' && (
//               <div className='space-y-6'>
//                 {currentQuestion.image_url && (
//                   <div className='rounded-xl overflow-hidden border bg-white max-w-md mx-auto shadow-sm'>
//                     <img
//                       src={currentQuestion.image_url}
//                       alt='Context'
//                       className='w-full h-auto object-contain max-h-[350px] mx-auto'
//                     />
//                   </div>
//                 )}

//                 <div className='grid grid-cols-1 sm:grid-cols-3 gap-6'>
//                   {['a', 'b', 'c'].map((letter) => {
//                     const audioUrl = currentQuestion.options?.[letter]
//                     if (!audioUrl) return null

//                     return (
//                       <ImageListenOptionCard
//                         key={`${currentQuestion.id}-${letter}`}
//                         letter={letter}
//                         audioUrl={audioUrl}
//                         mediaPlaying={mediaPlaying}
//                         setMediaPlaying={setMediaPlaying}
//                         onSelectOption={() =>
//                           handleAnswer(
//                             letter === currentQuestion.correct_answer,
//                           )
//                         }
//                       />
//                     )
//                   })}
//                 </div>
//               </div>
//             )}

//             {currentQuestion.q_type === 'image_context' &&
//               currentQuestion.image_url && (
//                 <div className='rounded-xl overflow-hidden border bg-white mb-4'>
//                   <img
//                     key={`img-${currentQuestion.id}`}
//                     src={currentQuestion.image_url}
//                     alt='Context'
//                     className='w-full h-auto object-contain max-h-[400px] mx-auto'
//                   />
//                 </div>
//               )}

//             {(currentQuestion.q_type === 'audio' ||
//               currentQuestion.q_type === 'listen_choose') &&
//               currentQuestion.audio_url && (
//                 <AudioPlayerCard
//                   questionId={currentQuestion.id}
//                   audioUrl={currentQuestion.audio_url}
//                   mediaPlaying={mediaPlaying}
//                   setMediaPlaying={setMediaPlaying}
//                   playedMediaIds={playedMediaIds}
//                   setPlayedMediaIds={setPlayedMediaIds}
//                 />
//               )}

//             {currentQuestion.q_type === 'video' &&
//               currentQuestion.video_url && (
//                 <VideoPlayerCard
//                   questionId={currentQuestion.id}
//                   videoUrl={currentQuestion.video_url}
//                   mediaPlaying={mediaPlaying}
//                   setMediaPlaying={setMediaPlaying}
//                   playedMediaIds={playedMediaIds}
//                   setPlayedMediaIds={setPlayedMediaIds}
//                 />
//               )}

//             <div className='grid gap-4'>
//               {currentQuestion.q_type === 'listen_choose' ? (
//                 <div className='grid grid-cols-1 sm:grid-cols-3 gap-4'>
//                   {['a', 'b', 'c'].map((letter) => (
//                     <button
//                       key={`${currentQuestion.id}-${letter}`}
//                       onClick={() =>
//                         handleAnswer(letter === currentQuestion.correct_answer)
//                       }
//                       className='group relative aspect-square overflow-hidden rounded-2xl border-2 border-zinc-200 bg-white p-3 transition-all hover:border-zinc-900 hover:shadow-md active:scale-95'
//                     >
//                       <img
//                         src={currentQuestion.options[letter]}
//                         alt={`Option ${letter}`}
//                         className='h-full w-full object-contain'
//                       />
//                       <div className='absolute bottom-3 right-3 flex h-7 w-7 items-center justify-center rounded-full bg-zinc-100 text-xs font-bold uppercase text-zinc-400 group-hover:bg-zinc-900 group-hover:text-white transition-colors'>
//                         {letter}
//                       </div>
//                     </button>
//                   ))}
//                 </div>
//               ) : currentQuestion.q_type === 'image_listen_choose' ? null : (
//                 <div
//                   className={
//                     currentQuestion.q_type === 'dialogue'
//                       ? 'flex flex-wrap gap-4 justify-center bg-blue-50/20 p-8 rounded-2xl border border-blue-100/50'
//                       : 'grid gap-4'
//                   }
//                 >
//                   {['a', 'b', 'c', 'd'].map((letter) => {
//                     const optionText = currentQuestion.options?.[letter]
//                     if (!optionText) return null

//                     if (currentQuestion.q_type === 'dialogue') {
//                       return (
//                         <Button
//                           key={`${currentQuestion.id}-${letter}`}
//                           variant='outline'
//                           className='h-auto py-4 px-8 rounded-full border-2 border-blue-200 text-blue-700 bg-white shadow-sm hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all text-lg font-medium'
//                           onClick={() =>
//                             handleAnswer(
//                               letter === currentQuestion.correct_answer,
//                             )
//                           }
//                         >
//                           {optionText}
//                         </Button>
//                       )
//                     }

//                     return (
//                       <Button
//                         key={`${currentQuestion.id}-${letter}`}
//                         variant='outline'
//                         className='h-auto min-h-[4.5rem] justify-start px-6 text-left text-lg py-4 hover:bg-zinc-50 hover:border-zinc-400 transition-all group'
//                         onClick={() =>
//                           handleAnswer(
//                             letter === currentQuestion.correct_answer,
//                           )
//                         }
//                       >
//                         <span className='mr-4 shrink-0 flex items-center justify-center w-8 h-8 rounded-full border border-zinc-200 bg-zinc-50 group-hover:bg-zinc-900 group-hover:text-white text-sm font-bold uppercase transition-colors'>
//                           {letter}
//                         </span>
//                         <span className='flex-1'>{optionText}</span>
//                       </Button>
//                     )
//                   })}
//                 </div>
//               )}
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   )
// }

// // --- SUB-COMPONENTS ---

// interface ImageListenOptionProps {
//   letter: string
//   audioUrl: string
//   mediaPlaying: boolean
//   setMediaPlaying: (playing: boolean) => void
//   onSelectOption: () => void
// }

// function ImageListenOptionCard({
//   letter,
//   audioUrl,
//   mediaPlaying,
//   setMediaPlaying,
//   onSelectOption,
// }: ImageListenOptionProps) {
//   const audioRef = useRef<HTMLAudioElement | null>(null)

//   return (
//     <div className='flex flex-col items-center gap-4 p-4 border border-zinc-200 rounded-2xl bg-zinc-50/50 shadow-sm'>
//       <div className='flex items-center justify-center w-full'>
//         <audio
//           ref={audioRef}
//           src={audioUrl}
//           onPlay={() => setMediaPlaying(true)}
//           onEnded={() => setMediaPlaying(false)}
//           onPause={() => setMediaPlaying(false)}
//         />
//         <button
//           type='button'
//           disabled={mediaPlaying}
//           className='flex items-center justify-center w-14 h-14 rounded-full bg-amber-500 hover:bg-amber-600 transition-all shadow-md active:scale-95 disabled:opacity-50 disabled:pointer-events-none'
//           onClick={() => {
//             if (mediaPlaying || !audioRef.current) return
//             audioRef.current.play()
//           }}
//         >
//           <svg
//             className='w-7 h-7 text-white fill-current ml-1'
//             viewBox='0 0 24 24'
//           >
//             <path d='M8 5v14l11-7z' />
//           </svg>
//         </button>
//       </div>

//       <button
//         type='button'
//         className='w-full h-24 rounded-xl border border-zinc-200 bg-white hover:bg-emerald-600 hover:border-emerald-600 text-emerald-600 hover:text-white transition-all shadow-sm group active:scale-95 flex items-center justify-center p-0 overflow-hidden'
//         onClick={onSelectOption}
//       >
//         <svg
//           style={{ width: '60px', height: '60px' }}
//           className='shrink-0 transition-transform group-hover:scale-110'
//           fill='none'
//           stroke='currentColor'
//           strokeWidth={3.5}
//           viewBox='0 0 24 24'
//         >
//           <path
//             strokeLinecap='round'
//             strokeLinejoin='round'
//             d='M5 13l4 4L19 7'
//           />
//         </svg>
//       </button>
//     </div>
//   )
// }

// interface MediaProps {
//   questionId: string
//   mediaPlaying: boolean
//   setMediaPlaying: (playing: boolean) => void
//   playedMediaIds: string[]
//   setPlayedMediaIds: React.Dispatch<React.SetStateAction<string[]>>
// }

// function AudioPlayerCard({
//   questionId,
//   audioUrl,
//   mediaPlaying,
//   setMediaPlaying,
//   playedMediaIds,
//   setPlayedMediaIds,
// }: MediaProps & { audioUrl: string }) {
//   const isPlayed = playedMediaIds.includes(questionId)
//   const audioRef = useRef<HTMLAudioElement | null>(null)

//   return (
//     <div className='bg-zinc-50 p-8 rounded-2xl border mb-6 max-w-xl mx-auto w-full text-center space-y-4 shadow-sm'>
//       <audio
//         ref={audioRef}
//         key={audioUrl}
//         src={audioUrl}
//         onEnded={() => {
//           setMediaPlaying(false)
//           setPlayedMediaIds((prev) => [...prev, questionId])
//         }}
//       />

//       <div className='flex justify-center items-center py-2'>
//         <button
//           disabled={mediaPlaying || isPlayed}
//           className={`relative flex items-center justify-center w-20 h-20 rounded-full transition-all duration-300 shadow-md ${
//             isPlayed
//               ? 'bg-zinc-200 text-zinc-400 cursor-not-allowed shadow-none'
//               : mediaPlaying
//                 ? 'bg-amber-500 text-white cursor-default scale-95'
//                 : 'bg-amber-500 hover:bg-amber-600 text-white hover:scale-105 active:scale-95'
//           }`}
//           onClick={() => {
//             if (audioRef.current) {
//               audioRef.current.play()
//               setMediaPlaying(true)
//             }
//           }}
//         >
//           {mediaPlaying && (
//             <span className='absolute inset-0 rounded-full bg-amber-400/40 animate-ping pointer-events-none' />
//           )}

//           {isPlayed ? (
//             <svg
//               className='w-8 h-8'
//               fill='none'
//               stroke='currentColor'
//               viewBox='0 0 24 24'
//             >
//               <path
//                 strokeLinecap='round'
//                 strokeLinejoin='round'
//                 strokeWidth={2.5}
//                 d='M5 13l4 4L19 7'
//               />
//             </svg>
//           ) : mediaPlaying ? (
//             <div className='flex items-end gap-1 h-6'>
//               <span
//                 className='w-1 bg-white rounded-full animate-bounce h-full'
//                 style={{ animationDuration: '0.6s' }}
//               />
//               <span
//                 className='w-1 bg-white rounded-full animate-bounce h-3/4'
//                 style={{ animationDuration: '0.4s' }}
//               />
//               <span
//                 className='w-1 bg-white rounded-full animate-bounce h-1/2'
//                 style={{ animationDuration: '0.8s' }}
//               />
//             </div>
//           ) : (
//             <svg
//               className='w-8 h-8 ml-1'
//               fill='currentColor'
//               viewBox='0 0 24 24'
//             >
//               <polygon points='5,3 19,12 5,21' />
//             </svg>
//           )}
//         </button>
//       </div>

//       <div className='space-y-1'>
//         <p className='text-sm font-semibold text-zinc-700'>
//           {isPlayed
//             ? 'Audio Completed'
//             : mediaPlaying
//               ? 'Listen closely...'
//               : 'Listen once only'}
//         </p>
//       </div>
//     </div>
//   )
// }

// function VideoPlayerCard({
//   questionId,
//   videoUrl,
//   mediaPlaying,
//   setMediaPlaying,
//   playedMediaIds,
//   setPlayedMediaIds,
// }: MediaProps & { videoUrl: string }) {
//   const isPlayed = playedMediaIds.includes(questionId)
//   const videoRef = useRef<HTMLVideoElement | null>(null)

//   return (
//     <div className='bg-zinc-950 rounded-2xl border shadow-md max-w-2xl mx-auto w-full overflow-hidden mb-6 relative group aspect-video'>
//       <video
//         ref={videoRef}
//         key={videoUrl}
//         playsInline
//         className='w-full h-full object-contain mx-auto bg-black'
//         onEnded={() => {
//           setMediaPlaying(false)
//           setPlayedMediaIds((prev) => [...prev, questionId])
//         }}
//       >
//         <source src={videoUrl} type='video/mp4' />
//       </video>

//       {(!mediaPlaying || isPlayed) && (
//         <div className='absolute inset-0 bg-black/50 backdrop-blur-[1px] flex flex-col items-center justify-center p-4 transition-all'>
//           <button
//             disabled={isPlayed}
//             className={`flex items-center justify-center w-20 h-20 rounded-full transition-all duration-300 shadow-xl ${
//               isPlayed
//                 ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed shadow-none'
//                 : 'bg-amber-500 hover:bg-amber-600 text-white hover:scale-105 active:scale-95'
//             }`}
//             onClick={() => {
//               if (videoRef.current) {
//                 videoRef.current.play()
//                 setMediaPlaying(true)
//               }
//             }}
//           >
//             {isPlayed ? (
//               <svg
//                 className='w-8 h-8'
//                 fill='none'
//                 stroke='currentColor'
//                 viewBox='0 0 24 24'
//               >
//                 <path
//                   strokeLinecap='round'
//                   strokeLinejoin='round'
//                   strokeWidth={2.5}
//                   d='M5 13l4 4L19 7'
//                 />
//               </svg>
//             ) : (
//               <svg
//                 className='w-8 h-8 ml-1'
//                 fill='currentColor'
//                 viewBox='0 0 24 24'
//               >
//                 <polygon points='5,3 19,12 5,21' />
//               </svg>
//             )}
//           </button>

//           <p className='text-xs text-zinc-300 mt-3 font-medium tracking-wide bg-black/40 px-3 py-1 rounded-full backdrop-blur-sm'>
//             {isPlayed ? 'Video Locked' : 'Watch once only'}
//           </p>
//         </div>
//       )}

//       {mediaPlaying && !isPlayed && (
//         <div className='absolute top-3 left-3 bg-black/70 backdrop-blur text-white px-2.5 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 pointer-events-none'>
//           <span className='h-2 w-2 rounded-full bg-red-500 animate-pulse' />
//           Playing Once
//         </div>
//       )}
//     </div>
//   )
// }

// src\components\test\AdaptiveTestController.tsx

'use client'

import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { createClient } from '@/lib/client'
import { Button } from '@/components/ui/button'
import { updateTestResult } from '@/app/actions'
import { TEST_STRATEGIES } from '@/logic/adaptive/strategies'
import { StrategyName } from '@/types/test'
import { getLevelsForTestType } from '@/types/level-config'

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

export default function AdaptiveTestController({
  initialSession,
  strategyName = 'SIX_QUESTION_DYNAMIC',
}: Props) {
  const supabase = useMemo(() => createClient(), [])
  const hasInitialized = useRef(false)

  // Retrieve category-specific level ladder (e.g. ['Pre-A1', 'A1', 'A1+'] for Prathom)
  const categoryLevels = useMemo(
    () => getLevelsForTestType(initialSession.testType),
    [initialSession.testType],
  )

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

  const [stats, setStats] = useState({
    currentLevel: initialSession.startingLevel,
    totalAnswered: 0,
    isFinished: false,
  })

  const calculateNextLevel = useCallback(
    (
      current: string,
      direction: 'up' | 'down',
      floorLevel: string | null,
    ): string => {
      const idx = categoryLevels.findIndex(
        (l) => l.toLowerCase() === current.toLowerCase(),
      )
      if (idx === -1) return current

      if (direction === 'up') {
        return idx < categoryLevels.length - 1
          ? categoryLevels[idx + 1]
          : categoryLevels[idx]
      }

      if (direction === 'down') {
        if (floorLevel) {
          const floorIdx = categoryLevels.findIndex(
            (l) => l.toLowerCase() === floorLevel.toLowerCase(),
          )
          if (idx <= floorIdx) return categoryLevels[idx]
        }
        return idx > 0 ? categoryLevels[idx - 1] : categoryLevels[idx]
      }

      return current
    },
    [categoryLevels],
  )

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

      const { data: booksData } = await supabase
        .from('books')
        .select('id, name, inlingua_level')
        .eq('cefr_level', finalLevel)
        .eq('test_identity', initialSession.testType)
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

      let query = supabase
        .from('test_questions')
        .select('*')
        .eq('test_type', testType)
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
      } else if (!data) {
        await finalizeTest(level, currentTotalAnswered, historyEntries)
      } else {
        setCurrentQuestion(data as Question)
      }
      setLoading(false)
    },
    [supabase, finalizeTest],
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

    if (total >= strategy.maxQuestions) {
      await finalizeTest(stats.currentLevel, total, updatedFullHistory)
      return
    }

    const newLevelHistory = [...currentLevelHistory, isCorrect]
    let nextLevel = stats.currentLevel
    let levelChanged = false
    let updatedFloor = highestPassedLevel

    if (strategy.shouldMoveUp(newLevelHistory)) {
      const currentIdx = categoryLevels.findIndex(
        (l) => l.toLowerCase() === stats.currentLevel.toLowerCase(),
      )
      const prevFloorIdx = categoryLevels.findIndex(
        (l) => l.toLowerCase() === (highestPassedLevel || '').toLowerCase(),
      )

      if (currentIdx > prevFloorIdx) {
        updatedFloor = stats.currentLevel
        setHighestPassedLevel(updatedFloor)
      }

      nextLevel = calculateNextLevel(stats.currentLevel, 'up', updatedFloor)
      levelChanged = nextLevel !== stats.currentLevel
    } else if (strategy.shouldMoveDown(newLevelHistory)) {
      nextLevel = calculateNextLevel(
        stats.currentLevel,
        'down',
        highestPassedLevel,
      )
      levelChanged = nextLevel !== stats.currentLevel
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

    fetchQuestion(
      initialSession.testType,
      nextLevel,
      updatedUsedIds,
      total,
      updatedFullHistory,
    )
  }

  if (stats.isFinished) {
    return (
      // <div className='text-center space-y-6 py-10 max-w-md mx-auto'>
      //   <h2 className='text-3xl font-bold'>Test Complete!</h2>

      //   <div className='p-8 bg-amber-100 text-amber-800 rounded-2xl w-full shadow-sm'>
      //     <p className='text-xs uppercase tracking-widest font-bold text-amber-600 mb-1'>
      //       DEV MODE: Estimated Level
      //     </p>
      //     <span className='text-6xl font-black'>{stats.currentLevel}</span>
      //   </div>

      //   {recommendedBooks.length > 0 && (
      //     <div className='p-6 bg-zinc-50 border border-zinc-200 rounded-2xl text-left space-y-3 shadow-sm'>
      //       <h3 className='text-xs font-bold uppercase tracking-wider text-zinc-500'>
      //         Recommended Coursebooks ({initialSession.testType})
      //       </h3>
      //       <ul className='space-y-2.5'>
      //         {recommendedBooks.map((book) => (
      //           <li
      //             key={book.id}
      //             className='flex items-center justify-between text-zinc-800 font-medium text-sm'
      //           >
      //             <div className='flex items-center gap-2'>
      //               <span className='text-amber-500'>📖</span>
      //               <span>{book.name}</span>
      //             </div>
      //             {book.inlingua_level !== null && (
      //               <span className='text-xs bg-zinc-200 text-zinc-700 px-2 py-0.5 rounded font-mono'>
      //                 Level {book.inlingua_level}
      //               </span>
      //             )}
      //           </li>
      //         ))}
      //       </ul>
      //     </div>
      //   )}

      //   <p className='text-zinc-500 text-sm text-balance'>
      //     Your results have been recorded. Our team will review your score shortly.
      //   </p>

      //   <Button
      //     size='lg'
      //     className='w-full'
      //     onClick={() => (window.location.href = '/')}
      //   >
      //     Finish
      //   </Button>
      // </div>
      <div className='text-center space-y-6 py-10 max-w-md mx-auto'>
  <h2 className='text-3xl font-bold'>Test Complete!</h2>

  {/* Compacted Dev Badge Box */}
  <div className='py-2.5 px-4 bg-amber-50 text-amber-900 rounded-xl w-full border border-amber-200/60 shadow-xs flex items-center justify-between'>
    <span className='text-[11px] uppercase tracking-wider font-bold text-amber-700'>
      DEV MODE: Estimated Level
    </span>
    <span className='text-xl font-black bg-amber-200/80 px-3 py-0.5 rounded-md text-amber-950 font-mono'>
      {stats.currentLevel}
    </span>
  </div>

  {/* Prominent Recommended Coursebooks Section */}
  {recommendedBooks.length > 0 && (
    <div className='rounded-2xl border border-zinc-200 bg-white text-left shadow-md overflow-hidden transition-all'>
      <div className='bg-zinc-900 px-6 py-3.5 flex items-center justify-between'>
        <h3 className='text-xs font-bold uppercase tracking-widest text-zinc-200 flex items-center gap-2'>
          <span>📚</span>
          <span>Recommended Coursebook{recommendedBooks.length > 1 ? 's' : ''}</span>
        </h3>
        <span className='text-[10px] uppercase font-semibold text-zinc-400 bg-zinc-800 px-2 py-0.5 rounded border border-zinc-700/50'>
          {initialSession.testType}
        </span>
      </div>

      <div className='p-6'>
        <ul className='divide-y divide-zinc-100'>
          {recommendedBooks.map((book) => (
            <li
              key={book.id}
              className='py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-3'
            >
              <div className='flex items-center gap-3 min-w-0'>
                <div className='w-8 h-8 rounded-lg bg-amber-50 border border-amber-200/50 flex items-center justify-center shrink-0 text-amber-600 text-sm'>
                  📖
                </div>
                <span className='text-zinc-900 font-semibold text-base truncate'>
                  {book.name}
                </span>
              </div>
              {book.inlingua_level !== null && (
                <span className='shrink-0 text-xs bg-amber-100 text-amber-800 font-semibold px-2.5 py-1 rounded-md border border-amber-200/60 font-mono'>
                  Level {book.inlingua_level}
                </span>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )}

  <p className='text-zinc-500 text-sm text-balance'>
    Your results have been recorded. Our team will review your score shortly.
  </p>

  <Button
    size='lg'
    className='w-full text-base font-semibold py-6 shadow-sm'
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
            <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600' />
            <p className='text-zinc-500 italic'>
              {isSaving ? 'Finalizing...' : 'Loading question...'}
            </p>
          </div>
        ) : (
          <div className='animate-in fade-in duration-500 space-y-6'>
            <h2 className='text-2xl font-semibold leading-snug'>
              {currentQuestion.question_text}
            </h2>

            {currentQuestion.q_type === 'dialogue' &&
              currentQuestion.image_url && (
                <div className='flex flex-col w-full mb-4'>
                  {currentQuestion.transcript && (
                    <div className='self-start ml-4 mb-3 relative bg-white border border-zinc-200 rounded-2xl px-6 py-3 shadow-sm'>
                      <p className='text-lg text-zinc-700'>
                        {currentQuestion.transcript}
                      </p>
                      <div className='absolute -bottom-2 left-6 w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[8px] border-t-zinc-200' />
                      <div className='absolute -bottom-[7px] left-6 w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[8px] border-t-white' />
                    </div>
                  )}

                  <div className='rounded-xl overflow-hidden border bg-white'>
                    <img
                      key={`img-${currentQuestion.id}`}
                      src={currentQuestion.image_url}
                      alt='Dialogue Context'
                      className='w-full h-auto object-contain max-h-[400px] mx-auto'
                    />
                  </div>

                  <div className='self-end mr-12 mt-3 relative bg-white border border-zinc-200 rounded-2xl w-28 h-12 flex items-center justify-center shadow-sm'>
                    <div className='flex gap-1.5'>
                      <span className='w-1.5 h-1.5 bg-zinc-300 rounded-full animate-bounce [animation-delay:-0.3s]' />
                      <span className='w-1.5 h-1.5 bg-zinc-300 rounded-full animate-bounce [animation-delay:-0.15s]' />
                      <span className='w-1.5 h-1.5 bg-zinc-300 rounded-full animate-bounce' />
                    </div>
                    <div className='absolute -top-2 right-8 w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-b-[8px] border-b-zinc-200' />
                    <div className='absolute -top-[7px] right-8 w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-b-[8px] border-b-white' />
                  </div>
                </div>
              )}

            {currentQuestion.q_type === 'image_listen_choose' && (
              <div className='space-y-6'>
                {currentQuestion.image_url && (
                  <div className='rounded-xl overflow-hidden border bg-white max-w-md mx-auto shadow-sm'>
                    <img
                      src={currentQuestion.image_url}
                      alt='Context'
                      className='w-full h-auto object-contain max-h-[350px] mx-auto'
                    />
                  </div>
                )}

                <div className='grid grid-cols-1 sm:grid-cols-3 gap-6'>
                  {['a', 'b', 'c'].map((letter) => {
                    const audioUrl = currentQuestion.options?.[letter]
                    if (!audioUrl) return null

                    return (
                      <ImageListenOptionCard
                        key={`${currentQuestion.id}-${letter}`}
                        letter={letter}
                        audioUrl={audioUrl}
                        mediaPlaying={mediaPlaying}
                        setMediaPlaying={setMediaPlaying}
                        onSelectOption={() =>
                          handleAnswer(
                            letter === currentQuestion.correct_answer,
                          )
                        }
                      />
                    )
                  })}
                </div>
              </div>
            )}

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

            {(currentQuestion.q_type === 'audio' ||
              currentQuestion.q_type === 'listen_choose') &&
              currentQuestion.audio_url && (
                <AudioPlayerCard
                  questionId={currentQuestion.id}
                  audioUrl={currentQuestion.audio_url}
                  mediaPlaying={mediaPlaying}
                  setMediaPlaying={setMediaPlaying}
                  playedMediaIds={playedMediaIds}
                  setPlayedMediaIds={setPlayedMediaIds}
                />
              )}

            {currentQuestion.q_type === 'video' &&
              currentQuestion.video_url && (
                <VideoPlayerCard
                  questionId={currentQuestion.id}
                  videoUrl={currentQuestion.video_url}
                  mediaPlaying={mediaPlaying}
                  setMediaPlaying={setMediaPlaying}
                  playedMediaIds={playedMediaIds}
                  setPlayedMediaIds={setPlayedMediaIds}
                />
              )}

            <div className='grid gap-4'>
              {currentQuestion.q_type === 'listen_choose' ? (
                <div className='grid grid-cols-1 sm:grid-cols-3 gap-4'>
                  {['a', 'b', 'c'].map((letter) => {
                    const imageUrl = currentQuestion.options?.[letter]
                    if (!imageUrl) return null

                    return (
                      <button
                        key={`${currentQuestion.id}-${letter}`}
                        onClick={() =>
                          handleAnswer(letter === currentQuestion.correct_answer)
                        }
                        className='group relative aspect-square overflow-hidden rounded-2xl border-2 border-zinc-200 bg-white p-3 transition-all hover:border-zinc-900 hover:shadow-md active:scale-95'
                      >
                        <img
                          src={imageUrl}
                          alt={`Option ${letter}`}
                          className='h-full w-full object-contain'
                        />
                        <div className='absolute bottom-3 right-3 flex h-7 w-7 items-center justify-center rounded-full bg-zinc-100 text-xs font-bold uppercase text-zinc-400 group-hover:bg-zinc-900 group-hover:text-white transition-colors'>
                          {letter}
                        </div>
                      </button>
                    )
                  })}
                </div>
              ) : currentQuestion.q_type === 'image_listen_choose' ? null : (
                <div
                  className={
                    currentQuestion.q_type === 'dialogue'
                      ? 'flex flex-wrap gap-4 justify-center bg-blue-50/20 p-8 rounded-2xl border border-blue-100/50'
                      : 'grid gap-4'
                  }
                >
                  {['a', 'b', 'c', 'd'].map((letter) => {
                    const optionText = currentQuestion.options?.[letter]
                    if (!optionText) return null

                    if (currentQuestion.q_type === 'dialogue') {
                      return (
                        <Button
                          key={`${currentQuestion.id}-${letter}`}
                          variant='outline'
                          className='h-auto py-4 px-8 rounded-full border-2 border-blue-200 text-blue-700 bg-white shadow-sm hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all text-lg font-medium'
                          onClick={() =>
                            handleAnswer(
                              letter === currentQuestion.correct_answer,
                            )
                          }
                        >
                          {optionText}
                        </Button>
                      )
                    }

                    return (
                      <Button
                        key={`${currentQuestion.id}-${letter}`}
                        variant='outline'
                        className='h-auto min-h-[4.5rem] justify-start px-6 text-left text-lg py-4 hover:bg-zinc-50 hover:border-zinc-400 transition-all group'
                        onClick={() =>
                          handleAnswer(
                            letter === currentQuestion.correct_answer,
                          )
                        }
                      >
                        <span className='mr-4 shrink-0 flex items-center justify-center w-8 h-8 rounded-full border border-zinc-200 bg-zinc-50 group-hover:bg-zinc-900 group-hover:text-white text-sm font-bold uppercase transition-colors'>
                          {letter}
                        </span>
                        <span className='flex-1'>{optionText}</span>
                      </Button>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// --- SUB-COMPONENTS ---

interface ImageListenOptionProps {
  letter: string
  audioUrl: string
  mediaPlaying: boolean
  setMediaPlaying: (playing: boolean) => void
  onSelectOption: () => void
}

function ImageListenOptionCard({
  audioUrl,
  mediaPlaying,
  setMediaPlaying,
  onSelectOption,
}: ImageListenOptionProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null)

  return (
    <div className='flex flex-col items-center gap-4 p-4 border border-zinc-200 rounded-2xl bg-zinc-50/50 shadow-sm'>
      <div className='flex items-center justify-center w-full'>
        <audio
          ref={audioRef}
          src={audioUrl}
          onPlay={() => setMediaPlaying(true)}
          onEnded={() => setMediaPlaying(false)}
          onPause={() => setMediaPlaying(false)}
        />
        <button
          type='button'
          disabled={mediaPlaying}
          className='flex items-center justify-center w-14 h-14 rounded-full bg-amber-500 hover:bg-amber-600 transition-all shadow-md active:scale-95 disabled:opacity-50 disabled:pointer-events-none'
          onClick={() => {
            if (mediaPlaying || !audioRef.current) return
            audioRef.current.play()
          }}
        >
          <svg
            className='w-7 h-7 text-white fill-current ml-1'
            viewBox='0 0 24 24'
          >
            <path d='M8 5v14l11-7z' />
          </svg>
        </button>
      </div>

      <button
        type='button'
        className='w-full h-24 rounded-xl border border-zinc-200 bg-white hover:bg-emerald-600 hover:border-emerald-600 text-emerald-600 hover:text-white transition-all shadow-sm group active:scale-95 flex items-center justify-center p-0 overflow-hidden'
        onClick={onSelectOption}
      >
        <svg
          style={{ width: '60px', height: '60px' }}
          className='shrink-0 transition-transform group-hover:scale-110'
          fill='none'
          stroke='currentColor'
          strokeWidth={3.5}
          viewBox='0 0 24 24'
        >
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            d='M5 13l4 4L19 7'
          />
        </svg>
      </button>
    </div>
  )
}

interface MediaProps {
  questionId: string
  mediaPlaying: boolean
  setMediaPlaying: (playing: boolean) => void
  playedMediaIds: string[]
  setPlayedMediaIds: React.Dispatch<React.SetStateAction<string[]>>
}

function AudioPlayerCard({
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
    <div className='bg-zinc-50 p-8 rounded-2xl border mb-6 max-w-xl mx-auto w-full text-center space-y-4 shadow-sm'>
      <audio
        ref={audioRef}
        key={audioUrl}
        src={audioUrl}
        onEnded={() => {
          setMediaPlaying(false)
          setPlayedMediaIds((prev) => [...prev, questionId])
        }}
      />

      <div className='flex justify-center items-center py-2'>
        <button
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
            <span className='absolute inset-0 rounded-full bg-amber-400/40 animate-ping pointer-events-none' />
          )}

          {isPlayed ? (
            <svg
              className='w-8 h-8'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2.5}
                d='M5 13l4 4L19 7'
              />
            </svg>
          ) : mediaPlaying ? (
            <div className='flex items-end gap-1 h-6'>
              <span
                className='w-1 bg-white rounded-full animate-bounce h-full'
                style={{ animationDuration: '0.6s' }}
              />
              <span
                className='w-1 bg-white rounded-full animate-bounce h-3/4'
                style={{ animationDuration: '0.4s' }}
              />
              <span
                className='w-1 bg-white rounded-full animate-bounce h-1/2'
                style={{ animationDuration: '0.8s' }}
              />
            </div>
          ) : (
            <svg
              className='w-8 h-8 ml-1'
              fill='currentColor'
              viewBox='0 0 24 24'
            >
              <polygon points='5,3 19,12 5,21' />
            </svg>
          )}
        </button>
      </div>

      <div className='space-y-1'>
        <p className='text-sm font-semibold text-zinc-700'>
          {isPlayed
            ? 'Audio Completed'
            : mediaPlaying
              ? 'Listen closely...'
              : 'Listen once only'}
        </p>
      </div>
    </div>
  )
}

function VideoPlayerCard({
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
    <div className='bg-zinc-950 rounded-2xl border shadow-md max-w-2xl mx-auto w-full overflow-hidden mb-6 relative group aspect-video'>
      <video
        ref={videoRef}
        key={videoUrl}
        playsInline
        className='w-full h-full object-contain mx-auto bg-black'
        onEnded={() => {
          setMediaPlaying(false)
          setPlayedMediaIds((prev) => [...prev, questionId])
        }}
      >
        <source src={videoUrl} type='video/mp4' />
      </video>

      {(!mediaPlaying || isPlayed) && (
        <div className='absolute inset-0 bg-black/50 backdrop-blur-[1px] flex flex-col items-center justify-center p-4 transition-all'>
          <button
            disabled={isPlayed}
            className={`flex items-center justify-center w-20 h-20 rounded-full transition-all duration-300 shadow-xl ${
              isPlayed
                ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed shadow-none'
                : 'bg-amber-500 hover:bg-amber-600 text-white hover:scale-105 active:scale-95'
            }`}
            onClick={() => {
              if (videoRef.current) {
                videoRef.current.play()
                setMediaPlaying(true)
              }
            }}
          >
            {isPlayed ? (
              <svg
                className='w-8 h-8'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2.5}
                  d='M5 13l4 4L19 7'
                />
              </svg>
            ) : (
              <svg
                className='w-8 h-8 ml-1'
                fill='currentColor'
                viewBox='0 0 24 24'
              >
                <polygon points='5,3 19,12 5,21' />
              </svg>
            )}
          </button>

          <p className='text-xs text-zinc-300 mt-3 font-medium tracking-wide bg-black/40 px-3 py-1 rounded-full backdrop-blur-sm'>
            {isPlayed ? 'Video Locked' : 'Watch once only'}
          </p>
        </div>
      )}

      {mediaPlaying && !isPlayed && (
        <div className='absolute top-3 left-3 bg-black/70 backdrop-blur text-white px-2.5 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 pointer-events-none'>
          <span className='h-2 w-2 rounded-full bg-red-500 animate-pulse' />
          Playing Once
        </div>
      )}
    </div>
  )
}