'use server'
import { createClient } from '@/lib/server'

export async function getActiveBranches() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('branches')
    .select('name')
    .eq('is_active', true)

  return data?.map((b) => b.name) || []
}

export async function initializeTestSession(data: {
  name: string
  age: number
  category: 'Young Learner' | 'Adult'
  branch: string
}) {
  const supabase = await createClient()

  // 1. Normalize the category to match your DB (young_learner)
  const dbCategory =
    data.category === 'Young Learner' ? 'young_learner' : 'adult'

  let query = supabase
    .from('test_mappings')
    .select('test_to_serve, starting_level')
    .eq('category', dbCategory)

  // 2. Apply age logic only for young learners
  if (dbCategory === 'young_learner') {
    query = query.lte('min_age', data.age).gte('max_age', data.age)
  } else {
    // For adults, we just want the row where age is null (ID: 1)
    query = query.is('min_age', null)
  }

  const { data: mapping, error: mapError } = await query.single()

  if (mapError || !mapping) {
    console.error('Mapping failed for:', { dbCategory, age: data.age })
    throw new Error(`Could not find a test configuration for ${data.category}`)
  }

  // 3. Create the initial test result record
  const { data: session, error: sessionError } = await supabase
    .from('test_results')
    .insert({
      student_name: data.name,
      age: data.category === 'Young Learner' ? data.age : null,
      branch_name: data.branch,
      test_type: mapping.test_to_serve as any,
      // Logic: Leave final_result NULL at start.
      // Remember where we started them for internal data.
      started_at_level: mapping.starting_level,
      status: 'started',
    })
    .select()
    .single()

  if (sessionError) {
    console.error('Session Error:', sessionError)
    throw new Error('Failed to create test session')
  }

  return {
    sessionId: session.id,
    testType: mapping.test_to_serve,
    startingLevel: mapping.starting_level,
  }
}

/**
 * Updates the existing test record with the final CEFR result
 */
export async function updateTestResult(
  sessionId: string,
  finalLevel: string,
  isFinished: boolean = false,
) {
  const supabase = await createClient()

  // If the test is finished, we update status to 'completed'
  // Otherwise, we can mark it as 'in_progress'
  const updateData: any = {
    final_result: finalLevel as any,
    status: isFinished ? 'completed' : 'in_progress',
  }

  const { error } = await supabase
    .from('test_results')
    .update(updateData)
    .eq('id', sessionId)

  if (error) {
    console.error('Update Error:', error)
    return { success: false, error: error.message }
  }

  return { success: true }
}
