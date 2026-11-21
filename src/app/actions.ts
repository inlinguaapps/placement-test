// src/app/actions.ts
'use server'

import { createClient } from '@/lib/server'

export type TestIdentity = 'KG' | 'Prathom' | 'Mathayom' | 'Adult' | 'Adult_Listening'
export type TestCategoryInput = 'Young Learner' | 'Adult' | 'Adult_Listening'

export type QuestionHistoryEntry =
  | {
      level: string
      correct: boolean
    }
  | {
      type: 'adult_listening_score'
      scoreSummary: string
      isFinished: boolean
    }

export interface RecommendedBook {
  id: string
  name: string
  test_identity: TestIdentity
  cefr_level: string
  inlingua_level: number | null
}

const MATHAYOM_BRIDGED_LEVELS = new Set(['A2', 'A2+', 'B1', 'B1+', 'B2', 'C1', 'C2'])

const LISTENING_Q_TYPES = new Set([
  'audio',
  'listen_choose',
  'image_listen_choose',
  'dialogue',
  'video',
])

function resolveBookTestIdentity(initialTestType: string, level: string): TestIdentity {
  if (initialTestType === 'Prathom' && MATHAYOM_BRIDGED_LEVELS.has(level)) {
    return 'Mathayom'
  }
  return initialTestType as TestIdentity
}

export async function getActiveBranches(): Promise<string[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('branches')
    .select('name')
    .eq('is_active', true)

  if (error) {
    console.error('[getActiveBranches] Error:', error.message)
    return []
  }

  return data.map((b) => b.name)
}

/**
 * Fetches an existing session record without creating a new one.
 * Used by the TestPage to prevent duplicate session creation.
 */
export async function getSessionData(sessionId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('test_results')
    .select('id, test_type, started_at_level')
    .eq('id', sessionId)
    .single()

  if (error || !data) {
    console.error('[getSessionData] Error:', error?.message)
    return null
  }

  return {
    sessionId: data.id,
    testType: data.test_type as TestIdentity,
    startingLevel: (data.started_at_level as string | null) ?? '',
  }
}

export async function initializeTestSession(data: {
  name: string
  age: number
  category: TestCategoryInput
  branch: string
}) {
  const supabase = await createClient()

  // Direct session creation for Adult with Listening (bypasses test_mappings & CEFR starting level)
  if (data.category === 'Adult_Listening') {
    const { data: session, error: sessionError } = await supabase
      .from('test_results')
      .insert({
        student_name: data.name,
        age: null,
        branch_name: data.branch,
        test_type: 'Adult_Listening',
        started_at_level: null,
        status: 'started',
      })
      .select()
      .single()

    if (sessionError) {
      console.error('[initializeTestSession] Adult_Listening Insert Error:', sessionError.message)
      throw new Error('Failed to create test session')
    }

    return {
      sessionId: session.id,
      testType: 'Adult_Listening' as TestIdentity,
      startingLevel: '',
    }
  }

  const dbCategory =
    data.category === 'Young Learner' ? 'young_learner' : 'adult'

  let query = supabase
    .from('test_mappings')
    .select('test_to_serve, starting_level')
    .eq('category', dbCategory)

  if (dbCategory === 'young_learner') {
    query = query.lte('min_age', data.age).gte('max_age', data.age)
  } else {
    query = query.is('min_age', null)
  }

  const { data: mapping, error: mapError } = await query.single()

  if (mapError || !mapping) {
    throw new Error(`Mapping failed for ${data.category} age ${data.age}`)
  }

  const { data: session, error: sessionError } = await supabase
    .from('test_results')
    .insert({
      student_name: data.name,
      age: data.category === 'Young Learner' ? data.age : null,
      branch_name: data.branch,
      test_type: mapping.test_to_serve as TestIdentity,
      started_at_level: mapping.starting_level,
      status: 'started',
    })
    .select()
    .single()

  if (sessionError) {
    console.error('[initializeTestSession] Insert Error:', sessionError.message)
    throw new Error('Failed to create test session')
  }

  return {
    sessionId: session.id,
    testType: mapping.test_to_serve as TestIdentity,
    startingLevel: mapping.starting_level as string,
  }
}

/**
 * Fetches all books from the database for initial server-side load.
 */
export async function getCourseBooks(): Promise<RecommendedBook[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('books')
    .select('id, name, test_identity, cefr_level, inlingua_level')
    .order('inlingua_level', { ascending: true, nullsFirst: false })

  if (error) {
    console.error('[getCourseBooks] Error:', error.message)
    return []
  }

  return (data as RecommendedBook[]) ?? []
}

/**
 * Fetches recommended books from the database based on the student's test category
 * and exact CEFR level.
 */
export async function getRecommendedBooks(
  testIdentity: TestIdentity,
  cefrLevel: string
): Promise<RecommendedBook[]> {
  console.log(`\n🔍 [getRecommendedBooks] Searching books table for test_identity="${testIdentity}", cefr_level="${cefrLevel}"`)

  const supabase = await createClient()

  const cleanLevel = cefrLevel.trim()

  // 1. Exact match on clean level
  const { data, error } = await supabase
    .from('books')
    .select('id, name, test_identity, cefr_level, inlingua_level')
    .eq('test_identity', testIdentity)
    .eq('cefr_level', cleanLevel)
    .order('inlingua_level', { ascending: true, nullsFirst: false })

  if (error) {
    console.error('❌ [getRecommendedBooks] DB Error:', error.message)
    return []
  }

  console.log(`📊 [getRecommendedBooks] Matches found for (${testIdentity}, ${cleanLevel}):`, data?.length ?? 0)

  // 2. Fallback diagnostic log if no books found
  if (!data || data.length === 0) {
    console.warn(`⚠️ No books matched for test_identity="${testIdentity}" AND cefr_level="${cleanLevel}".`)
    
    const { data: allIdentityBooks } = await supabase
      .from('books')
      .select('name, cefr_level, inlingua_level')
      .eq('test_identity', testIdentity)

    console.log(`💡 Available books in DB for test_identity="${testIdentity}":`, allIdentityBooks)
  }

  return (data as RecommendedBook[]) ?? []
}

