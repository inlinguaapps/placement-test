// src/app/(student)/test/page.tsx
import { initializeTestSession } from '@/app/actions'
import AdaptiveTestController from '@/components/test/AdaptiveTestController'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default async function TestPage({
  searchParams,
}: {
  searchParams: any
}) {
  // 1. Wait for params
  const { name, type, age, branch } = await searchParams

  let session = null
  let errorMessage = null

  // 2. ONLY the data fetching goes in the try/catch
  try {
    session = await initializeTestSession({
      name: name || 'Guest',
      age: Number(age) || 0,
      category: type === 'young' ? 'Young Learner' : 'Adult',
      branch: branch || '',
    })
  } catch (error) {
    console.error('Test initialization failed:', error)
    errorMessage =
      "We couldn't start your test. Please check your connection and try again."
  }

  // 3. Handle the error UI outside the try/catch
  if (errorMessage || !session) {
    return (
      <div className='flex flex-col items-center justify-center min-h-screen p-6 text-center'>
        <h1 className='text-xl font-bold mb-2'>System Error</h1>
        <p className='text-muted-foreground mb-6'>{errorMessage}</p>
        <Link href='/'>
          <Button variant='outline'>Return to Home</Button>
        </Link>
      </div>
    )
  }

  // 4. Return the Success UI
  return (
    <div className='flex flex-col items-center justify-center min-h-screen p-4 bg-zinc-50 dark:bg-black'>
      <div className='w-full max-w-2xl'>
        <AdaptiveTestController initialSession={session} />
      </div>
    </div>
  )
}
