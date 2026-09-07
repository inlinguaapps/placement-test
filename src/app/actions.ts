// //src\app\actions.ts

// 'use server'

// import { createClient } from '@/lib/server'

// export async function getActiveBranches() {
//   const supabase = await createClient()
//   const { data, error } = await supabase
//     .from('branches')
//     .select('name')
//     .eq('is_active', true)

//   if (error) {
//     console.error('[getActiveBranches] Error:', error.message)
//     return []
//   }

//   return data.map((b) => b.name)
// }

// /**
//  * Fetches an existing session record without creating a new one.
//  * Used by the TestPage to prevent duplicate session creation.
//  */
// export async function getSessionData(sessionId: string) {
//   const supabase = await createClient()

//   const { data, error } = await supabase
//     .from('test_results')
//     .select('id, test_type, started_at_level')
//     .eq('id', sessionId)
//     .single()

//   if (error || !data) {
//     console.error('[getSessionData] Error:', error?.message)
//     return null
//   }

//   return {
//     sessionId: data.id,
//     testType: data.test_type,
//     startingLevel: data.started_at_level,
//   }
// }

// export async function initializeTestSession(data: {
//   name: string
//   age: number
//   category: 'Young Learner' | 'Adult'
//   branch: string
// }) {
//   const supabase = await createClient()

//   const dbCategory =
//     data.category === 'Young Learner' ? 'young_learner' : 'adult'

//   let query = supabase
//     .from('test_mappings')
//     .select('test_to_serve, starting_level')
//     .eq('category', dbCategory)

//   if (dbCategory === 'young_learner') {
//     query = query.lte('min_age', data.age).gte('max_age', data.age)
//   } else {
//     query = query.is('min_age', null)
//   }

//   const { data: mapping, error: mapError } = await query.single()

//   if (mapError || !mapping) {
//     throw new Error(`Mapping failed for ${data.category} age ${data.age}`)
//   }

//   const { data: session, error: sessionError } = await supabase
//     .from('test_results')
//     .insert({
//       student_name: data.name,
//       age: data.category === 'Young Learner' ? data.age : null,
//       branch_name: data.branch,
//       test_type: mapping.test_to_serve as any,
//       started_at_level: mapping.starting_level,
//       status: 'started',
//     })
//     .select()
//     .single()

//   if (sessionError) {
//     console.error('[initializeTestSession] Insert Error:', sessionError.message)
//     throw new Error('Failed to create test session')
//   }

//   return {
//     sessionId: session.id,
//     testType: mapping.test_to_serve,
//     startingLevel: mapping.starting_level,
//   }
// }

// /**
//  * Updates existing test record with CEFR result, status, and question history.
//  * Accepts the optional 4th argument to store granular question levels and outcomes.
//  */
// export async function updateTestResult(
//   sessionId: string,
//   finalLevel: string,
//   isFinished: boolean = false,
//   questionHistory: { level: string; correct: boolean }[] = [],
// ) {
//   const supabase = await createClient()

//   const { data, error } = await supabase
//     .from('test_results')
//     .update({
//       final_result: finalLevel as any,
//       status: isFinished ? 'completed' : 'in_progress',
//       question_history: questionHistory, // Maps to JSONB column in Supabase
//     })
//     .eq('id', sessionId)
//     .select()

//   if (error) {
//     console.error('[updateTestResult] Error:', error.message)
//     return { success: false, error: error.message }
//   }

//   if (!data || data.length === 0) {
//     return { success: false, error: 'Record not found' }
//   }

//   return { success: true }
// }

// export type TestIdentity = 'KG' | 'Prathom' | 'Mathayom' | 'Adult'

// export interface RecommendedBook {
//   id: string
//   name: string
//   test_identity: TestIdentity
//   cefr_level: string
//   inlingua_level: number | null
// }

// /**
//  * Fetches recommended books from the database based on the student's test category
//  * and final CEFR level (including fine-grained '+' levels like A2+).
//  */
// export async function getRecommendedBooks(
//   testIdentity: TestIdentity,
//   cefrLevel: string
// ): Promise<RecommendedBook[]> {
//   const supabase = await createClient()

//   const { data, error } = await supabase
//     .from('books')
//     .select('id, name, test_identity, cefr_level, inlingua_level')
//     .eq('test_identity', testIdentity)
//     .or(`cefr_level.eq.${cefrLevel},cefr_level.eq.${cefrLevel}+`)
//     .order('inlingua_level', { ascending: true, nullsFirst: false })

//   if (error) {
//     console.error('[getRecommendedBooks] Error fetching books:', error.message)
//     return []
//   }