/**
 * Updates existing test record with CEFR result (or score summary), status,
 * question history, and matched coursebook results.
 */
export async function updateTestResult(
  sessionId: string,
  finalLevel: string,
  isFinished: boolean = false,
  questionHistory: QuestionHistoryEntry[] = [],
  recommendedBooks?: string[]
) {
  console.log('\n================ [updateTestResult] START ================')
  console.log('📌 Input sessionId:', sessionId)
  console.log('📌 Input finalLevel:', finalLevel)
  console.log('📌 Input isFinished:', isFinished)
  console.log('📌 Input recommendedBooks passed:', recommendedBooks)

  const supabase = await createClient()

  const { data: session, error: sessionError } = await supabase
    .from('test_results')
    .select('test_type')
    .eq('id', sessionId)
    .maybeSingle()

  if (sessionError) {
    console.error('❌ Error fetching session test_type:', sessionError.message)
  }

  const isListeningTest = session?.test_type === 'Adult_Listening'

  let booksToSave: string[] = isListeningTest ? [] : (recommendedBooks || [])

  // Only look up recommended books for level-based tests
  if (!isListeningTest && (!recommendedBooks || recommendedBooks.length === 0)) {
    console.log('🔍 Querying test_results by primary key `id` for test_type...')
    console.log('📦 Session record retrieved from DB:', session)

    if (session?.test_type) {
      const targetTestIdentity = resolveBookTestIdentity(session.test_type, finalLevel)

      console.log(`📚 Calling getRecommendedBooks(testIdentity: "${targetTestIdentity}", level: "${finalLevel}")...`)
      
      const books = await getRecommendedBooks(
        targetTestIdentity,
        finalLevel
      )
      
      console.log('📖 Raw books retrieved from getRecommendedBooks:', books)

      if (!books || books.length === 0) {
        console.warn(`⚠️ getRecommendedBooks returned NO books for test_type "${targetTestIdentity}" and level "${finalLevel}"`)
      }
      
      booksToSave = books ? books.map((b) => b.name) : []
      console.log('✅ Final book names to save:', booksToSave)
    } else {
      console.warn('⚠️ WARNING: Could not find session or test_type is missing/null!')
    }
  }

  const isScoreSummaryString =
    isListeningTest ||
    (typeof finalLevel === 'string' &&
      finalLevel.includes('Listening:') &&
      finalLevel.includes('Grammar:'))

  const dbFinalResult = isScoreSummaryString ? 'A1' : finalLevel
  const dbQuestionHistory: QuestionHistoryEntry[] = isScoreSummaryString
    ? [
        ...(Array.isArray(questionHistory) ? questionHistory : []),
        {
          type: 'adult_listening_score',
          scoreSummary: finalLevel,
          isFinished: Boolean(isFinished),
        },
      ]
    : questionHistory

  const updatePayload = {
    final_result: dbFinalResult,
    status: isFinished ? 'completed' : 'in_progress',
    question_history: dbQuestionHistory,
    recommended_books: booksToSave,
  }

  console.log('💾 Updating DB with payload:', updatePayload)

  const { data, error } = await supabase
    .from('test_results')
    .update(updatePayload)
    .eq('id', sessionId)
    .select()

  if (error) {
    console.error('❌ [updateTestResult] Database Error:', error.message)
    console.log('================ [updateTestResult] END ==================\n')
    return { success: false, error: error.message }
  }

  if (!data || data.length === 0) {
    console.error('❌ [updateTestResult] Record not found. No rows updated for ID:', sessionId)
    console.log('================ [updateTestResult] END ==================\n')
    return { success: false, error: 'Record not found' }
  }

  console.log('🎉 [updateTestResult] Success! Saved row in DB:', data[0])
  console.log('================ [updateTestResult] END ==================\n')

  return { success: true, recommendedBooks: booksToSave }
}

export async function deleteTestResult(sessionId: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('test_results')
    .delete()
    .eq('id', sessionId)

  if (error) {
    console.error('[deleteTestResult] Error:', error.message)
    throw new Error('Failed to delete test result')
  }

  return { success: true }
}

/**
 * Fetches the 100 listening and 50 reading questions for Adult_Listening.
 */
export async function getAdultListeningQuestions() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('test_questions')
    .select('*')
    .eq('test_type', 'Adult_Listening')
    .order('sort_order', { ascending: true, nullsFirst: false })

  if (error) {
    console.error('[getAdultListeningQuestions] Error:', error.message)
    return { listening: [], reading: [] }
  }

  const rows = data ?? []
  const listening = rows
    .filter((q) => LISTENING_Q_TYPES.has(q.q_type))
    .slice(0, 100)
  const reading = rows
    .filter((q) => !LISTENING_Q_TYPES.has(q.q_type))
    .slice(0, 50)

  return { listening, reading }
}