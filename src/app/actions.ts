'use server'

import { createClient } from '@/lib/server'

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
    testType: data.test_type,
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
    testType: mapping.test_to_serve,
    startingLevel: mapping.starting_level,
  }
}

/**
 * Updates existing test record with CEFR result, status, and question history.
 * Accepts the optional 4th argument to store granular question levels and outcomes.
 */
export async function updateTestResult(
  sessionId: string,
  finalLevel: string,
  isFinished: boolean = false,
  questionHistory: { level: string; correct: boolean }[] = [],
) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('test_results')
    .update({
      final_result: finalLevel as any,
      status: isFinished ? 'completed' : 'in_progress',
      question_history: questionHistory, // Maps to JSONB column in Supabase
    })
    .eq('id', sessionId)
    .select()

  if (error) {
    console.error('[updateTestResult] Error:', error.message)
    return { success: false, error: error.message }
  }

  if (!data || data.length === 0) {
    return { success: false, error: 'Record not found' }
  }

  return { success: true }
}