//   return data ?? []
// }

// src/app/actions.ts
'use server'

import { createClient } from '@/lib/server'

export type TestIdentity = 'KG' | 'Prathom' | 'Mathayom' | 'Adult'

export interface RecommendedBook {
  id: string
  name: string
  test_identity: TestIdentity
  cefr_level: string
  inlingua_level: number | null
}

export async function getActiveBranches() {
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
    startingLevel: data.started_at_level,
  }
}

export async function initializeTestSession(data: {
  name: string
  age: number
  category: 'Young Learner' | 'Adult'
  branch: string
}) {
  const supabase = await createClient()

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
      test_type: mapping.test_to_serve as any,
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
    startingLevel: mapping.starting_level,
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
 * and final CEFR level.
 */
export async function getRecommendedBooks(
  testIdentity: TestIdentity,
  cefrLevel: string
): Promise<RecommendedBook[]> {
  console.log(`\n🔍 [getRecommendedBooks] Searching books table for test_identity="${testIdentity}", cefr_level="${cefrLevel}"`)

  const supabase = await createClient()

  // Clean and trim the level input
  const cleanLevel = cefrLevel.trim()

  // 1. Try exact match using trimmed level
  const { data, error } = await supabase
    .from('books')
    .select('id, name, test_identity, cefr_level, inlingua_level')
    .eq('test_identity', testIdentity)
    .ilike('cefr_level', `%${cleanLevel}%`) // Using wildcard search to capture "A1", "A1 ", etc.
    .order('inlingua_level', { ascending: true, nullsFirst: false })

  if (error) {
    console.error('❌ [getRecommendedBooks] DB Error:', error.message)
    return []
  }

  console.log(`📊 [getRecommendedBooks] Matches found for (${testIdentity}, ${cleanLevel}):`, data?.length ?? 0)

  // 2. Fallback: If no books found for this specific test identity, inspect available levels for 'KG'
  if (!data || data.length === 0) {
    console.warn(`⚠️ No books matched for test_identity="${testIdentity}" AND cefr_level="${cleanLevel}".`)
    
    // Check what books actually exist for this testIdentity to diagnose schema mismatched levels
    const { data: allIdentityBooks } = await supabase
      .from('books')
      .select('name, cefr_level, inlingua_level')
      .eq('test_identity', testIdentity)

    console.log(`💡 Available books in DB for test_identity="${testIdentity}":`, allIdentityBooks)
  }

  return (data as RecommendedBook[]) ?? []
}

/**
 * Updates existing test record with CEFR result, status, question history,
 * and matched coursebook results.
 */
// 

export async function updateTestResult(
  sessionId: string,
  finalLevel: string,
  isFinished: boolean = false,
  questionHistory: { level: string; correct: boolean }[] = [],
  recommendedBooks?: string[]
) {
  console.log('\n================ [updateTestResult] START ================')
  console.log('📌 Input sessionId:', sessionId)
  console.log('📌 Input finalLevel:', finalLevel)
  console.log('📌 Input isFinished:', isFinished)
  console.log('📌 Input recommendedBooks passed:', recommendedBooks)

  const supabase = await createClient()

  let booksToSave: string[] = recommendedBooks || []

  // If books were not explicitly passed in, calculate them on the server
  if (!recommendedBooks || recommendedBooks.length === 0) {
    console.log('🔍 Querying test_results by primary key `id` for test_type...')

    const { data: session, error: sessionError } = await supabase
      .from('test_results')
      .select('test_type')
      .eq('id', sessionId)
      .maybeSingle()

    if (sessionError) {
      console.error('❌ Error fetching session test_type:', sessionError.message)
    }

    console.log('📦 Session record retrieved from DB:', session)

    if (session?.test_type) {
      console.log(`📚 Calling getRecommendedBooks(testType: "${session.test_type}", level: "${finalLevel}")...`)
      
      const books = await getRecommendedBooks(
        session.test_type as TestIdentity,
        finalLevel
      )
      
      console.log('📖 Raw books retrieved from getRecommendedBooks:', books)

      if (!books || books.length === 0) {
        console.warn(`⚠️ getRecommendedBooks returned NO books for test_type "${session.test_type}" and level "${finalLevel}"`)
      }
      
      booksToSave = books ? books.map((b) => b.name) : []
      console.log('✅ Final book names to save:', booksToSave)
    } else {
      console.warn('⚠️ WARNING: Could not find session or test_type is missing/null!')
    }
  }

  const updatePayload = {
    final_result: finalLevel as any,
    status: isFinished ? 'completed' : 'in_progress',
    question_history: questionHistory,
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